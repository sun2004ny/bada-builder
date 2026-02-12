import express from 'express';
import pool from '../config/database.js';
import { authenticate, optionalAuth, isAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { uploadImage, uploadMultipleImages, uploadFile } from '../services/cloudinary.js';
import { sendGroupPropertyBookingEmail, sendAdminGroupBookingNotification } from '../services/groupBookingEmailService.js'; // SMTP for group bookings

import fs from 'fs';
import path from 'path';

const router = express.Router();

const diagLog = (msg) => {
    const timestamp = new Date().toISOString();
    fs.appendFileSync('save_diag.log', `[${timestamp}] ${msg}\n`);
    console.log(msg);
};

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

// Bulk Update Project (Atomic with Transaction & Booking Protection)
router.put('/admin/projects/:id/bulk', authenticate, isAdmin, upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'brochure', maxCount: 1 }
]), async (req, res) => {
    const projectId = req.params.id;
    const client = await pool.connect();
    try {
        console.log(`🚀 Starting Atomic Bulk Project Update for ID: ${projectId}...`);

        const {
            title, developer, location, description, original_price, group_price,
            discount, savings, type, min_buyers, possession, rera_number, area,
            hierarchy, last_updated_at,
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
            orientation, parking_type, parking_slots, entry_points,
            mixed_use_selected_types
        } = req.body;

        const parseArray = (val) => {
            if (Array.isArray(val)) return val;
            if (typeof val === 'string' && val.trim() !== '') {
                try { return JSON.parse(val); } catch (e) { return []; }
            }
            return [];
        };

        const parsedBenefitsList = parseArray(benefits);
        const parsedMixedTypes = parseArray(mixed_use_selected_types);

        await client.query('BEGIN');

        // 1. Optimistic Locking & Existence Check
        const existingProjectRes = await client.query('SELECT updated_at, image, images, brochure_url FROM live_group_projects WHERE id = $1 FOR UPDATE', [projectId]);
        if (existingProjectRes.rows.length === 0) {
            throw new Error('Project not found');
        }
        const existingProject = existingProjectRes.rows[0];

        // If client provided last_updated_at, verify it matches
        if (last_updated_at && new Date(existingProject.updated_at).getTime() !== new Date(last_updated_at).getTime()) {
            throw new Error('Concurrency Error: This project has been updated by another user. Please refresh and try again.');
        }

        // 2. Handle Files (Image Preservation Logic)
        let image = existingProject.image;
        let images = existingProject.images;
        let brochure_url = existingProject.brochure_url;

        if (req.files && req.files['images']) {
            const imageBuffers = req.files['images'].map(file => file.buffer);
            images = await uploadMultipleImages(imageBuffers, 'live_grouping');
            image = images[0];
        }

        if (req.files && req.files['brochure']) {
            const brochureBuffer = req.files['brochure'][0].buffer;
            brochure_url = await uploadFile(brochureBuffer, 'live_grouping_brochures');
        }

        // 3. Update Project
        await client.query(
            `UPDATE live_group_projects SET 
                title = $1, developer = $2, location = $3, description = $4, image = $5, images = $6, 
                original_price = $7, group_price = $8, discount = $9, savings = $10, type = $11, min_buyers = $12,
                possession = $13, rera_number = $14, area = $15, brochure_url = $16,
                project_name = $17, builder_name = $18, property_type = $19, unit_configuration = $20, project_level = $21,
                offer_type = $22, discount_percentage = $23, discount_label = $24, offer_expiry_datetime = $25,
                regular_price_per_sqft = $26, group_price_per_sqft = $27, price_unit = $28, currency = $29,
                regular_total_price = $30, discounted_total_price_min = $31, discounted_total_price_max = $32,
                regular_price_min = $33, regular_price_max = $34,
                total_savings_min = $35, total_savings_max = $36, benefits = $37,
                primary_cta_text = $38, secondary_cta_text = $39, details_page_url = $40,
                regular_price_per_sqft_max = $41, group_price_per_sqft_max = $42,
                layout_columns = $43, layout_rows = $44,
                latitude = $45, longitude = $46, map_address = $47,
                road_width = $48, plot_gap = $49, plot_size_width = $50, plot_size_depth = $51,
                orientation = $52, parking_type = $53, parking_slots = $54, entry_points = $55,
                mixed_use_selected_types = $56,
                updated_at = NOW()
            WHERE id = $57`,
            [
                title, developer, location, description, image, images, original_price, group_price, discount, savings, type, min_buyers, possession, rera_number, area, brochure_url,
                project_name, builder_name, pt, unit_configuration, project_level,
                offer_type, discount_percentage, discount_label, offer_expiry_datetime,
                regular_price_per_sqft, group_price_per_sqft, price_unit, currency || 'INR',
                regular_total_price, discounted_total_price_min, discounted_total_price_max,
                regular_price_min, regular_price_max,
                total_savings_min, total_savings_max, JSON.stringify(parsedBenefitsList),
                primary_cta_text, secondary_cta_text, details_page_url,
                regular_price_per_sqft_max, group_price_per_sqft_max,
                layout_columns, layout_rows,
                latitude || null, longitude || null, map_address || null,
                road_width || null, plot_gap || null, plot_size_width || null, plot_size_depth || null,
                orientation || null, parking_type || 'Front', parking_slots || 0, entry_points || null,
                parsedMixedTypes,
                projectId
            ]
        );
        console.log(`✅ [DEBUG] Project ${projectId} updated basic info.`);

        // 4. Process Hierarchy
        const hierarchyData = typeof hierarchy === 'string' ? JSON.parse(hierarchy || '[]') : (hierarchy || []);
        console.log(`📡 [DEBUG] Received ${hierarchyData.length} sections in hierarchy.`);

        const payloadTowerIds = hierarchyData.map(t => t.id).filter(id => id);
        const payloadUnitIds = [];
        hierarchyData.forEach(t => {
            if (t.units) t.units.forEach(u => u.id && payloadUnitIds.push(u.id));
        });
        console.log(`📋 [DEBUG] Payload IDs: Towers: [${payloadTowerIds.join(', ')}], Units: ${payloadUnitIds.length} existing.`);

        // --- BOOKING PROTECTION CHECK ---
        // Find units currently in DB for this project that are NOT in the payload
        const missingBookedUnitsRes = await client.query(`
            SELECT u.unit_number, t.tower_name FROM live_group_units u
            JOIN live_group_towers t ON u.tower_id = t.id
            WHERE t.project_id = $1 
            AND u.id NOT IN (SELECT unnest($2::int[]))
            AND u.status = 'booked'
        `, [projectId, payloadUnitIds.length > 0 ? payloadUnitIds : [-1]]);

        if (missingBookedUnitsRes.rows.length > 0) {
            const details = missingBookedUnitsRes.rows.map(r => `${r.tower_name} - ${r.unit_number}`).join(', ');
            throw new Error(`Deletion Blocked: The following units have active bookings and cannot be removed: ${details}`);
        }

        // 5. Final Deletions (Cleanup missing elements) - HAPPENS BEFORE SYNC to avoid purging new ones
        // First delete units that are not in the payload and belong to any tower of this project
        await client.query(`
            DELETE FROM live_group_units 
            WHERE tower_id IN (SELECT id FROM live_group_towers WHERE project_id = $1)
            AND id NOT IN (SELECT unnest($2::int[]))
        `, [projectId, payloadUnitIds.length > 0 ? payloadUnitIds : [-1]]);

        // Then delete towers that are not in the payload
        await client.query(`
            DELETE FROM live_group_towers 
            WHERE project_id = $1 AND id NOT IN (SELECT unnest($2::int[]))
        `, [projectId, payloadTowerIds.length > 0 ? payloadTowerIds : [-1]]);

        diagLog(`🚀 Starting Atomic Bulk Project Update for ID: ${projectId}...`);
        diagLog(`📡 Received ${hierarchyData.length} sections in hierarchy.`);
        for (const towerData of hierarchyData) {
            diagLog(`🏢 Syncing Tower: ${towerData.tower_name || towerData.name} (ID: ${towerData.id || 'NEW'})`);
            let towerId = towerData.id;
            if (towerId) {
                // Update Tower
                await client.query(
                    'UPDATE live_group_towers SET tower_name = $1, total_floors = $2, layout_columns = $3, layout_rows = $4, property_type = $5 WHERE id = $6 AND project_id = $7',
                    [towerData.tower_name || towerData.name, towerData.total_floors || 0, towerData.layout_columns || null, towerData.layout_rows || null, towerData.property_type || null, towerId, projectId]
                );
            } else {
                // Insert New Tower
                const tRes = await client.query(
                    'INSERT INTO live_group_towers (project_id, tower_name, total_floors, layout_columns, layout_rows, property_type) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
                    [projectId, towerData.tower_name || towerData.name, towerData.total_floors || 0, towerData.layout_columns || null, towerData.layout_rows || null, towerData.property_type || null]
                );
                towerId = tRes.rows[0].id;
            }

            // Sync Units for this tower
            if (towerData.units && Array.isArray(towerData.units)) {
                diagLog(`  🔢 Processing ${towerData.units.length} units for tower ${towerId}...`);
                for (const unit of towerData.units) {
                    if (unit.id) {
                        // Update Unit
                        await client.query(
                            `UPDATE live_group_units SET 
                                unit_number = $1, unit_type = $2, floor_number = $3, area = $4, price = $5, 
                                price_per_sqft = $6, discount_price_per_sqft = $7, status = $8,
                                carpet_area = $9, super_built_up_area = $10, facing = $11, is_corner = $12,
                                plot_width = $13, plot_depth = $14, front_side = $15, back_side = $16, left_side = $17, right_side = $18,
                                unit_image_url = $19, unit_gallery = $20, property_type = $21
                            WHERE id = $22 AND tower_id = $23`,
                            [
                                unit.unit_number, unit.unit_type || 'Unit', unit.floor_number, unit.area || 0, unit.price || 0,
                                unit.price_per_sqft || 0, unit.discount_price_per_sqft || null, unit.status || 'available',
                                unit.carpet_area || null, unit.super_built_up_area || null, unit.facing || null, unit.is_corner || false,
                                unit.plot_width || null, unit.plot_depth || null, unit.front_side || null, unit.back_side || null, unit.left_side || null, unit.right_side || null,
                                unit.unit_image_url || null, unit.unit_gallery || [],
                                unit.property_type || unit.unit_type || null,
                                unit.id, towerId
                            ]
                        );
                    } else {
                        // Insert New Unit
                        await client.query(
                            `INSERT INTO live_group_units (
                                tower_id, floor_number, unit_number, unit_type, area, price, price_per_sqft, 
                                discount_price_per_sqft, status, carpet_area, super_built_up_area, facing, is_corner,
                                plot_width, plot_depth, front_side, back_side, left_side, right_side,
                                unit_image_url, unit_gallery, property_type
                            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)`,
                            [
                                towerId, unit.floor_number, unit.unit_number, unit.unit_type || 'Unit', unit.area || 0, unit.price || 0,
                                unit.price_per_sqft || 0, unit.discount_price_per_sqft || null, unit.status || 'available',
                                unit.carpet_area || null, unit.super_built_up_area || null, unit.facing || null, unit.is_corner || false,
                                unit.plot_width || null, unit.plot_depth || null, unit.front_side || null, unit.back_side || null, unit.left_side || null, unit.right_side || null,
                                unit.unit_image_url || null, unit.unit_gallery || [],
                                unit.property_type || unit.unit_type || null
                            ]
                        );
                    }
                }
                diagLog(`  ✅ Finished syncing ${towerData.units.length} units for tower ${towerId}`);
                const countRes = await client.query('SELECT COUNT(*) FROM live_group_units WHERE tower_id = $1', [towerId]);
                diagLog(`  📊 DB VERIFY: Tower ${towerId} now has ${countRes.rows[0].count} units.`);
            } else {
                diagLog(`  ⚠️ No units array found for tower ${towerId}`);
            }
        }

        // 7. Update Project Aggregate Stats
        diagLog(`🔄 Updating aggregate total_slots for Project ${projectId}...`);
        await client.query(`
            UPDATE live_group_projects 
            SET total_slots = (
                SELECT COUNT(*) FROM live_group_units u 
                JOIN live_group_towers t ON u.tower_id = t.id 
                WHERE t.project_id = $1
            )
            WHERE id = $1
        `, [projectId]);

        const finalCountRes = await client.query('SELECT total_slots FROM live_group_projects WHERE id = $1', [projectId]);
        diagLog(`✅ Project ${projectId} aggregate count updated to ${finalCountRes.rows[0].total_slots}.`);

        console.log(`✅ [DEBUG] Project ${projectId} aggregate count updated.`);

        await client.query('COMMIT');
        res.json({ message: 'Project hierarchy updated successfully' });

    } catch (error) {
        await client.query('ROLLBACK');
        diagLog(`❌ [FATAL ERROR] Bulk Update Failed: ${error.message}\n${error.stack}`);
        res.status(500).json({ error: error.message || 'Failed to update project' });
    } finally {
        client.release();
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

        const parseArray = (val) => {
            if (Array.isArray(val)) return val;
            if (typeof val === 'string' && val.trim() !== '') {
                try { return JSON.parse(val); } catch (e) { return []; }
            }
            return [];
        };

        const parsedBenefitsList = parseArray(benefits);
        const parsedMixedTypes = parseArray(pt); // property_type in POST is pt

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
                latitude, longitude, map_address,
                road_width, plot_gap, plot_size_width, plot_size_depth,
                orientation, parking_type, parking_slots, entry_points,
                mixed_use_selected_types
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18,
                $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, $46, $47, $48, $49, $50, $51, $52, $53, $54, $55, $56, $57, $58
            ) RETURNING *`,
            [
                title, developer, location, description, 'live', image, images, original_price, group_price, discount, savings, type, min_buyers, possession, rera_number, area, req.user.id, brochure_url,
                project_name, builder_name, pt, unit_configuration, project_level,
                offer_type, discount_percentage, discount_label, offer_expiry_datetime,
                regular_price_per_sqft, group_price_per_sqft, price_unit, currency || 'INR',
                regular_total_price, discounted_total_price_min, discounted_total_price_max,
                regular_price_min, regular_price_max,
                total_savings_min, total_savings_max, JSON.stringify(parsedBenefitsList),
                primary_cta_text, secondary_cta_text, details_page_url,
                regular_price_per_sqft_max, group_price_per_sqft_max,
                layout_columns, layout_rows,
                latitude || null, longitude || null, map_address || null,
                road_width || null, plot_gap || null, plot_size_width || null, plot_size_depth || null,
                orientation || null, parking_type || 'Front', parking_slots || 0, entry_points || null,
                [] // mixed_use_selected_types
            ]
        );

        res.status(201).json({ project: result.rows[0] });
    } catch (error) {
        console.error('Admin create project error:', error);
        res.status(500).json({ error: 'Failed to create project' });
    }
});

// Bulk Project & Hierarchy Creation (Atomic POST)
router.post('/admin/projects/bulk', authenticate, isAdmin, upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'brochure', maxCount: 1 }
]), async (req, res) => {
    const client = await pool.connect();
    try {
        console.log(`🚀 Starting Atomic Bulk Project Creation...`);
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
            orientation, parking_type, parking_slots, entry_points,
            mixed_use_selected_types
        } = req.body;

        const parseArray = (val) => {
            if (Array.isArray(val)) return val;
            if (typeof val === 'string' && val.trim() !== '') {
                try { return JSON.parse(val); } catch (e) { return []; }
            }
            return [];
        };

        const parsedBenefitsList = parseArray(benefits);
        const parsedMixedTypes = parseArray(mixed_use_selected_types);

        await client.query('BEGIN');

        // 1. Handle Files
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

        // 2. Insert Project
        const pRes = await client.query(
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
                orientation, parking_type, parking_slots, entry_points,
                mixed_use_selected_types
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18,
                $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, $46, $47, $48, $49, $50, $51, $52, $53, $54, $55, $56, $57, $58
            ) RETURNING id`,
            [
                title, developer, location, description, 'live', image, images, original_price, group_price, discount, savings, type, min_buyers, possession, rera_number, area, req.user.id, brochure_url,
                project_name, builder_name, pt, unit_configuration, project_level,
                offer_type, discount_percentage, discount_label, offer_expiry_datetime,
                regular_price_per_sqft, group_price_per_sqft, price_unit, currency || 'INR',
                regular_total_price, discounted_total_price_min, discounted_total_price_max,
                regular_price_min, regular_price_max,
                total_savings_min, total_savings_max, JSON.stringify(parsedBenefitsList),
                primary_cta_text, secondary_cta_text, details_page_url,
                regular_price_per_sqft_max, group_price_per_sqft_max,
                layout_columns, layout_rows,
                latitude || null, longitude || null, map_address || null,
                road_width || null, plot_gap || null, plot_size_width || null, plot_size_depth || null,
                orientation || null, parking_type || 'Front', parking_slots || 0, entry_points || null,
                parsedMixedTypes
            ]
        );
        const projectId = pRes.rows[0].id;

        // 3. Process Hierarchy
        const hierarchyData = typeof hierarchy === 'string' ? JSON.parse(hierarchy || '[]') : (hierarchy || []);

        for (const towerData of hierarchyData) {
            // Insert Tower
            const tRes = await client.query(
                'INSERT INTO live_group_towers (project_id, tower_name, total_floors, layout_columns, layout_rows, property_type) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
                [projectId, towerData.tower_name || towerData.name, towerData.total_floors || 0, towerData.layout_columns || null, towerData.layout_rows || null, towerData.property_type || null]
            );
            const towerId = tRes.rows[0].id;

            // Sync Units
            if (towerData.units && Array.isArray(towerData.units)) {
                for (const unit of towerData.units) {
                    await client.query(
                        `INSERT INTO live_group_units (
                            tower_id, floor_number, unit_number, unit_type, area, price, price_per_sqft, 
                            discount_price_per_sqft, status, carpet_area, super_built_up_area, facing, is_corner,
                            plot_width, plot_depth, front_side, back_side, left_side, right_side,
                            unit_image_url, unit_gallery, property_type
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)`,
                        [
                            towerId, unit.floor_number, unit.unit_number, unit.unit_type || 'Unit', unit.area || 0, unit.price || 0,
                            unit.price_per_sqft || 0, unit.discount_price_per_sqft || null, unit.status || 'available',
                            unit.carpet_area || null, unit.super_built_up_area || null, unit.facing || null, unit.is_corner || false,
                            unit.plot_width || null, unit.plot_depth || null, unit.front_side || null, unit.back_side || null, unit.left_side || null, unit.right_side || null,
                            unit.unit_image_url || null, unit.unit_gallery || [],
                            unit.property_type || unit.unit_type || null
                        ]
                    );
                }
            }
        }

        // 4. Update Project Aggregate Stats
        await client.query(`UPDATE live_group_projects SET total_slots = (SELECT COUNT(*) FROM live_group_units u JOIN live_group_towers t ON u.tower_id = t.id WHERE t.project_id = $1) WHERE id = $1`, [projectId]);

        await client.query('COMMIT');
        res.status(201).json({ message: 'Project and hierarchy created successfully', projectId });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Bulk Create Error:', error);
        res.status(500).json({ error: error.message || 'Failed to create project' });
    } finally {
        client.release();
    }
});

// Diagnostic Route
router.get('/admin/projects/:id/diag', authenticate, isAdmin, async (req, res) => {
    try {
        const projectId = req.params.id;
        const stats = await pool.query(`
            SELECT p.id, p.title, p.total_slots, 
                   (SELECT COUNT(*) FROM live_group_towers WHERE project_id = p.id) as tower_count,
                   (SELECT COUNT(*) FROM live_group_units u JOIN live_group_towers t ON u.tower_id = t.id WHERE t.project_id = p.id) as real_unit_count
            FROM live_group_projects p
            WHERE p.id = $1
        `, [projectId]);

        const towers = await pool.query(`
            SELECT t.id, t.tower_name, t.property_type, (SELECT COUNT(*) FROM live_group_units WHERE tower_id = t.id) as unit_count
            FROM live_group_towers t
            WHERE t.project_id = $1
        `, [projectId]);

        res.json({ stats: stats.rows[0], towers: towers.rows });
    } catch (error) {
        console.error('Diagnostic error:', error);
        res.status(500).json({ error: error.message });
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
                        unit.status || 'available', unit.unit_image_url || null, unit.unit_gallery || [],
                        unit.property_type || unit.unit_type || null
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
                        unit_image_url, unit_gallery, property_type
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
