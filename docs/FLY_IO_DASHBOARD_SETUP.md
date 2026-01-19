# 🚀 Setup Fly.io via Dashboard (GitHub Integration)

Panduan step-by-step untuk setup aplikasi via Fly.io Dashboard dengan GitHub integration.

## ⚠️ Masalah yang Sering Terjadi

Dari screenshot, ada beberapa masalah yang perlu diperbaiki:

### 1. **Internal Port Salah**
- ❌ Dashboard menunjukkan: `8080`
- ✅ Seharusnya: `3000`

### 2. **Memory Terlalu Kecil**
- ❌ Dashboard menunjukkan: `256MB`
- ✅ Seharusnya: Minimal `512MB` (disarankan)

### 3. **Error: "Failed to create app"**
- Bisa karena app name sudah digunakan
- Atau konfigurasi tidak valid

## 📋 Langkah-Langkah Setup yang Benar

### Step 1: Buka Fly.io Dashboard

1. Login ke https://fly.io/dashboard
2. Klik **"Launch an App from GitHub"**

### Step 2: Pilih Repository

1. **Organization**: Pilih `Irfanz8`
2. **Repository**: Pilih `api-system-perum`
3. Pastikan commit terbaru terlihat (e3c17a0 on main)

### Step 3: Konfigurasi App

**⚠️ PENTING: Isi dengan nilai berikut:**

1. **App name**: 
   ```
   api-system-perum
   ```
   (atau nama lain jika sudah digunakan)

2. **Organization**: 
   ```
   Personal
   ```

3. **Branch**: 
   ```
   main
   ```

4. **Region**: 
   ```
   sin - Singapore
   ```
   (atau pilih yang terdekat dengan Anda)

5. **Internal port**: 
   ```
   3000
   ```
   ⚠️ **JANGAN 8080!** Harus **3000**

6. **CPU(s)**: 
   ```
   shared-cpu-1x
   ```
   (atau shared-cpu-2x jika perlu)

7. **Memory**: 
   ```
   512MB
   ```
   ⚠️ **JANGAN 256MB!** Minimal **512MB**

### Step 4: Environment Variables

Klik **"Environment Variables"** dan tambahkan:

```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=your_database_url
FRONTEND_URL=https://your-frontend-domain.com
NODE_ENV=production
PORT=3000
```

**Catatan:** 
- Ganti `your_supabase_url`, dll dengan nilai sebenarnya
- Jangan commit secrets ke GitHub!

### Step 5: Launch App

1. Klik **"Launch App"**
2. Tunggu build process selesai
3. Cek logs jika ada error

## 🔧 Alternatif: Setup via CLI (Lebih Mudah)

Jika dashboard error, gunakan CLI:

### 1. Install Fly CLI

```bash
curl -L https://fly.io/install.sh | sh
```

### 2. Login

```bash
fly auth login
```

### 3. Launch App

```bash
cd /path/to/api-system-perum
fly launch
```

Jawab pertanyaan:
- App name: `api-system-perum` (atau nama lain)
- Region: `sin` (Singapore)
- PostgreSQL: No (kita pakai Supabase)
- Redis: No

### 4. Set Secrets

```bash
fly secrets set SUPABASE_URL=your_supabase_url
fly secrets set SUPABASE_ANON_KEY=your_supabase_anon_key
fly secrets set DATABASE_URL=your_database_url
fly secrets set FRONTEND_URL=https://your-frontend-domain.com
fly secrets set NODE_ENV=production
```

### 5. Deploy

```bash
fly deploy
```

## 🐛 Troubleshooting

### Error: "Failed to create app"

**Kemungkinan penyebab:**
1. App name sudah digunakan
2. Port salah (harus 3000, bukan 8080)
3. Memory terlalu kecil (minimal 512MB)
4. Konfigurasi tidak valid

**Solusi:**
1. Coba dengan app name yang berbeda
2. Pastikan port = 3000
3. Pastikan memory = 512MB atau lebih
4. Gunakan CLI sebagai alternatif

### Error: Build Failed

**Solusi:**
1. Cek logs: `fly logs`
2. Pastikan `fly.toml` sudah benar
3. Pastikan `.nvmrc` ada (Node.js 20)
4. Pastikan `package.json` valid

### Error: Port Not Listening

**Solusi:**
1. Pastikan app listen di port 3000
2. Pastikan `PORT` env var = 3000
3. Cek `fly.toml` internal_port = 3000

### Error: Database Connection

**Solusi:**
1. Pastikan `DATABASE_URL` sudah di-set
2. Pastikan Supabase database accessible
3. Cek connection string format

## ✅ Checklist

Sebelum launch, pastikan:

- [ ] Internal port = **3000** (bukan 8080)
- [ ] Memory = **512MB** atau lebih (bukan 256MB)
- [ ] Region sesuai (sin untuk Singapore)
- [ ] Environment variables sudah di-set
- [ ] App name belum digunakan
- [ ] Branch = main
- [ ] Repository sudah di-push ke GitHub

## 📝 Catatan Penting

1. **Port harus 3000** karena:
   - `fly.toml` set `internal_port = 3000`
   - `index.js` listen di `process.env.PORT || 3000`
   - Environment variable `PORT = 3000`

2. **Memory minimal 512MB** karena:
   - Node.js butuh minimal 512MB untuk run dengan baik
   - 256MB terlalu kecil dan bisa menyebabkan crash

3. **App name harus unique**:
   - Jika `api-system-perum` sudah digunakan, coba:
     - `api-system-perum-1`
     - `api-perumahan`
     - `perumahan-api`

## 🚀 Setelah Launch Berhasil

1. **Cek status:**
   ```bash
   fly status
   ```

2. **Cek logs:**
   ```bash
   fly logs
   ```

3. **Test endpoint:**
   ```bash
   curl https://api-system-perum.fly.dev/
   ```

4. **Update secrets jika perlu:**
   ```bash
   fly secrets set KEY=value
   ```

## 🔗 Resources

- [Fly.io Dashboard](https://fly.io/dashboard)
- [Fly.io Docs](https://fly.io/docs/)
- [Fly.io CLI Reference](https://fly.io/docs/flyctl/)

---

**Jika masih error, coba gunakan CLI method yang lebih reliable!**