-- =============================================================
-- SEEDER: Dummy Data untuk Testing
-- =============================================================
-- Jalankan setelah 02_seeder.sql
-- =============================================================

-- =============================================================
-- 1. PROPERTIES (Properti)
-- =============================================================
INSERT INTO properties (name, type, address, price, status, description, luas_tanah, luas_bangunan, jumlah_kamar, jumlah_kamar_mandi) VALUES
    ('Rumah Tipe 36', 'rumah', 'Jl. Mawar No. 1, Blok A1, Perumahan Griya Asri', 350000000.00, 'available', 'Rumah minimalis tipe 36 dengan halaman depan dan carport. Lokasi strategis dekat sekolah.', 72.00, 36.00, 2, 1),
    ('Rumah Tipe 45', 'rumah', 'Jl. Melati No. 5, Blok B3, Perumahan Griya Asri', 450000000.00, 'available', 'Rumah tipe 45 dengan 2 kamar tidur dan ruang tamu luas. Sudah termasuk kitchen set.', 90.00, 45.00, 2, 1),
    ('Rumah Tipe 54', 'rumah', 'Jl. Kenanga No. 10, Blok C5, Perumahan Griya Asri', 550000000.00, 'reserved', 'Rumah tipe 54 dengan 3 kamar tidur, 2 kamar mandi, dan carport 2 mobil.', 120.00, 54.00, 3, 2),
    ('Rumah Tipe 70', 'rumah', 'Jl. Anggrek No. 8, Blok D2, Perumahan Griya Asri', 750000000.00, 'available', 'Rumah mewah tipe 70 dengan taman belakang, 3 kamar tidur master.', 150.00, 70.00, 3, 2),
    ('Ruko 2 Lantai', 'ruko', 'Jl. Raya Utama No. 101, Perumahan Griya Asri', 850000000.00, 'available', 'Ruko strategis 2 lantai di jalan utama, cocok untuk usaha.', 60.00, 80.00, 0, 2),
    ('Ruko 3 Lantai', 'ruko', 'Jl. Raya Utama No. 102, Perumahan Griya Asri', 1200000000.00, 'sold', 'Ruko premium 3 lantai dengan rooftop, lokasi sangat strategis.', 75.00, 150.00, 0, 3),
    ('Kavling Tanah A', 'kavling', 'Blok E1, Perumahan Griya Asri', 200000000.00, 'available', 'Kavling tanah siap bangun, sudah ada IMB.', 100.00, 0.00, 0, 0),
    ('Kavling Tanah B', 'kavling', 'Blok E2, Perumahan Griya Asri', 180000000.00, 'available', 'Kavling tanah hook, sudah rata dan siap bangun.', 90.00, 0.00, 0, 0),
    ('Rumah Tipe 100', 'rumah', 'Jl. Flamboyan No. 1, Blok F1, Perumahan Griya Asri', 1500000000.00, 'available', 'Rumah mewah 2 lantai dengan kolam renang dan taman luas.', 300.00, 200.00, 4, 3),
    ('Apartemen Studio', 'apartemen', 'Tower A, Lantai 5, Unit 501', 400000000.00, 'available', 'Apartemen studio fully furnished dengan view city.', 0.00, 25.00, 1, 1)
ON CONFLICT DO NOTHING;

-- =============================================================
-- 2. INVENTORY (Persediaan)
-- =============================================================
INSERT INTO inventory (name, category, quantity, unit, unit_price, supplier, min_stock, description) VALUES
    ('Semen Tiga Roda', 'material', 500, 'sak', 65000.00, 'PT. Indocement', 100, 'Semen portland tipe 1 untuk konstruksi umum'),
    ('Bata Merah', 'material', 10000, 'pcs', 800.00, 'UD. Bata Jaya', 2000, 'Bata merah press ukuran standar'),
    ('Pasir Beton', 'material', 200, 'kubik', 350000.00, 'CV. Pasir Makmur', 50, 'Pasir beton berkualitas dari Cirebon'),
    ('Besi 10mm', 'material', 1000, 'batang', 85000.00, 'PT. Krakatau Steel', 200, 'Besi beton polos diameter 10mm'),
    ('Besi 12mm', 'material', 800, 'batang', 120000.00, 'PT. Krakatau Steel', 150, 'Besi beton ulir diameter 12mm'),
    ('Keramik 40x40', 'material', 5000, 'pcs', 12000.00, 'Roman Ceramics', 1000, 'Keramik lantai motif marmer ukuran 40x40cm'),
    ('Cat Dulux Putih', 'material', 100, 'kaleng', 350000.00, 'PT. AkzoNobel', 20, 'Cat tembok interior warna putih 5kg'),
    ('Pipa PVC 3 inch', 'material', 200, 'batang', 75000.00, 'Wavin', 50, 'Pipa PVC untuk saluran air'),
    ('Kabel NYY 3x2.5', 'material', 50, 'roll', 850000.00, 'Supreme Cable', 10, 'Kabel listrik NYY untuk instalasi rumah'),
    ('Pintu Kayu Jati', 'material', 30, 'unit', 2500000.00, 'CV. Kayu Indah', 10, 'Pintu utama kayu jati solid'),
    ('Mixer Beton', 'tools', 5, 'unit', 15000000.00, 'Krisbow', 2, 'Mesin pengaduk semen kapasitas 350L'),
    ('Genset 5000W', 'tools', 3, 'unit', 12000000.00, 'Honda', 1, 'Generator listrik portable'),
    ('Scaffolding Set', 'tools', 20, 'set', 5000000.00, 'PT. Scaffolding Indonesia', 5, 'Set scaffolding untuk konstruksi'),
    ('Helm Safety', 'safety', 50, 'unit', 75000.00, 'MSA Safety', 20, 'Helm keselamatan kerja standar SNI'),
    ('Rompi Safety', 'safety', 50, 'unit', 45000.00, 'Local Brand', 20, 'Rompi keselamatan warna orange')
ON CONFLICT DO NOTHING;

-- =============================================================
-- 3. FINANCIAL TRANSACTIONS (Keuangan)
-- =============================================================
INSERT INTO financial_transactions (type, category, amount, description, transaction_date, property_id) VALUES
    -- Income
    ('income', 'penjualan', 1200000000.00, 'Penjualan Ruko 3 Lantai - Pembayaran Lunas', '2026-01-15', 6),
    ('income', 'dp', 55000000.00, 'DP Rumah Tipe 54 (10%) - Blok C5', '2026-01-20', 3),
    ('income', 'cicilan', 45000000.00, 'Cicilan ke-3 Rumah Tipe 45 - Blok B3', '2026-01-25', 2),
    ('income', 'booking_fee', 5000000.00, 'Booking Fee Rumah Tipe 70 - Blok D2', '2026-01-28', 4),
    ('income', 'penjualan', 200000000.00, 'Penjualan Kavling Tanah A - Blok E1', '2026-01-30', 7),
    
    -- Expenses
    ('expense', 'material', 32500000.00, 'Pembelian Semen 500 sak untuk proyek Blok D', '2026-01-10', NULL),
    ('expense', 'material', 85000000.00, 'Pembelian Besi Beton untuk konstruksi Tower B', '2026-01-12', NULL),
    ('expense', 'gaji', 150000000.00, 'Gaji Karyawan Bulan Januari 2026', '2026-01-31', NULL),
    ('expense', 'operasional', 25000000.00, 'Biaya Operasional Kantor Januari 2026', '2026-01-31', NULL),
    ('expense', 'marketing', 15000000.00, 'Biaya Marketing dan Promosi', '2026-01-15', NULL),
    ('expense', 'perizinan', 50000000.00, 'Biaya IMB Blok F', '2026-01-05', NULL),
    ('expense', 'material', 60000000.00, 'Pembelian Keramik untuk Blok A,B,C', '2026-01-18', NULL),
    ('expense', 'subkontraktor', 200000000.00, 'Pembayaran Subkon Pekerjaan Struktur', '2026-01-22', NULL),
    ('expense', 'utilitas', 8500000.00, 'Tagihan Listrik dan Air Januari 2026', '2026-01-31', NULL),
    ('expense', 'maintenance', 12000000.00, 'Perawatan Alat Berat dan Kendaraan', '2026-01-20', NULL)
ON CONFLICT DO NOTHING;

-- =============================================================
-- 4. INVENTORY TRANSACTIONS (Transaksi Persediaan)
-- =============================================================
INSERT INTO inventory_transactions (inventory_id, type, quantity, description, transaction_date) VALUES
    -- Masuk (In)
    (1, 'in', 500, 'Pembelian semen dari PT. Indocement', '2026-01-05'),
    (2, 'in', 10000, 'Pembelian bata merah', '2026-01-06'),
    (3, 'in', 200, 'Pembelian pasir beton', '2026-01-06'),
    (4, 'in', 1000, 'Pembelian besi 10mm', '2026-01-08'),
    (5, 'in', 800, 'Pembelian besi 12mm', '2026-01-08'),
    (6, 'in', 5000, 'Pembelian keramik 40x40', '2026-01-10'),
    
    -- Keluar (Out)
    (1, 'out', 150, 'Penggunaan untuk proyek Blok A', '2026-01-12'),
    (2, 'out', 3000, 'Penggunaan untuk proyek Blok A', '2026-01-12'),
    (3, 'out', 50, 'Penggunaan untuk proyek Blok A', '2026-01-13'),
    (4, 'out', 200, 'Penggunaan untuk proyek Blok A', '2026-01-15'),
    (1, 'out', 100, 'Penggunaan untuk proyek Blok B', '2026-01-18'),
    (5, 'out', 150, 'Penggunaan untuk proyek Blok B', '2026-01-18'),
    (6, 'out', 1000, 'Pemasangan lantai Blok A Unit 1-5', '2026-01-20'),
    (7, 'out', 20, 'Pengecatan Blok A Unit 1-5', '2026-01-25'),
    (14, 'out', 10, 'Distribusi helm safety ke pekerja baru', '2026-01-28')
ON CONFLICT DO NOTHING;

-- =============================================================
-- 5. PROPERTY SALES (Penjualan Properti)
-- =============================================================
INSERT INTO property_sales (property_id, buyer_name, buyer_email, buyer_phone, sale_price, sale_date, status, notes) VALUES
    (6, 'PT. Maju Bersama', 'finance@majubersama.co.id', '021-5551234', 1200000000.00, '2026-01-15', 'completed', 'Pembayaran lunas via transfer BCA'),
    (3, 'Budi Santoso', 'budi.santoso@gmail.com', '0812-3456-7890', 550000000.00, '2026-01-20', 'pending', 'DP 10% sudah dibayar, cicilan 60x'),
    (2, 'Siti Rahayu', 'siti.rahayu@yahoo.com', '0813-9876-5432', 450000000.00, '2025-10-15', 'pending', 'Cicilan ke-3 dari 48x, lancar'),
    (4, 'Andi Wijaya', 'andi.w@outlook.com', '0821-1111-2222', 750000000.00, '2026-01-28', 'pending', 'Booking fee 5jt, menunggu approval KPR'),
    (7, 'CV. Property Invest', 'invest@propertyinvest.id', '021-5559999', 200000000.00, '2026-01-30', 'completed', 'Pembelian kavling untuk investasi')
ON CONFLICT DO NOTHING;

-- =============================================================
-- SUMMARY
-- =============================================================
-- Properties: 10 data (rumah, ruko, kavling, apartemen)
-- Inventory: 15 data (material, tools, safety)
-- Financial: 15 data (income & expense)
-- Inventory Transactions: 15 data (in & out)
-- Property Sales: 5 data (completed & pending)
