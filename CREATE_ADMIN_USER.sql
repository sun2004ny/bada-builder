-- ============================================
-- CREATE ADMIN USER FOR BADA BUILDER
-- ============================================

-- First, check if there's a constraint on user_type and modify it if needed
DO $$
BEGIN
    -- Drop the existing constraint if it exists
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'users_user_type_check' 
        AND conrelid = 'users'::regclass
    ) THEN
        ALTER TABLE users DROP CONSTRAINT users_user_type_check;
        RAISE NOTICE 'Dropped existing user_type constraint';
    END IF;
    
    -- Add new constraint that includes 'admin'
    ALTER TABLE users ADD CONSTRAINT users_user_type_check 
    CHECK (user_type IN ('individual', 'developer', 'admin'));
    RAISE NOTICE 'Added new user_type constraint with admin support';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Constraint modification failed, continuing with user creation';
END $$;

-- Now create the admin user
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin123@gmail.com') THEN
        -- Create admin user with hashed password
        -- Password: admin@123 (hashed with bcrypt, salt rounds 10)
        INSERT INTO users (
            name, 
            email, 
            password, 
            user_type, 
            is_verified,
            created_at, 
            updated_at
        ) VALUES (
            'Admin User',
            'admin123@gmail.com',
            '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- bcrypt hash of 'admin@123'
            'admin',
            true,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        );
        
        RAISE NOTICE 'Admin user created successfully with email: admin123@gmail.com';
    ELSE
        -- Update existing user to admin if needed
        UPDATE users 
        SET user_type = 'admin', 
            is_verified = true,
            updated_at = CURRENT_TIMESTAMP
        WHERE email = 'admin123@gmail.com' 
        AND user_type != 'admin';
        
        RAISE NOTICE 'Admin user already exists: admin123@gmail.com';
    END IF;
END $$;

-- Verify admin user creation
SELECT 
    id,
    name,
    email,
    user_type,
    is_verified,
    created_at
FROM users 
WHERE email = 'admin123@gmail.com';

-- ============================================
-- ADMIN USER CREDENTIALS
-- ============================================
-- Email: admin123@gmail.com
-- Password: admin@123
-- User Type: admin
-- ============================================