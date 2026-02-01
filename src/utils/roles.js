/**
 * Valid roles dalam sistem
 */
export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin'
};

/**
 * Array semua valid roles
 */
export const VALID_ROLES = Object.values(ROLES);

/**
 * Memeriksa apakah role valid
 */
export const isValidRole = (role) => {
  return VALID_ROLES.includes(role);
};

/**
 * Memeriksa apakah user adalah admin (admin atau superadmin)
 */
export const isAdminRole = (role) => {
  return role === ROLES.ADMIN || role === ROLES.SUPERADMIN;
};

/**
 * Memeriksa apakah user adalah superadmin
 */
export const isSuperAdminRole = (role) => {
  return role === ROLES.SUPERADMIN;
};

/**
 * Actions untuk permission check
 */
export const ACTIONS = {
  VIEW: 'view',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete'
};