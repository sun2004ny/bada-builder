
import pool from './config/database.js';

async function checkUnit() {
    try {
        console.log("Connecting...");
        // Find unit B-1
        const res = await pool.query("SELECT id, unit_number, unit_gallery, pg_typeof(unit_gallery) FROM live_group_units WHERE unit_number = 'B-1'");

        if (res.rows.length === 0) {
            console.log("Unit B-2 not found.");
        } else {
            const unit = res.rows[0];
            console.log("Found Unit:", unit.unit_number);
            console.log("Raw unit_gallery value:", unit.unit_gallery);
            console.log("Type of unit_gallery value:", typeof unit.unit_gallery);
            console.log("Is array?", Array.isArray(unit.unit_gallery));
            console.log("DB Column Type (pg_typeof):", unit.pg_typeof);
        }
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await pool.end();
    }
}

checkUnit();
