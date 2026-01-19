const db = require('../config/database');
const supabase = require('../config/supabase');
const { ROLES, isValidRole } = require('../utils/roles');
const { getRolePermissions, PERMISSIONS } = require('../middleware/permissions');

/**
 * Get role hierarchy dan informasi
 */
exports.getRoleHierarchy = async (req, res) => {
  try {
    const hierarchy = {
      superadmin: {
        level: 3,
        description: 'Full access ke semua fitur termasuk user management',
        permissions: getRolePermissions(ROLES.SUPERADMIN),
        canManage: ['superadmin', 'admin', 'user']
      },
      admin: {
        level: 2,
        description: 'CRUD access untuk operasional (keuangan, properti, persediaan, penjualan)',
        permissions: getRolePermissions(ROLES.ADMIN),
        canManage: ['admin', 'user']
      },
      user: {
        level: 1,
        description: 'Read-only access untuk sebagian besar data',
        permissions: getRolePermissions(ROLES.USER),
        canManage: []
      }
    };

    res.json({
      success: true,
      data: hierarchy,
      hierarchy: [
        { role: 'superadmin', level: 3 },
        { role: 'admin', level: 2 },
        { role: 'user', level: 1 }
      ]
    });
  } catch (error) {
    console.error('Get role hierarchy error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get role hierarchy'
    });
  }
};

/**
 * Get permissions untuk suatu role
 */
exports.getRolePermissions = async (req, res) => {
  try {
    const { role } = req.params;

    if (!isValidRole(role)) {
      return res.status(400).json({
        success: false,
        error: `Role tidak valid. Role yang tersedia: ${Object.values(ROLES).join(', ')}`
      });
    }

    const permissions = getRolePermissions(role);
    const permissionDetails = {};

    // Get detail setiap permission
    for (const permission of permissions) {
      permissionDetails[permission] = {
        allowed: true,
        description: getPermissionDescription(permission)
      };
    }

    res.json({
      success: true,
      data: {
        role,
        permissions,
        permissionDetails,
        totalPermissions: permissions.length
      }
    });
  } catch (error) {
    console.error('Get role permissions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get role permissions'
    });
  }
};

/**
 * Get all permissions matrix
 */
exports.getPermissionsMatrix = async (req, res) => {
  try {
    const matrix = {};

    // Build matrix untuk setiap permission
    for (const [permission, allowedRoles] of Object.entries(PERMISSIONS)) {
      matrix[permission] = {
        superadmin: allowedRoles.includes(ROLES.SUPERADMIN),
        admin: allowedRoles.includes(ROLES.ADMIN),
        user: allowedRoles.includes(ROLES.USER),
        allowedRoles
      };
    }

    res.json({
      success: true,
      data: matrix,
      summary: {
        totalPermissions: Object.keys(PERMISSIONS).length,
        superadminPermissions: getRolePermissions(ROLES.SUPERADMIN).length,
        adminPermissions: getRolePermissions(ROLES.ADMIN).length,
        userPermissions: getRolePermissions(ROLES.USER).length
      }
    });
  } catch (error) {
    console.error('Get permissions matrix error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get permissions matrix'
    });
  }
};

/**
 * Get all users dengan role dan permissions mereka
 */
exports.getUsersWithRoles = async (req, res) => {
  try {
    const query = `
      SELECT 
        id, 
        username, 
        email, 
        role, 
        created_at, 
        updated_at,
        (SELECT COUNT(*) FROM financial_transactions WHERE created_by = users.id) as transaction_count,
        (SELECT COUNT(*) FROM properties WHERE created_by = users.id) as property_count
      FROM users 
      ORDER BY 
        CASE role
          WHEN 'superadmin' THEN 1
          WHEN 'admin' THEN 2
          WHEN 'user' THEN 3
        END,
        created_at DESC
    `;
    const result = await db.query(query);

    // Tambahkan permissions untuk setiap user
    const usersWithPermissions = result.rows.map(user => ({
      ...user,
      permissions: getRolePermissions(user.role),
      permissionCount: getRolePermissions(user.role).length
    }));

    // Group by role
    const groupedByRole = {
      superadmin: usersWithPermissions.filter(u => u.role === ROLES.SUPERADMIN),
      admin: usersWithPermissions.filter(u => u.role === ROLES.ADMIN),
      user: usersWithPermissions.filter(u => u.role === ROLES.USER)
    };

    res.json({
      success: true,
      count: usersWithPermissions.length,
      data: usersWithPermissions,
      groupedByRole,
      statistics: {
        total: usersWithPermissions.length,
        superadmin: groupedByRole.superadmin.length,
        admin: groupedByRole.admin.length,
        user: groupedByRole.user.length
      }
    });
  } catch (error) {
    console.error('Get users with roles error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get users with roles'
    });
  }
};

/**
 * Get users by role
 */
exports.getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;

    if (!isValidRole(role)) {
      return res.status(400).json({
        success: false,
        error: `Role tidak valid. Role yang tersedia: ${Object.values(ROLES).join(', ')}`
      });
    }

    const query = `
      SELECT 
        id, 
        username, 
        email, 
        role, 
        created_at, 
        updated_at
      FROM users 
      WHERE role = $1
      ORDER BY created_at DESC
    `;
    const result = await db.query(query, [role]);

    res.json({
      success: true,
      count: result.rows.length,
      role,
      permissions: getRolePermissions(role),
      data: result.rows
    });
  } catch (error) {
    console.error('Get users by role error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get users by role'
    });
  }
};

/**
 * Update user role dengan validasi hierarki
 */
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const currentUser = req.user;

    if (!role) {
      return res.status(400).json({
        success: false,
        error: 'Role wajib diisi'
      });
    }

    if (!isValidRole(role)) {
      return res.status(400).json({
        success: false,
        error: `Role tidak valid. Role yang tersedia: ${Object.values(ROLES).join(', ')}`
      });
    }

    // Validasi: Superadmin tidak bisa downgrade dirinya sendiri
    if (currentUser.id === id && currentUser.role === ROLES.SUPERADMIN && role !== ROLES.SUPERADMIN) {
      return res.status(403).json({
        success: false,
        error: 'Superadmin tidak bisa mengubah role sendiri'
      });
    }

    // Validasi: Hanya superadmin yang bisa assign superadmin
    if (role === ROLES.SUPERADMIN && currentUser.role !== ROLES.SUPERADMIN) {
      return res.status(403).json({
        success: false,
        error: 'Hanya superadmin yang bisa assign role superadmin'
      });
    }

    // Get user yang akan di-update
    const userQuery = 'SELECT id, email, role FROM users WHERE id = $1';
    const userResult = await db.query(userQuery, [id]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User tidak ditemukan'
      });
    }

    const targetUser = userResult.rows[0];

    // Validasi: Tidak bisa mengubah role user yang levelnya sama atau lebih tinggi
    const roleLevels = {
      [ROLES.SUPERADMIN]: 3,
      [ROLES.ADMIN]: 2,
      [ROLES.USER]: 1
    };

    if (roleLevels[targetUser.role] >= roleLevels[currentUser.role] && currentUser.id !== id) {
      return res.status(403).json({
        success: false,
        error: 'Anda tidak bisa mengubah role user yang levelnya sama atau lebih tinggi'
      });
    }

    // Update di Supabase Auth
    const { data: { user }, error: supabaseError } = await supabase.auth.admin.updateUserById(id, {
      user_metadata: { role }
    });

    if (supabaseError) {
      return res.status(400).json({
        success: false,
        error: supabaseError.message
      });
    }

    // Update di database lokal
    const updateQuery = `
      UPDATE users 
      SET role = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2 
      RETURNING id, username, email, role, created_at, updated_at
    `;
    const result = await db.query(updateQuery, [role, id]);

    res.json({
      success: true,
      message: `Role user berhasil diubah dari ${targetUser.role} menjadi ${role}`,
      data: {
        ...result.rows[0],
        oldRole: targetUser.role,
        newRole: role,
        permissions: getRolePermissions(role),
        updatedBy: {
          id: currentUser.id,
          email: currentUser.email,
          role: currentUser.role
        }
      }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user role'
    });
  }
};

/**
 * Get role statistics
 */
exports.getRoleStatistics = async (req, res) => {
  try {
    const query = `
      SELECT 
        role,
        COUNT(*) as count,
        MIN(created_at) as first_user_created,
        MAX(created_at) as last_user_created
      FROM users
      GROUP BY role
      ORDER BY 
        CASE role
          WHEN 'superadmin' THEN 1
          WHEN 'admin' THEN 2
          WHEN 'user' THEN 3
        END
    `;
    const result = await db.query(query);

    const statistics = {
      total: 0,
      byRole: {},
      permissions: {}
    };

    result.rows.forEach(row => {
      statistics.total += parseInt(row.count);
      statistics.byRole[row.role] = {
        count: parseInt(row.count),
        firstUserCreated: row.first_user_created,
        lastUserCreated: row.last_user_created,
        permissions: getRolePermissions(row.role),
        permissionCount: getRolePermissions(row.role).length
      };
      statistics.permissions[row.role] = getRolePermissions(row.role);
    });

    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('Get role statistics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get role statistics'
    });
  }
};

/**
 * Get feature access untuk suatu role (dengan detail endpoint)
 */
exports.getRoleFeatureAccess = async (req, res) => {
  try {
    const { role } = req.params;

    if (!isValidRole(role)) {
      return res.status(400).json({
        success: false,
        error: `Role tidak valid. Role yang tersedia: ${Object.values(ROLES).join(', ')}`
      });
    }

    const permissions = getRolePermissions(role);
    
    // Group permissions by feature/module
    const featureAccess = {
      users: {
        name: 'User Management',
        endpoints: [
          { method: 'GET', path: '/api/users', permission: 'USERS_READ', allowed: permissions.includes('USERS_READ') },
          { method: 'GET', path: '/api/users/:id', permission: 'USERS_READ', allowed: permissions.includes('USERS_READ') },
          { method: 'PATCH', path: '/api/users/:id/role', permission: 'USERS_UPDATE_ROLE', allowed: permissions.includes('USERS_UPDATE_ROLE') },
          { method: 'DELETE', path: '/api/users/:id', permission: 'USERS_DELETE', allowed: permissions.includes('USERS_DELETE') }
        ],
        canAccess: permissions.includes('USERS_READ')
      },
      keuangan: {
        name: 'Financial Transactions',
        endpoints: [
          { method: 'GET', path: '/api/keuangan', permission: 'KEUNGAN_READ', allowed: permissions.includes('KEUNGAN_READ') },
          { method: 'GET', path: '/api/keuangan/summary', permission: 'KEUNGAN_READ', allowed: permissions.includes('KEUNGAN_READ') },
          { method: 'GET', path: '/api/keuangan/:id', permission: 'KEUNGAN_READ', allowed: permissions.includes('KEUNGAN_READ') },
          { method: 'POST', path: '/api/keuangan', permission: 'KEUNGAN_CREATE', allowed: permissions.includes('KEUNGAN_CREATE') },
          { method: 'PUT', path: '/api/keuangan/:id', permission: 'KEUNGAN_UPDATE', allowed: permissions.includes('KEUNGAN_UPDATE') },
          { method: 'DELETE', path: '/api/keuangan/:id', permission: 'KEUNGAN_DELETE', allowed: permissions.includes('KEUNGAN_DELETE') }
        ],
        canAccess: permissions.includes('KEUNGAN_READ'),
        canCreate: permissions.includes('KEUNGAN_CREATE'),
        canUpdate: permissions.includes('KEUNGAN_UPDATE'),
        canDelete: permissions.includes('KEUNGAN_DELETE')
      },
      properti: {
        name: 'Properties',
        endpoints: [
          { method: 'GET', path: '/api/properti', permission: 'PROPERTI_READ', allowed: permissions.includes('PROPERTI_READ') },
          { method: 'GET', path: '/api/properti/available', permission: 'PROPERTI_READ', allowed: permissions.includes('PROPERTI_READ') },
          { method: 'GET', path: '/api/properti/stats', permission: 'PROPERTI_READ', allowed: permissions.includes('PROPERTI_READ') },
          { method: 'GET', path: '/api/properti/:id', permission: 'PROPERTI_READ', allowed: permissions.includes('PROPERTI_READ') },
          { method: 'POST', path: '/api/properti', permission: 'PROPERTI_CREATE', allowed: permissions.includes('PROPERTI_CREATE') },
          { method: 'PUT', path: '/api/properti/:id', permission: 'PROPERTI_UPDATE', allowed: permissions.includes('PROPERTI_UPDATE') },
          { method: 'DELETE', path: '/api/properti/:id', permission: 'PROPERTI_DELETE', allowed: permissions.includes('PROPERTI_DELETE') },
          { method: 'PATCH', path: '/api/properti/:id/status', permission: 'PROPERTI_UPDATE_STATUS', allowed: permissions.includes('PROPERTI_UPDATE_STATUS') }
        ],
        canAccess: permissions.includes('PROPERTI_READ'),
        canCreate: permissions.includes('PROPERTI_CREATE'),
        canUpdate: permissions.includes('PROPERTI_UPDATE'),
        canDelete: permissions.includes('PROPERTI_DELETE')
      },
      persediaan: {
        name: 'Inventory',
        endpoints: [
          { method: 'GET', path: '/api/persediaan', permission: 'PERSEDIAAN_READ', allowed: permissions.includes('PERSEDIAAN_READ') },
          { method: 'GET', path: '/api/persediaan/low-stock', permission: 'PERSEDIAAN_READ', allowed: permissions.includes('PERSEDIAAN_READ') },
          { method: 'GET', path: '/api/persediaan/stats', permission: 'PERSEDIAAN_READ', allowed: permissions.includes('PERSEDIAAN_READ') },
          { method: 'GET', path: '/api/persediaan/:id', permission: 'PERSEDIAAN_READ', allowed: permissions.includes('PERSEDIAAN_READ') },
          { method: 'POST', path: '/api/persediaan', permission: 'PERSEDIAAN_CREATE', allowed: permissions.includes('PERSEDIAAN_CREATE') },
          { method: 'PUT', path: '/api/persediaan/:id', permission: 'PERSEDIAAN_UPDATE', allowed: permissions.includes('PERSEDIAAN_UPDATE') },
          { method: 'DELETE', path: '/api/persediaan/:id', permission: 'PERSEDIAAN_DELETE', allowed: permissions.includes('PERSEDIAAN_DELETE') },
          { method: 'POST', path: '/api/persediaan/:id/transaction', permission: 'PERSEDIAAN_TRANSACTION', allowed: permissions.includes('PERSEDIAAN_TRANSACTION') }
        ],
        canAccess: permissions.includes('PERSEDIAAN_READ'),
        canCreate: permissions.includes('PERSEDIAAN_CREATE'),
        canUpdate: permissions.includes('PERSEDIAAN_UPDATE'),
        canDelete: permissions.includes('PERSEDIAAN_DELETE')
      },
      penjualan: {
        name: 'Property Sales',
        endpoints: [
          { method: 'GET', path: '/api/penjualan', permission: 'PENJUALAN_READ', allowed: permissions.includes('PENJUALAN_READ') },
          { method: 'GET', path: '/api/penjualan/stats', permission: 'PENJUALAN_READ', allowed: permissions.includes('PENJUALAN_READ') },
          { method: 'GET', path: '/api/penjualan/revenue/:year', permission: 'PENJUALAN_READ', allowed: permissions.includes('PENJUALAN_READ') },
          { method: 'GET', path: '/api/penjualan/:id', permission: 'PENJUALAN_READ', allowed: permissions.includes('PENJUALAN_READ') },
          { method: 'POST', path: '/api/penjualan', permission: 'PENJUALAN_CREATE', allowed: permissions.includes('PENJUALAN_CREATE') },
          { method: 'PUT', path: '/api/penjualan/:id', permission: 'PENJUALAN_UPDATE', allowed: permissions.includes('PENJUALAN_UPDATE') },
          { method: 'DELETE', path: '/api/penjualan/:id', permission: 'PENJUALAN_DELETE', allowed: permissions.includes('PENJUALAN_DELETE') },
          { method: 'POST', path: '/api/penjualan/:id/complete', permission: 'PENJUALAN_COMPLETE', allowed: permissions.includes('PENJUALAN_COMPLETE') }
        ],
        canAccess: permissions.includes('PENJUALAN_READ'),
        canCreate: permissions.includes('PENJUALAN_CREATE'),
        canUpdate: permissions.includes('PENJUALAN_UPDATE'),
        canDelete: permissions.includes('PENJUALAN_DELETE')
      },
      roles: {
        name: 'Role Management',
        endpoints: [
          { method: 'GET', path: '/api/roles/hierarchy', permission: 'USERS_READ', allowed: permissions.includes('USERS_READ') },
          { method: 'GET', path: '/api/roles/:role/permissions', permission: 'USERS_READ', allowed: permissions.includes('USERS_READ') },
          { method: 'GET', path: '/api/roles/permissions/matrix', permission: 'USERS_READ', allowed: permissions.includes('USERS_READ') },
          { method: 'GET', path: '/api/roles/users', permission: 'USERS_READ', allowed: permissions.includes('USERS_READ') },
          { method: 'PATCH', path: '/api/roles/users/:id/role', permission: 'USERS_UPDATE_ROLE', allowed: permissions.includes('USERS_UPDATE_ROLE') }
        ],
        canAccess: permissions.includes('USERS_READ')
      }
    };

    // Calculate summary
    const summary = {
      totalFeatures: Object.keys(featureAccess).length,
      accessibleFeatures: Object.values(featureAccess).filter(f => f.canAccess).length,
      totalEndpoints: Object.values(featureAccess).reduce((sum, f) => sum + f.endpoints.length, 0),
      accessibleEndpoints: Object.values(featureAccess).reduce((sum, f) => sum + f.endpoints.filter(e => e.allowed).length, 0),
      canCreate: Object.values(featureAccess).some(f => f.canCreate),
      canUpdate: Object.values(featureAccess).some(f => f.canUpdate),
      canDelete: Object.values(featureAccess).some(f => f.canDelete)
    };

    res.json({
      success: true,
      role,
      summary,
      featureAccess,
      permissions: {
        list: permissions,
        count: permissions.length,
        details: permissions.map(p => ({
          permission: p,
          description: getPermissionDescription(p)
        }))
      }
    });
  } catch (error) {
    console.error('Get role feature access error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get role feature access'
    });
  }
};

/**
 * Helper function untuk mendapatkan deskripsi permission
 */
function getPermissionDescription(permission) {
  const descriptions = {
    'USERS_READ': 'Melihat daftar users',
    'USERS_CREATE': 'Membuat user baru',
    'USERS_UPDATE': 'Mengupdate data user',
    'USERS_DELETE': 'Menghapus user',
    'USERS_UPDATE_ROLE': 'Mengubah role user',
    'KEUNGAN_READ': 'Melihat transaksi keuangan',
    'KEUNGAN_CREATE': 'Membuat transaksi keuangan',
    'KEUNGAN_UPDATE': 'Mengupdate transaksi keuangan',
    'KEUNGAN_DELETE': 'Menghapus transaksi keuangan',
    'PROPERTI_READ': 'Melihat data properti',
    'PROPERTI_CREATE': 'Membuat properti baru',
    'PROPERTI_UPDATE': 'Mengupdate data properti',
    'PROPERTI_DELETE': 'Menghapus properti',
    'PROPERTI_UPDATE_STATUS': 'Mengubah status properti',
    'PERSEDIAAN_READ': 'Melihat data persediaan',
    'PERSEDIAAN_CREATE': 'Membuat item persediaan baru',
    'PERSEDIAAN_UPDATE': 'Mengupdate data persediaan',
    'PERSEDIAAN_DELETE': 'Menghapus item persediaan',
    'PERSEDIAAN_TRANSACTION': 'Mengelola transaksi persediaan (in/out)',
    'PENJUALAN_READ': 'Melihat data penjualan',
    'PENJUALAN_CREATE': 'Membuat penjualan baru',
    'PENJUALAN_UPDATE': 'Mengupdate data penjualan',
    'PENJUALAN_DELETE': 'Menghapus penjualan',
    'PENJUALAN_COMPLETE': 'Menyelesaikan penjualan'
  };

  return descriptions[permission] || 'Permission tidak diketahui';
}
