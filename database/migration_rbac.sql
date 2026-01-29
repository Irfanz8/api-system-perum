-- Migration: RBAC System with Divisions and Permissions
-- Run this migration to add division-based role management

-- ============================================
-- 1. DIVISIONS TABLE
-- ============================================
-- Divisions/Departments in the organization
CREATE TABLE IF NOT EXISTS divisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for updated_at
CREATE TRIGGER update_divisions_updated_at 
    BEFORE UPDATE ON divisions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 2. MODULES TABLE
-- ============================================
-- Modules/Menus that can be accessed (keuangan, properti, etc)
CREATE TABLE IF NOT EXISTS modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    route VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for updated_at
CREATE TRIGGER update_modules_updated_at 
    BEFORE UPDATE ON modules 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 3. USER-DIVISION ASSIGNMENT TABLE
-- ============================================
-- Many-to-many relationship between users and divisions
CREATE TABLE IF NOT EXISTS user_divisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    division_id UUID NOT NULL REFERENCES divisions(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, division_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_divisions_user_id ON user_divisions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_divisions_division_id ON user_divisions(division_id);

-- ============================================
-- 4. USER PERMISSIONS TABLE
-- ============================================
-- User access to modules with CRUD permissions
CREATE TABLE IF NOT EXISTS user_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    can_view BOOLEAN DEFAULT false,
    can_create BOOLEAN DEFAULT false,
    can_update BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    granted_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, module_id)
);

-- Create trigger for updated_at
CREATE TRIGGER update_user_permissions_updated_at 
    BEFORE UPDATE ON user_permissions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_module_id ON user_permissions(module_id);

-- ============================================
-- 5. SEED DATA: DEFAULT MODULES
-- ============================================
-- Insert default modules matching existing routes
INSERT INTO modules (name, code, description, icon, route, sort_order) VALUES
    ('Keuangan', 'keuangan', 'Manajemen keuangan dan transaksi', 'wallet', '/keuangan', 1),
    ('Properti', 'properti', 'Manajemen data properti', 'home', '/properti', 2),
    ('Persediaan', 'persediaan', 'Manajemen stok dan inventaris', 'package', '/persediaan', 3),
    ('Penjualan', 'penjualan', 'Manajemen penjualan properti', 'shopping-cart', '/penjualan', 4),
    ('User Management', 'users', 'Manajemen user (admin only)', 'users', '/users', 5),
    ('Role Management', 'roles', 'Manajemen role (superadmin only)', 'shield', '/roles', 6),
    ('Divisi', 'divisions', 'Manajemen divisi', 'building', '/divisions', 7)
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- 6. SEED DATA: DEFAULT DIVISIONS
-- ============================================
-- Insert default divisions
INSERT INTO divisions (name, code, description) VALUES
    ('Keuangan', 'KEU', 'Divisi Keuangan - mengelola transaksi dan laporan keuangan'),
    ('Properti', 'PROP', 'Divisi Properti - mengelola data dan informasi properti'),
    ('Penjualan', 'SALES', 'Divisi Penjualan - mengelola proses penjualan'),
    ('Gudang', 'WH', 'Divisi Gudang - mengelola persediaan dan stok')
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- 7. UPGRADE EXISTING USERS TO ADMIN
-- ============================================
-- Set all existing users (except superadmin) to admin role
UPDATE users 
SET role = 'admin' 
WHERE role = 'user';

-- ============================================
-- 8. ASSIGN ALL ADMINS TO ALL DIVISIONS
-- ============================================
-- Existing admins get access to all divisions
INSERT INTO user_divisions (user_id, division_id)
SELECT u.id, d.id
FROM users u
CROSS JOIN divisions d
WHERE u.role = 'admin'
ON CONFLICT (user_id, division_id) DO NOTHING;

-- ============================================
-- 9. GIVE ADMINS FULL PERMISSIONS ON ALL MODULES
-- ============================================
-- Admins get full CRUD on all modules
INSERT INTO user_permissions (user_id, module_id, can_view, can_create, can_update, can_delete)
SELECT u.id, m.id, true, true, true, true
FROM users u
CROSS JOIN modules m
WHERE u.role = 'admin'
ON CONFLICT (user_id, module_id) DO UPDATE SET
    can_view = true,
    can_create = true,
    can_update = true,
    can_delete = true;

-- ============================================
-- ROLLBACK SCRIPT (uncomment to rollback)
-- ============================================
-- DROP TABLE IF EXISTS user_permissions;
-- DROP TABLE IF EXISTS user_divisions;
-- DROP TABLE IF EXISTS modules;
-- DROP TABLE IF EXISTS divisions;

