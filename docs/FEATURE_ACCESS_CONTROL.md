# Feature Access Control Documentation

## Overview

Sistem ini menggunakan **Permission-Based Access Control** dimana setiap feature/endpoint memiliki permission tertentu, dan setiap role memiliki daftar permissions yang berbeda.

## Cara Kerja

### 1. Permission Definition

Setiap feature memiliki permission yang didefinisikan di `src/middleware/permissions.js`:

```javascript
const PERMISSIONS = {
  // Contoh: Feature Keuangan
  KEUNGAN_READ: [ROLES.USER, ROLES.ADMIN, ROLES.SUPERADMIN],
  KEUNGAN_CREATE: [ROLES.ADMIN, ROLES.SUPERADMIN],
  KEUNGAN_UPDATE: [ROLES.ADMIN, ROLES.SUPERADMIN],
  KEUNGAN_DELETE: [ROLES.ADMIN, ROLES.SUPERADMIN],
};
```

**Penjelasan**:
- `KEUNGAN_READ`: Bisa diakses oleh `USER`, `ADMIN`, dan `SUPERADMIN`
- `KEUNGAN_CREATE`: Hanya bisa diakses oleh `ADMIN` dan `SUPERADMIN`
- `KEUNGAN_UPDATE`: Hanya bisa diakses oleh `ADMIN` dan `SUPERADMIN`
- `KEUNGAN_DELETE`: Hanya bisa diakses oleh `ADMIN` dan `SUPERADMIN`

### 2. Route Protection

Setiap route dilindungi dengan middleware `checkPermission`:

```javascript
// Read - semua authenticated users bisa akses
router.get('/', authenticateUser, checkPermission('KEUNGAN_READ'), controller.getAll);

// Create - hanya admin & superadmin
router.post('/', authenticateUser, checkPermission('KEUNGAN_CREATE'), controller.create);

// Update - hanya admin & superadmin
router.put('/:id', authenticateUser, checkPermission('KEUNGAN_UPDATE'), controller.update);

// Delete - hanya admin & superadmin
router.delete('/:id', authenticateUser, checkPermission('KEUNGAN_DELETE'), controller.delete);
```

### 3. Permission Check Flow

```
1. User mengirim request dengan Bearer token
   ↓
2. authenticateUser middleware memverifikasi token
   ↓
3. checkPermission middleware memeriksa:
   - Apakah permission ada di PERMISSIONS?
   - Apakah role user ada di allowedRoles untuk permission tersebut?
   ↓
4. Jika YA → Request diteruskan ke controller
   Jika TIDAK → Return 403 Forbidden
```

## Feature Access Matrix

### User (Level 1 - Read Only)

| Feature | Read | Create | Update | Delete |
|---------|------|--------|--------|--------|
| **Users** | ❌ | ❌ | ❌ | ❌ |
| **Keuangan** | ✅ | ❌ | ❌ | ❌ |
| **Properti** | ✅ | ❌ | ❌ | ❌ |
| **Persediaan** | ✅ | ❌ | ❌ | ❌ |
| **Penjualan** | ✅ | ❌ | ❌ | ❌ |
| **Role Management** | ❌ | ❌ | ❌ | ❌ |

**Total Accessible Endpoints**: ~5 endpoints (read-only)

### Admin (Level 2 - CRUD Operational)

| Feature | Read | Create | Update | Delete |
|---------|------|--------|--------|--------|
| **Users** | ❌ | ❌ | ❌ | ❌ |
| **Keuangan** | ✅ | ✅ | ✅ | ✅ |
| **Properti** | ✅ | ✅ | ✅ | ✅ |
| **Persediaan** | ✅ | ✅ | ✅ | ✅ |
| **Penjualan** | ✅ | ✅ | ✅ | ✅ |
| **Role Management** | ❌ | ❌ | ❌ | ❌ |

**Total Accessible Endpoints**: ~20 endpoints (full CRUD untuk operasional)

### Superadmin (Level 3 - Full Access)

| Feature | Read | Create | Update | Delete |
|---------|------|--------|--------|--------|
| **Users** | ✅ | ✅ | ✅ | ✅ |
| **Keuangan** | ✅ | ✅ | ✅ | ✅ |
| **Properti** | ✅ | ✅ | ✅ | ✅ |
| **Persediaan** | ✅ | ✅ | ✅ | ✅ |
| **Penjualan** | ✅ | ✅ | ✅ | ✅ |
| **Role Management** | ✅ | ✅ | ✅ | ✅ |

**Total Accessible Endpoints**: ~25 endpoints (full access ke semua)

## Detail Feature Access

### 1. User Management

**Permission**: `USERS_READ`, `USERS_CREATE`, `USERS_UPDATE`, `USERS_DELETE`, `USERS_UPDATE_ROLE`

**Allowed Roles**: `SUPERADMIN` only

**Endpoints**:
- `GET /api/users` - List semua users
- `GET /api/users/:id` - Detail user
- `PATCH /api/users/:id/role` - Update role user
- `DELETE /api/users/:id` - Hapus user

**Batasan**: Hanya superadmin yang bisa manage users.

### 2. Financial Transactions (Keuangan)

**Permissions**:
- `KEUNGAN_READ`: `USER`, `ADMIN`, `SUPERADMIN`
- `KEUNGAN_CREATE`: `ADMIN`, `SUPERADMIN`
- `KEUNGAN_UPDATE`: `ADMIN`, `SUPERADMIN`
- `KEUNGAN_DELETE`: `ADMIN`, `SUPERADMIN`

**Endpoints**:
- `GET /api/keuangan` - List transaksi (✅ semua)
- `GET /api/keuangan/summary` - Summary (✅ semua)
- `GET /api/keuangan/:id` - Detail (✅ semua)
- `POST /api/keuangan` - Create (❌ user, ✅ admin/superadmin)
- `PUT /api/keuangan/:id` - Update (❌ user, ✅ admin/superadmin)
- `DELETE /api/keuangan/:id` - Delete (❌ user, ✅ admin/superadmin)

**Batasan**: User hanya bisa read, admin dan superadmin bisa CRUD.

### 3. Properties (Properti)

**Permissions**:
- `PROPERTI_READ`: `USER`, `ADMIN`, `SUPERADMIN`
- `PROPERTI_CREATE`: `ADMIN`, `SUPERADMIN`
- `PROPERTI_UPDATE`: `ADMIN`, `SUPERADMIN`
- `PROPERTI_DELETE`: `ADMIN`, `SUPERADMIN`
- `PROPERTI_UPDATE_STATUS`: `ADMIN`, `SUPERADMIN`

**Endpoints**:
- `GET /api/properti` - List properti (✅ semua)
- `GET /api/properti/available` - Properti tersedia (✅ semua)
- `GET /api/properti/stats` - Statistik (✅ semua)
- `GET /api/properti/:id` - Detail (✅ semua)
- `POST /api/properti` - Create (❌ user, ✅ admin/superadmin)
- `PUT /api/properti/:id` - Update (❌ user, ✅ admin/superadmin)
- `DELETE /api/properti/:id` - Delete (❌ user, ✅ admin/superadmin)
- `PATCH /api/properti/:id/status` - Update status (❌ user, ✅ admin/superadmin)

**Batasan**: User hanya bisa read, admin dan superadmin bisa CRUD.

### 4. Inventory (Persediaan)

**Permissions**:
- `PERSEDIAAN_READ`: `USER`, `ADMIN`, `SUPERADMIN`
- `PERSEDIAAN_CREATE`: `ADMIN`, `SUPERADMIN`
- `PERSEDIAAN_UPDATE`: `ADMIN`, `SUPERADMIN`
- `PERSEDIAAN_DELETE`: `ADMIN`, `SUPERADMIN`
- `PERSEDIAAN_TRANSACTION`: `ADMIN`, `SUPERADMIN`

**Endpoints**:
- `GET /api/persediaan` - List inventory (✅ semua)
- `GET /api/persediaan/low-stock` - Low stock items (✅ semua)
- `GET /api/persediaan/stats` - Statistik (✅ semua)
- `GET /api/persediaan/:id` - Detail (✅ semua)
- `POST /api/persediaan` - Create (❌ user, ✅ admin/superadmin)
- `PUT /api/persediaan/:id` - Update (❌ user, ✅ admin/superadmin)
- `DELETE /api/persediaan/:id` - Delete (❌ user, ✅ admin/superadmin)
- `POST /api/persediaan/:id/transaction` - Add transaction (❌ user, ✅ admin/superadmin)

**Batasan**: User hanya bisa read, admin dan superadmin bisa CRUD.

### 5. Property Sales (Penjualan)

**Permissions**:
- `PENJUALAN_READ`: `USER`, `ADMIN`, `SUPERADMIN`
- `PENJUALAN_CREATE`: `ADMIN`, `SUPERADMIN`
- `PENJUALAN_UPDATE`: `ADMIN`, `SUPERADMIN`
- `PENJUALAN_DELETE`: `ADMIN`, `SUPERADMIN`
- `PENJUALAN_COMPLETE`: `ADMIN`, `SUPERADMIN`

**Endpoints**:
- `GET /api/penjualan` - List penjualan (✅ semua)
- `GET /api/penjualan/stats` - Statistik (✅ semua)
- `GET /api/penjualan/revenue/:year` - Revenue per tahun (✅ semua)
- `GET /api/penjualan/:id` - Detail (✅ semua)
- `POST /api/penjualan` - Create (❌ user, ✅ admin/superadmin)
- `PUT /api/penjualan/:id` - Update (❌ user, ✅ admin/superadmin)
- `DELETE /api/penjualan/:id` - Delete (❌ user, ✅ admin/superadmin)
- `POST /api/penjualan/:id/complete` - Complete sale (❌ user, ✅ admin/superadmin)

**Batasan**: User hanya bisa read, admin dan superadmin bisa CRUD.

### 6. Role Management

**Permissions**: `USERS_READ`, `USERS_UPDATE_ROLE`

**Allowed Roles**: `SUPERADMIN` only

**Endpoints**:
- `GET /api/roles/hierarchy` - Role hierarchy
- `GET /api/roles/:role/permissions` - Permissions untuk role
- `GET /api/roles/permissions/matrix` - Permissions matrix
- `GET /api/roles/users` - Users dengan roles
- `GET /api/roles/users/:role` - Users by role
- `PATCH /api/roles/users/:id/role` - Update user role
- `GET /api/roles/statistics` - Role statistics
- `GET /api/roles/:role/features` - Feature access untuk role

**Batasan**: Hanya superadmin yang bisa akses.

## Cara Mengecek Feature Access

### Via API

**Endpoint**: `GET /api/roles/:role/features`

**Contoh**: Cek feature access untuk role `admin`

```bash
GET /api/roles/admin/features
Authorization: Bearer {superadmin-token}
```

**Response**:
```json
{
  "success": true,
  "role": "admin",
  "summary": {
    "totalFeatures": 6,
    "accessibleFeatures": 5,
    "totalEndpoints": 25,
    "accessibleEndpoints": 20,
    "canCreate": true,
    "canUpdate": true,
    "canDelete": true
  },
  "featureAccess": {
    "keuangan": {
      "name": "Financial Transactions",
      "canAccess": true,
      "canCreate": true,
      "canUpdate": true,
      "canDelete": true,
      "endpoints": [
        {
          "method": "GET",
          "path": "/api/keuangan",
          "permission": "KEUNGAN_READ",
          "allowed": true
        },
        {
          "method": "POST",
          "path": "/api/keuangan",
          "permission": "KEUNGAN_CREATE",
          "allowed": true
        }
      ]
    }
  }
}
```

## Error Responses

### 403 Forbidden (Tidak punya permission)

```json
{
  "success": false,
  "error": "You do not have permission to perform this action",
  "required": "KEUNGAN_CREATE",
  "yourRole": "user",
  "allowedRoles": ["admin", "superadmin"]
}
```

**Penjelasan**:
- User dengan role `user` mencoba create transaksi keuangan
- Permission `KEUNGAN_CREATE` hanya bisa diakses oleh `admin` dan `superadmin`
- Request ditolak dengan error 403

## Best Practices

1. **Selalu gunakan `authenticateUser` sebelum `checkPermission`**
   ```javascript
   router.post('/', authenticateUser, checkPermission('KEUNGAN_CREATE'), controller.create);
   ```

2. **Gunakan permission yang spesifik**
   - ✅ `KEUNGAN_CREATE` (spesifik)
   - ❌ `KEUNGAN_ALL` (terlalu umum)

3. **Update permission matrix jika menambah feature baru**
   - Tambahkan permission di `src/middleware/permissions.js`
   - Update dokumentasi ini

4. **Test dengan berbagai role**
   - Pastikan user biasa tidak bisa akses endpoint yang memerlukan admin
   - Pastikan admin tidak bisa akses endpoint user management

## Menambah Feature Baru

### Step 1: Define Permission

```javascript
// src/middleware/permissions.js
const PERMISSIONS = {
  // ... existing permissions
  NEW_FEATURE_READ: [ROLES.USER, ROLES.ADMIN, ROLES.SUPERADMIN],
  NEW_FEATURE_CREATE: [ROLES.ADMIN, ROLES.SUPERADMIN],
  NEW_FEATURE_UPDATE: [ROLES.ADMIN, ROLES.SUPERADMIN],
  NEW_FEATURE_DELETE: [ROLES.ADMIN, ROLES.SUPERADMIN],
};
```

### Step 2: Protect Routes

```javascript
// src/routes/newFeature.js
router.get('/', authenticateUser, checkPermission('NEW_FEATURE_READ'), controller.getAll);
router.post('/', authenticateUser, checkPermission('NEW_FEATURE_CREATE'), controller.create);
router.put('/:id', authenticateUser, checkPermission('NEW_FEATURE_UPDATE'), controller.update);
router.delete('/:id', authenticateUser, checkPermission('NEW_FEATURE_DELETE'), controller.delete);
```

### Step 3: Update Documentation

Update file ini dengan feature baru.

## Summary

- **User**: Read-only access untuk sebagian besar data
- **Admin**: Full CRUD untuk operasional (keuangan, properti, persediaan, penjualan)
- **Superadmin**: Full access ke semua fitur termasuk user management

Setiap endpoint dilindungi dengan permission check, dan hanya user dengan role yang sesuai yang bisa mengakses.
