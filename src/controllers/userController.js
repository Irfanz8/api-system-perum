import { supabaseAdmin } from '../config/supabase.js';
import db from '../config/database.js';
import { ROLES, isValidRole } from '../utils/roles.js';
import { parsePaginationParams, buildPaginatedApiResponse } from '../utils/pagination.js';

/**
 * Get all users with pagination (superadmin only)
 */
export const getAllUsers = async (req, res) => {
  try {
    const { page, limit, offset, sortBy, sortOrder } = parsePaginationParams(req.query, {
      defaultSortBy: 'created_at',
      allowedSortFields: ['created_at', 'updated_at', 'username', 'email', 'role']
    });

    const search = req.query.search || null;
    const roleFilter = req.query.role || null;

    // Build WHERE conditions
    const conditions = [];
    if (search) {
      conditions.push(db`(username ILIKE ${'%' + search + '%'} OR email ILIKE ${'%' + search + '%'})`);
    }
    if (roleFilter) {
      conditions.push(db`role = ${roleFilter}`);
    }

    const whereClause = conditions.length > 0 
      ? db`WHERE ${conditions.reduce((a, b) => db`${a} AND ${b}`)}`
      : db``;

    // Get total count
    const countResult = await db`SELECT COUNT(*) as total FROM users ${whereClause}`;
    const totalItems = parseInt(countResult[0].total);

    // Build ORDER BY - using safe column mapping
    const sortColumns = {
      'created_at': db`created_at`,
      'updated_at': db`updated_at`,
      'username': db`username`,
      'email': db`email`,
      'role': db`role`
    };
    const sortColumn = sortColumns[sortBy] || sortColumns['created_at'];
    const orderDirection = sortOrder === 'asc' ? db`ASC` : db`DESC`;

    // Get paginated data
    const data = await db`
      SELECT id, username, email, role, created_at, updated_at 
      FROM users 
      ${whereClause}
      ORDER BY ${sortColumn} ${orderDirection}
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    res.json(buildPaginatedApiResponse(data, totalItems, page, limit));
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get users'
    });
  }
};

/**
 * Get user by ID (superadmin only)
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db`SELECT id, username, email, role, created_at, updated_at FROM users WHERE id = ${id}`;
    
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User tidak ditemukan'
      });
    }
    
    res.json({
      success: true,
      data: result[0]
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user'
    });
  }
};

/**
 * Update user role (superadmin only)
 */
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const currentUser = req.user;
    
    // Log untuk debugging
    console.log('=== Update User Role Request ===');
    console.log('Target User ID:', id);
    console.log('Request Body:', req.body);
    console.log('Requested Role:', role);
    console.log('Current User:', currentUser?.email, currentUser?.role);
    
    if (!role) {
      console.log('ERROR: Role tidak ada di request body');
      return res.status(400).json({
        success: false,
        error: 'Role wajib diisi'
      });
    }
    
    if (!isValidRole(role)) {
      console.log('ERROR: Role tidak valid:', role);
      console.log('Valid roles:', Object.values(ROLES));
      return res.status(400).json({
        success: false,
        error: `Role tidak valid. Role yang tersedia: ${Object.values(ROLES).join(', ')}`
      });
    }

    if (currentUser.id === id && currentUser.role === ROLES.SUPERADMIN && role !== ROLES.SUPERADMIN) {
      return res.status(403).json({
        success: false,
        error: 'Superadmin tidak bisa mengubah role sendiri'
      });
    }

    if (role === ROLES.SUPERADMIN && currentUser.role !== ROLES.SUPERADMIN) {
      return res.status(403).json({
        success: false,
        error: 'Hanya superadmin yang bisa assign role superadmin'
      });
    }

    const userResult = await db`SELECT id, email, role FROM users WHERE id = ${id}`;

    if (userResult.length === 0) {
      console.log('ERROR: User tidak ditemukan di database');
      return res.status(404).json({
        success: false,
        error: 'User tidak ditemukan di database. Pastikan user ID sudah terdaftar.'
      });
    }

    const targetUser = userResult[0];
    console.log('Target user found in database:', targetUser.email, targetUser.role);

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
    
    console.log('Updating Supabase user metadata...');
    const { data, error: supabaseError } = await supabaseAdmin.auth.admin.updateUserById(id, {
      user_metadata: { role }
    });
    
    if (supabaseError) {
      console.log('ERROR: Supabase update failed:', supabaseError);
      
      // Check if it's a "user not found" error from Supabase
      if (supabaseError.message && supabaseError.message.toLowerCase().includes('not found')) {
        return res.status(404).json({
          success: false,
          error: `User ditemukan di database tapi tidak di Supabase Auth. User mungkin belum login atau data tidak sinkron. User: ${targetUser.email}`
        });
      }
      
      return res.status(400).json({
        success: false,
        error: supabaseError.message
      });
    }
    console.log('Supabase user metadata updated successfully');
    
    const result = await db`UPDATE users SET role = ${role}, updated_at = CURRENT_TIMESTAMP WHERE id = ${id} RETURNING *`;
    
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User tidak ditemukan'
      });
    }
    
    res.json({
      success: true,
      message: `Role user berhasil diubah dari ${targetUser.role} menjadi ${role}`,
      data: {
        ...result[0],
        oldRole: targetUser.role,
        newRole: role
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
 * Delete user (superadmin only)
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error: supabaseError } = await supabaseAdmin.auth.admin.deleteUser(id);
    
    if (supabaseError) {
      return res.status(400).json({
        success: false,
        error: supabaseError.message
      });
    }
    
    const result = await db`DELETE FROM users WHERE id = ${id} RETURNING *`;
    
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User tidak ditemukan'
      });
    }
    
    res.json({
      success: true,
      message: 'User berhasil dihapus',
      data: result[0]
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user'
    });
  }
};