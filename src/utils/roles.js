/**
 * Valid roles dalam sistem
 */
const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin'
};

/**
 * Array semua valid roles
 */
const VALID_ROLES = Object.values(ROLES);

/**
 * Memeriksa apakah role valid
 */
const isValidRole = (role) => {
  return VALID_ROLES.includes(role);
};

/**
 * Memeriksa apakah user adalah admin (admin atau superadmin)
 */
const isAdminRole = (role) => {
  return role === ROLES.ADMIN || role === ROLES.SUPERADMIN;
};

/**
 * Memeriksa apakah user adalah superadmin
 */
const isSuperAdminRole = (role) => {
  return role === ROLES.SUPERADMIN;
};

module.exports = {
  ROLES,
  VALID_ROLES,
  isValidRole,
  isAdminRole,
  isSuperAdminRole
};