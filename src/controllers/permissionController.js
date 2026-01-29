const db = require('../config/database');

/**
 * Get permissions for a specific user
 */
const getUserPermissions = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user info
    const userQuery = 'SELECT id, email, username, role FROM users WHERE id = $1';
    const userResult = await db.query(userQuery, [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get user divisions
    const divisionsQuery = `
      SELECT d.id, d.name, d.code
      FROM user_divisions ud
      JOIN divisions d ON ud.division_id = d.id
      WHERE ud.user_id = $1 AND d.is_active = true
    `;
    const divisionsResult = await db.query(divisionsQuery, [userId]);

    // Get user permissions
    const permissionsQuery = `
      SELECT 
        m.code,
        m.name,
        up.can_view,
        up.can_create,
        up.can_update,
        up.can_delete
      FROM user_permissions up
      JOIN modules m ON up.module_id = m.id
      WHERE up.user_id = $1 AND m.is_active = true
    `;
    const permissionsResult = await db.query(permissionsQuery, [userId]);

    // Transform permissions to object format
    const permissions = {};
    permissionsResult.rows.forEach(p => {
      permissions[p.code] = {
        name: p.name,
        view: p.can_view,
        create: p.can_create,
        update: p.can_update,
        delete: p.can_delete
      };
    });

    res.json({
      success: true,
      data: {
        user: userResult.rows[0],
        divisions: divisionsResult.rows,
        permissions
      }
    });
  } catch (error) {
    console.error('Error getting user permissions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user permissions'
    });
  }
};

/**
 * Get current user's permissions (for frontend)
 */
const getMyPermissions = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Get user divisions
    const divisionsQuery = `
      SELECT d.id, d.name, d.code
      FROM user_divisions ud
      JOIN divisions d ON ud.division_id = d.id
      WHERE ud.user_id = $1 AND d.is_active = true
    `;
    const divisionsResult = await db.query(divisionsQuery, [userId]);

    // Get all active modules
    const modulesQuery = 'SELECT id, code, name, icon, route, sort_order FROM modules WHERE is_active = true ORDER BY sort_order ASC';
    const modulesResult = await db.query(modulesQuery);

    // For superadmin, grant all permissions
    if (userRole === 'superadmin') {
      const permissions = {};
      modulesResult.rows.forEach(m => {
        permissions[m.code] = {
          name: m.name,
          icon: m.icon,
          route: m.route,
          view: true,
          create: true,
          update: true,
          delete: true
        };
      });

      return res.json({
        success: true,
        data: {
          user: req.user,
          divisions: divisionsResult.rows,
          permissions,
          modules: modulesResult.rows
        }
      });
    }

    // For admin, grant permissions based on their divisions + user permissions
    // For regular users, only use user_permissions table

    const permissionsQuery = `
      SELECT 
        m.code,
        m.name,
        m.icon,
        m.route,
        COALESCE(up.can_view, false) as can_view,
        COALESCE(up.can_create, false) as can_create,
        COALESCE(up.can_update, false) as can_update,
        COALESCE(up.can_delete, false) as can_delete
      FROM modules m
      LEFT JOIN user_permissions up ON m.id = up.module_id AND up.user_id = $1
      WHERE m.is_active = true
      ORDER BY m.sort_order ASC
    `;
    const permissionsResult = await db.query(permissionsQuery, [userId]);

    const permissions = {};
    permissionsResult.rows.forEach(p => {
      permissions[p.code] = {
        name: p.name,
        icon: p.icon,
        route: p.route,
        view: p.can_view,
        create: p.can_create,
        update: p.can_update,
        delete: p.can_delete
      };
    });

    res.json({
      success: true,
      data: {
        user: req.user,
        divisions: divisionsResult.rows,
        permissions,
        modules: modulesResult.rows
      }
    });
  } catch (error) {
    console.error('Error getting my permissions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch permissions'
    });
  }
};

/**
 * Set permissions for a user (admin/superadmin)
 */
const setUserPermissions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { permissions } = req.body;

    if (!permissions || typeof permissions !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'permissions object is required'
      });
    }

    // Check if user exists
    const userQuery = 'SELECT id, role FROM users WHERE id = $1';
    const userResult = await db.query(userQuery, [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Cannot set permissions for superadmin
    if (userResult.rows[0].role === 'superadmin') {
      return res.status(400).json({
        success: false,
        error: 'Cannot modify permissions for superadmin'
      });
    }

    // Check if requester is admin and target is also admin (only superadmin can modify admin)
    if (req.user.role === 'admin' && userResult.rows[0].role === 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin cannot modify permissions for another admin'
      });
    }

    // Get all modules
    const modulesQuery = 'SELECT id, code FROM modules WHERE is_active = true';
    const modulesResult = await db.query(modulesQuery);
    const moduleMap = {};
    modulesResult.rows.forEach(m => {
      moduleMap[m.code] = m.id;
    });

    // Upsert permissions for each module
    const results = [];
    for (const [moduleCode, perms] of Object.entries(permissions)) {
      const moduleId = moduleMap[moduleCode];
      if (!moduleId) continue;

      const upsertQuery = `
        INSERT INTO user_permissions (user_id, module_id, can_view, can_create, can_update, can_delete, granted_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (user_id, module_id) 
        DO UPDATE SET 
          can_view = $3,
          can_create = $4,
          can_update = $5,
          can_delete = $6,
          granted_by = $7,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `;
      const result = await db.query(upsertQuery, [
        userId,
        moduleId,
        perms.view ?? false,
        perms.create ?? false,
        perms.update ?? false,
        perms.delete ?? false,
        req.user.id
      ]);
      results.push(result.rows[0]);
    }

    res.json({
      success: true,
      message: 'Permissions updated successfully',
      data: results
    });
  } catch (error) {
    console.error('Error setting user permissions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to set user permissions'
    });
  }
};

/**
 * Bulk set permissions for multiple users
 */
const bulkSetPermissions = async (req, res) => {
  try {
    const { user_ids, permissions } = req.body;

    if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'user_ids array is required'
      });
    }

    if (!permissions || typeof permissions !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'permissions object is required'
      });
    }

    // Get all modules
    const modulesQuery = 'SELECT id, code FROM modules WHERE is_active = true';
    const modulesResult = await db.query(modulesQuery);
    const moduleMap = {};
    modulesResult.rows.forEach(m => {
      moduleMap[m.code] = m.id;
    });

    let totalUpdated = 0;

    for (const userId of user_ids) {
      // Check if user exists and is not superadmin
      const userQuery = 'SELECT id, role FROM users WHERE id = $1';
      const userResult = await db.query(userQuery, [userId]);

      if (userResult.rows.length === 0 || userResult.rows[0].role === 'superadmin') {
        continue;
      }

      // Upsert permissions for each module
      for (const [moduleCode, perms] of Object.entries(permissions)) {
        const moduleId = moduleMap[moduleCode];
        if (!moduleId) continue;

        const upsertQuery = `
          INSERT INTO user_permissions (user_id, module_id, can_view, can_create, can_update, can_delete, granted_by)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (user_id, module_id) 
          DO UPDATE SET 
            can_view = $3,
            can_create = $4,
            can_update = $5,
            can_delete = $6,
            granted_by = $7,
            updated_at = CURRENT_TIMESTAMP
        `;
        await db.query(upsertQuery, [
          userId,
          moduleId,
          perms.view ?? false,
          perms.create ?? false,
          perms.update ?? false,
          perms.delete ?? false,
          req.user.id
        ]);
      }
      totalUpdated++;
    }

    res.json({
      success: true,
      message: `Permissions updated for ${totalUpdated} users`
    });
  } catch (error) {
    console.error('Error bulk setting permissions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to set permissions'
    });
  }
};

module.exports = {
  getUserPermissions,
  getMyPermissions,
  setUserPermissions,
  bulkSetPermissions
};
