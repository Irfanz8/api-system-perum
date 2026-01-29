-- =============================================================
-- SEED DIVISIONS & PERMISSIONS
-- Jalankan SETELAH users dibuat via API atau Supabase Dashboard
-- =============================================================

-- =============================================================
-- STEP 1: Assign Users ke Divisions (berdasarkan email)
-- =============================================================

-- Admin Keuangan → Divisi Keuangan
INSERT INTO user_divisions (user_id, division_id)
SELECT u.id, d.id 
FROM users u, divisions d 
WHERE u.email = 'admin.keuangan@perumahan.com' AND d.code = 'KEU'
ON CONFLICT (user_id, division_id) DO NOTHING;

-- Staff Keuangan → Divisi Keuangan
INSERT INTO user_divisions (user_id, division_id)
SELECT u.id, d.id 
FROM users u, divisions d 
WHERE u.email = 'staff.keuangan@perumahan.com' AND d.code = 'KEU'
ON CONFLICT (user_id, division_id) DO NOTHING;

-- Admin Properti → Divisi Properti
INSERT INTO user_divisions (user_id, division_id)
SELECT u.id, d.id 
FROM users u, divisions d 
WHERE u.email = 'admin.properti@perumahan.com' AND d.code = 'PROP'
ON CONFLICT (user_id, division_id) DO NOTHING;

-- Staff Properti → Divisi Properti
INSERT INTO user_divisions (user_id, division_id)
SELECT u.id, d.id 
FROM users u, divisions d 
WHERE u.email = 'staff.properti@perumahan.com' AND d.code = 'PROP'
ON CONFLICT (user_id, division_id) DO NOTHING;

-- Admin Penjualan → Divisi Penjualan
INSERT INTO user_divisions (user_id, division_id)
SELECT u.id, d.id 
FROM users u, divisions d 
WHERE u.email = 'admin.penjualan@perumahan.com' AND d.code = 'SALES'
ON CONFLICT (user_id, division_id) DO NOTHING;

-- Staff Penjualan → Divisi Penjualan
INSERT INTO user_divisions (user_id, division_id)
SELECT u.id, d.id 
FROM users u, divisions d 
WHERE u.email = 'staff.penjualan@perumahan.com' AND d.code = 'SALES'
ON CONFLICT (user_id, division_id) DO NOTHING;

-- Admin Gudang → Divisi Gudang
INSERT INTO user_divisions (user_id, division_id)
SELECT u.id, d.id 
FROM users u, divisions d 
WHERE u.email = 'admin.gudang@perumahan.com' AND d.code = 'WH'
ON CONFLICT (user_id, division_id) DO NOTHING;

-- Staff Gudang → Divisi Gudang
INSERT INTO user_divisions (user_id, division_id)
SELECT u.id, d.id 
FROM users u, divisions d 
WHERE u.email = 'staff.gudang@perumahan.com' AND d.code = 'WH'
ON CONFLICT (user_id, division_id) DO NOTHING;

-- =============================================================
-- STEP 2: Set Permissions (berdasarkan email)
-- =============================================================

-- Admin Keuangan: Full CRUD ke keuangan
INSERT INTO user_permissions (user_id, module_id, can_view, can_create, can_update, can_delete)
SELECT u.id, m.id, true, true, true, true
FROM users u, modules m 
WHERE u.email = 'admin.keuangan@perumahan.com' AND m.code = 'keuangan'
ON CONFLICT (user_id, module_id) DO UPDATE SET
    can_view = true, can_create = true, can_update = true, can_delete = true;

-- Staff Keuangan: View only
INSERT INTO user_permissions (user_id, module_id, can_view, can_create, can_update, can_delete)
SELECT u.id, m.id, true, false, false, false
FROM users u, modules m 
WHERE u.email = 'staff.keuangan@perumahan.com' AND m.code = 'keuangan'
ON CONFLICT (user_id, module_id) DO UPDATE SET
    can_view = true, can_create = false, can_update = false, can_delete = false;

-- Admin Properti: Full CRUD ke properti
INSERT INTO user_permissions (user_id, module_id, can_view, can_create, can_update, can_delete)
SELECT u.id, m.id, true, true, true, true
FROM users u, modules m 
WHERE u.email = 'admin.properti@perumahan.com' AND m.code = 'properti'
ON CONFLICT (user_id, module_id) DO UPDATE SET
    can_view = true, can_create = true, can_update = true, can_delete = true;

-- Staff Properti: View only
INSERT INTO user_permissions (user_id, module_id, can_view, can_create, can_update, can_delete)
SELECT u.id, m.id, true, false, false, false
FROM users u, modules m 
WHERE u.email = 'staff.properti@perumahan.com' AND m.code = 'properti'
ON CONFLICT (user_id, module_id) DO UPDATE SET
    can_view = true, can_create = false, can_update = false, can_delete = false;

-- Admin Penjualan: Full CRUD ke penjualan
INSERT INTO user_permissions (user_id, module_id, can_view, can_create, can_update, can_delete)
SELECT u.id, m.id, true, true, true, true
FROM users u, modules m 
WHERE u.email = 'admin.penjualan@perumahan.com' AND m.code = 'penjualan'
ON CONFLICT (user_id, module_id) DO UPDATE SET
    can_view = true, can_create = true, can_update = true, can_delete = true;

-- Staff Penjualan: View + Create
INSERT INTO user_permissions (user_id, module_id, can_view, can_create, can_update, can_delete)
SELECT u.id, m.id, true, true, false, false
FROM users u, modules m 
WHERE u.email = 'staff.penjualan@perumahan.com' AND m.code = 'penjualan'
ON CONFLICT (user_id, module_id) DO UPDATE SET
    can_view = true, can_create = true, can_update = false, can_delete = false;

-- Admin Gudang: Full CRUD ke persediaan
INSERT INTO user_permissions (user_id, module_id, can_view, can_create, can_update, can_delete)
SELECT u.id, m.id, true, true, true, true
FROM users u, modules m 
WHERE u.email = 'admin.gudang@perumahan.com' AND m.code = 'persediaan'
ON CONFLICT (user_id, module_id) DO UPDATE SET
    can_view = true, can_create = true, can_update = true, can_delete = true;

-- Staff Gudang: View + Create + Update
INSERT INTO user_permissions (user_id, module_id, can_view, can_create, can_update, can_delete)
SELECT u.id, m.id, true, true, true, false
FROM users u, modules m 
WHERE u.email = 'staff.gudang@perumahan.com' AND m.code = 'persediaan'
ON CONFLICT (user_id, module_id) DO UPDATE SET
    can_view = true, can_create = true, can_update = true, can_delete = false;

-- =============================================================
-- VERIFY
-- =============================================================
-- Lihat hasil
SELECT u.email, u.role, d.name as division
FROM users u
LEFT JOIN user_divisions ud ON u.id = ud.user_id
LEFT JOIN divisions d ON ud.division_id = d.id
WHERE u.email LIKE '%@perumahan.com'
ORDER BY u.role, u.email;
