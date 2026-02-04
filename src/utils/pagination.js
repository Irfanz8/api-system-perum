/**
 * Pagination Helper Utilities
 * Provides standardized pagination parsing and response building
 */

/**
 * Parse pagination parameters from request query
 * @param {object} query - req.query object
 * @param {object} options - optional default values
 * @returns {object} { page, limit, offset, sortBy, sortOrder }
 */
export const parsePaginationParams = (query, options = {}) => {
  const {
    defaultLimit = 10,
    maxLimit = 100,
    defaultSortBy = 'created_at',
    defaultSortOrder = 'desc',
    allowedSortFields = null
  } = options;

  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit) || defaultLimit));
  const offset = (page - 1) * limit;
  
  let sortBy = query.sortBy || defaultSortBy;
  // Validate sortBy field if allowedSortFields is provided
  if (allowedSortFields && !allowedSortFields.includes(sortBy)) {
    sortBy = defaultSortBy;
  }
  
  const sortOrder = query.sortOrder === 'asc' ? 'asc' : defaultSortOrder;
  
  return { page, limit, offset, sortBy, sortOrder };
};

/**
 * Build pagination metadata for response
 * @param {number} totalItems - Total count of items
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @returns {object} Pagination metadata object
 */
export const buildPaginationResponse = (totalItems, page, limit) => {
  const totalPages = Math.ceil(totalItems / limit);
  
  return {
    page,
    limit,
    totalItems,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
};

/**
 * Build complete paginated API response
 * @param {array} data - Array of items
 * @param {number} totalItems - Total count of items  
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @returns {object} Complete API response object
 */
export const buildPaginatedApiResponse = (data, totalItems, page, limit) => {
  return {
    success: true,
    data,
    pagination: buildPaginationResponse(totalItems, page, limit)
  };
};

/**
 * Get sort direction for SQL query
 * @param {string} sortOrder - 'asc' or 'desc'
 * @returns {string} SQL sort direction
 */
export const getSortDirection = (sortOrder) => {
  return sortOrder === 'asc' ? 'ASC' : 'DESC';
};
