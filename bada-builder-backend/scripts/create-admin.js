import bcrypt from 'bcryptjs';
import pool from '../config/database.js';

async function createAdminUser() {
  try {
    console.log('🔧 Creating admin user...');
    
    const adminEmail = 'admin123@gmail.com';
    const adminPassword = 'admin@123';
    const adminName = 'Admin User';
    
    // Check if admin user already exists
    const existingUser = await pool.query(
      'SELECT id, email, user_type FROM users WHERE email = $1',
      [adminEmail]
    );
    
    if (existingUser.rows.length > 0) {
      const user = existingUser.rows[0];
      if (user.user_type === 'admin') {
        console.log('✅ Admin user already exists:', adminEmail);
        return;
      } else {
        // Update existing user to admin
        await pool.query(
          'UPDATE users SET user_type = $1, is_verified = true, updated_at = CURRENT_TIMESTAMP WHERE email = $2',
          ['admin', adminEmail]
        );
        console.log('✅ Updated existing user to admin:', adminEmail);
        return;
      }
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    // Create admin user
    const result = await pool.query(
      `INSERT INTO users (name, email, password, user_type, is_verified, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id, email, name, user_type`,
      [adminName, adminEmail, hashedPassword, 'admin', true]
    );
    
    const newUser = result.rows[0];
    console.log('✅ Admin user created successfully:');
    console.log('   ID:', newUser.id);
    console.log('   Email:', newUser.email);
    console.log('   Name:', newUser.name);
    console.log('   Type:', newUser.user_type);
    console.log('');
    console.log('🔑 Admin Credentials:');
    console.log('   Email: admin123@gmail.com');
    console.log('   Password: admin@123');
    console.log('');
    console.log('🌐 Access the admin panel at: /admin');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  }
}

// Run the script
createAdminUser()
  .then(() => {
    console.log('✅ Admin user setup completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Admin user setup failed:', error);
    process.exit(1);
  });