import pool from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const createTables = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Drop tables in reverse order of dependencies if they exist
    await client.query('DROP TABLE IF EXISTS property_payments CASCADE');
    await client.query('DROP TABLE IF EXISTS installments CASCADE');
    await client.query('DROP TABLE IF EXISTS payment_plans CASCADE');
    await client.query('DROP TABLE IF EXISTS complaints CASCADE');
    await client.query('DROP TABLE IF EXISTS live_grouping_properties CASCADE');
    await client.query('DROP TABLE IF EXISTS bookings CASCADE');
    await client.query('DROP TABLE IF EXISTS properties CASCADE');
    await client.query('DROP TABLE IF EXISTS leads CASCADE');
    await client.query('DROP TABLE IF EXISTS users CASCADE');

    // Users table
    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        user_type VARCHAR(20) DEFAULT 'individual' CHECK (user_type IN ('individual', 'developer')),
        profile_photo TEXT,
        is_subscribed BOOLEAN DEFAULT FALSE,
        subscription_expiry TIMESTAMP,
        subscription_plan VARCHAR(50),
        subscription_price DECIMAL(10, 2),
        subscribed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Properties table
    await client.query(`
      CREATE TABLE properties (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        location VARCHAR(255) NOT NULL,
        price VARCHAR(100) NOT NULL,
        bhk VARCHAR(20),
        description TEXT,
        facilities TEXT[],
        image_url TEXT,
        images TEXT[],
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        user_type VARCHAR(20) NOT NULL,
        company_name VARCHAR(255),
        project_name VARCHAR(255),
        total_units VARCHAR(50),
        completion_date VARCHAR(50),
        rera_number VARCHAR(100),
        subscription_expiry TIMESTAMP,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'pending')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expired_at TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Leads table
    await client.query(`
      CREATE TABLE leads (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        requirement_type VARCHAR(50) NOT NULL,
        location VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Bookings table
    await client.query(`
      CREATE TABLE bookings (
        id SERIAL PRIMARY KEY,
        property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
        property_title VARCHAR(255) NOT NULL,
        property_location VARCHAR(255) NOT NULL,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        user_email VARCHAR(255) NOT NULL,
        visit_date DATE NOT NULL,
        visit_time VARCHAR(20) NOT NULL,
        number_of_people INTEGER DEFAULT 1,
        person1_name VARCHAR(255) NOT NULL,
        person2_name VARCHAR(255),
        person3_name VARCHAR(255),
        pickup_address TEXT,
        payment_method VARCHAR(50) DEFAULT 'postvisit',
        payment_status VARCHAR(20) DEFAULT 'pending',
        razorpay_payment_id VARCHAR(255),
        payment_amount DECIMAL(10, 2),
        payment_currency VARCHAR(10) DEFAULT 'INR',
        payment_timestamp TIMESTAMP,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Live grouping properties table
    await client.query(`
      CREATE TABLE live_grouping_properties (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        developer VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        original_price VARCHAR(100) NOT NULL,
        group_price VARCHAR(100) NOT NULL,
        discount VARCHAR(50),
        savings VARCHAR(100),
        type VARCHAR(50) NOT NULL,
        total_slots INTEGER DEFAULT 0,
        filled_slots INTEGER DEFAULT 0,
        time_left VARCHAR(50),
        min_buyers INTEGER DEFAULT 0,
        benefits TEXT[],
        status VARCHAR(50) DEFAULT 'Active',
        area VARCHAR(100),
        possession VARCHAR(100),
        rera_number VARCHAR(100),
        facilities TEXT[],
        description TEXT,
        advantages JSONB,
        group_details JSONB,
        images TEXT[],
        image TEXT,
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Complaints table
    await client.query(`
      CREATE TABLE complaints (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        complaint_type VARCHAR(100) NOT NULL,
        location VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        media_urls TEXT[],
        status VARCHAR(50) DEFAULT 'Submitted' CHECK (status IN ('Submitted', 'Under Review', 'In Progress', 'Resolved', 'Rejected')),
        admin_notes TEXT,
        resolution_photos TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Payment plans table (for 100 months system)
    await client.query(`
      CREATE TABLE payment_plans (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
        plan_type VARCHAR(50) DEFAULT '100_months',
        total_amount DECIMAL(12, 2) NOT NULL,
        booking_paid DECIMAL(12, 2) NOT NULL,
        monthly_amount DECIMAL(12, 2) NOT NULL,
        paid_months INTEGER DEFAULT 0,
        pending_months INTEGER NOT NULL,
        next_due_date DATE,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'delayed', 'defaulted', 'completed')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Installments table
    await client.query(`
      CREATE TABLE installments (
        id SERIAL PRIMARY KEY,
        plan_id INTEGER REFERENCES payment_plans(id) ON DELETE CASCADE,
        month_number INTEGER NOT NULL,
        amount DECIMAL(12, 2) NOT NULL,
        due_date DATE NOT NULL,
        paid_date TIMESTAMP,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
        late_fee DECIMAL(10, 2) DEFAULT 0,
        payment_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Property payments table
    await client.query(`
      CREATE TABLE property_payments (
        id SERIAL PRIMARY KEY,
        plan_id INTEGER REFERENCES payment_plans(id) ON DELETE CASCADE,
        installment_id INTEGER REFERENCES installments(id) ON DELETE SET NULL,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        amount DECIMAL(12, 2) NOT NULL,
        payment_method VARCHAR(50),
        razorpay_payment_id VARCHAR(255),
        status VARCHAR(20) DEFAULT 'success' CHECK (status IN ('success', 'failed', 'pending')),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_properties_user_id ON properties(user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_bookings_property_id ON bookings(property_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_payment_plans_user_id ON payment_plans(user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_installments_plan_id ON installments(plan_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_installments_status ON installments(status)`);

    await client.query('COMMIT');
    console.log('✅ Database tables created successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating tables:', error);
    throw error;
  } finally {
    client.release();
  }
};

createTables()
  .then(() => {
    console.log('✅ Migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
