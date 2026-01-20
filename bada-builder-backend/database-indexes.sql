-- ============================================
-- SAFE DATABASE INDEXES FOR BADA BUILDER
-- Run with: psql $DATABASE_URL -f database-indexes.sql
-- All indexes use CONCURRENTLY (no locks)
-- All indexes use IF NOT EXISTS (idempotent)
-- ============================================

-- Properties Table (Critical - Most Queried)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_user_id 
ON properties(user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_status_active 
ON properties(status) 
WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_user_type 
ON properties(user_type);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_type_status 
ON properties(user_type, status) 
WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_created_at 
ON properties(created_at DESC);

-- Chats Table (High Priority)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chats_buyer_id 
ON chats(buyer_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chats_owner_id 
ON chats(owner_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chats_property_id 
ON chats(property_id);

-- Bookings Table
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_user_id 
ON bookings(user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_property_id 
ON bookings(property_id);

-- Complaints Table
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_complaints_status 
ON complaints(status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_complaints_user_id 
ON complaints(user_id);

-- Reviews Table
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_property_id 
ON reviews(property_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_user_id 
ON reviews(user_id);

-- Users Table
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email 
ON users(email);

-- User Subscriptions Table
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_subscriptions_user_id 
ON user_subscriptions(user_id);

-- Favorites Table
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_favorites_user_id 
ON favorites(user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_favorites_property_id 
ON favorites(property_id);

-- Live Grouping Tables
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_live_group_units_project_id 
ON live_group_units(project_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_live_group_units_status 
ON live_group_units(status);

-- ============================================
-- VERIFICATION QUERIES
-- Run these to check index creation
-- ============================================

-- List all indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Check index sizes
SELECT
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;

-- Check index usage stats
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as scans,
    idx_tup_read as tuples_read
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
