import express from 'express';
import pool from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route GET /api/joined-live-groups
 * @desc Get all live groups joined by the logged-in user
 * @access Private
 */
router.get('/', authenticate, async (req, res) => {
    try {
        const userId = req.user.id; // User ID from auth middleware

        // Query to fetch Booked Units by this user
        // Joins with Towers and Projects to get context
        // "unit.booked_by = user.id" is the source of truth
        const query = `
            SELECT 
                u.id as unit_id,
                u.unit_number,
                u.floor_number,
                u.price as joined_price,
                u.booked_at,
                u.unit_type,
                u.area,
                u.price_per_sqft as unit_regular_rate,
                u.discount_price_per_sqft as unit_group_rate,
                
                t.tower_name,
                
                p.id as project_id,
                p.title as project_title,
                p.image as project_image,
                p.status as project_status,
                p.original_price as regular_price_project,
                p.group_price as group_price_project,
                p.regular_price_per_sqft as project_regular_rate,
                p.group_price_per_sqft as project_group_rate,
                p.total_slots,
                p.min_buyers,
                p.location as project_location,
                p.developer as project_developer,
                p.type as project_type,
                
                -- Calculate project level stats for progress
                (SELECT COUNT(*) 
                 FROM live_group_units u2 
                 JOIN live_group_towers t2 ON u2.tower_id = t2.id 
                 WHERE t2.project_id = p.id AND u2.status = 'booked') as total_joined_buyers

            FROM live_group_units u
            JOIN live_group_towers t ON u.tower_id = t.id
            JOIN live_group_projects p ON t.project_id = p.id
            WHERE u.booked_by = $1 AND u.status = 'booked'
            ORDER BY u.booked_at DESC
        `;

        const result = await pool.query(query, [userId]);

        // Transform data to match frontend requirements
        const joinedGroups = result.rows.map(row => {
            const totalJoined = parseInt(row.total_joined_buyers) || 0;
            const requiredBuyers = row.min_buyers || 1;

            // Progress Calculation
            let progress = Math.round((totalJoined / requiredBuyers) * 100);
            if (progress > 100) progress = 100;

            // Status Determination
            let displayStatus = 'active';
            if (row.project_status && (row.project_status.toLowerCase() === 'closed')) {
                displayStatus = 'closed';
            } else if (totalJoined < requiredBuyers) {
                displayStatus = 'waiting';
            } else {
                displayStatus = 'active'; // Target met or exceeded
            }

            // --- Financial Calculation Logic ---
            // 1. User Joined Price (Locked Price)
            let userPrice = parseFloat(row.joined_price) || 0;
            const area = parseFloat(row.area) || 0;

            if (userPrice === 0 && area > 0) {
                // Fallback: Use unit's discount rate or project's group rate
                const rate = parseFloat(row.unit_group_rate) || parseFloat(row.project_group_rate) || 0;
                userPrice = area * rate;
            }

            // 2. Regular Price (Market Price)
            let regularPrice = parseFloat(row.regular_price_project) || 0;

            if (regularPrice === 0 && area > 0) {
                // Fallback: Use unit's regular rate or project's regular rate
                const rate = parseFloat(row.unit_regular_rate) || parseFloat(row.project_regular_rate) || 0;
                regularPrice = area * rate;
            }

            // If we still have 0, fallback to a heuristic (User Price + 20%)
            if (regularPrice === 0 && userPrice > 0) {
                regularPrice = userPrice * 1.2;
            }

            const savings = regularPrice > userPrice ? regularPrice - userPrice : 0;

            // Token Assessment (Placeholder)
            const tokenPaid = 0;
            const remainingPayable = userPrice - tokenPaid;

            return {
                id: row.unit_id,
                projectId: row.project_id,
                projectName: row.project_title,
                projectImage: row.project_image,
                location: row.project_location || 'Prime Location',
                developer: row.project_developer || 'Premium Developer',
                assetType: row.project_type || row.unit_type || 'Residential',

                unitNumber: `${row.tower_name} - ${row.floor_number}${row.unit_number}`,
                joinedDate: row.booked_at,

                // Financials
                userJoinedPrice: userPrice,
                regularPrice: regularPrice,
                totalSavings: savings,
                tokenPaid: tokenPaid,
                remainingPayable: remainingPayable,

                // Status & Progress
                status: displayStatus,
                buyersJoined: totalJoined,
                buyersRequired: requiredBuyers,
                progressPercentage: progress,

                // UX Helpers
                isActivated: totalJoined >= requiredBuyers,
            };
        });

        res.json({ success: true, count: joinedGroups.length, data: joinedGroups });

    } catch (error) {
        console.error('Get Joined Live Groups Error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch joined live groups' });
    }
});

export default router;
