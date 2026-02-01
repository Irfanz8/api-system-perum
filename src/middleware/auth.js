import { supabaseAdmin } from '../config/supabase.js';
import { ROLES } from '../utils/roles.js';
import db from '../config/database.js';

/**
 * Middleware untuk memverifikasi JWT token dari Supabase
 */
export const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No authorization token provided'
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Verifikasi token dengan Supabase using admin client
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error) {
      console.error('Supabase auth error:', error.message);
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token: ' + error.message
      });
    }
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get user role from database (lebih reliable)
    let userRole = user.user_metadata?.role || ROLES.USER;
    
    try {
      const roleResult = await db`SELECT role FROM users WHERE id = ${user.id}`;
      if (roleResult.length > 0 && roleResult[0].role) {
        userRole = roleResult[0].role;
      }
    } catch (dbError) {
      console.error('Error fetching user role from database:', dbError);
      // Fallback ke user_metadata jika database error
    }

    // Tambahkan user data ke request object
    req.user = {
      id: user.id,
      email: user.email,
      role: userRole,
      name: user.user_metadata?.name || user.email
    };
    
    console.log(`Auth middleware success: ${req.user.email} (${req.user.role})`);

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed: ' + error.message
    });
  }
};

/**
 * Middleware untuk memeriksa apakah user adalah division admin
 */
export const isDivisionAdmin = async (req, res, next) => {
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

    // Check if user is division admin of any division
    const result = await db`
      SELECT 1 FROM user_divisions
      WHERE user_id = ${req.user.id} AND is_division_admin = true
      LIMIT 1
    `;

    if (result.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'You must be a division admin to perform this action'
      });
    }

    next();
  } catch (error) {
    console.error('Division admin check error:', error);
    res.status(500).json({
      success: false,
      error: 'Authorization check failed'
    });
  }
};

/**
 * Middleware untuk memeriksa apakah user dapat manage target user
 * (same division and requester is division admin)
 */
export const canManageUser = async (req, res, next) => {
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

    const targetUserId = req.params.userId || req.body.userId;
    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        error: 'Target user ID is required'
      });
    }

    // Check if both users are in the same division and requester is admin
    const result = await db`
      SELECT 
        ud1.division_id,
        ud1.is_division_admin as requester_is_admin,
        ud2.is_division_admin as target_is_admin
      FROM user_divisions ud1
      JOIN user_divisions ud2 ON ud1.division_id = ud2.division_id
      WHERE ud1.user_id = ${req.user.id} 
      AND ud2.user_id = ${targetUserId}
      AND ud1.is_division_admin = true
    `;

    if (result.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'You can only manage users in your division'
      });
    }

    // Cannot manage other division admins
    if (result[0].target_is_admin && req.user.id !== targetUserId) {
      return res.status(403).json({
        success: false,
        error: 'You cannot manage other division admins'
      });
    }

    next();
  } catch (error) {
    console.error('Can manage user check error:', error);
    res.status(500).json({
      success: false,
      error: 'Authorization check failed'
    });
  }
};


/**
 * Middleware untuk memeriksa role user
 */
export const authorizeRoles = (...roles) => {
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
export const isAdmin = authorizeRoles(ROLES.ADMIN, ROLES.SUPERADMIN);

/**
 * Middleware untuk memeriksa apakah user adalah superadmin
 */
export const isSuperAdmin = authorizeRoles(ROLES.SUPERADMIN);

/**
 * Middleware untuk memeriksa permission spesifik pada module
 * @param {string} moduleCode - Kode module (e.g., 'keuangan', 'properti')
 * @param {string} action - Action yang diperlukan ('view', 'create', 'update', 'delete')
 */
export const hasPermission = (moduleCode, action) => {
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

      // Check permission from database using tagged template
      const result = await db`
        SELECT ${db.unsafe(actionColumn)} as has_permission
        FROM user_permissions up
        JOIN modules m ON up.module_id = m.id
        WHERE up.user_id = ${req.user.id} AND m.code = ${moduleCode} AND m.is_active = true
      `;

      if (result.length === 0 || !result[0].has_permission) {
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
export const belongsToDivision = (divisionIdParam = 'divisionId') => {
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

      const result = await db`
        SELECT 1 FROM user_divisions
        WHERE user_id = ${req.user.id} AND division_id = ${divisionId}
      `;

      if (result.length === 0) {
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