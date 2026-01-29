-- =============================================================
-- SEED USERS: User untuk setiap divisi beserta admin
-- =============================================================
-- 
-- PENTING: User harus dibuat terlebih dahulu via Supabase Auth!
-- Setelah user dibuat, copy UUID-nya dan ganti placeholder di bawah.
--
-- Cara membuat user di Supabase:
-- 1. Buka Dashboard Supabase → Authentication → Users → Add User
-- 2. Isi email dan password (gunakan password: Password123!)
-- 3. Salin UUID yang diberikan
-- 4. Ganti placeholder 'UUID_XXX' di bawah dengan UUID yang sebenarnya
-- =============================================================

-- =============================================================
-- STEP 1: Daftar User yang perlu dibuat di Supabase Auth
-- =============================================================
-- 
-- | No | Email                          | Password      | Role       |
-- |----|--------------------------------|---------------|------------|
-- | 1  | superadmin@perumahan.com       | Password123!  | superadmin |
-- | 2  | admin.keuangan@perumahan.com   | Password123!  | admin      |
-- | 3  | admin.properti@perumahan.com   | Password123!  | admin      |
-- | 4  | admin.penjualan@perumahan.com  | Password123!  | admin      |
-- | 5  | admin.gudang@perumahan.com     | Password123!  | admin      |
-- | 6  | staff.keuangan@perumahan.com   | Password123!  | user       |
-- | 7  | staff.properti@perumahan.com   | Password123!  | user       |
-- | 8  | staff.penjualan@perumahan.com  | Password123!  | user       |
-- | 9  | staff.gudang@perumahan.com     | Password123!  | user       |
--
-- =============================================================

-- =============================================================
-- STEP 2: Insert Users ke tabel users (ganti UUID dengan yang asli)
-- =============================================================

-- Hapus data lama (opsional - uncomment jika perlu reset)
-- DELETE FROM user_permissions;
-- DELETE FROM user_divisions;
-- DELETE FROM users WHERE email LIKE '%@perumahan.com';

-- ⚠️ PENTING: Ganti UUID di bawah dengan UUID dari Supabase Auth!
-- Atau comment INSERT users ini jika user sudah dibuat via endpoint /api/auth/signup

-- Contoh UUID (GANTI dengan UUID asli dari Supabase Auth):
-- Untuk mendapatkan UUID: Supabase Dashboard → Authentication → Users → Copy UUID

INSERT INTO users (id, username, email, password_hash, role) VALUES
-- Superadmin (full access)
('11111111-1111-1111-1111-111111111111', 'superadmin', 'superadmin@perumahan.com', NULL, 'superadmin'),

-- Admin per divisi
('22222222-2222-2222-2222-222222222221', 'admin_keuangan', 'admin.keuangan@perumahan.com', NULL, 'admin'),
('22222222-2222-2222-2222-222222222222', 'admin_properti', 'admin.properti@perumahan.com', NULL, 'admin'),
('22222222-2222-2222-2222-222222222223', 'admin_penjualan', 'admin.penjualan@perumahan.com', NULL, 'admin'),
('22222222-2222-2222-2222-222222222224', 'admin_gudang', 'admin.gudang@perumahan.com', NULL, 'admin'),

-- Staff per divisi (user biasa)
('33333333-3333-3333-3333-333333333331', 'staff_keuangan', 'staff.keuangan@perumahan.com', NULL, 'user'),
('33333333-3333-3333-3333-333333333332', 'staff_properti', 'staff.properti@perumahan.com', NULL, 'user'),
('33333333-3333-3333-3333-333333333333', 'staff_penjualan', 'staff.penjualan@perumahan.com', NULL, 'user'),
('33333333-3333-3333-3333-333333333334', 'staff_gudang', 'staff.gudang@perumahan.com', NULL, 'user')
ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    email = EXCLUDED.email,
    role = EXCLUDED.role;

-- =============================================================
-- STEP 3: Assign Users ke Divisions
-- =============================================================

-- Pastikan divisions sudah ada (dari migration_rbac.sql)
-- Jika belum, jalankan ini:
-- INSERT INTO divisions (name, code, description) VALUES
--     ('Keuangan', 'KEU', 'Divisi Keuangan'),
--     ('Properti', 'PROP', 'Divisi Properti'),
--     ('Penjualan', 'SALES', 'Divisi Penjualan'),
--     ('Gudang', 'WH', 'Divisi Gudang')
-- ON CONFLICT (code) DO NOTHING;

-- Assign Admin Keuangan ke divisi Keuangan
INSERT INTO user_divisions (user_id, division_id)
SELECT '22222222-2222-2222-2222-222222222221'::uuid, d.id FROM divisions d WHERE d.code = 'KEU'
ON CONFLICT (user_id, division_id) DO NOTHING;

-- Assign Staff Keuangan ke divisi Keuangan
INSERT INTO user_divisions (user_id, division_id)
SELECT '33333333-3333-3333-3333-333333333331'::uuid, d.id FROM divisions d WHERE d.code = 'KEU'
ON CONFLICT (user_id, division_id) DO NOTHING;

-- Assign Admin Properti ke divisi Properti
INSERT INTO user_divisions (user_id, division_id)
SELECT '22222222-2222-2222-2222-222222222222'::uuid, d.id FROM divisions d WHERE d.code = 'PROP'
ON CONFLICT (user_id, division_id) DO NOTHING;

-- Assign Staff Properti ke divisi Properti
INSERT INTO user_divisions (user_id, division_id)
SELECT '33333333-3333-3333-3333-333333333332'::uuid, d.id FROM divisions d WHERE d.code = 'PROP'
ON CONFLICT (user_id, division_id) DO NOTHING;

-- Assign Admin Penjualan ke divisi Penjualan
INSERT INTO user_divisions (user_id, division_id)
SELECT '22222222-2222-2222-2222-222222222223'::uuid, d.id FROM divisions d WHERE d.code = 'SALES'
ON CONFLICT (user_id, division_id) DO NOTHING;

-- Assign Staff Penjualan ke divisi Penjualan
INSERT INTO user_divisions (user_id, division_id)
SELECT '33333333-3333-3333-3333-333333333333'::uuid, d.id FROM divisions d WHERE d.code = 'SALES'
ON CONFLICT (user_id, division_id) DO NOTHING;

-- Assign Admin Gudang ke divisi Gudang
INSERT INTO user_divisions (user_id, division_id)
SELECT '22222222-2222-2222-2222-222222222224'::uuid, d.id FROM divisions d WHERE d.code = 'WH'
ON CONFLICT (user_id, division_id) DO NOTHING;

-- Assign Staff Gudang ke divisi Gudang
INSERT INTO user_divisions (user_id, division_id)
SELECT '33333333-3333-3333-3333-333333333334'::uuid, d.id FROM divisions d WHERE d.code = 'WH'
ON CONFLICT (user_id, division_id) DO NOTHING;

-- =============================================================
-- STEP 4: Set Permissions untuk setiap user
-- =============================================================

-- Helper: Get module IDs
-- SELECT id, code FROM modules;

-- Admin Keuangan: Full access ke module keuangan
INSERT INTO user_permissions (user_id, module_id, can_view, can_create, can_update, can_delete)
SELECT '22222222-2222-2222-2222-222222222221'::uuid, m.id, true, true, true, true
FROM modules m WHERE m.code = 'keuangan'
ON CONFLICT (user_id, module_id) DO UPDATE SET
    can_view = true, can_create = true, can_update = true, can_delete = true;

-- Staff Keuangan: View only ke module keuangan
INSERT INTO user_permissions (user_id, module_id, can_view, can_create, can_update, can_delete)
SELECT '33333333-3333-3333-3333-333333333331'::uuid, m.id, true, false, false, false
FROM modules m WHERE m.code = 'keuangan'
ON CONFLICT (user_id, module_id) DO UPDATE SET
    can_view = true, can_create = false, can_update = false, can_delete = false;

-- Admin Properti: Full access ke module properti
INSERT INTO user_permissions (user_id, module_id, can_view, can_create, can_update, can_delete)
SELECT '22222222-2222-2222-2222-222222222222'::uuid, m.id, true, true, true, true
FROM modules m WHERE m.code = 'properti'
ON CONFLICT (user_id, module_id) DO UPDATE SET
    can_view = true, can_create = true, can_update = true, can_delete = true;

-- Staff Properti: View only ke module properti  
INSERT INTO user_permissions (user_id, module_id, can_view, can_create, can_update, can_delete)
SELECT '33333333-3333-3333-3333-333333333332'::uuid, m.id, true, false, false, false
FROM modules m WHERE m.code = 'properti'
ON CONFLICT (user_id, module_id) DO UPDATE SET
    can_view = true, can_create = false, can_update = false, can_delete = false;

-- Admin Penjualan: Full access ke module penjualan
INSERT INTO user_permissions (user_id, module_id, can_view, can_create, can_update, can_delete)
SELECT '22222222-2222-2222-2222-222222222223'::uuid, m.id, true, true, true, true
FROM modules m WHERE m.code = 'penjualan'
ON CONFLICT (user_id, module_id) DO UPDATE SET
    can_view = true, can_create = true, can_update = true, can_delete = true;

-- Staff Penjualan: View + Create ke module penjualan
INSERT INTO user_permissions (user_id, module_id, can_view, can_create, can_update, can_delete)
SELECT '33333333-3333-3333-3333-333333333333'::uuid, m.id, true, true, false, false
FROM modules m WHERE m.code = 'penjualan'
ON CONFLICT (user_id, module_id) DO UPDATE SET
    can_view = true, can_create = true, can_update = false, can_delete = false;

-- Admin Gudang: Full access ke module persediaan
INSERT INTO user_permissions (user_id, module_id, can_view, can_create, can_update, can_delete)
SELECT '22222222-2222-2222-2222-222222222224'::uuid, m.id, true, true, true, true
FROM modules m WHERE m.code = 'persediaan'
ON CONFLICT (user_id, module_id) DO UPDATE SET
    can_view = true, can_create = true, can_update = true, can_delete = true;

-- Staff Gudang: View + Create + Update ke module persediaan
INSERT INTO user_permissions (user_id, module_id, can_view, can_create, can_update, can_delete)
SELECT '33333333-3333-3333-3333-333333333334'::uuid, m.id, true, true, true, false
FROM modules m WHERE m.code = 'persediaan'
ON CONFLICT (user_id, module_id) DO UPDATE SET
    can_view = true, can_create = true, can_update = true, can_delete = false;

-- =============================================================
-- STEP 5: Verify data
-- =============================================================
-- Uncomment untuk verifikasi

-- Lihat semua users
-- SELECT id, username, email, role FROM users WHERE email LIKE '%@perumahan.com';

-- Lihat user divisions
-- SELECT u.email, d.name as division 
-- FROM user_divisions ud
-- JOIN users u ON ud.user_id = u.id
-- JOIN divisions d ON ud.division_id = d.id;

-- Lihat user permissions
-- SELECT u.email, m.name as module, up.can_view, up.can_create, up.can_update, up.can_delete
-- FROM user_permissions up
-- JOIN users u ON up.user_id = u.id
-- JOIN modules m ON up.module_id = m.id
-- ORDER BY u.email, m.name;
