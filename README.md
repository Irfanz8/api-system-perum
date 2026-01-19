# API Sistem Pengelolaan Perumahan

Backend REST API untuk sistem pengelolaan perumahan yang mencakup manajemen keuangan, properti, dan persediaan dengan OAuth 2.0 authentication.

## Fitur

- ✅ Manajemen Transaksi Keuangan (Pemasukan & Pengeluaran)
- ✅ Manajemen Properti (Rumah, Ruko, Apartemen, dll)
- ✅ Manajemen Persediaan (Material, Tools, Furniture)
- ✅ Manajemen Penjualan Properti
- ✅ Laporan dan Statistik
- ✅ CRUD lengkap untuk semua modul
- ✅ OAuth 2.0 Authentication (Google, GitHub, dll)
- ✅ Email & Password Authentication
- ✅ Role-based Access Control (Admin, User)
- ✅ Refresh Token Support

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth (OAuth 2.0, Email/Password)
- **Security**: Helmet, CORS, Rate Limiting, JWT
- **Environment**: dotenv
- **Deployment**: Vercel, Fly.io, Render

## Instalasi

### Prerequisites

- Node.js (v14 atau higher)
- npm atau yarn
- Akun Supabase (Gratis di supabase.com)
- Akun Fly.io (Opsional untuk deployment)

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

3. Setup Supabase:

   a. Buat project baru di [Supabase](https://supabase.com/)
   
   b. Dapatkan credentials dari Settings → API:
      - Project URL
      - anon/public key
      - Database connection string

   c. Enable OAuth providers di Authentication → Providers:
      - Google
      - GitHub
      - dll

4. Setup environment variables:
```bash
cp .env.example .env
```

5. Edit file `.env` dengan konfigurasi Supabase:
```env
PORT=3000
NODE_ENV=development

# Frontend URL untuk OAuth redirect
FRONTEND_URL=http://localhost:3000

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

6. Setup database:
```bash
# Import schema ke Supabase
psql $DATABASE_URL < database/schema.sql
```

7. Jalankan server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

Server akan berjalan di `http://localhost:3000`

## API Documentation (Swagger)

Setelah server berjalan, Anda dapat mengakses dokumentasi API lengkap di:

**Swagger UI**: http://localhost:3000/api-docs

Dokumentasi Swagger menyediakan:
- ✅ Dokumentasi lengkap semua endpoint
- ✅ Try it out - test API langsung dari browser
- ✅ Request/Response examples
- ✅ Authentication dengan Bearer token
- ✅ Schema definitions

## API Endpoints

### Authentication (/api/auth)

| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| GET | `/api/auth/oauth` | Dapatkan OAuth URL | Public |
| POST | `/api/auth/callback` | Handle OAuth callback | Public |
| POST | `/api/auth/signup` | Sign up dengan email/password | Public |
| POST | `/api/auth/signin` | Sign in dengan email/password | Public |
| POST | `/api/auth/reset-password` | Reset password | Public |
| POST | `/api/auth/refresh-token` | Refresh access token | Public |
| POST | `/api/auth/signout` | Sign out | Protected |
| GET | `/api/auth/profile` | Get current user profile | Protected |
| PUT | `/api/auth/profile` | Update user profile | Protected |

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

### Sign Up dengan Email dan Password

```bash
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe",
  "role": "user"
}
```

### Sign In dengan Email dan Password

```bash
POST /api/auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "user": {
      "id": "user-uuid-here",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user"
    },
    "session": {
      "access_token": "eyJhbGc...",
      "refresh_token": "eyJhbGc...",
      "expires_at": 1705891200
    }
  }
}
```

### Get OAuth URL (Google)

```bash
GET /api/auth/oauth?provider=google&redirectTo=http://localhost:3000/auth/callback
```

Response:
```json
{
  "success": true,
  "data": {
    "url": "https://accounts.google.com/o/oauth2/v2/auth?...",
    "provider": "google"
  }
}
```

### Mengakses Endpoint yang Dilindungi

Untuk mengakses endpoint yang memerlukan autentikasi, sertakan token di header:

```bash
GET /api/keuangan
Authorization: Bearer eyJhbGc...
```

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
- `users` - Pengguna sistem (sinkronisasi dengan Supabase Auth)
- `properties` - Data properti
- `financial_transactions` - Transaksi keuangan
- `inventory` - Item persediaan
- `inventory_transactions` - Riwayat transaksi persediaan
- `property_sales` - Penjualan properti

### Sinkronisasi dengan Supabase Auth

Tabel `users` di database lokal akan otomatis disinkronisasi dengan Supabase Auth setiap kali user login atau register. ID user dari Supabase akan digunakan sebagai foreign key di tabel lain.

### Security Notes

- Semua password disimpan di Supabase Auth (bcrypt hashed)
- User OAuth tidak memiliki password di database lokal
- Access token dari Supabase digunakan untuk autentikasi
- Refresh token dapat digunakan untuk mendapatkan access token baru tanpa login ulang

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

### Deploy ke Vercel (Recommended)

1. **Via Dashboard (Paling Mudah)**:
   - Login ke [Vercel](https://vercel.com)
   - Klik "Add New Project"
   - Import repository `Irfanz8/api-system-perum`
   - Set environment variables:
     - `SUPABASE_URL`
     - `SUPABASE_ANON_KEY`
     - `DATABASE_URL`
     - `FRONTEND_URL`
     - `NODE_ENV=production`
   - Klik "Deploy"

2. **Via CLI**:
   ```bash
   npm i -g vercel
   vercel login
   vercel
   vercel --prod
   ```

   Lihat dokumentasi lengkap di [docs/VERCEL_DEPLOYMENT.md](./docs/VERCEL_DEPLOYMENT.md)

### Deploy ke Fly.io

1. Install Fly CLI:
```bash
curl -L https://fly.io/install.sh | sh
```

2. Login ke Fly.io:
```bash
fly auth login
```

3. Inisialisasi aplikasi:
```bash
fly launch
```

4. Setup environment variables di Fly.io dashboard:
   - SUPABASE_URL
   - SUPABASE_ANON_KEY
   - DATABASE_URL
   - FRONTEND_URL

5. Deploy aplikasi:
```bash
fly deploy
```

6. Cek status aplikasi:
```bash
fly status
```

7. Lihat logs:
```bash
fly logs
```

### Deploy dengan GitHub Actions (Opsional)

1. Buat repository di GitHub
2. Push code ke repository:
```bash
git remote add origin https://github.com/username/api-system-perum.git
git branch -M main
git push -u origin main
```

3. GitHub Actions akan otomatis deploy ke Fly.io (jika workflow dikonfigurasi)

### Environment Variables untuk Production

Setiap environment variable yang perlu di-set di Fly.io dashboard:
- `PORT`: 3000
- `NODE_ENV`: production
- `FRONTEND_URL`: URL frontend Anda
- `SUPABASE_URL`: URL dari Supabase dashboard
- `SUPABASE_ANON_KEY`: Anon key dari Supabase dashboard
- `DATABASE_URL`: Connection string dari Supabase database settings

## Contributing

1. Fork repository
2. Buat branch fitur (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buka Pull Request

## License

ISC

## Troubleshooting

### Error: "No authorization token provided"

Pastikan Anda menyertakan header Authorization dengan format:
```
Authorization: Bearer <your-access-token>
```

### Error: "Invalid or expired token"

Refresh token Anda menggunakan endpoint `/api/auth/refresh-token`:
```bash
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refresh_token": "your-refresh-token"
}
```

### Error: "Database connection failed"

Periksa:
1. DATABASE_URL di environment variables sudah benar
2. Supabase project dalam status active
3. IP address Anda tidak diblokir oleh Supabase

### Error: "Missing Supabase credentials"

Pastikan environment variables berikut sudah di-set:
- SUPABASE_URL
- SUPABASE_ANON_KEY
- DATABASE_URL

### OAuth tidak berfungsi

1. Pastikan OAuth provider sudah di-enable di Supabase dashboard
2. Periksa redirect URL di Supabase dashboard sudah sesuai dengan frontend Anda
3. FRONTEND_URL di environment variables harus sesuai dengan URL frontend Anda

## Testing dengan Postman/Insomnia

1. Import collection Postman (opsional)
2. Setup environment variables:
   - `base_url`: URL API Anda (http://localhost:3000 untuk development)
   - `access_token`: Token dari response login
3. Gunakan token untuk mengakses endpoint yang dilindungi

## Rate Limiting

API memiliki rate limiting untuk mencegah abuse:
- 100 requests per 15 menit per IP
- Error response: "Too many requests from this IP, please try again later."

Untuk mengubah rate limit, update environment variables:
- `RATE_LIMIT_WINDOW_MS`: Window time dalam milliseconds
- `RATE_LIMIT_MAX_REQUESTS`: Maximum requests per window

## Kontak

Untuk pertanyaan atau support, silakan buka issue di repository.