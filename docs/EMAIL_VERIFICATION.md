# Email Verification Setup

## Masalah: Tidak Bisa Login Setelah Signup

Jika Anda mengalami error saat login setelah signup, kemungkinan besar karena **email verification** diaktifkan di Supabase.

## Solusi 1: Disable Email Confirmation (Development)

Untuk development, Anda bisa disable email confirmation:

1. Buka **Supabase Dashboard** → **Authentication** → **Settings**
2. Scroll ke bagian **Email Auth**
3. **Disable** opsi **"Enable email confirmations"**
4. Klik **Save**

Sekarang user bisa langsung login setelah signup tanpa perlu verifikasi email.

## Solusi 2: Gunakan Email Verification (Production)

Untuk production, tetap aktifkan email verification untuk keamanan.

### Cara Verifikasi Email:

1. Setelah signup, user akan menerima email verifikasi
2. Klik link di email untuk verifikasi
3. Setelah verifikasi, user bisa login

### Resend Verification Email:

Jika email verifikasi tidak sampai atau expired, gunakan endpoint:

```bash
POST /api/auth/resend-verification
Content-Type: application/json

{
  "email": "user@example.com"
}
```

## Solusi 3: Auto-Confirm Email (Development dengan Supabase Admin)

Jika Anda ingin tetap menggunakan email verification tapi auto-confirm untuk development:

1. Install Supabase Admin SDK (opsional)
2. Atau gunakan Supabase Dashboard untuk manually confirm user

## Error Messages

### "Email not confirmed" / "email_not_confirmed"
- **Penyebab**: Email belum diverifikasi
- **Solusi**: 
  - Cek email untuk link verifikasi
  - Atau gunakan `/api/auth/resend-verification` untuk kirim ulang
  - Atau disable email confirmation di Supabase Dashboard

### "Invalid login credentials"
- **Penyebab**: Email atau password salah
- **Solusi**: Pastikan email dan password benar

### "User not found"
- **Penyebab**: User belum terdaftar
- **Solusi**: Signup terlebih dahulu

## Testing Flow

### Development (Email Confirmation Disabled):
```
1. POST /api/auth/signup → User langsung bisa login
2. POST /api/auth/signin → Login berhasil
```

### Production (Email Confirmation Enabled):
```
1. POST /api/auth/signup → User perlu verifikasi email
2. Cek email → Klik link verifikasi
3. POST /api/auth/signin → Login berhasil
```

## Konfigurasi Supabase

### Email Templates

Anda bisa customize email template di:
- **Supabase Dashboard** → **Authentication** → **Email Templates**

### Redirect URL

Pastikan redirect URL di email template sesuai dengan frontend URL:
- Development: `http://localhost:3000/auth/callback`
- Production: `https://yourdomain.com/auth/callback`

## Troubleshooting

### Email tidak sampai
1. Cek folder spam/junk
2. Pastikan email provider tidak memblokir email dari Supabase
3. Gunakan endpoint `/api/auth/resend-verification`

### Link verifikasi expired
- Link verifikasi biasanya valid selama 24 jam
- Request link baru dengan `/api/auth/resend-verification`

### User sudah terverifikasi tapi masih error
1. Cek di Supabase Dashboard → Authentication → Users
2. Pastikan status user adalah "Confirmed"
3. Coba logout dan login lagi