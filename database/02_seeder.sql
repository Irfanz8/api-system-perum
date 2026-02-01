-- =============================================================
-- SEEDER: Data awal untuk RBAC dan dummy data
-- =============================================================
-- Jalankan setelah 01_schema.sql
-- =============================================================

-- =============================================================
-- 1. SEED DIVISIONS
-- =============================================================
INSERT INTO divisions (name, code, description) VALUES
    ('Keuangan', 'KEU', 'Divisi Keuangan - mengelola transaksi dan laporan keuangan'),
    ('Properti', 'PROP', 'Divisi Properti - mengelola data dan informasi properti'),
    ('Penjualan', 'SALES', 'Divisi Penjualan - mengelola proses penjualan'),
    ('Gudang', 'WH', 'Divisi Gudang - mengelola persediaan dan stok'),
    ('Admin', 'ADM', 'Divisi Administrasi - mengelola user dan sistem')
ON CONFLICT (code) DO NOTHING;

-- =============================================================
-- 2. SEED MODULES
-- =============================================================
INSERT INTO modules (name, code, description, icon, route, sort_order) VALUES
    ('Dashboard', 'dashboard', 'Dashboard utama aplikasi', 'home', '/dashboard', 0),
    ('Keuangan', 'keuangan', 'Manajemen keuangan dan transaksi', 'wallet', '/keuangan', 1),
    ('Properti', 'properti', 'Manajemen data properti', 'building', '/properti', 2),
    ('Persediaan', 'persediaan', 'Manajemen stok dan inventaris', 'package', '/persediaan', 3),
    ('Penjualan', 'penjualan', 'Manajemen penjualan properti', 'shopping-cart', '/penjualan', 4),
    ('User Management', 'users', 'Manajemen user', 'users', '/users', 5),
    ('Role Management', 'roles', 'Manajemen role dan permissions', 'shield', '/roles', 6),
    ('Divisi', 'divisions', 'Manajemen divisi', 'building-2', '/divisions', 7),
    ('Laporan', 'reports', 'Laporan dan analitik', 'chart', '/reports', 8)
ON CONFLICT (code) DO NOTHING;

-- =============================================================
-- 3. SYNC EXISTING AUTH USERS
-- =============================================================
INSERT INTO users (id, username, email, role, is_active, created_at)
SELECT 
    id,
    COALESCE(raw_user_meta_data->>'name', SPLIT_PART(email, '@', 1)),
    email,
    COALESCE(raw_user_meta_data->>'role', 'user'),
    true,
    created_at
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    username = COALESCE(EXCLUDED.username, users.username),
    updated_at = NOW();

-- =============================================================
-- 4. SUPERADMIN: Full access ke semua modules
-- =============================================================
INSERT INTO user_permissions (user_id, module_id, can_view, can_create, can_update, can_delete)
SELECT u.id, m.id, true, true, true, true
FROM users u CROSS JOIN modules m
WHERE u.role = 'superadmin'
ON CONFLICT (user_id, module_id) DO UPDATE SET
    can_view = EXCLUDED.can_view, 
    can_create = EXCLUDED.can_create, 
    can_update = EXCLUDED.can_update, 
    can_delete = EXCLUDED.can_delete;

-- =============================================================
-- 5. ADMIN: Full access ke semua modules
-- =============================================================
INSERT INTO user_permissions (user_id, module_id, can_view, can_create, can_update, can_delete)
SELECT u.id, m.id, true, true, true, true
FROM users u CROSS JOIN modules m
WHERE u.role = 'admin' AND m.code != 'roles'
ON CONFLICT (user_id, module_id) DO UPDATE SET
    can_view = EXCLUDED.can_view, 
    can_create = EXCLUDED.can_create, 
    can_update = EXCLUDED.can_update, 
    can_delete = EXCLUDED.can_delete;

-- ADMIN: View only untuk roles module
INSERT INTO user_permissions (user_id, module_id, can_view, can_create, can_update, can_delete)
SELECT u.id, m.id, true, false, false, false
FROM users u CROSS JOIN modules m
WHERE u.role = 'admin' AND m.code = 'roles'
ON CONFLICT (user_id, module_id) DO UPDATE SET
    can_view = EXCLUDED.can_view, 
    can_create = EXCLUDED.can_create, 
    can_update = EXCLUDED.can_update, 
    can_delete = EXCLUDED.can_delete;

-- =============================================================
-- 6. USER: View only pada basic modules
-- =============================================================
INSERT INTO user_permissions (user_id, module_id, can_view, can_create, can_update, can_delete)
SELECT u.id, m.id, true, false, false, false
FROM users u CROSS JOIN modules m
WHERE u.role = 'user' AND m.code IN ('dashboard', 'keuangan', 'properti', 'penjualan', 'persediaan')
ON CONFLICT (user_id, module_id) DO UPDATE SET
    can_view = EXCLUDED.can_view, 
    can_create = EXCLUDED.can_create, 
    can_update = EXCLUDED.can_update, 
    can_delete = EXCLUDED.can_delete;

-- USER: No access untuk modules lainnya
INSERT INTO user_permissions (user_id, module_id, can_view, can_create, can_update, can_delete)
SELECT u.id, m.id, false, false, false, false
FROM users u CROSS JOIN modules m
WHERE u.role = 'user' AND m.code NOT IN ('dashboard', 'keuangan', 'properti', 'penjualan', 'persediaan')
ON CONFLICT (user_id, module_id) DO UPDATE SET
    can_view = EXCLUDED.can_view, 
    can_create = EXCLUDED.can_create, 
    can_update = EXCLUDED.can_update, 
    can_delete = EXCLUDED.can_delete;

-- =============================================================
-- 7. ASSIGN DIVISIONS untuk Superadmin & Admin
-- =============================================================
INSERT INTO user_divisions (user_id, division_id)
SELECT u.id, d.id
FROM users u CROSS JOIN divisions d
WHERE u.role IN ('superadmin', 'admin')
ON CONFLICT (user_id, division_id) DO NOTHING;

-- =============================================================
-- 8. HELPER FUNCTIONS
-- =============================================================

-- Assign user ke divisi
CREATE OR REPLACE FUNCTION assign_user_to_division(p_email VARCHAR, p_division_code VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE v_user_id UUID; v_division_id UUID;
BEGIN
    SELECT id INTO v_user_id FROM users WHERE email = p_email;
    SELECT id INTO v_division_id FROM divisions WHERE code = p_division_code;
    IF v_user_id IS NULL OR v_division_id IS NULL THEN RETURN FALSE; END IF;
    INSERT INTO user_divisions (user_id, division_id) VALUES (v_user_id, v_division_id)
    ON CONFLICT DO NOTHING;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Set permission user
CREATE OR REPLACE FUNCTION set_user_permission(p_email VARCHAR, p_module VARCHAR, p_view BOOLEAN, p_create BOOLEAN, p_update BOOLEAN, p_delete BOOLEAN)
RETURNS BOOLEAN AS $$
DECLARE v_user_id UUID; v_module_id UUID;
BEGIN
    SELECT id INTO v_user_id FROM users WHERE email = p_email;
    SELECT id INTO v_module_id FROM modules WHERE code = p_module;
    IF v_user_id IS NULL OR v_module_id IS NULL THEN RETURN FALSE; END IF;
    INSERT INTO user_permissions (user_id, module_id, can_view, can_create, can_update, can_delete)
    VALUES (v_user_id, v_module_id, p_view, p_create, p_update, p_delete)
    ON CONFLICT (user_id, module_id) DO UPDATE SET
        can_view = p_view, can_create = p_create, can_update = p_update, can_delete = p_delete;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- =============================================================
-- USAGE
-- =============================================================
-- Set user sebagai superadmin:
-- UPDATE users SET role = 'superadmin' WHERE email = 'your@email.com';
-- Kemudian jalankan ulang seeder ini

-- Assign user ke divisi:
-- SELECT assign_user_to_division('user@email.com', 'KEU');

-- Set permission manual:
-- SELECT set_user_permission('user@email.com', 'keuangan', true, true, true, false);
