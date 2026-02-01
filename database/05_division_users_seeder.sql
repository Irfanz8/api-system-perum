-- =============================================================
-- SEEDER: User Divisions with Division Admins
-- =============================================================
-- Run after 02_seeder.sql and 04_division_admin_migration.sql
-- =============================================================
-- This creates realistic division assignments with:
-- - 1 Division Admin per division
-- - Multiple team members per division
-- - Superadmin remains global (not assigned to specific division)
-- =============================================================

-- =============================================================
-- CLEANUP EXISTING ASSIGNMENTS (Optional - comment out if needed)
-- =============================================================
-- TRUNCATE user_divisions CASCADE;

-- =============================================================
-- GET DIVISION IDs
-- =============================================================
DO $$
DECLARE
    div_keuangan UUID;
    div_properti UUID;
    div_penjualan UUID;
    div_gudang UUID;
    div_admin UUID;
    
    -- Division Admins
    admin_keuangan UUID;
    admin_properti UUID;
    admin_penjualan UUID;
    admin_gudang UUID;
    admin_sistem UUID;
    
    -- Superadmin (will get global access, no division)
    superadmin_id UUID;
BEGIN
    -- Get division IDs
    SELECT id INTO div_keuangan FROM divisions WHERE code = 'KEU';
    SELECT id INTO div_properti FROM divisions WHERE code = 'PROP';
    SELECT id INTO div_penjualan FROM divisions WHERE code = 'SALES';
    SELECT id INTO div_gudang FROM divisions WHERE code = 'WH';
    SELECT id INTO div_admin FROM divisions WHERE code = 'ADM';
    
    -- Create Division Admin users if they don't exist
    -- These users will be created in Supabase Auth first, then synced here
    
    -- For demo purposes, we'll use existing users or create placeholders
    -- In production, these would be real Supabase Auth users
    
    -- =============================================================
    -- CREATE DUMMY DIVISION ADMIN USERS
    -- =============================================================
    
    -- Admin Keuangan
    INSERT INTO users (id, username, email, role, is_active)
    VALUES (
        gen_random_uuid(),
        'Admin Keuangan',
        'admin.keuangan@perum.com',
        'user', -- role is 'user', but has division admin flag
        true
    )
    ON CONFLICT (email) DO UPDATE SET username = EXCLUDED.username
    RETURNING id INTO admin_keuangan;
    
    -- Admin Properti
    INSERT INTO users (id, username, email, role, is_active)
    VALUES (
        gen_random_uuid(),
        'Admin Properti',
        'admin.properti@perum.com',
        'user',
        true
    )
    ON CONFLICT (email) DO UPDATE SET username = EXCLUDED.username
    RETURNING id INTO admin_properti;
    
    -- Admin Penjualan
    INSERT INTO users (id, username, email, role, is_active)
    VALUES (
        gen_random_uuid(),
        'Admin Penjualan',
        'admin.penjualan@perum.com',
        'user',
        true
    )
    ON CONFLICT (email) DO UPDATE SET username = EXCLUDED.username
    RETURNING id INTO admin_penjualan;
    
    -- Admin Gudang
    INSERT INTO users (id, username, email, role, is_active)
    VALUES (
        gen_random_uuid(),
        'Admin Gudang',
        'admin.gudang@perum.com',
        'user',
        true
    )
    ON CONFLICT (email) DO UPDATE SET username = EXCLUDED.username
    RETURNING id INTO admin_gudang;
    
    -- Admin Sistem (untuk divisi Admin)
    INSERT INTO users (id, username, email, role, is_active)
    VALUES (
        gen_random_uuid(),
        'Admin Sistem',
        'admin.sistem@perum.com',
        'user',
        true
    )
    ON CONFLICT (email) DO UPDATE SET username = EXCLUDED.username
    RETURNING id INTO admin_sistem;
    
    -- Get superadmin if exists (keep them without division assignment)
    SELECT id INTO superadmin_id FROM users WHERE role = 'superadmin' LIMIT 1;
    
    -- =============================================================
    -- ASSIGN DIVISION ADMINS
    -- =============================================================
    
    -- Assign Admin Keuangan as Division Admin
    INSERT INTO user_divisions (user_id, division_id, is_division_admin)
    VALUES (admin_keuangan, div_keuangan, true)
    ON CONFLICT (user_id, division_id) DO UPDATE 
    SET is_division_admin = true;
    
    -- Assign Admin Properti as Division Admin
    INSERT INTO user_divisions (user_id, division_id, is_division_admin)
    VALUES (admin_properti, div_properti, true)
    ON CONFLICT (user_id, division_id) DO UPDATE 
    SET is_division_admin = true;
    
    -- Assign Admin Penjualan as Division Admin
    INSERT INTO user_divisions (user_id, division_id, is_division_admin)
    VALUES (admin_penjualan, div_penjualan, true)
    ON CONFLICT (user_id, division_id) DO UPDATE 
    SET is_division_admin = true;
    
    -- Assign Admin Gudang as Division Admin
    INSERT INTO user_divisions (user_id, division_id, is_division_admin)
    VALUES (admin_gudang, div_gudang, true)
    ON CONFLICT (user_id, division_id) DO UPDATE 
    SET is_division_admin = true;
    
    -- Assign Admin Sistem as Division Admin
    INSERT INTO user_divisions (user_id, division_id, is_division_admin)
    VALUES (admin_sistem, div_admin, true)
    ON CONFLICT (user_id, division_id) DO UPDATE 
    SET is_division_admin = true;
    
    -- =============================================================
    -- CREATE & ASSIGN TEAM MEMBERS
    -- =============================================================
    
    -- ========== DIVISI KEUANGAN ==========
    -- Team members for Keuangan division
    INSERT INTO users (id, username, email, role, is_active) VALUES
        (gen_random_uuid(), 'Budi Santoso', 'budi.santoso@perum.com', 'user', true),
        (gen_random_uuid(), 'Siti Aminah', 'siti.aminah@perum.com', 'user', true),
        (gen_random_uuid(), 'Ahmad Fauzi', 'ahmad.fauzi@perum.com', 'user', true)
    ON CONFLICT (email) DO NOTHING;
    
    -- Assign to Keuangan division
    INSERT INTO user_divisions (user_id, division_id, is_division_admin)
    SELECT u.id, div_keuangan, false
    FROM users u
    WHERE u.email IN ('budi.santoso@perum.com', 'siti.aminah@perum.com', 'ahmad.fauzi@perum.com')
    ON CONFLICT (user_id, division_id) DO NOTHING;
    
    -- ========== DIVISI PROPERTI ==========
    INSERT INTO users (id, username, email, role, is_active) VALUES
        (gen_random_uuid(), 'Dewi Lestari', 'dewi.lestari@perum.com', 'user', true),
        (gen_random_uuid(), 'Eko Prasetyo', 'eko.prasetyo@perum.com', 'user', true),
        (gen_random_uuid(), 'Fitri Handayani', 'fitri.handayani@perum.com', 'user', true)
    ON CONFLICT (email) DO NOTHING;
    
    INSERT INTO user_divisions (user_id, division_id, is_division_admin)
    SELECT u.id, div_properti, false
    FROM users u
    WHERE u.email IN ('dewi.lestari@perum.com', 'eko.prasetyo@perum.com', 'fitri.handayani@perum.com')
    ON CONFLICT (user_id, division_id) DO NOTHING;
    
    -- ========== DIVISI PENJUALAN ==========
    INSERT INTO users (id, username, email, role, is_active) VALUES
        (gen_random_uuid(), 'Gita Permata', 'gita.permata@perum.com', 'user', true),
        (gen_random_uuid(), 'Hendra Wijaya', 'hendra.wijaya@perum.com', 'user', true),
        (gen_random_uuid(), 'Indah Sari', 'indah.sari@perum.com', 'user', true),
        (gen_random_uuid(), 'Joko Susilo', 'joko.susilo@perum.com', 'user', true)
    ON CONFLICT (email) DO NOTHING;
    
    INSERT INTO user_divisions (user_id, division_id, is_division_admin)
    SELECT u.id, div_penjualan, false
    FROM users u
    WHERE u.email IN ('gita.permata@perum.com', 'hendra.wijaya@perum.com', 
                      'indah.sari@perum.com', 'joko.susilo@perum.com')
    ON CONFLICT (user_id, division_id) DO NOTHING;
    
    -- ========== DIVISI GUDANG ==========
    INSERT INTO users (id, username, email, role, is_active) VALUES
        (gen_random_uuid(), 'Kurnia Sari', 'kurnia.sari@perum.com', 'user', true),
        (gen_random_uuid(), 'Lukman Hakim', 'lukman.hakim@perum.com', 'user', true),
        (gen_random_uuid(), 'Maya Sari', 'maya.sari@perum.com', 'user', true)
    ON CONFLICT (email) DO NOTHING;
    
    INSERT INTO user_divisions (user_id, division_id, is_division_admin)
    SELECT u.id, div_gudang, false
    FROM users u
    WHERE u.email IN ('kurnia.sari@perum.com', 'lukman.hakim@perum.com', 'maya.sari@perum.com')
    ON CONFLICT (user_id, division_id) DO NOTHING;
    
    -- ========== DIVISI ADMIN ==========
    INSERT INTO users (id, username, email, role, is_active) VALUES
        (gen_random_uuid(), 'Nina Marlina', 'nina.marlina@perum.com', 'user', true),
        (gen_random_uuid(), 'Omar Bakri', 'omar.bakri@perum.com', 'user', true)
    ON CONFLICT (email) DO NOTHING;
    
    INSERT INTO user_divisions (user_id, division_id, is_division_admin)
    SELECT u.id, div_admin, false
    FROM users u
    WHERE u.email IN ('nina.marlina@perum.com', 'omar.bakri@perum.com')
    ON CONFLICT (user_id, division_id) DO NOTHING;
    
    -- =============================================================
    -- GRANT BASIC PERMISSIONS TO DIVISION ADMINS
    -- =============================================================
    -- Division admins get view access to their relevant modules
    
    -- Keuangan admin -> keuangan module
    INSERT INTO user_permissions (user_id, module_id, can_view, can_create, can_update, can_delete)
    SELECT admin_keuangan, m.id, true, true, true, true
    FROM modules m
    WHERE m.code IN ('dashboard', 'keuangan', 'reports')
    ON CONFLICT (user_id, module_id) DO UPDATE SET
        can_view = true, can_create = true, can_update = true, can_delete = true;
    
    -- Properti admin -> properti module
    INSERT INTO user_permissions (user_id, module_id, can_view, can_create, can_update, can_delete)
    SELECT admin_properti, m.id, true, true, true, true
    FROM modules m
    WHERE m.code IN ('dashboard', 'properti', 'reports')
    ON CONFLICT (user_id, module_id) DO UPDATE SET
        can_view = true, can_create = true, can_update = true, can_delete = true;
    
    -- Penjualan admin -> penjualan module
    INSERT INTO user_permissions (user_id, module_id, can_view, can_create, can_update, can_delete)
    SELECT admin_penjualan, m.id, true, true, true, true
    FROM modules m
    WHERE m.code IN ('dashboard', 'penjualan', 'reports')
    ON CONFLICT (user_id, module_id) DO UPDATE SET
        can_view = true, can_create = true, can_update = true, can_delete = true;
    
    -- Gudang admin -> persediaan module
    INSERT INTO user_permissions (user_id, module_id, can_view, can_create, can_update, can_delete)
    SELECT admin_gudang, m.id, true, true, true, true
    FROM modules m
    WHERE m.code IN ('dashboard', 'persediaan', 'reports')
    ON CONFLICT (user_id, module_id) DO UPDATE SET
        can_view = true, can_create = true, can_update = true, can_delete = true;
    
    -- Admin Sistem -> users, roles, divisions
    INSERT INTO user_permissions (user_id, module_id, can_view, can_create, can_update, can_delete)
    SELECT admin_sistem, m.id, true, true, true, false
    FROM modules m
    WHERE m.code IN ('dashboard', 'users', 'divisions', 'reports')
    ON CONFLICT (user_id, module_id) DO UPDATE SET
        can_view = true, can_create = true, can_update = true;
    
    -- View only for roles
    INSERT INTO user_permissions (user_id, module_id, can_view, can_create, can_update, can_delete)
    SELECT admin_sistem, m.id, true, false, false, false
    FROM modules m
    WHERE m.code = 'roles'
    ON CONFLICT (user_id, module_id) DO UPDATE SET can_view = true;
    
    RAISE NOTICE 'Division assignments completed successfully!';
    RAISE NOTICE '=================================================';
    RAISE NOTICE 'Division Admins created:';
    RAISE NOTICE '- Admin Keuangan: admin.keuangan@perum.com';
    RAISE NOTICE '- Admin Properti: admin.properti@perum.com';
    RAISE NOTICE '- Admin Penjualan: admin.penjualan@perum.com';
    RAISE NOTICE '- Admin Gudang: admin.gudang@perum.com';
    RAISE NOTICE '- Admin Sistem: admin.sistem@perum.com';
    RAISE NOTICE '=================================================';
    RAISE NOTICE 'Team members created per division: 2-4 users';
    RAISE NOTICE '=================================================';
    
END $$;

-- =============================================================
-- VERIFICATION QUERIES
-- =============================================================

-- View all division admins
-- SELECT * FROM division_admins ORDER BY division_name;

-- View all division members
-- SELECT * FROM division_members ORDER BY division_name, is_division_admin DESC;

-- Count members per division
-- SELECT 
--     d.name as division,
--     COUNT(*) as total_members,
--     COUNT(*) FILTER (WHERE ud.is_division_admin = true) as admins,
--     COUNT(*) FILTER (WHERE ud.is_division_admin = false) as members
-- FROM divisions d
-- LEFT JOIN user_divisions ud ON d.id = ud.division_id
-- GROUP BY d.id, d.name
-- ORDER BY d.name;
