# 📊 Dummy Data untuk Database

File `dummy_data.sql` berisi sample data untuk semua tabel di database. Gunakan untuk testing dan development.

## 🚀 Cara Import

### Via psql (Command Line)

```bash
# Import ke Supabase PostgreSQL
psql $DATABASE_URL < database/dummy_data.sql

# Atau dengan password
psql -h db.xxx.supabase.co -U postgres -d postgres -f database/dummy_data.sql
```

### Via Supabase Dashboard

1. Buka Supabase Dashboard → **SQL Editor**
2. Copy isi file `dummy_data.sql`
3. Paste ke SQL Editor
4. Klik **Run**

### Via pgAdmin atau DBeaver

1. Buka file `dummy_data.sql`
2. Copy semua isinya
3. Paste ke query editor
4. Execute query

## ⚠️ Penting: UUID Users

**Sebelum import, pastikan:**

1. **User sudah dibuat di Supabase Auth** dengan email yang sesuai
2. **Ganti UUID di dummy_data.sql** dengan UUID user yang sebenarnya

### Cara mendapatkan UUID User:

1. Buka **Supabase Dashboard** → **Authentication** → **Users**
2. Cari user yang ingin digunakan
3. Copy **UUID** dari user tersebut
4. Ganti UUID di `dummy_data.sql` dengan UUID yang sebenarnya

### Contoh:

Jika di Supabase Auth ada user dengan:
- Email: `admin@perumahan.com`
- UUID: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

Maka di `dummy_data.sql`, ganti:
```sql
-- Sebelum
('00000000-0000-0000-0000-000000000001', 'admin', 'admin@perumahan.com', ...)

-- Sesudah
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'admin', 'admin@perumahan.com', ...)
```

## 📋 Data yang Tersedia

### Users (4 users)
- 1 Superadmin
- 1 Admin
- 2 User biasa

### Properties (8 properties)
- 5 Rumah (Type 36, 45, 60, 54)
- 2 Ruko (2 lantai dan 3 lantai)
- 1 Apartemen Studio
- Status: available, sold, reserved

### Financial Transactions (10 transactions)
- 4 Income (penjualan, sewa, lainnya)
- 6 Expense (operasional, gaji, pemeliharaan, marketing, pajak)

### Inventory (13 items)
- 7 Material (semen, bata, pasir, besi, cat, keramik, paku)
- 3 Tools (palu, obeng, meteran)
- 3 Furniture (kursi, meja, lemari)

### Inventory Transactions (10 transactions)
- 4 Stock in (pembelian)
- 6 Stock out (penggunaan)

### Property Sales (4 sales)
- 1 Completed sale
- 3 Pending sales

## 🔍 Verifikasi Data

Setelah import, verifikasi dengan query:

```sql
-- Cek jumlah data per tabel
SELECT 
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM properties) as properties,
  (SELECT COUNT(*) FROM financial_transactions) as transactions,
  (SELECT COUNT(*) FROM inventory) as inventory_items,
  (SELECT COUNT(*) FROM inventory_transactions) as inventory_transactions,
  (SELECT COUNT(*) FROM property_sales) as sales;
```

## 🧹 Reset Data (Opsional)

Jika ingin menghapus semua dummy data:

```sql
-- Hapus semua data (hati-hati!)
DELETE FROM property_sales;
DELETE FROM inventory_transactions;
DELETE FROM financial_transactions;
DELETE FROM inventory;
DELETE FROM properties;
-- Users jangan dihapus karena terkait dengan Supabase Auth
```

## 📝 Catatan

1. **Foreign Keys**: Pastikan UUID users valid sebelum import
2. **Dates**: Semua tanggal menggunakan format `YYYY-MM-DD`
3. **Amounts**: Semua nominal dalam Rupiah (IDR)
4. **Status**: Sesuai dengan enum yang didefinisikan di schema

## 🎯 Use Cases

Dummy data ini berguna untuk:
- ✅ Testing API endpoints
- ✅ Development frontend
- ✅ Demo aplikasi
- ✅ Testing reports dan statistics
- ✅ Training user

## 🔄 Update Data

Jika ingin menambah atau mengubah dummy data:
1. Edit file `dummy_data.sql`
2. Tambahkan INSERT statements baru
3. Import ulang (atau gunakan UPDATE untuk data yang sudah ada)

---

**Selamat menggunakan dummy data! 🎉**