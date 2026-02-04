-- =============================================================
-- MIGRATION: Notifications System
-- =============================================================
-- Run this after existing migrations
-- =============================================================

-- =============================================================
-- 1. NOTIFICATIONS TABLE
-- =============================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Composite index for common query pattern (user's unread notifications)
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- =============================================================
-- 2. NOTIFICATION TYPES REFERENCE
-- =============================================================
-- Types:
--   sale_new       - New sale created
--   sale_complete  - Sale completed
--   low_stock      - Inventory low stock alert
--   payment_due    - Payment reminder (future)
--   system         - System notifications
--   info           - General information

COMMENT ON TABLE notifications IS 'User notifications for system events';
COMMENT ON COLUMN notifications.type IS 'Notification type: sale_new, sale_complete, low_stock, payment_due, system, info';
COMMENT ON COLUMN notifications.data IS 'Additional JSON data related to the notification (e.g., sale_id, inventory_id)';

-- =============================================================
-- 3. CLEANUP OLD NOTIFICATIONS (Optional trigger)
-- =============================================================
-- Auto-delete notifications older than 90 days (run via cron job or manually)
-- DELETE FROM notifications WHERE created_at < NOW() - INTERVAL '90 days';
