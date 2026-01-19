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
