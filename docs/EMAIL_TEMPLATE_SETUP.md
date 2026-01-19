# Setup Email Template Custom di Supabase

Panduan lengkap untuk mengatur email template yang bagus dengan sender name custom di Supabase.

## 📋 Daftar Isi

1. [Setup Sender Name](#setup-sender-name)
2. [Setup Email Templates](#setup-email-templates)
3. [Template Variables](#template-variables)
4. [Preview Template](#preview-template)
5. [Testing](#testing)

## 🏷️ Setup Sender Name

### Langkah 1: Buka Supabase Dashboard

1. Login ke [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project Anda
3. Buka **Settings** → **Auth** → **Email Templates**

### Langkah 2: Konfigurasi Sender

1. Scroll ke bagian **"SMTP Settings"** (opsional, untuk custom SMTP)
2. Atau gunakan default Supabase SMTP

**Untuk Custom Sender Name:**

1. Buka **Settings** → **Auth** → **Email Templates**
2. Di setiap template, Anda bisa set:
   - **From Name**: Nama pengirim (contoh: "Sistem Pengelolaan Perumahan")
   - **From Email**: Email pengirim (default: noreply@mail.app.supabase.io)

**Catatan:** 
- Untuk custom domain email, Anda perlu setup SMTP custom
- Default Supabase menggunakan `noreply@mail.app.supabase.io`

## 📧 Setup Email Templates

### Langkah 1: Buka Email Templates

1. Di Supabase Dashboard → **Authentication** → **Email Templates**
2. Anda akan melihat beberapa template:
   - **Confirm signup** (Email Verifikasi)
   - **Reset password** (Reset Password)
   - **Magic Link** (Magic Link Login)
   - **Change Email Address** (Ubah Email)

### Langkah 2: Customize Template

#### A. Email Verifikasi (Confirm signup)

1. Klik **"Confirm signup"** template
2. **Subject**: Customize subject email
   ```
   Verifikasi Email Anda - Sistem Pengelolaan Perumahan
   ```

3. **Body**: Copy template HTML dari `docs/email-templates/verification-email.html`
   - Buka file `docs/email-templates/verification-email.html`
   - Copy semua isinya
   - Paste ke field **Body** di Supabase
   - **Important:** Ganti `{{ .ConfirmationURL }}` dengan variable Supabase: `{{ .ConfirmationURL }}`
   - Ganti `{{ .SiteURL }}` dengan variable Supabase: `{{ .SiteURL }}`

4. **From Name**: 
   ```
   Sistem Pengelolaan Perumahan
   ```

#### B. Reset Password

1. Klik **"Reset password"** template
2. **Subject**:
   ```
   Reset Password - Sistem Pengelolaan Perumahan
   ```

3. **Body**: Copy dari `docs/email-templates/reset-password-email.html`
   - Ganti variables sesuai kebutuhan

4. **From Name**:
   ```
   Sistem Pengelolaan Perumahan
   ```

### Langkah 3: Template Variables

Supabase menyediakan variables berikut yang bisa digunakan:

| Variable | Deskripsi | Contoh |
|----------|-----------|--------|
| `{{ .ConfirmationURL }}` | URL untuk konfirmasi/verifikasi | `https://xxx.supabase.co/auth/v1/verify?token=...` |
| `{{ .SiteURL }}` | URL website Anda | `https://yourdomain.com` |
| `{{ .Email }}` | Email user | `user@example.com` |
| `{{ .Token }}` | Token verifikasi | `abc123...` |
| `{{ .TokenHash }}` | Hash dari token | `xyz789...` |
| `{{ .RedirectTo }}` | URL redirect setelah verifikasi | `https://yourdomain.com/auth/callback` |

### Langkah 4: Save Template

1. Setelah mengisi semua field, klik **"Save"**
2. Template akan langsung aktif

## 🎨 Customize Design

### Warna

Anda bisa customize warna di template HTML:

**Email Verifikasi:**
```css
/* Gradient header */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Button */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

**Reset Password:**
```css
/* Gradient header */
background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);

/* Button */
background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
```

### Logo

Ganti emoji logo di template:
```html
<!-- Email Verifikasi -->
<div class="logo">🏠</div>

<!-- Reset Password -->
<div class="logo">🔐</div>
```

Atau gunakan image URL:
```html
<div class="logo">
    <img src="https://yourdomain.com/logo.png" alt="Logo" style="width: 60px; height: 60px;">
</div>
```

### Text Content

Customize teks sesuai kebutuhan:
- Nama aplikasi
- Pesan selamat datang
- Instruksi
- Footer text

## 🔍 Preview Template

### Cara Preview di Supabase

1. Setelah save template, klik **"Send test email"**
2. Masukkan email Anda
3. Cek inbox untuk melihat hasil

### Cara Preview Lokal

1. Buka file HTML di browser
2. Ganti variables dengan contoh:
   ```html
   <!-- Ganti ini -->
   {{ .ConfirmationURL }}
   
   <!-- Dengan contoh URL -->
   https://example.com/verify?token=abc123
   ```

## 🧪 Testing

### Test Email Verifikasi

1. **Signup user baru:**
   ```bash
   POST /api/auth/signup
   {
     "email": "test@example.com",
     "password": "password123",
     "name": "Test User"
   }
   ```

2. **Cek email inbox** untuk melihat template custom

3. **Klik link verifikasi** untuk test flow

### Test Reset Password

1. **Request reset password:**
   ```bash
   POST /api/auth/reset-password
   {
     "email": "test@example.com"
   }
   ```

2. **Cek email inbox** untuk melihat template custom

3. **Klik link reset** untuk test flow

## 📝 Tips & Best Practices

### 1. Mobile Responsive
Template sudah responsive, tapi pastikan test di mobile device

### 2. Email Client Compatibility
Test di berbagai email client:
- Gmail
- Outlook
- Apple Mail
- Yahoo Mail

### 3. Spam Prevention
- Gunakan domain email yang verified
- Hindari kata-kata spam di subject
- Jangan terlalu banyak link

### 4. Branding
- Gunakan warna brand Anda
- Tambahkan logo perusahaan
- Konsisten dengan website Anda

### 5. Security
- Jangan expose sensitive info di email
- Gunakan HTTPS untuk semua link
- Set expiration time untuk link

## 🚀 Advanced: Custom SMTP

Jika ingin menggunakan custom SMTP (untuk custom domain email):

1. **Setup SMTP di Supabase:**
   - Settings → Auth → SMTP Settings
   - Masukkan SMTP credentials
   - Test connection

2. **Custom Domain:**
   - Setup DNS records untuk domain
   - Verify domain di Supabase
   - Set custom sender email

## 📚 Resources

- [Supabase Email Templates Docs](https://supabase.com/docs/guides/auth/auth-email-templates)
- [HTML Email Best Practices](https://www.campaignmonitor.com/dev-resources/guides/coding/)
- [Email Template Variables](https://supabase.com/docs/reference/auth/auth-email-templates)

## ❓ Troubleshooting

### Email tidak sampai
- Cek spam folder
- Verify SMTP settings
- Cek email provider blocking

### Template tidak ter-render
- Pastikan syntax variable benar: `{{ .VariableName }}`
- Cek HTML syntax
- Test dengan simple template dulu

### Styling tidak muncul
- Beberapa email client tidak support CSS advanced
- Gunakan inline styles
- Test di berbagai email client

## 📞 Support

Jika ada masalah, cek:
1. Supabase Dashboard logs
2. Email delivery status
3. SMTP connection status