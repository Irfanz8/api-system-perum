const supabase = require('../config/supabase');

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

    // Tambahkan user data ke request object
    req.user = {
      id: user.id,
      email: user.email,
      role: user.user_metadata.role || 'user',
      name: user.user_metadata.name || user.email
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
 * Middleware untuk memeriksa apakah user adalah admin
 */
const isAdmin = authorizeRoles('admin', 'superadmin');

module.exports = {
  authenticateUser,
  authorizeRoles,
  isAdmin
};