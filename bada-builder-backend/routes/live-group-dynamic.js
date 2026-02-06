import express from 'express';
import pool from '../config/database.js';
import { authenticate, optionalAuth, isAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { uploadImage, uploadMultipleImages, uploadFile } from '../services/cloudinary.js';
import { sendGroupPropertyBookingEmail, sendAdminGroupBookingNotification } from '../services/groupBookingEmailService.js'; // SMTP for group bookings

const router = express.Router();

// --- PUBLIC ROUTES ---

// Get all dynamic live grouping projects
router.get('/', optionalAuth, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT p.*, 
            (SELECT COUNT(*) FROM live_group_towers WHERE project_id = p.id) as tower_count,
            (SELECT COUNT(*) FROM live_group_units u 
             JOIN live_group_towers t ON u.tower_id = t.id 
             WHERE t.project_id = p.id) as total_slots,
            (SELECT COUNT(*) FROM live_group_units u 
             JOIN live_group_towers t ON u.tower_id = t.id 
             WHERE t.project_id = p.id AND u.status = 'booked') as filled_slots
            FROM live_group_projects p 
            WHERE status != $1 
            ORDER BY created_at DESC`,
            ['closed']
        );
        res.json({ projects: result.rows });
    } catch (error) {
        console.error('Get dynamic live groups error:', error);
        res.status(500).json({ error: 'Failed to fetch live groups' });
    }
});

// Get full hierarchy for 3D View
router.get('/:id/full', optionalAuth, async (req, res) => {
    try {
        const projectId = req.params.id;

        // 1. Get Project
        const projectResult = await pool.query(
            `SELECT p.*,
            (SELECT COUNT(*) FROM live_group_units u 
             JOIN live_group_towers t ON u.tower_id = t.id 
             WHERE t.project_id = p.id) as total_slots,
            (SELECT COUNT(*) FROM live_group_units u 
             JOIN live_group_towers t ON u.tower_id = t.id 
             WHERE t.project_id = p.id AND u.status = 'booked') as filled_slots
            FROM live_group_projects p WHERE p.id = $1`,
            [projectId]
        );

        console.log(`🔍 [DEBUG] Hierarchy Fetch for ID: ${projectId}. Result Rows: ${projectResult.rows.length}`);

        if (projectResult.rows.length === 0) {
            console.error(`❌ [ERROR] Project ${projectId} NOT FOUND in live_group_projects table.`);
            return res.status(404).json({ error: 'Project not found' });
        }

        const project = projectResult.rows[0];

        // 2. Get Towers
        const towersResult = await pool.query('SELECT * FROM live_group_towers WHERE project_id = $1 ORDER BY id', [projectId]);
        const towers = towersResult.rows;

        // 3. Get Units for each tower
        for (let tower of towers) {
            const unitsResult = await pool.query('SELECT * FROM live_group_units WHERE tower_id = $1 ORDER BY floor_number, unit_number', [tower.id]);
            tower.units = unitsResult.rows;
        }

        project.towers = towers;
        res.json({ project });
    } catch (error) {
        console.error('Get full hierarchy error:', error);
        res.status(500).json({ error: 'Failed to fetch project structure' });
    }
});

// Lock a unit for custom duration
router.post('/units/:id/lock', authenticate, async (req, res) => {
    try {
        const unitId = req.params.id;
        const userId = req.user.id;
        const { duration = 10 } = req.body; // duration in minutes

        // Start transaction
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Check if available
            const checkResult = await client.query(
                'SELECT status, locked_at, locked_by FROM live_group_units WHERE id = $1 FOR UPDATE',
                [unitId]
            );

            if (checkResult.rows.length === 0) throw new Error('Unit not found');

            const unit = checkResult.rows[0];
            const now = new Date();

            // If locked, check if expired (default 10 mins or specific duration)
            if (unit.status === 'locked' && unit.locked_at) {
                const lockDuration = (now - new Date(unit.locked_at)) / 1000 / 60;
                // If it's locked by someone else and not expired, error
                if (unit.locked_by !== userId && lockDuration < 10) {
                    return res.status(400).json({ error: 'Unit is currently on hold by another user' });
                }
            } else if (unit.status === 'booked') {
                return res.status(400).json({ error: 'Unit is already booked' });
            }

            // Perform lock
            const expiry = new Date(now.getTime() + duration * 60000);
            await client.query(
                'UPDATE live_group_units SET status = $1, locked_at = $2, locked_by = $3 WHERE id = $4',
                ['locked', now, userId, unitId]
            );

            await client.query('COMMIT');
            res.json({
                message: `Unit held for ${duration} minutes`,
                unitId,
                expiresAt: expiry
            });
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Lock unit error:', error);
        res.status(500).json({ error: error.message || 'Failed to lock unit' });
    }
});

// Book a unit permanently
router.post('/units/:id/book', authenticate, async (req, res) => {
    try {
        const unitId = req.params.id;
        const userId = req.user.id;
        const { paymentData } = req.body;

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const checkResult = await client.query(
                'SELECT status, locked_by FROM live_group_units WHERE id = $1 FOR UPDATE',
                [unitId]
            );

            if (checkResult.rows.length === 0) throw new Error('Unit not found');
            const unit = checkResult.rows[0];

            if (unit.status === 'booked') {
                return res.status(400).json({ error: 'Unit is already booked' });
            }

            // If locked by someone else, check if it's REALLY locked (expiry logic)
            // But for simplicity in this flow, if it's booked, we just update status

            await client.query(
                'UPDATE live_group_units SET status = $1, booked_at = NOW(), booked_by = $2, locked_at = NULL, locked_by = NULL WHERE id = $3',
                ['booked', userId, unitId]
            );

            // Record booking in a main bookings table if exists
            // For now, updating the status in units is the primary goal

            await client.query('COMMIT');

            // Send booking confirmation email (non-blocking)
            // Fetch complete booking details for email
            pool.query(`
                SELECT 
                    u.id as unit_id,
                    u.unit_number,
                    u.floor_number,
                    u.unit_type,
                    u.area,
                    u.price,
                    u.booked_at,
                    t.tower_name,
                    p.id as project_id,
                    p.title as project_title,
                    p.location as project_location,
                    p.developer,
                    usr.name as user_name,
                    usr.email as user_email,
                    usr.phone as user_phone
                FROM live_group_units u
                JOIN live_group_towers t ON u.tower_id = t.id
                JOIN live_group_projects p ON t.project_id = p.id
                JOIN users usr ON u.booked_by = usr.id
                WHERE u.id = $1
            `, [unitId])
                .then(result => {
                    if (result.rows.length > 0) {
                        const booking = result.rows[0];

                        // Send confirmation email via SMTP
                        sendGroupPropertyBookingEmail({
                            booking_id: booking.unit_id,
                            user_name: booking.user_name,
                            user_email: booking.user_email,
                            user_phone: booking.user_phone || 'Not provided',
                            property_name: booking.project_title || 'Untitled Project',
                            unit_details: `${booking.tower_name} - Floor ${booking.floor_number}, Unit ${booking.unit_number}`,
                            amount: parseFloat(booking.price) || 0,
                            join_date: booking.booked_at,
                            project_location: booking.project_location || 'Not Specified',
                            developer: booking.developer || 'Bada Builder',
                            unit_type: booking.unit_type,
                            area: booking.area
                        }).catch(err => {
                            console.error('❌ [Group Booking] Email sending failed (non-critical):', err.message);
                        });

                        // Send Admin Notification
                        sendAdminGroupBookingNotification({
                            booking_id: booking.unit_id,
                            user_name: booking.user_name,
                            user_email: booking.user_email,
                            user_phone: booking.user_phone || 'Not provided',
                            property_name: booking.project_title || 'Untitled Project',
                            unit_details: `${booking.tower_name} - Floor ${booking.floor_number}, Unit ${booking.unit_number}`,
                            amount: parseFloat(booking.price) || 0,
                            join_date: booking.booked_at,
                            project_location: booking.project_location || 'Not Specified',
                            developer: booking.developer || 'Bada Builder',
                            unit_type: booking.unit_type,
                            area: booking.area
                        }).catch(err => {
                            console.error('❌ [Group Booking] Admin email sending failed:', err.message);
                        });
                    }
                })
                .catch(err => {
                    console.error('❌ [Group Booking] Failed to fetch booking details for email:', err.message);
                });

            res.json({ message: 'Unit successfully booked', unitId });
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Book unit error:', error);
        res.status(500).json({ error: 'Failed to book unit' });
    }
});

// Create Razorpay Order for Unit Booking
router.post('/create-booking-order', authenticate, async (req, res) => {
    try {
        const { unit_id, amount } = req.body;

        if (!unit_id || !amount) {
            return res.status(400).json({ error: 'Unit ID and amount are required' });
        }

        // Import Razorpay service
        const { createOrder } = await import('../services/razorpay.js');

        // Create Razorpay order
        const order = await createOrder(
            amount,
            'INR',
            `unit_booking_${unit_id}_${Date.now()}`
        );

        console.log('✅ Razorpay order created for unit booking:', order.id);

        res.json({
            orderId: order.id,
            amount: amount,
            currency: order.currency,
            unit_id: unit_id
        });
    } catch (error) {
        console.error('❌ Create booking order error:', error);
        res.status(500).json({ error: error.message || 'Failed to create booking order' });
    }
});

// --- ADMIN ROUTES ---

// Bulk Create Project (Atomic)
router.post('/admin/projects/bulk', authenticate, isAdmin, upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'brochure', maxCount: 1 }
]), async (req, res) => {
    try {
        console.log('🚀 Starting Atomic Bulk Project Creation...');

        const {
            title, developer, location, description, original_price, group_price,
            discount, savings, type, min_buyers, possession, rera_number, area,
            hierarchy,
            project_name, builder_name, property_type: pt, unit_configuration, project_level,
            offer_type, discount_percentage, discount_label, offer_expiry_datetime,
            regular_price_per_sqft, regular_price_per_sqft_max, group_price_per_sqft, group_price_per_sqft_max, price_unit, currency,
            regular_total_price, discounted_total_price_min, discounted_total_price_max,
            regular_price_min, regular_price_max,
            total_savings_min, total_savings_max, benefits,
            primary_cta_text, secondary_cta_text, details_page_url,
            layout_columns, layout_rows,
            latitude, longitude, map_address,
            road_width, plot_gap, plot_size_width, plot_size_depth,
            orientation, parking_type, parking_slots, entry_points
        } = req.body;

        // 1. Handle Files (DO THIS BEFORE OPENING DB CONNECTION)
        let image = null;
        let images = [];
        let brochure_url = null;

        console.log('☁️ Uploading media to Cloudinary...');
        if (req.files && req.files['images']) {
            const imageBuffers = req.files['images'].map(file => file.buffer);
            images = await uploadMultipleImages(imageBuffers, 'live_grouping');
            image = images[0];
        }

        if (req.files && req.files['brochure']) {
            const brochureBuffer = req.files['brochure'][0].buffer;
            brochure_url = await uploadFile(brochureBuffer, 'live_grouping_brochures');
        }
        console.log('✅ Media upload complete.');

        // 2. Open DB Connection and Start Transaction
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 3. Insert Project
            const projectResult = await client.query(
                `INSERT INTO live_group_projects (
                    title, developer, location, description, status, image, images, 
                    original_price, group_price, discount, savings, type, min_buyers,
                    possession, rera_number, area, created_by, brochure_url,
                    project_name, builder_name, property_type, unit_configuration, project_level,
                    offer_type, discount_percentage, discount_label, offer_expiry_datetime,
                    regular_price_per_sqft, group_price_per_sqft, price_unit, currency,
                    regular_total_price, discounted_total_price_min, discounted_total_price_max,
                    regular_price_min, regular_price_max,
                    total_savings_min, total_savings_max, benefits,
                    primary_cta_text, secondary_cta_text, details_page_url,
                    regular_price_per_sqft_max, group_price_per_sqft_max,
                    layout_columns, layout_rows,
                    latitude, longitude, map_address,
                    road_width, plot_gap, plot_size_width, plot_size_depth,
                    orientation, parking_type, parking_slots, entry_points
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18,
                    $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42,
                    $43, $44, $45, $46, $47, $48, $49, $50, $51, $52, $53, $54, $55, $56, $57
                ) RETURNING *`,
                [
                    title, developer, location, description, 'live', image, images, original_price, group_price, discount, savings, type, min_buyers, possession, rera_number, area, req.user.id, brochure_url,
                    project_name, builder_name, pt, unit_configuration, project_level,
                    offer_type, discount_percentage, discount_label, offer_expiry_datetime,
                    regular_price_per_sqft, group_price_per_sqft, price_unit, currency || 'INR',
                    regular_total_price, discounted_total_price_min, discounted_total_price_max,
                    regular_price_min, regular_price_max,
                    total_savings_min, total_savings_max, Array.isArray(benefits) ? JSON.stringify(benefits) : (benefits || '[]'),
                    primary_cta_text, secondary_cta_text, details_page_url,
                    regular_price_per_sqft_max, group_price_per_sqft_max,
                    layout_columns, layout_rows,
                    latitude || null, longitude || null, map_address || null,
                    road_width || null, plot_gap || null, plot_size_width || null, plot_size_depth || null,
                    orientation || null, parking_type || 'Front', parking_slots || 0, entry_points || null
                ]
            );

            const project = projectResult.rows[0];
            console.log(`✅ Project created: ${project.id}. Building hierarchy...`);

            // 4. Process Hierarchy & Collect Units for Batch Insert
            const hierarchyData = typeof hierarchy === 'string' ? JSON.parse(hierarchy || '[]') : (hierarchy || []);
            let totalUnitsGenerated = 0;
            const allUnitsToInsert = [];

            for (const towerData of hierarchyData) {
                // Insert Tower
                const towerResult = await client.query(
                    'INSERT INTO live_group_towers (project_id, tower_name, total_floors, layout_columns, layout_rows) VALUES ($1, $2, $3, $4, $5) RETURNING id',
                    [project.id, towerData.tower_name || towerData.name, towerData.total_floors || 0, towerData.layout_columns || null, towerData.layout_rows || null]
                );
                const towerId = towerResult.rows[0].id;
                console.log(`  Tower ${towerId} created.`);

                if (towerData.units && Array.isArray(towerData.units)) {
                    for (const unit of towerData.units) {
                        allUnitsToInsert.push({
                            tower_id: towerId,
                            floor_number: unit.floor_number,
                            unit_number: unit.unit_number,
                            unit_type: unit.unit_type || 'Unit',
                            area: unit.area || 0,
                            carpet_area: unit.carpet_area || null,
                            super_built_up_area: unit.super_built_up_area || null,
                            price: unit.price || 0,
                            price_per_sqft: unit.price_per_sqft || 0,
                            discount_price_per_sqft: unit.discount_price_per_sqft || null,
                            plot_width: unit.plot_width || null,
                            plot_depth: unit.plot_depth || null,
                            front_side: unit.front_side || null,
                            back_side: unit.back_side || null,
                            left_side: unit.left_side || null,
                            right_side: unit.right_side || null,
                            status: unit.status || 'available',
                            facing: unit.facing || null,
                            is_corner: unit.is_corner || false,
                            unit_image_url: unit.unit_image_url || null,
                            unit_gallery: unit.unit_gallery || []
                        });
                        totalUnitsGenerated++;
                    }
                }
            }

            // 5. Batch Insert All Units
            if (allUnitsToInsert.length > 0) {
                const values = [];
                const placeholders = [];
                let counter = 1;

                allUnitsToInsert.forEach((unit) => {
                    const rowPlaceholders = [];
                    const cols = [
                        unit.tower_id, unit.floor_number, unit.unit_number, unit.unit_type,
                        unit.area, unit.carpet_area, unit.super_built_up_area, unit.price,
                        unit.price_per_sqft, unit.discount_price_per_sqft, unit.plot_width, unit.plot_depth,
                        unit.front_side, unit.back_side, unit.left_side, unit.right_side,
                        unit.status, unit.facing, unit.is_corner, unit.unit_image_url, unit.unit_gallery
                    ];

                    cols.forEach(val => {
                        values.push(val);
                        rowPlaceholders.push(`$${counter++}`);
                    });

                    placeholders.push(`(${rowPlaceholders.join(', ')})`);
                });

                const insertQuery = `
                    INSERT INTO live_group_units (
                        tower_id, floor_number, unit_number, unit_type, 
                        area, carpet_area, super_built_up_area, price, price_per_sqft, discount_price_per_sqft, 
                        plot_width, plot_depth, front_side, back_side, left_side, right_side,
                        status, facing, is_corner, unit_image_url, unit_gallery
                    ) VALUES ${placeholders.join(', ')}
                `;
                await client.query(insertQuery, values);
            }

            // 6. Update Project Total Slots
            await client.query(
                'UPDATE live_group_projects SET total_slots = $1 WHERE id = $2',
                [totalUnitsGenerated, project.id]
            );

            await client.query('COMMIT');
            console.log(`🎉 Bulk creation complete in transaction. ${totalUnitsGenerated} units generated.`);
            res.status(201).json({ project, message: 'Project hierarchy created successfully' });

        } catch (dbError) {
            await client.query('ROLLBACK');
            throw dbError;
        } finally {
            client.release();
        }

    } catch (error) {
        console.error('❌ Bulk Create Error details:', error);
        res.status(500).json({ error: 'Failed to create project hierarchy: ' + error.message });
    }
});

// Create Project (Single - Legacy)
router.post('/admin/projects', authenticate, isAdmin, upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'brochure', maxCount: 1 }
]), async (req, res) => {
    try {
        const {
            title, developer, location, description, original_price, group_price,
            discount, savings, type, min_buyers, possession, rera_number, area,
            project_name, builder_name, property_type: pt, unit_configuration, project_level,
            offer_type, discount_percentage, discount_label, offer_expiry_datetime,
            regular_price_per_sqft, regular_price_per_sqft_max, group_price_per_sqft, group_price_per_sqft_max, price_unit, currency,
            regular_total_price, discounted_total_price_min, discounted_total_price_max,
            regular_price_min, regular_price_max,
            total_savings_min, total_savings_max, benefits,
            primary_cta_text, secondary_cta_text, details_page_url,
            layout_columns, layout_rows,
            latitude, longitude, map_address
        } = req.body;

        let image = null;
        let images = [];
        let brochure_url = null;

        if (req.files && req.files['images']) {
            const imageBuffers = req.files['images'].map(file => file.buffer);
            images = await uploadMultipleImages(imageBuffers, 'live_grouping');
            image = images[0];
        }

        if (req.files && req.files['brochure']) {
            const brochureBuffer = req.files['brochure'][0].buffer;
            brochure_url = await uploadFile(brochureBuffer, 'live_grouping_brochures');
        }

        const result = await pool.query(
            `INSERT INTO live_group_projects (
                title, developer, location, description, status, image, images, 
                original_price, group_price, discount, savings, type, min_buyers,
                possession, rera_number, area, created_by, brochure_url,
                project_name, builder_name, property_type, unit_configuration, project_level,
                offer_type, discount_percentage, discount_label, offer_expiry_datetime,
                regular_price_per_sqft, group_price_per_sqft, price_unit, currency,
                regular_total_price, discounted_total_price_min, discounted_total_price_max,
                regular_price_min, regular_price_max,
                total_savings_min, total_savings_max, benefits,
                primary_cta_text, secondary_cta_text, details_page_url,
                regular_price_per_sqft_max, group_price_per_sqft_max,
                layout_columns, layout_rows,
                latitude, longitude, map_address
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18,
                $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, $46, $47, $48, $49
            ) RETURNING *`,
            [
                title, developer, location, description, 'live', image, images, original_price, group_price, discount, savings, type, min_buyers, possession, rera_number, area, req.user.id, brochure_url,
                project_name, builder_name, pt, unit_configuration, project_level,
                offer_type, discount_percentage, discount_label, offer_expiry_datetime,
                regular_price_per_sqft, group_price_per_sqft, price_unit, currency || 'INR',
                regular_total_price, discounted_total_price_min, discounted_total_price_max,
                regular_price_min, regular_price_max,
                total_savings_min, total_savings_max, Array.isArray(benefits) ? JSON.stringify(benefits) : (benefits || '[]'),
                primary_cta_text, secondary_cta_text, details_page_url,
                regular_price_per_sqft_max, group_price_per_sqft_max,
                layout_columns, layout_rows,
                latitude || null, longitude || null, map_address || null
            ]
        );

        res.status(201).json({ project: result.rows[0] });
    } catch (error) {
        console.error('Admin create project error:', error);
        res.status(500).json({ error: 'Failed to create project' });
    }
});

// Add Tower
router.post('/admin/projects/:id/towers', authenticate, isAdmin, async (req, res) => {
    try {
        const { tower_name, total_floors, layout_columns, layout_rows } = req.body;
        const project_id = req.params.id;

        const result = await pool.query(
            'INSERT INTO live_group_towers (project_id, tower_name, total_floors, layout_columns, layout_rows) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [project_id, tower_name, total_floors, layout_columns, layout_rows]
        );

        res.status(201).json({ tower: result.rows[0] });
    } catch (error) {
        console.error('Admin add tower error:', error);
        res.status(500).json({ error: 'Failed to add tower' });
    }
});

// Bulk Generate Units (Enhanced for Mixed-Use)
router.post('/admin/towers/:id/generate-units', authenticate, isAdmin, async (req, res) => {
    try {
        const towerId = req.params.id;
        const { units } = req.body;

        if (!units || !Array.isArray(units) || units.length === 0) {
            return res.status(400).json({ error: 'Units data is required and must be an array' });
        }

        const towerResult = await pool.query('SELECT project_id FROM live_group_towers WHERE id = $1', [towerId]);
        if (towerResult.rows.length === 0) return res.status(404).json({ error: 'Tower not found' });

        const projectId = towerResult.rows[0].project_id;

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Batch Insert Units
            if (units.length > 0) {
                console.log(`📦 Batch generating ${units.length} units for tower ${towerId}...`);
                const values = [];
                const placeholders = [];
                let counter = 1;

                units.forEach((unit) => {
                    const rowPlaceholders = [];
                    const cols = [
                        towerId, unit.floor_number, unit.unit_number, unit.unit_type || 'Unit',
                        unit.area || 0, unit.carpet_area || null, unit.super_built_up_area || null,
                        unit.price || 0, unit.price_per_sqft || 0, unit.discount_price_per_sqft || null,
                        unit.status || 'available', unit.unit_image_url || null, unit.unit_gallery || []
                    ];

                    cols.forEach(val => {
                        values.push(val);
                        rowPlaceholders.push(`$${counter++}`);
                    });

                    placeholders.push(`(${rowPlaceholders.join(', ')})`);
                });

                const insertQuery = `
                    INSERT INTO live_group_units (
                        tower_id, floor_number, unit_number, unit_type, 
                        area, carpet_area, super_built_up_area, price, price_per_sqft, discount_price_per_sqft, status,
                        unit_image_url, unit_gallery
                    ) VALUES ${placeholders.join(', ')}
                `;
                await client.query(insertQuery, values);
            }

            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }

        // Update Project Total Slots (Atomic subquery)
        await pool.query(`
            UPDATE live_group_projects 
            SET total_slots = (
                SELECT COUNT(*) FROM live_group_units u 
                JOIN live_group_towers t ON u.tower_id = t.id 
                WHERE t.project_id = live_group_projects.id
            )
            WHERE id = $1
        `, [projectId]);

        res.json({ message: `Successfully generated ${units.length} units` });
    } catch (error) {
        console.error('❌ Admin generate units error:', error);
        res.status(500).json({ error: 'Failed to generate units: ' + error.message });
    }
});

// Update a single unit's details
router.patch('/admin/units/:id', authenticate, isAdmin, async (req, res) => {
    try {
        const unitId = req.params.id;
        console.log(`📝 [DEBUG] Updating Unit ${unitId}. Body:`, JSON.stringify(req.body, null, 2));
        const {
            unit_number, unit_type, floor_number, area, carpet_area, super_built_up_area,
            price_per_sqft, discount_price_per_sqft, status, facing, is_corner, unit_image_url,
            plot_width, plot_depth, front_side, back_side, left_side, right_side, unit_gallery
        } = req.body;

        const existingResult = await pool.query('SELECT * FROM live_group_units WHERE id = $1', [unitId]);
        if (existingResult.rows.length === 0) {
            return res.status(404).json({ error: 'Unit not found' });
        }
        const existingUnit = existingResult.rows[0];

        const finalUnitNumber = unit_number !== undefined ? unit_number : existingUnit.unit_number;
        const finalUnitType = unit_type !== undefined ? unit_type : existingUnit.unit_type;
        const finalFloorNumber = floor_number !== undefined ? parseInt(floor_number) : existingUnit.floor_number;
        const finalArea = area !== undefined ? parseFloat(area) : parseFloat(existingUnit.area);
        const finalCarpetArea = carpet_area !== undefined ? (carpet_area ? parseFloat(carpet_area) : null) : existingUnit.carpet_area;
        const finalSuperBuiltUpArea = super_built_up_area !== undefined ? (super_built_up_area ? parseFloat(super_built_up_area) : null) : existingUnit.super_built_up_area;
        const finalPricePerSqft = price_per_sqft !== undefined ? parseFloat(price_per_sqft) : parseFloat(existingUnit.price_per_sqft);

        let finalDiscountPricePerSqft = existingUnit.discount_price_per_sqft;
        if (discount_price_per_sqft !== undefined) {
            finalDiscountPricePerSqft = (discount_price_per_sqft !== '' && discount_price_per_sqft !== null)
                ? parseFloat(discount_price_per_sqft)
                : null;
        }

        const finalStatus = status !== undefined ? status : existingUnit.status;
        const finalPlotWidth = plot_width !== undefined ? (plot_width ? parseFloat(plot_width) : null) : existingUnit.plot_width;
        const finalPlotDepth = plot_depth !== undefined ? (plot_depth ? parseFloat(plot_depth) : null) : existingUnit.plot_depth;

        const finalFrontSide = front_side !== undefined ? (front_side ? parseFloat(front_side) : null) : existingUnit.front_side;
        const finalBackSide = back_side !== undefined ? (back_side ? parseFloat(back_side) : null) : existingUnit.back_side;
        const finalLeftSide = left_side !== undefined ? (left_side ? parseFloat(left_side) : null) : existingUnit.left_side;
        const finalRightSide = right_side !== undefined ? (right_side ? parseFloat(right_side) : null) : existingUnit.right_side;

        const effectiveRate = finalDiscountPricePerSqft !== null ? finalDiscountPricePerSqft : finalPricePerSqft;
        const totalPrice = finalArea * effectiveRate;

        const result = await pool.query(
            `UPDATE live_group_units SET 
                unit_number = $1,
                unit_type = $2,
                floor_number = $3,
                area = $4,
                price_per_sqft = $5,
                discount_price_per_sqft = $6,
                status = $7,
                price = $8,
                carpet_area = $9,
                super_built_up_area = $10,
                facing = $11,
                is_corner = $12,
                unit_image_url = $13,
                plot_width = $14,
                plot_depth = $15,
                front_side = $16,
                back_side = $17,
                left_side = $18,
                right_side = $19,
                unit_gallery = $20
            WHERE id = $21 RETURNING *`,
            [
                finalUnitNumber, finalUnitType, finalFloorNumber, finalArea,
                finalPricePerSqft, finalDiscountPricePerSqft, finalStatus,
                totalPrice, finalCarpetArea, finalSuperBuiltUpArea,
                facing !== undefined ? facing : existingUnit.facing,
                is_corner !== undefined ? is_corner : existingUnit.is_corner,
                unit_image_url !== undefined ? unit_image_url : existingUnit.unit_image_url,
                finalPlotWidth,
                finalPlotDepth,
                finalFrontSide,
                finalBackSide,
                finalLeftSide,
                finalRightSide,
                unit_gallery !== undefined ? unit_gallery : existingUnit.unit_gallery,
                unitId
            ]
        );

        res.json({ message: 'Unit updated successfully', unit: result.rows[0] });
    } catch (error) {
        console.error('Admin update unit error:', error);
        res.status(500).json({ error: `Failed to update unit: ${error.message}` });
    }
});

// Delete Project
router.delete('/admin/projects/:id', authenticate, isAdmin, async (req, res) => {
    try {
        const projectId = req.params.id;
        await pool.query('DELETE FROM live_group_projects WHERE id = $1', [projectId]);
        res.json({ message: 'Project and all associated data deleted' });
    } catch (error) {
        console.error('Admin delete project error:', error);
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

// Update Project Status
router.patch('/admin/projects/:id/status', authenticate, isAdmin, async (req, res) => {
    try {
        const projectId = req.params.id;
        const { status } = req.body;

        await pool.query('UPDATE live_group_projects SET status = $1 WHERE id = $2', [status, projectId]);
        res.json({ message: 'Project status updated', status });
    } catch (error) {
        console.error('Admin update status error:', error);
        res.status(500).json({ error: 'Failed to update project status' });
    }
});

// Single Image Upload (Generic for Units/Misc)
router.post('/admin/upload-image', authenticate, isAdmin, upload.single('images'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const imageUrl = await uploadImage(req.file.buffer, 'live_group_units');
        res.json({ imageUrl });
    } catch (error) {
        console.error('Image upload error:', error);
        res.status(500).json({ error: 'Failed to upload image' });
    }
});

// Multi-Image Upload (Parallel for Unit Gallery)
router.post('/admin/upload-gallery', authenticate, isAdmin, upload.array('images', 20), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        console.log(`☁️ Parallel uploading ${req.files.length} images to Cloudinary...`);
        const imageBuffers = req.files.map(file => file.buffer);
        const imageUrls = await uploadMultipleImages(imageBuffers, 'live_group_unit_gallery');

        res.json({ imageUrls });
    } catch (error) {
        console.error('Gallery upload error:', error);
        res.status(500).json({ error: 'Failed to upload gallery images' });
    }
});

export default router;
