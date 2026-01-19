# 🚀 Quick Start: Setup Email Template Custom

Panduan cepat untuk setup email template yang bagus di Supabase.

## ⚡ Langkah Cepat (5 Menit)

### 1. Buka Supabase Dashboard
- Login ke [Supabase Dashboard](https://supabase.com/dashboard)
- Pilih project Anda
- Buka **Authentication** → **Email Templates**

### 2. Setup Email Verifikasi

1. Klik template **"Confirm signup"**

2. **Subject:**
   ```
   Verifikasi Email Anda - Sistem Pengelolaan Perumahan
   ```

3. **From Name:**
   ```
   Sistem Pengelolaan Perumahan
   ```

4. **Body:** 
   - Buka file: `docs/email-templates/verification-email-supabase.html`
   - Copy semua isinya
   - Paste ke field **Body** di Supabase
   - **Pastikan** variable `{{ .ConfirmationURL }}` dan `{{ .SiteURL }}` tetap ada

5. Klik **Save**

### 3. Setup Reset Password

1. Klik template **"Reset password"**

2. **Subject:**
   ```
   Reset Password - Sistem Pengelolaan Perumahan
   ```

3. **From Name:**
   ```
   Sistem Pengelolaan Perumahan
   ```

4. **Body:**
   - Buka file: `docs/email-templates/reset-password-email.html`
   - Copy semua isinya
   - Paste ke field **Body** di Supabase
   - Ganti `{{ .ConfirmationURL }}` dengan variable Supabase yang benar

5. Klik **Save**

### 4. Test Email

1. Klik **"Send test email"** di template
2. Masukkan email Anda
3. Cek inbox untuk melihat hasil

## 🎨 Customize (Opsional)

### Ubah Warna
Edit gradient di template:
```css
/* Email Verifikasi - Ungu */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Reset Password - Merah Muda */
background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
```

### Ubah Logo
Ganti emoji atau gunakan image:
```html
<!-- Emoji -->
<div class="logo">🏠</div>

<!-- Image -->
<div class="logo">
    <img src="https://yourdomain.com/logo.png" alt="Logo">
</div>
```

### Ubah Text
Edit teks di template sesuai kebutuhan:
- Nama aplikasi
- Pesan selamat datang
- Instruksi

## 📋 Checklist

- [ ] Template verifikasi sudah di-setup
- [ ] Template reset password sudah di-setup
- [ ] From Name sudah di-set
- [ ] Subject sudah di-customize
- [ ] Test email sudah dikirim dan diterima
- [ ] Link di email berfungsi dengan baik

## 🎯 Hasil Akhir

Setelah setup, email yang dikirim akan memiliki:
- ✅ Design modern dan responsive
- ✅ Branding sesuai aplikasi Anda
- ✅ Sender name custom
- ✅ Mobile-friendly
- ✅ Professional look

## 📚 Dokumentasi Lengkap

Untuk detail lebih lengkap, lihat:
- [EMAIL_TEMPLATE_SETUP.md](./EMAIL_TEMPLATE_SETUP.md) - Panduan lengkap
- [EMAIL_VERIFICATION.md](./EMAIL_VERIFICATION.md) - Troubleshooting

## ❓ Masalah?

Jika ada masalah:
1. Pastikan variable `{{ .ConfirmationURL }}` dan `{{ .SiteURL }}` tidak dihapus
2. Test dengan "Send test email" dulu
3. Cek spam folder jika email tidak sampai
4. Pastikan HTML syntax benar

---

**Selamat! Email template Anda sudah siap digunakan! 🎉**