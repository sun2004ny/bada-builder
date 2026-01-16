-- ============================================
-- COMPLETE DATABASE SETUP FOR OTP SYSTEM
-- PostgreSQL (Neon DB Compatible)
-- ============================================

-- ============================================
-- 1. CREATE USERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    user_type VARCHAR(50) DEFAULT 'individual',
    profile_photo TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_subscribed BOOLEAN DEFAULT FALSE,
    subscription_expiry TIMESTAMP,
    subscription_plan VARCHAR(100),
    subscription_price DECIMAL(10, 2),
    subscribed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_verified ON users(is_verified);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- ============================================
-- 2. CREATE EMAIL_OTPS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS email_otps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for email_otps table
CREATE INDEX IF NOT EXISTS idx_email_otps_email ON email_otps(email);
CREATE INDEX IF NOT EXISTS idx_email_otps_expires ON email_otps(expires_at);
CREATE INDEX IF NOT EXISTS idx_email_otps_otp ON email_otps(otp);

-- ============================================
-- 3. ADD COMMENTS TO TABLES
-- ============================================

COMMENT ON TABLE users IS 'Stores user account information';
COMMENT ON COLUMN users.id IS 'Unique user identifier (UUID)';
COMMENT ON COLUMN users.email IS 'User email address (unique)';
COMMENT ON COLUMN users.password IS 'Hashed password using bcrypt';
COMMENT ON COLUMN users.is_verified IS 'Email verification status';
COMMENT ON COLUMN users.user_type IS 'Type of user: individual or developer';

COMMENT ON TABLE email_otps IS 'Stores temporary OTPs for email verification';
COMMENT ON COLUMN email_otps.otp IS '6-digit verification code';
COMMENT ON COLUMN email_otps.expires_at IS 'OTP expiration timestamp (5 minutes from creation)';

-- ============================================
-- 4. CREATE FAVORITES TABLE
-- ============================================

-- First, drop the existing table if it exists (to recreate with correct types)
DROP TABLE IF EXISTS favorites;

CREATE TABLE IF NOT EXISTS favorites (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    property_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, property_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_property_id ON favorites(property_id);

COMMENT ON TABLE favorites IS 'Stores user bookmarked properties';

-- ============================================
-- 5. SAMPLE QUERIES FOR TESTING
-- ============================================

-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'email_otps');

-- View all users
SELECT id, name, email, is_verified, user_type, created_at 
FROM users 
ORDER BY created_at DESC;

-- View active OTPs (not expired)
SELECT email, otp, expires_at, 
       CASE 
           WHEN expires_at > NOW() THEN 'Valid'
           ELSE 'Expired'
       END as status
FROM email_otps
ORDER BY created_at DESC;

-- Count users by verification status
SELECT 
    is_verified,
    COUNT(*) as user_count
FROM users
GROUP BY is_verified;

-- Count users by type
SELECT 
    user_type,
    COUNT(*) as user_count
FROM users
GROUP BY user_type;

-- ============================================
-- 5. CLEANUP QUERIES (USE WITH CAUTION)
-- ============================================

-- Delete expired OTPs
DELETE FROM email_otps WHERE expires_at < NOW();

-- Delete all OTPs (for testing)
-- DELETE FROM email_otps;

-- Delete all users (for testing - BE CAREFUL!)
-- DELETE FROM users;

-- Drop tables (for complete reset - BE VERY CAREFUL!)
-- DROP TABLE IF EXISTS email_otps CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- 6. USEFUL MAINTENANCE QUERIES
-- ============================================

-- Find users registered in last 24 hours
SELECT id, name, email, is_verified, created_at
FROM users
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- Find unverified users
SELECT id, name, email, created_at
FROM users
WHERE is_verified = FALSE
ORDER BY created_at DESC;

-- Count OTPs by email
SELECT email, COUNT(*) as otp_count
FROM email_otps
GROUP BY email
ORDER BY otp_count DESC;

-- Check database size
SELECT 
    pg_size_pretty(pg_database_size(current_database())) as database_size;

-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ============================================
-- 7. SECURITY BEST PRACTICES
-- ============================================

-- Ensure passwords are never stored in plain text
-- Always use bcrypt with salt rounds >= 10
-- OTPs should expire after 5 minutes
-- Delete OTPs after successful verification
-- Use SSL/TLS for database connections
-- Implement rate limiting on OTP requests
-- Log failed verification attempts

-- ============================================
-- 8. AUTOMATED CLEANUP (OPTIONAL)
-- ============================================

-- Create a function to clean up expired OTPs
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
    DELETE FROM email_otps WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- You can call this function periodically:
-- SELECT cleanup_expired_otps();

-- Or set up a cron job (if your database supports it)
-- Example: Run every hour
-- SELECT cron.schedule('cleanup-otps', '0 * * * *', 'SELECT cleanup_expired_otps()');

-- ============================================
-- END OF SQL SETUP
-- ============================================
