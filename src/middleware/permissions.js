import { ROLES } from '../utils/roles.js';

/**
 * Permission matrix untuk setiap role
 */
export const PERMISSIONS = {
  // Users Management
  USERS_READ: [ROLES.SUPERADMIN],
  USERS_CREATE: [ROLES.SUPERADMIN],
  USERS_UPDATE: [ROLES.SUPERADMIN],
  USERS_DELETE: [ROLES.SUPERADMIN],
  USERS_UPDATE_ROLE: [ROLES.SUPERADMIN],

  // Financial Transactions
  KEUNGAN_READ: [ROLES.USER, ROLES.ADMIN, ROLES.SUPERADMIN],
  KEUNGAN_CREATE: [ROLES.ADMIN, ROLES.SUPERADMIN],
  KEUNGAN_UPDATE: [ROLES.ADMIN, ROLES.SUPERADMIN],
  KEUNGAN_DELETE: [ROLES.ADMIN, ROLES.SUPERADMIN],

  // Properties
  PROPERTI_READ: [ROLES.USER, ROLES.ADMIN, ROLES.SUPERADMIN],
  PROPERTI_CREATE: [ROLES.ADMIN, ROLES.SUPERADMIN],
  PROPERTI_UPDATE: [ROLES.ADMIN, ROLES.SUPERADMIN],
  PROPERTI_DELETE: [ROLES.ADMIN, ROLES.SUPERADMIN],
  PROPERTI_UPDATE_STATUS: [ROLES.ADMIN, ROLES.SUPERADMIN],

  // Inventory
  PERSEDIAAN_READ: [ROLES.USER, ROLES.ADMIN, ROLES.SUPERADMIN],
  PERSEDIAAN_CREATE: [ROLES.ADMIN, ROLES.SUPERADMIN],
  PERSEDIAAN_UPDATE: [ROLES.ADMIN, ROLES.SUPERADMIN],
  PERSEDIAAN_DELETE: [ROLES.ADMIN, ROLES.SUPERADMIN],
  PERSEDIAAN_TRANSACTION: [ROLES.ADMIN, ROLES.SUPERADMIN],

  // Property Sales
  PENJUALAN_READ: [ROLES.USER, ROLES.ADMIN, ROLES.SUPERADMIN],
  PENJUALAN_CREATE: [ROLES.ADMIN, ROLES.SUPERADMIN],
  PENJUALAN_UPDATE: [ROLES.ADMIN, ROLES.SUPERADMIN],
  PENJUALAN_DELETE: [ROLES.ADMIN, ROLES.SUPERADMIN],
  PENJUALAN_COMPLETE: [ROLES.ADMIN, ROLES.SUPERADMIN],
};

/**
 * Middleware untuk memeriksa permission
 * @param {string} permission - Permission yang diperlukan
 */
export const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const userRole = req.user.role;
    const allowedRoles = PERMISSIONS[permission];

    if (!allowedRoles) {
      console.error(`Permission ${permission} not defined`);
      return res.status(500).json({
        success: false,
        error: 'Permission configuration error'
      });
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to perform this action',
        required: permission,
        yourRole: userRole,
        allowedRoles: allowedRoles
      });
    }

    next();
  };
};

/**
 * Middleware untuk memeriksa apakah user bisa mengakses resource miliknya sendiri
 * Digunakan untuk user biasa yang hanya bisa akses data yang mereka buat
 */
export const checkOwnership = (resourceUserIdField = 'created_by') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Superadmin dan Admin bisa akses semua
    if (req.user.role === ROLES.SUPERADMIN || req.user.role === ROLES.ADMIN) {
      return next();
    }

    // Untuk user biasa, cek ownership
    // Note: Implementasi ini perlu disesuaikan dengan controller
    // karena req.resource mungkin belum ada
    // Biasanya dilakukan di controller level
    next();
  };
};

/**
 * Helper function untuk mendapatkan semua permissions yang dimiliki role
 */
export const getRolePermissions = (role) => {
  const permissions = [];
  for (const [permission, allowedRoles] of Object.entries(PERMISSIONS)) {
    if (allowedRoles.includes(role)) {
      permissions.push(permission);
    }
  }
  return permissions;
};
