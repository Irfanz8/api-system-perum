# 🚀 Fly.io Deployment Guide

Panduan lengkap untuk deploy aplikasi ke Fly.io.

## 📋 Prerequisites

1. Install Fly CLI:
```bash
curl -L https://fly.io/install.sh | sh
```

2. Login ke Fly.io:
```bash
fly auth login
```

## 🔧 Setup Awal

### 1. Inisialisasi App (Jika Belum)

```bash
fly launch
```

Pilih:
- App name: `api-system-perum` (atau nama lain)
- Region: `sin` (Singapore) atau pilih yang terdekat
- PostgreSQL: No (kita pakai Supabase)
- Redis: No

### 2. Setup Environment Variables

```bash
# Set environment variables
fly secrets set SUPABASE_URL=your_supabase_url
fly secrets set SUPABASE_ANON_KEY=your_supabase_anon_key
fly secrets set DATABASE_URL=your_database_url
fly secrets set FRONTEND_URL=https://your-frontend-domain.com
fly secrets set NODE_ENV=production
```

Atau set via Fly.io Dashboard:
1. Buka https://fly.io/dashboard
2. Pilih app Anda
3. Buka **Secrets** tab
4. Tambahkan secrets

## 🐛 Troubleshooting Build Error

### Error 1: Build Timeout

**Solusi:**
```bash
# Update fly.toml dengan build timeout yang lebih lama
[build]
  builder = "nixpacks"
  build_timeout = 600  # 10 menit
```

### Error 2: Node.js Version Not Found

**Solusi:**
- File `.nvmrc` sudah ada dengan Node.js 20
- File `nixpacks.toml` sudah dikonfigurasi
- Atau gunakan Dockerfile (sudah tersedia)

### Error 3: Dependencies Install Error

**Solusi:**
```bash
# Pastikan package.json valid
npm install

# Test build lokal
npm ci --only=production
```

### Error 4: Port Not Listening

**Solusi:**
- Pastikan app listen di port yang sesuai dengan `PORT` env var
- Cek `fly.toml` internal_port sudah benar (3000)

### Error 5: Database Connection Error

**Solusi:**
- Pastikan `DATABASE_URL` sudah di-set sebagai secret
- Pastikan Supabase database accessible dari internet
- Cek IP whitelist di Supabase (jika ada)

## 🔄 Deploy

### Deploy dengan Nixpacks (Default)

```bash
fly deploy
```

### Deploy dengan Dockerfile

Jika nixpacks error, Fly.io akan otomatis menggunakan Dockerfile.

Atau force menggunakan Dockerfile:
```bash
fly deploy --dockerfile Dockerfile
```

### Deploy dengan Build Args

```bash
fly deploy --build-arg NODE_ENV=production
```

## 📊 Monitoring

### Check Logs

```bash
# Real-time logs
fly logs

# Logs dengan filter
fly logs | grep error
```

### Check App Status

```bash
fly status
```

### Check App Info

```bash
fly info
```

## 🔍 Debugging

### SSH ke Container

```bash
fly ssh console
```

### Check Environment Variables

```bash
fly ssh console -C "env | grep SUPABASE"
```

### Test Database Connection

```bash
fly ssh console -C "node -e \"require('./src/config/database.js').pool.query('SELECT NOW()').then(r => console.log(r.rows))\""
```

## ⚙️ Konfigurasi

### Update fly.toml

File `fly.toml` sudah dikonfigurasi dengan:
- ✅ Nixpacks builder
- ✅ Node.js 20
- ✅ Port 3000
- ✅ Health checks
- ✅ Auto start/stop machines
- ✅ Rolling deployment

### Update Resources

```bash
# Scale up
fly scale count 2

# Scale memory
fly scale memory 1024

# Scale CPU
fly scale vm shared-cpu-2x
```

## 🚨 Common Issues

### Issue: App Crashes on Start

**Check:**
1. Environment variables sudah di-set
2. Database connection berfungsi
3. Port listening di PORT env var
4. Dependencies terinstall dengan benar

**Solution:**
```bash
# Check logs
fly logs

# Check app status
fly status

# Restart app
fly apps restart api-system-perum
```

### Issue: Build Fails

**Check:**
1. package.json valid
2. Dependencies tidak ada conflict
3. Node.js version sesuai

**Solution:**
```bash
# Test build lokal
npm ci

# Deploy dengan verbose
fly deploy --verbose

# Atau gunakan Dockerfile
fly deploy --dockerfile Dockerfile
```

### Issue: Database Connection Timeout

**Check:**
1. DATABASE_URL benar
2. Supabase database accessible
3. IP tidak diblokir

**Solution:**
- Cek Supabase dashboard → Settings → Database
- Pastikan connection pooling enabled
- Gunakan connection string dengan pooler

## 📝 Checklist Deployment

- [ ] Fly CLI terinstall
- [ ] Login ke Fly.io
- [ ] App sudah diinisialisasi
- [ ] Environment variables sudah di-set
- [ ] Database connection berfungsi
- [ ] Build berhasil (test lokal)
- [ ] Deploy berhasil
- [ ] Health check pass
- [ ] App accessible via URL

## 🔗 Resources

- [Fly.io Docs](https://fly.io/docs/)
- [Fly.io Node.js Guide](https://fly.io/docs/languages-and-frameworks/node/)
- [Nixpacks Docs](https://nixpacks.com/docs/)

## 💡 Tips

1. **Gunakan Secrets** untuk sensitive data (jangan hardcode)
2. **Monitor Logs** untuk debugging
3. **Test Locally** sebelum deploy
4. **Use Health Checks** untuk auto-restart
5. **Scale Gradually** mulai dari 1 instance

## 🆘 Support

Jika masih ada masalah:
1. Check logs: `fly logs`
2. Check status: `fly status`
3. Check Fly.io dashboard
4. Review error messages dengan detail