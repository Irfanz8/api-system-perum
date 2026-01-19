# 🚀 Deploy ke Vercel

Panduan lengkap untuk deploy API Sistem Pengelolaan Perumahan ke Vercel.

## 📋 Prerequisites

1. Akun Vercel (gratis di https://vercel.com)
2. Repository sudah di-push ke GitHub
3. Environment variables sudah disiapkan

## 🚀 Cara Deploy

### Opsi 1: Via Dashboard (Paling Mudah)

1. **Buka Vercel Dashboard**
   - Login ke https://vercel.com
   - Klik "Add New Project"

2. **Import Repository**
   - Pilih "Import Git Repository"
   - Pilih `Irfanz8/api-system-perum`
   - Klik "Import"

3. **Konfigurasi Project**
   - **Framework Preset**: `Other` atau `Node.js`
   - **Root Directory**: `./` (default)
   - **Build Command**: (kosongkan atau `npm install`)
   - **Output Directory**: (kosongkan)
   - **Install Command**: `npm install`

4. **Environment Variables**
   Klik "Environment Variables" dan tambahkan:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   DATABASE_URL=your_database_url
   FRONTEND_URL=https://your-frontend-domain.com
   NODE_ENV=production
   ```

5. **Deploy**
   - Klik "Deploy"
   - Tunggu build process selesai
   - URL akan muncul setelah deploy berhasil

### Opsi 2: Via CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd /path/to/api-system-perum
   vercel
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add SUPABASE_URL
   vercel env add SUPABASE_ANON_KEY
   vercel env add DATABASE_URL
   vercel env add FRONTEND_URL
   vercel env add NODE_ENV production
   ```

5. **Deploy Production**
   ```bash
   vercel --prod
   ```

## ⚙️ Konfigurasi

### File `vercel.json`

File ini sudah dibuat dengan konfigurasi:
- ✅ Serverless function handler
- ✅ Routes configuration
- ✅ Environment variables

### Update `index.js`

File `index.js` sudah di-update untuk:
- ✅ Export Express app untuk Vercel
- ✅ Conditional listen (hanya untuk development)
- ✅ Support serverless function

## 🔧 Environment Variables

Pastikan set environment variables berikut di Vercel:

| Variable | Deskripsi | Contoh |
|----------|-----------|--------|
| `SUPABASE_URL` | URL Supabase project | `https://xxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase anon key | `eyJhbGc...` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...` |
| `FRONTEND_URL` | URL frontend aplikasi | `https://yourdomain.com` |
| `NODE_ENV` | Environment | `production` |

## 📝 Set Environment Variables

### Via Dashboard:
1. Buka project di Vercel dashboard
2. Klik "Settings" → "Environment Variables"
3. Tambahkan setiap variable
4. Pilih environment (Production, Preview, Development)
5. Klik "Save"

### Via CLI:
```bash
vercel env add SUPABASE_URL production
# Masukkan value saat diminta
```

## 🧪 Testing

Setelah deploy, test endpoint:

```bash
# Test root endpoint
curl https://api-system-perum.vercel.app/

# Test API endpoint
curl https://api-system-perum.vercel.app/api/keuangan

# Test Swagger docs
curl https://api-system-perum.vercel.app/api-docs
```

## 🐛 Troubleshooting

### Error: "Cannot find module"

**Solusi:**
- Pastikan semua dependencies ada di `package.json`
- Pastikan `npm install` berjalan saat build
- Cek build logs di Vercel dashboard

### Error: "Function timeout"

**Solusi:**
- Optimalkan query database
- Gunakan connection pooling
- Pertimbangkan upgrade ke Pro plan (timeout 60s)

### Error: "Database connection failed"

**Solusi:**
- Pastikan `DATABASE_URL` sudah di-set
- Pastikan Supabase database accessible
- Cek IP whitelist di Supabase (jika ada)

### Error: "Module not found"

**Solusi:**
- Pastikan semua imports benar
- Cek apakah ada native modules yang tidak didukung
- Pastikan `package.json` dependencies lengkap

## 📊 Monitoring

### View Logs

1. Buka Vercel dashboard
2. Pilih project
3. Klik "Deployments"
4. Klik deployment terbaru
5. Klik "Functions" tab untuk melihat logs

### Via CLI:
```bash
vercel logs
```

## 🔄 Auto-Deploy

Vercel akan otomatis deploy setiap kali:
- Push ke branch `main` (production)
- Push ke branch lain (preview)
- Pull request dibuat (preview)

## 🌐 Custom Domain

1. Buka project settings
2. Klik "Domains"
3. Tambahkan domain Anda
4. Follow instruksi untuk setup DNS

## 💡 Tips

1. **Use Environment Variables** untuk semua secrets
2. **Monitor Logs** untuk debugging
3. **Test Locally** dengan `vercel dev` sebelum deploy
4. **Use Preview Deployments** untuk test sebelum production
5. **Optimize Cold Starts** dengan connection pooling

## 🆚 Vercel vs Platform Lain

| Feature | Vercel | Render | Fly.io |
|---------|--------|--------|--------|
| Free Tier | ✅ Unlimited | ✅ 750hrs/mo | ✅ Limited |
| Auto-Deploy | ✅ Yes | ✅ Yes | ✅ Yes |
| Serverless | ✅ Yes | ❌ No | ❌ No |
| Cold Start | ⚠️ Yes | ❌ No | ❌ No |
| Timeout | ⚠️ 10s (hobby) | ✅ No limit | ✅ No limit |
| PostgreSQL | ✅ Via Supabase | ✅ Managed | ✅ Managed |

## 📚 Resources

- [Vercel Docs](https://vercel.com/docs)
- [Vercel Node.js Guide](https://vercel.com/docs/functions/serverless-functions/runtimes/node-js)
- [Vercel CLI Reference](https://vercel.com/docs/cli)

## ✅ Checklist

Sebelum deploy:
- [ ] File `vercel.json` sudah ada
- [ ] `index.js` sudah di-export dengan benar
- [ ] Environment variables sudah disiapkan
- [ ] Repository sudah di-push ke GitHub
- [ ] Dependencies lengkap di `package.json`

Setelah deploy:
- [ ] Deploy berhasil
- [ ] URL accessible
- [ ] API endpoints berfungsi
- [ ] Swagger docs accessible
- [ ] Database connection berfungsi

---

**Selamat! API Anda sudah siap di Vercel! 🎉**