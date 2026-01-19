-- Dummy Data untuk Sistem Pengelolaan Perumahan
-- File ini berisi sample data untuk testing dan development
-- Import dengan: psql $DATABASE_URL < database/dummy_data.sql

-- ============================================
-- USERS (Sample Users)
-- ============================================
-- PENTING: Pastikan user dengan UUID ini sudah ada di Supabase Auth!
-- UUID: 1e84fc5f-1776-4b63-ab57-2bd3fe871782
-- 
-- Jika user belum ada di Supabase Auth, buat terlebih dahulu via Dashboard atau API
-- Setelah user dibuat, uncomment baris di bawah untuk insert ke tabel users:

INSERT INTO users (id, username, email, password_hash, role) VALUES
('1e84fc5f-1776-4b63-ab57-2bd3fe871782', 'admin', 'admin@perumahan.com', NULL, 'superadmin')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- PROPERTIES (Sample Properties)
-- ============================================
INSERT INTO properties (name, type, address, price, status, description, luas_tanah, luas_bangunan, jumlah_kamar, jumlah_kamar_mandi) VALUES
('Rumah Type 36', 'rumah', 'Jl. Perumahan Indah Blok A No. 1', 350000000, 'available', 'Rumah minimalis 2 kamar tidur, cocok untuk keluarga kecil', 72, 36, 2, 1),
('Rumah Type 45', 'rumah', 'Jl. Perumahan Indah Blok A No. 2', 450000000, 'available', 'Rumah dengan 3 kamar tidur, garasi, dan taman', 90, 45, 3, 2),
('Rumah Type 60', 'rumah', 'Jl. Perumahan Indah Blok B No. 1', 650000000, 'sold', 'Rumah mewah dengan 4 kamar tidur, 2 kamar mandi, dan kolam renang', 120, 60, 4, 2),
('Ruko 2 Lantai', 'ruko', 'Jl. Raya Perumahan No. 10', 800000000, 'available', 'Ruko strategis di pinggir jalan raya, 2 lantai, cocok untuk usaha', 60, 120, 0, 2),
('Apartemen Studio', 'apartemen', 'Tower A Lantai 5 Unit 501', 250000000, 'available', 'Apartemen studio dengan view kota, fully furnished', 25, 25, 1, 1),
('Rumah Type 36 Premium', 'rumah', 'Jl. Perumahan Elite Blok C No. 5', 400000000, 'reserved', 'Rumah dengan finishing premium, siap huni', 72, 36, 2, 2),
('Ruko 3 Lantai', 'ruko', 'Jl. Raya Perumahan No. 15', 1200000000, 'available', 'Ruko besar 3 lantai, sangat strategis untuk bisnis', 80, 240, 0, 3),
('Rumah Type 54', 'rumah', 'Jl. Perumahan Indah Blok C No. 3', 550000000, 'available', 'Rumah dengan 3 kamar tidur, ruang keluarga luas', 108, 54, 3, 2)
ON CONFLICT DO NOTHING;

-- ============================================
-- FINANCIAL TRANSACTIONS (Sample Transactions)
-- ============================================
-- UUID user: 1e84fc5f-1776-4b63-ab57-2bd3fe871782

-- Income transactions
INSERT INTO financial_transactions (type, category, amount, description, transaction_date, property_id, created_by) VALUES
('income', 'penjualan', 650000000, 'Penjualan Rumah Type 60 Blok B No. 1', '2024-01-15', 3, '1e84fc5f-1776-4b63-ab57-2bd3fe871782'),
('income', 'penjualan', 350000000, 'DP Penjualan Rumah Type 36 Premium', '2024-01-20', 6, '1e84fc5f-1776-4b63-ab57-2bd3fe871782'),
('income', 'sewa', 5000000, 'Pendapatan sewa ruko bulan Januari', '2024-01-01', 4, '1e84fc5f-1776-4b63-ab57-2bd3fe871782'),
('income', 'lainnya', 2000000, 'Pendapatan dari jasa konsultasi', '2024-01-10', NULL, '1e84fc5f-1776-4b63-ab57-2bd3fe871782'),

-- Expense transactions
('expense', 'biaya_operasional', 15000000, 'Biaya listrik, air, dan internet bulan Januari', '2024-01-05', NULL, '1e84fc5f-1776-4b63-ab57-2bd3fe871782'),
('expense', 'gaji', 5000000, 'Gaji staff bulan Januari', '2024-01-01', NULL, '1e84fc5f-1776-4b63-ab57-2bd3fe871782'),
('expense', 'pemeliharaan', 3000000, 'Perbaikan atap dan cat rumah', '2024-01-12', 1, '1e84fc5f-1776-4b63-ab57-2bd3fe871782'),
('expense', 'marketing', 5000000, 'Biaya iklan dan promosi', '2024-01-08', NULL, '1e84fc5f-1776-4b63-ab57-2bd3fe871782'),
('expense', 'pajak', 2000000, 'Pajak properti bulan Januari', '2024-01-15', 1, '1e84fc5f-1776-4b63-ab57-2bd3fe871782'),
('expense', 'biaya_operasional', 8000000, 'Biaya keamanan dan kebersihan', '2024-01-10', NULL, '1e84fc5f-1776-4b63-ab57-2bd3fe871782')
ON CONFLICT DO NOTHING;

-- ============================================
-- INVENTORY (Sample Inventory Items)
-- ============================================
INSERT INTO inventory (name, category, quantity, unit, unit_price, supplier, min_stock, description) VALUES
('Semen Portland', 'material', 150, 'sak', 65000, 'PT. Semen Indonesia', 20, 'Semen Portland 50kg'),
('Bata Merah', 'material', 5000, 'buah', 500, 'CV. Bata Jaya', 1000, 'Bata merah standar ukuran 20x10x5 cm'),
('Pasir', 'material', 20, 'm3', 250000, 'PT. Pasir Sejahtera', 5, 'Pasir halus untuk konstruksi'),
('Besi Beton', 'material', 500, 'batang', 85000, 'PT. Baja Nusantara', 100, 'Besi beton diameter 10mm'),
('Cat Tembok', 'material', 30, 'kaleng', 150000, 'PT. Cat Indah', 10, 'Cat tembok warna putih'),
('Keramik Lantai', 'material', 200, 'box', 350000, 'PT. Keramik Nusantara', 50, 'Keramik lantai ukuran 40x40 cm'),
('Paku', 'material', 50, 'kg', 25000, 'CV. Paku Jaya', 10, 'Paku berbagai ukuran'),
('Palu', 'tools', 10, 'pcs', 75000, 'PT. Alat Bangunan', 2, 'Palu kayu standar'),
('Obeng Set', 'tools', 5, 'set', 150000, 'PT. Alat Bangunan', 1, 'Set obeng berbagai ukuran'),
('Meteran', 'tools', 8, 'pcs', 50000, 'PT. Alat Bangunan', 2, 'Meteran 5 meter'),
('Kursi Kantor', 'furniture', 20, 'pcs', 500000, 'PT. Furniture Jaya', 5, 'Kursi kantor ergonomis'),
('Meja Rapat', 'furniture', 3, 'pcs', 2000000, 'PT. Furniture Jaya', 1, 'Meja rapat besar'),
('Lemari Arsip', 'furniture', 5, 'pcs', 1500000, 'PT. Furniture Jaya', 1, 'Lemari arsip 4 pintu')
ON CONFLICT DO NOTHING;

-- ============================================
-- INVENTORY TRANSACTIONS (Sample Transactions)
-- ============================================
-- UUID user: 1e84fc5f-1776-4b63-ab57-2bd3fe871782

-- Stock in (pembelian)
INSERT INTO inventory_transactions (inventory_id, type, quantity, description, transaction_date, created_by) VALUES
(1, 'in', 50, 'Pembelian semen untuk proyek rumah Type 36', '2024-01-05', '1e84fc5f-1776-4b63-ab57-2bd3fe871782'),
(2, 'in', 2000, 'Pembelian bata merah untuk pembangunan', '2024-01-06', '1e84fc5f-1776-4b63-ab57-2bd3fe871782'),
(3, 'in', 10, 'Pembelian pasir untuk proyek', '2024-01-07', '1e84fc5f-1776-4b63-ab57-2bd3fe871782'),
(4, 'in', 200, 'Pembelian besi beton untuk struktur', '2024-01-08', '1e84fc5f-1776-4b63-ab57-2bd3fe871782'),

-- Stock out (penggunaan)
(1, 'out', 30, 'Penggunaan semen untuk pembangunan rumah Type 36', '2024-01-10', '1e84fc5f-1776-4b63-ab57-2bd3fe871782'),
(2, 'out', 1000, 'Penggunaan bata untuk dinding rumah', '2024-01-11', '1e84fc5f-1776-4b63-ab57-2bd3fe871782'),
(3, 'out', 5, 'Penggunaan pasir untuk plesteran', '2024-01-12', '1e84fc5f-1776-4b63-ab57-2bd3fe871782'),
(4, 'out', 100, 'Penggunaan besi untuk struktur rumah', '2024-01-13', '1e84fc5f-1776-4b63-ab57-2bd3fe871782'),
(5, 'out', 10, 'Penggunaan cat untuk finishing rumah', '2024-01-14', '1e84fc5f-1776-4b63-ab57-2bd3fe871782'),
(6, 'out', 50, 'Pemasangan keramik lantai', '2024-01-15', '1e84fc5f-1776-4b63-ab57-2bd3fe871782')
ON CONFLICT DO NOTHING;

-- ============================================
-- PROPERTY SALES (Sample Sales)
-- ============================================
-- UUID user: 1e84fc5f-1776-4b63-ab57-2bd3fe871782

INSERT INTO property_sales (property_id, buyer_name, buyer_email, buyer_phone, sale_price, sale_date, status, notes, created_by) VALUES
(3, 'Budi Santoso', 'budi.santoso@email.com', '081234567890', 650000000, '2024-01-15', 'completed', 'Pembayaran lunas, proses serah terima selesai', '1e84fc5f-1776-4b63-ab57-2bd3fe871782'),
(6, 'Siti Nurhaliza', 'siti.nurhaliza@email.com', '081234567891', 350000000, '2024-01-20', 'pending', 'DP sudah dibayar 50%, sisa pembayaran bulan depan', '1e84fc5f-1776-4b63-ab57-2bd3fe871782'),
(1, 'Ahmad Fauzi', 'ahmad.fauzi@email.com', '081234567892', 350000000, '2024-01-25', 'pending', 'Sedang proses survey dan negosiasi', '1e84fc5f-1776-4b63-ab57-2bd3fe871782'),
(2, 'Dewi Sartika', 'dewi.sartika@email.com', '081234567893', 450000000, '2024-01-28', 'pending', 'Minat tinggi, menunggu persetujuan kredit', '1e84fc5f-1776-4b63-ab57-2bd3fe871782')
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Uncomment untuk melihat data yang sudah di-insert

-- SELECT COUNT(*) as total_users FROM users;
-- SELECT COUNT(*) as total_properties FROM properties;
-- SELECT COUNT(*) as total_transactions FROM financial_transactions;
-- SELECT COUNT(*) as total_inventory FROM inventory;
-- SELECT COUNT(*) as total_inventory_transactions FROM inventory_transactions;
-- SELECT COUNT(*) as total_sales FROM property_sales;

-- SELECT 
--   (SELECT COUNT(*) FROM users) as users,
--   (SELECT COUNT(*) FROM properties) as properties,
--   (SELECT COUNT(*) FROM financial_transactions) as transactions,
--   (SELECT COUNT(*) FROM inventory) as inventory_items,
--   (SELECT COUNT(*) FROM inventory_transactions) as inventory_transactions,
--   (SELECT COUNT(*) FROM property_sales) as sales;