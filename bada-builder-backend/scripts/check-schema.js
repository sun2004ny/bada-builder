import pool from '../config/database.js';

const checkSchema = async () => {
    try {
        const usersResult = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'id';
        `);
        console.log('USERS_ID_TYPE:', usersResult.rows[0]?.data_type);

        const propsResult = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'short_stay_properties' AND column_name = 'id';
        `);
        console.log('PROPERTIES_ID_TYPE:', propsResult.rows[0]?.data_type);

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkSchema();
