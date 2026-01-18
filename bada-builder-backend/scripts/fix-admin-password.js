import bcrypt from 'bcryptjs';
import pool from '../config/database.js';

async function fixAdminPassword() {
  try {
    console.log('🔧 Fixing admin password...');
    
    const adminEmail = 'admin123@gmail.com';
    const adminPassword = 'admin@123';
    
    // Generate a fresh hash
    console.log('🔐 Generating password hash...');
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    console.log('✅ Password hash generated:', hashedPassword);
    
    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id, email, user_type FROM users WHERE email = $1',
      [adminEmail]
    );
    
    if (existingUser.rows.length === 0) {
      console.log('❌ Admin user not found. Creating new admin user...');
      
      // Create admin user
      const result = await pool.query(
        `INSERT INTO users (name, email, password, user_type, is_verified, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING id, email, name, user_type`,
        ['Admin User', adminEmail, hashedPassword, 'admin', true]
      );
      
      console.log('✅ Admin user created:', result.rows[0]);
    } else {
      console.log('👤 Admin user found. Updating password...');
      
      // Update password
      const result = await pool.query(
        `UPDATE users SET 
         password = $1, 
         user_type = 'admin',
         is_verified = true,
         updated_at = CURRENT_TIMESTAMP 
         WHERE email = $2
         RETURNING id, email, name, user_type`,
        [hashedPassword, adminEmail]
      );
      
      console.log('✅ Admin password updated:', result.rows[0]);
    }
    
    // Test the password
    console.log('🧪 Testing password...');
    const testUser = await pool.query('SELECT password FROM users WHERE email = $1', [adminEmail]);
    const isValid = await bcrypt.compare(adminPassword, testUser.rows[0].password);
    
    if (isValid) {
      console.log('✅ Password test PASSED - Login should work now!');
    } else {
      console.log('❌ Password test FAILED - Something is wrong');
    }
    
    console.log('');
    console.log('🔑 Admin Credentials:');
    console.log('   Email: admin123@gmail.com');
    console.log('   Password: admin@123');
    console.log('');
    console.log('🌐 Try logging in at: http://localhost:5173/login');
    
  } catch (error) {
    console.error('❌ Error fixing admin password:', error);
    throw error;
  }
}

// Run the script
fixAdminPassword()
  .then(() => {
    console.log('✅ Admin password fix completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Admin password fix failed:', error);
    process.exit(1);
  });