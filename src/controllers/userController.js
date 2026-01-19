const supabase = require('../config/supabase');
const db = require('../config/database');
const { ROLES, isValidRole } = require('../utils/roles');

/**
 * Get all users (superadmin only)
 */
exports.getAllUsers = async (req, res) => {
  try {
    const query = 'SELECT id, username, email, role, created_at, updated_at FROM users ORDER BY created_at DESC';
    const result = await db.query(query);
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
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
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'SELECT id, username, email, role, created_at, updated_at FROM users WHERE id = $1';
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User tidak ditemukan'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
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
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
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
    const updateQuery = 'UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *';
    const result = await db.query(updateQuery, [role, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User tidak ditemukan'
      });
    }
    
    res.json({
      success: true,
      message: 'Role user berhasil diupdate',
      data: result.rows[0]
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
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Hapus dari Supabase Auth
    const { error: supabaseError } = await supabase.auth.admin.deleteUser(id);
    
    if (supabaseError) {
      return res.status(400).json({
        success: false,
        error: supabaseError.message
      });
    }
    
    // Hapus dari database lokal (CASCADE akan menghapus data terkait)
    const deleteQuery = 'DELETE FROM users WHERE id = $1 RETURNING *';
    const result = await db.query(deleteQuery, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User tidak ditemukan'
      });
    }
    
    res.json({
      success: true,
      message: 'User berhasil dihapus',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user'
    });
  }
};