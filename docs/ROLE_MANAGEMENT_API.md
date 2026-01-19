# Role Management API Documentation

## Overview

API untuk mengelola role dan permissions user. Hanya **Superadmin** yang bisa mengakses semua endpoint ini.

## Base URL

```
/api/roles
```

## Endpoints

### 1. Get Role Hierarchy

Mendapatkan informasi hierarki role dan permissions untuk setiap role.

**Endpoint**: `GET /api/roles/hierarchy`

**Authentication**: Required (Superadmin only)

**Response**:
```json
{
  "success": true,
  "data": {
    "superadmin": {
      "level": 3,
      "description": "Full access ke semua fitur termasuk user management",
      "permissions": ["USERS_READ", "USERS_CREATE", ...],
      "canManage": ["superadmin", "admin", "user"]
    },
    "admin": {
      "level": 2,
      "description": "CRUD access untuk operasional",
      "permissions": ["KEUNGAN_READ", "KEUNGAN_CREATE", ...],
      "canManage": ["admin", "user"]
    },
    "user": {
      "level": 1,
      "description": "Read-only access",
      "permissions": ["KEUNGAN_READ", "PROPERTI_READ", ...],
      "canManage": []
    }
  },
  "hierarchy": [
    { "role": "superadmin", "level": 3 },
    { "role": "admin", "level": 2 },
    { "role": "user", "level": 1 }
  ]
}
```

### 2. Get Role Permissions

Mendapatkan daftar permissions untuk suatu role.

**Endpoint**: `GET /api/roles/:role/permissions`

**Parameters**:
- `role` (path): `user`, `admin`, atau `superadmin`

**Authentication**: Required (Superadmin only)

**Response**:
```json
{
  "success": true,
  "data": {
    "role": "admin",
    "permissions": ["KEUNGAN_READ", "KEUNGAN_CREATE", ...],
    "permissionDetails": {
      "KEUNGAN_READ": {
        "allowed": true,
        "description": "Melihat transaksi keuangan"
      },
      ...
    },
    "totalPermissions": 15
  }
}
```

### 3. Get Permissions Matrix

Mendapatkan matrix permissions untuk semua role.

**Endpoint**: `GET /api/roles/permissions/matrix`

**Authentication**: Required (Superadmin only)

**Response**:
```json
{
  "success": true,
  "data": {
    "KEUNGAN_READ": {
      "superadmin": true,
      "admin": true,
      "user": true,
      "allowedRoles": ["user", "admin", "superadmin"]
    },
    "KEUNGAN_CREATE": {
      "superadmin": true,
      "admin": true,
      "user": false,
      "allowedRoles": ["admin", "superadmin"]
    },
    ...
  },
  "summary": {
    "totalPermissions": 25,
    "superadminPermissions": 25,
    "adminPermissions": 20,
    "userPermissions": 5
  }
}
```

### 4. Get Users with Roles

Mendapatkan semua users beserta role dan permissions mereka.

**Endpoint**: `GET /api/roles/users`

**Authentication**: Required (Superadmin only)

**Response**:
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "id": "uuid",
      "username": "admin",
      "email": "admin@example.com",
      "role": "admin",
      "permissions": ["KEUNGAN_READ", "KEUNGAN_CREATE", ...],
      "permissionCount": 20,
      "transaction_count": 5,
      "property_count": 2,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    },
    ...
  ],
  "groupedByRole": {
    "superadmin": [...],
    "admin": [...],
    "user": [...]
  },
  "statistics": {
    "total": 10,
    "superadmin": 1,
    "admin": 2,
    "user": 7
  }
}
```

### 5. Get Users by Role

Mendapatkan semua users dengan role tertentu.

**Endpoint**: `GET /api/roles/users/:role`

**Parameters**:
- `role` (path): `user`, `admin`, atau `superadmin`

**Authentication**: Required (Superadmin only)

**Response**:
```json
{
  "success": true,
  "count": 5,
  "role": "admin",
  "permissions": ["KEUNGAN_READ", "KEUNGAN_CREATE", ...],
  "data": [
    {
      "id": "uuid",
      "username": "admin1",
      "email": "admin1@example.com",
      "role": "admin",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    },
    ...
  ]
}
```

### 6. Update User Role

Mengubah role user dengan validasi hierarki.

**Endpoint**: `PATCH /api/roles/users/:id/role`

**Parameters**:
- `id` (path): UUID user

**Authentication**: Required (Superadmin only)

**Request Body**:
```json
{
  "role": "admin"
}
```

**Validasi**:
- Superadmin tidak bisa mengubah role sendiri
- Hanya superadmin yang bisa assign role superadmin
- Tidak bisa mengubah role user yang levelnya sama atau lebih tinggi

**Response**:
```json
{
  "success": true,
  "message": "Role user berhasil diubah dari user menjadi admin",
  "data": {
    "id": "uuid",
    "username": "user1",
    "email": "user1@example.com",
    "role": "admin",
    "oldRole": "user",
    "newRole": "admin",
    "permissions": ["KEUNGAN_READ", "KEUNGAN_CREATE", ...],
    "updatedBy": {
      "id": "superadmin-uuid",
      "email": "superadmin@example.com",
      "role": "superadmin"
    },
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-02T00:00:00.000Z"
  }
}
```

**Error Responses**:
- `400`: Role tidak valid
- `403`: Permission denied (tidak bisa mengubah role user dengan level sama/lebih tinggi)
- `404`: User tidak ditemukan

### 7. Get Role Statistics

Mendapatkan statistik role (jumlah user per role, dll).

**Endpoint**: `GET /api/roles/statistics`

**Authentication**: Required (Superadmin only)

**Response**:
```json
{
  "success": true,
  "data": {
    "total": 10,
    "byRole": {
      "superadmin": {
        "count": 1,
        "firstUserCreated": "2024-01-01T00:00:00.000Z",
        "lastUserCreated": "2024-01-01T00:00:00.000Z",
        "permissions": [...],
        "permissionCount": 25
      },
      "admin": {
        "count": 2,
        "firstUserCreated": "2024-01-02T00:00:00.000Z",
        "lastUserCreated": "2024-01-05T00:00:00.000Z",
        "permissions": [...],
        "permissionCount": 20
      },
      "user": {
        "count": 7,
        "firstUserCreated": "2024-01-03T00:00:00.000Z",
        "lastUserCreated": "2024-01-10T00:00:00.000Z",
        "permissions": [...],
        "permissionCount": 5
      }
    },
    "permissions": {
      "superadmin": [...],
      "admin": [...],
      "user": [...]
    }
  }
}
```

## Usage Examples

### Mengubah role user menjadi admin

```bash
curl -X PATCH https://api.example.com/api/roles/users/{user-id}/role \
  -H "Authorization: Bearer {superadmin-token}" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "admin"
  }'
```

### Melihat semua users dengan role mereka

```bash
curl -X GET https://api.example.com/api/roles/users \
  -H "Authorization: Bearer {superadmin-token}"
```

### Melihat permissions untuk role admin

```bash
curl -X GET https://api.example.com/api/roles/admin/permissions \
  -H "Authorization: Bearer {superadmin-token}"
```

## Security Notes

1. **Hanya Superadmin** yang bisa mengakses semua endpoint role management
2. **Validasi Hierarki**: Superadmin tidak bisa mengubah role user yang levelnya sama atau lebih tinggi
3. **Self-Protection**: Superadmin tidak bisa downgrade role sendiri
4. **Role Assignment**: Hanya superadmin yang bisa assign role superadmin

## Related Endpoints

- `/api/users` - User management endpoints (juga superadmin only)
- `/api/users/:id/role` - Alternative endpoint untuk update role (backward compatibility)
