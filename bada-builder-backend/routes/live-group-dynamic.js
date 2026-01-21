import express from 'express';
import pool from '../config/database.js';
import { authenticate, optionalAuth, isAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { uploadImage, uploadMultipleImages, uploadFile } from '../services/cloudinary.js';

const router = express.Router();

// --- PUBLIC ROUTES ---

// Get all dynamic live grouping projects
router.get('/', optionalAuth, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT p.*, 
            (SELECT COUNT(*) FROM live_group_towers WHERE project_id = p.id) as tower_count
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
        const projectResult = await pool.query('SELECT * FROM live_group_projects WHERE id = $1', [projectId]);
        if (projectResult.rows.length === 0) return res.status(404).json({ error: 'Project not found' });

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

// --- ADMIN ROUTES ---

// Create Project
router.post('/admin/projects', authenticate, isAdmin, upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'brochure', maxCount: 1 }
]), async (req, res) => {
    try {
        const { title, developer, location, description, original_price, group_price, discount, savings, type, min_buyers, possession, rera_number, area } = req.body;

        let image = null;
        let images = [];
        let brochure_url = null;

        // Handle Images
        if (req.files && req.files['images']) {
            const imageBuffers = req.files['images'].map(file => file.buffer);
            images = await uploadMultipleImages(imageBuffers, 'live_grouping');
            image = images[0];
        }

        // Handle Brochure
        if (req.files && req.files['brochure']) {
            const brochureBuffer = req.files['brochure'][0].buffer;
            brochure_url = await uploadFile(brochureBuffer, 'live_grouping_brochures');
        }

        const result = await pool.query(
            `INSERT INTO live_group_projects (
        title, developer, location, description, status, image, images, 
        original_price, group_price, discount, savings, type, min_buyers,
        possession, rera_number, area, created_by, brochure_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) 
      RETURNING *`,
            [title, developer, location, description, 'live', image, images, original_price, group_price, discount, savings, type, min_buyers, possession, rera_number, area, req.user.id, brochure_url]
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
        const { tower_name, total_floors } = req.body;
        const project_id = req.params.id;

        const result = await pool.query(
            'INSERT INTO live_group_towers (project_id, tower_name, total_floors) VALUES ($1, $2, $3) RETURNING *',
            [project_id, tower_name, total_floors]
        );

        res.status(201).json({ tower: result.rows[0] });
    } catch (error) {
        console.error('Admin add tower error:', error);
        res.status(500).json({ error: 'Failed to add tower' });
    }
});

// Bulk Generate Units
router.post('/admin/towers/:id/generate-units', authenticate, isAdmin, async (req, res) => {
    try {
        const towerId = req.params.id;
        let { unitsPerFloor, pricePerUnit, unitType, areaPerUnit, hasBasement, hasGroundFloor } = req.body;

        // Force boolean conversion
        hasBasement = String(hasBasement) === 'true' || hasBasement === true;
        hasGroundFloor = String(hasGroundFloor) === 'true' || hasGroundFloor === true;

        // Get tower floors
        const towerResult = await pool.query('SELECT total_floors FROM live_group_towers WHERE id = $1', [towerId]);
        if (towerResult.rows.length === 0) return res.status(404).json({ error: 'Tower not found' });

        const floors = towerResult.rows[0].total_floors;
        const unitsData = [];
        const unitChars = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

        // Helper to add units for a specific floor
        const addUnitsForFloor = (floorNum, prefix = '') => {
            for (let u = 0; u < unitsPerFloor; u++) {
                const unitChar = unitChars[u] || u;
                // e.g. B-1A or GF-1A if you want prefixes, OR just B-A?
                // Standard convention: 
                // Floor 1: 1A, 1B
                // GF: GF-A, GF-B
                // Basement: B-A, B-B (or B1-A if multiple basements, but let's stick to B for single)

                let unitLabel = '';
                if (floorNum === -1) unitLabel = `B-${unitChar}`;
                else if (floorNum === 0) unitLabel = `GF-${unitChar}`;
                else unitLabel = `${floorNum}${unitChar}`;

                unitsData.push({
                    tower_id: towerId,
                    floor_number: floorNum,
                    unit_number: unitLabel,
                    unit_type: unitType,
                    area: areaPerUnit,
                    price: pricePerUnit,
                    status: 'available'
                });
            }
        };

        // 1. Basement (Floor -1)
        if (hasBasement) {
            addUnitsForFloor(-1);
        }

        // 2. Ground Floor (Floor 0)
        if (hasGroundFloor) {
            addUnitsForFloor(0);
        }

        // 3. Regular Floors (1 to N)
        for (let f = 1; f <= floors; f++) {
            addUnitsForFloor(f);
        }

        // Bulk insert
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            for (let unit of unitsData) {
                await client.query(
                    'INSERT INTO live_group_units (tower_id, floor_number, unit_number, unit_type, area, price, status) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                    [unit.tower_id, unit.floor_number, unit.unit_number, unit.unit_type, unit.area, unit.price, unit.status]
                );
            }
            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }

        // Update Project total_slots
        await pool.query(`
      UPDATE live_group_projects 
      SET total_slots = (
        SELECT COUNT(*) FROM live_group_units u 
        JOIN live_group_towers t ON u.tower_id = t.id 
        WHERE t.project_id = live_group_projects.id
      )
      WHERE id = (SELECT project_id FROM live_group_towers WHERE id = $1)
    `, [towerId]);

        res.json({ message: `Successfully generated ${unitsData.length} units` });
    } catch (error) {
        console.error('Admin generate units error:', error);
        res.status(500).json({ error: 'Failed to generate units' });
    }
});

// Delete Project
router.delete('/admin/projects/:id', authenticate, isAdmin, async (req, res) => {
    try {
        const projectId = req.params.id;
        // Cascading delete is handled by DB schema (ON DELETE CASCADE)
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

export default router;
