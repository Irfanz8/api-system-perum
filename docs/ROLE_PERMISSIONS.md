# Role-Based Access Control (RBAC) Documentation

## Overview

Sistem ini menggunakan Role-Based Access Control (RBAC) dengan hierarki 3 level:
- **Superadmin**: Full access ke semua fitur
- **Admin**: CRUD untuk operasional (keuangan, properti, persediaan, penjualan)
- **User**: Read-only untuk sebagian data

## Role Hierarchy

```
Superadmin (Highest)
    ↓
Admin
    ↓
User (Lowest)
```

## Permission Matrix

### 1. Users Management

| Action | User | Admin | Superadmin |
|--------|------|-------|------------|
| Read Users | ❌ | ❌ | ✅ |
| Create Users | ❌ | ❌ | ✅ |
| Update Users | ❌ | ❌ | ✅ |
| Delete Users | ❌ | ❌ | ✅ |
| Update User Role | ❌ | ❌ | ✅ |

**Endpoint**: `/api/users/*`

### 2. Financial Transactions (Keuangan)

| Action | User | Admin | Superadmin |
|--------|------|-------|------------|
| Read Transactions | ✅ | ✅ | ✅ |
| Create Transaction | ❌ | ✅ | ✅ |
| Update Transaction | ❌ | ✅ | ✅ |
| Delete Transaction | ❌ | ✅ | ✅ |
| View Summary | ✅ | ✅ | ✅ |

**Endpoint**: `/api/keuangan/*`

### 3. Properties (Properti)

| Action | User | Admin | Superadmin |
|--------|------|-------|------------|
| Read Properties | ✅ | ✅ | ✅ |
| Create Property | ❌ | ✅ | ✅ |
| Update Property | ❌ | ✅ | ✅ |
| Delete Property | ❌ | ✅ | ✅ |
| Update Status | ❌ | ✅ | ✅ |
| View Stats | ✅ | ✅ | ✅ |

**Endpoint**: `/api/properti/*`

### 4. Inventory (Persediaan)

| Action | User | Admin | Superadmin |
|--------|------|-------|------------|
| Read Inventory | ✅ | ✅ | ✅ |
| Create Item | ❌ | ✅ | ✅ |
| Update Item | ❌ | ✅ | ✅ |
| Delete Item | ❌ | ✅ | ✅ |
| Add Transaction (in/out) | ❌ | ✅ | ✅ |
| View Low Stock | ✅ | ✅ | ✅ |
| View Stats | ✅ | ✅ | ✅ |

**Endpoint**: `/api/persediaan/*`

### 5. Property Sales (Penjualan)

| Action | User | Admin | Superadmin |
|--------|------|-------|------------|
| Read Sales | ✅ | ✅ | ✅ |
| Create Sale | ❌ | ✅ | ✅ |
| Update Sale | ❌ | ✅ | ✅ |
| Delete Sale | ❌ | ✅ | ✅ |
| Complete Sale | ❌ | ✅ | ✅ |
| View Stats | ✅ | ✅ | ✅ |
| View Revenue | ✅ | ✅ | ✅ |

**Endpoint**: `/api/penjualan/*`

### 6. Authentication

| Action | User | Admin | Superadmin |
|--------|------|-------|------------|
| Sign Up | ✅ | ✅ | ✅ |
| Sign In | ✅ | ✅ | ✅ |
| OAuth Login | ✅ | ✅ | ✅ |
| View Profile | ✅ | ✅ | ✅ |
| Update Own Profile | ✅ | ✅ | ✅ |

**Endpoint**: `/api/auth/*`

## Implementation Details

### Permission Middleware

Semua routes menggunakan middleware `checkPermission` untuk memverifikasi akses:

```javascript
const { authenticateUser } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

// Example: Read-only untuk semua authenticated users
router.get('/', authenticateUser, checkPermission('KEUNGAN_READ'), controller.getAll);

// Example: Create hanya untuk Admin dan Superadmin
router.post('/', authenticateUser, checkPermission('KEUNGAN_CREATE'), controller.create);
```

### Permission Constants

Semua permission didefinisikan di `src/middleware/permissions.js`:

```javascript
const PERMISSIONS = {
  // Users
  USERS_READ: [ROLES.SUPERADMIN],
  USERS_CREATE: [ROLES.SUPERADMIN],
  // ... etc
};
```

### Role dari Database

Role user diambil dari database `users` table, bukan hanya dari `user_metadata`. Ini memastikan role yang akurat dan bisa di-update oleh superadmin.

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "error": "No authorization token provided"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "You do not have permission to perform this action",
  "required": "KEUNGAN_CREATE",
  "yourRole": "user",
  "allowedRoles": ["admin", "superadmin"]
}
```

## Testing Permissions

### Test sebagai User
1. Sign up dengan role `user`
2. Coba akses endpoint yang memerlukan admin/superadmin
3. Seharusnya mendapat error 403

### Test sebagai Admin
1. Superadmin update role user menjadi `admin`
2. Login sebagai admin
3. Coba CRUD keuangan, properti, persediaan, penjualan
4. Seharusnya berhasil
5. Coba akses `/api/users` - seharusnya error 403

### Test sebagai Superadmin
1. Login sebagai superadmin
2. Akses semua endpoint
3. Seharusnya semua berhasil

## Best Practices

1. **Always authenticate first**: Gunakan `authenticateUser` sebelum `checkPermission`
2. **Check role from database**: Role diambil dari database untuk akurasi
3. **Clear error messages**: Error response memberikan informasi yang jelas
4. **Document permissions**: Update dokumentasi ini jika menambah permission baru

## Adding New Permissions

1. Tambahkan permission constant di `src/middleware/permissions.js`
2. Update permission matrix di file ini
3. Apply permission middleware ke routes yang sesuai
4. Test dengan berbagai role

## Notes

- User biasa hanya bisa **read** data, tidak bisa create/update/delete
- Admin bisa **CRUD** untuk operasional, tapi tidak bisa manage users
- Superadmin memiliki **full access** ke semua fitur
- Semua endpoint (kecuali auth) memerlukan authentication
- Role diambil dari database untuk memastikan konsistensi
