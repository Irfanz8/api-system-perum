# API Sistem Pengelolaan Perumahan

Backend REST API untuk sistem pengelolaan perumahan yang mencakup manajemen keuangan, properti, dan persediaan.

## Fitur

- ✅ Manajemen Transaksi Keuangan (Pemasukan & Pengeluaran)
- ✅ Manajemen Properti (Rumah, Ruko, Apartemen, dll)
- ✅ Manajemen Persediaan (Material, Tools, Furniture)
- ✅ Manajemen Penjualan Properti
- ✅ Laporan dan Statistik
- ✅ CRUD lengkap untuk semua modul

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Security**: Helmet, CORS, Rate Limiting
- **Environment**: dotenv

## Instalasi

### Prerequisites

- Node.js (v14 atau higher)
- PostgreSQL (v12 atau higher)
- npm atau yarn

### Langkah-langkah Instalasi

1. Clone repository:
```bash
git clone <repository-url>
cd api-system-perum
```

2. Install dependensi:
```bash
npm install
```

3. Setup environment variables:
```bash
cp .env.example .env
```

4. Edit file `.env` sesuai dengan konfigurasi database Anda:
```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=perumahan_db
DB_USER=postgres
DB_PASSWORD=your_password_here
```

5. Setup database:
```bash
# Buat database PostgreSQL
createdb perumahan_db

# Import schema
psql -U postgres -d perumahan_db -f database/schema.sql
```

6. Jalankan server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

Server akan berjalan di `http://localhost:3000`

## API Endpoints

### Keuangan (/api/keuangan)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/keuangan` | Ambil semua transaksi |
| GET | `/api/keuangan/summary` | Ambil ringkasan keuangan |
| GET | `/api/keuangan/:id` | Ambil transaksi berdasarkan ID |
| POST | `/api/keuangan` | Buat transaksi baru |
| PUT | `/api/keuangan/:id` | Update transaksi |
| DELETE | `/api/keuangan/:id` | Hapus transaksi |

### Properti (/api/properti)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/properti` | Ambil semua properti |
| GET | `/api/properti/available` | Ambil properti yang tersedia |
| GET | `/api/properti/stats` | Ambil statistik properti |
| GET | `/api/properti/:id` | Ambil properti berdasarkan ID |
| GET | `/api/properti/:id/sales` | Ambil riwayat penjualan properti |
| POST | `/api/properti` | Buat properti baru |
| PUT | `/api/properti/:id` | Update properti |
| DELETE | `/api/properti/:id` | Hapus properti |
| PATCH | `/api/properti/:id/status` | Update status properti |

### Persediaan (/api/persediaan)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/persediaan` | Ambil semua item persediaan |
| GET | `/api/persediaan/low-stock` | Ambil item dengan stok rendah |
| GET | `/api/persediaan/stats` | Ambil statistik persediaan |
| GET | `/api/persediaan/:id` | Ambil item berdasarkan ID |
| GET | `/api/persediaan/:id/history` | Ambil riwayat transaksi item |
| POST | `/api/persediaan` | Buat item baru |
| PUT | `/api/persediaan/:id` | Update item |
| DELETE | `/api/persediaan/:id` | Hapus item |
| PATCH | `/api/persediaan/:id/quantity` | Update quantity item |
| POST | `/api/persediaan/:id/transaction` | Tambah transaksi (masuk/keluar) |

### Penjualan (/api/penjualan)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/penjualan` | Ambil semua penjualan |
| GET | `/api/penjualan/stats` | Ambil statistik penjualan |
| GET | `/api/penjualan/revenue/:year` | Ambil pendapatan bulanan |
| GET | `/api/penjualan/:id` | Ambil penjualan berdasarkan ID |
| POST | `/api/penjualan` | Buat penjualan baru |
| PUT | `/api/penjualan/:id` | Update penjualan |
| DELETE | `/api/penjualan/:id` | Hapus penjualan |
| PATCH | `/api/penjualan/:id/status` | Update status penjualan |
| POST | `/api/penjualan/:id/complete` | Selesaikan penjualan |

## Contoh Request

### Buat Transaksi Keuangan Baru

```bash
POST /api/keuangan
Content-Type: application/json

{
  "type": "income",
  "category": "penjualan",
  "amount": 500000000,
  "description": "Penjualan rumah type 36",
  "transaction_date": "2024-01-15",
  "property_id": 1
}
```

### Buat Properti Baru

```bash
POST /api/properti
Content-Type: application/json

{
  "name": "Rumah Type 36",
  "type": "rumah",
  "address": "Jl. Perumahan Indah No. 1",
  "price": 350000000,
  "status": "available",
  "description": "Rumah minimalis 2 kamar tidur",
  "luas_tanah": 72,
  "luas_bangunan": 36,
  "jumlah_kamar": 2,
  "jumlah_kamar_mandi": 1
}
```

### Buat Item Persediaan Baru

```bash
POST /api/persediaan
Content-Type: application/json

{
  "name": "Semen Portland",
  "category": "material",
  "quantity": 100,
  "unit": "sak",
  "unit_price": 65000,
  "supplier": "PT. Semen Indonesia",
  "min_stock": 20,
  "description": "Semen Portland 50kg"
}
```

### Tambah Transaksi Persediaan

```bash
POST /api/persediaan/1/transaction
Content-Type: application/json

{
  "type": "out",
  "quantity": 10,
  "description": "Penggunaan untuk pembangunan rumah A",
  "transaction_date": "2024-01-16"
}
```

### Buat Penjualan Properti Baru

```bash
POST /api/penjualan
Content-Type: application/json

{
  "property_id": 1,
  "buyer_name": "Budi Santoso",
  "buyer_email": "budi@email.com",
  "buyer_phone": "08123456789",
  "sale_price": 350000000,
  "sale_date": "2024-01-20",
  "status": "pending",
  "notes": "DP sudah dibayar 50%"
}
```

## Query Parameters

### Filter Keuangan
- `type`: Filter berdasarkan tipe (income/expense)
- `category`: Filter berdasarkan kategori
- `start_date`: Filter tanggal awal
- `end_date`: Filter tanggal akhir
- `limit`: Batas jumlah hasil

### Filter Properti
- `type`: Filter berdasarkan tipe properti
- `status`: Filter berdasarkan status
- `min_price`: Harga minimum
- `max_price`: Harga maksimum
- `limit`: Batas jumlah hasil

### Filter Persediaan
- `category`: Filter berdasarkan kategori
- `supplier`: Filter berdasarkan supplier
- `low_stock`: Tampilkan stok rendah (true/false)
- `limit`: Batas jumlah hasil

### Filter Penjualan
- `status`: Filter berdasarkan status
- `buyer_name`: Filter berdasarkan nama pembeli
- `start_date`: Filter tanggal awal
- `end_date`: Filter tanggal akhir
- `limit`: Batas jumlah hasil

## Testing dengan Postman/Insomnia

1. Import collection Postman (akan dibuatkan nanti)
2. Setup environment variables di Postman
3. Jalankan request untuk testing endpoint

## Database Schema

Lihat file `database/schema.sql` untuk detail lengkap struktur database.

Tabel utama:
- `users` - Pengguna sistem
- `properties` - Data properti
- `financial_transactions` - Transaksi keuangan
- `inventory` - Item persediaan
- `inventory_transactions` - Riwayat transaksi persediaan
- `property_sales` - Penjualan properti

## Error Handling

API mengembalikan respons error dengan format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

Status codes:
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

## Deployment

### Railway

1. Push code ke GitHub
2. Login ke Railway
3. Buat project baru dari repository GitHub
4. Setup environment variables di Railway
5. Deploy otomatis akan berjalan

### Render

1. Push code ke GitHub
2. Login ke Render
3. Buat Web Service baru
4. Hubungkan dengan repository GitHub
5. Setup environment variables
6. Deploy

## Contributing

1. Fork repository
2. Buat branch fitur (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buka Pull Request

## License

ISC

## Kontak

Untuk pertanyaan atau support, silakan buka issue di repository.