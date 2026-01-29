const supabase = require('../config/supabase');
const { ROLES } = require('../utils/roles');

/**
 * Middleware untuk memverifikasi JWT token dari Supabase
 */
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No authorization token provided'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verifikasi token dengan Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // Get user role from database (lebih reliable)
    const db = require('../config/database');
    let userRole = user.user_metadata?.role || ROLES.USER;
    
    try {
      const roleQuery = 'SELECT role FROM users WHERE id = $1';
      const roleResult = await db.query(roleQuery, [user.id]);
      if (roleResult.rows.length > 0 && roleResult.rows[0].role) {
        userRole = roleResult.rows[0].role;
      }
    } catch (error) {
      console.error('Error fetching user role from database:', error);
      // Fallback ke user_metadata jika database error
    }

    // Tambahkan user data ke request object
    req.user = {
      id: user.id,
      email: user.email,
      role: userRole,
      name: user.user_metadata?.name || user.email
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

/**
 * Middleware untuk memeriksa role user
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to perform this action'
      });
    }

    next();
  };
};

/**
 * Middleware untuk memeriksa apakah user adalah admin (admin atau superadmin)
 */
const isAdmin = authorizeRoles(ROLES.ADMIN, ROLES.SUPERADMIN);

/**
 * Middleware untuk memeriksa apakah user adalah superadmin
 */
const isSuperAdmin = authorizeRoles(ROLES.SUPERADMIN);

/**
 * Middleware untuk memeriksa permission spesifik pada module
 * @param {string} moduleCode - Kode module (e.g., 'keuangan', 'properti')
 * @param {string} action - Action yang diperlukan ('view', 'create', 'update', 'delete')
 */
const hasPermission = (moduleCode, action) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      // Superadmin bypass - punya semua permission
      if (req.user.role === ROLES.SUPERADMIN) {
        return next();
      }

      const db = require('../config/database');
      
      // Map action to column name
      const actionColumnMap = {
        'view': 'can_view',
        'create': 'can_create',
        'update': 'can_update',
        'delete': 'can_delete'
      };

      const actionColumn = actionColumnMap[action];
      if (!actionColumn) {
        return res.status(400).json({
          success: false,
          error: 'Invalid action specified'
        });
      }

      // Check permission from database
      const query = `
        SELECT up.${actionColumn} as has_permission
        FROM user_permissions up
        JOIN modules m ON up.module_id = m.id
        WHERE up.user_id = $1 AND m.code = $2 AND m.is_active = true
      `;
      const result = await db.query(query, [req.user.id, moduleCode]);

      if (result.rows.length === 0 || !result.rows[0].has_permission) {
        return res.status(403).json({
          success: false,
          error: `You do not have ${action} permission for ${moduleCode}`
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({
        success: false,
        error: 'Permission check failed'
      });
    }
  };
};

/**
 * Middleware untuk memeriksa apakah user belong to division tertentu
 * @param {string} divisionIdParam - Nama parameter yang berisi division_id (default: 'divisionId')
 */
const belongsToDivision = (divisionIdParam = 'divisionId') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      // Superadmin bypass
      if (req.user.role === ROLES.SUPERADMIN) {
        return next();
      }

      const divisionId = req.params[divisionIdParam] || req.body[divisionIdParam];
      if (!divisionId) {
        return res.status(400).json({
          success: false,
          error: 'Division ID is required'
        });
      }

      const db = require('../config/database');
      const query = `
        SELECT 1 FROM user_divisions
        WHERE user_id = $1 AND division_id = $2
      `;
      const result = await db.query(query, [req.user.id, divisionId]);

      if (result.rows.length === 0) {
        return res.status(403).json({
          success: false,
          error: 'You do not have access to this division'
        });
      }

      next();
    } catch (error) {
      console.error('Division check error:', error);
      res.status(500).json({
        success: false,
        error: 'Division check failed'
      });
    }
  };
};

module.exports = {
  authenticateUser,
  authorizeRoles,
  isAdmin,
  isSuperAdmin,
  hasPermission,
  belongsToDivision
};