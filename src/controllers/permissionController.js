import db from '../config/database.js';

/**
 * Get permissions for a specific user
 */
export const getUserPermissions = async (req, res) => {
  try {
    const { userId } = req.params;

    const userResult = await db`SELECT id, email, username, role FROM users WHERE id = ${userId}`;

    if (userResult.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const divisionsResult = await db`
      SELECT d.id, d.name, d.code
      FROM user_divisions ud
      JOIN divisions d ON ud.division_id = d.id
      WHERE ud.user_id = ${userId} AND d.is_active = true
    `;

    const permissionsResult = await db`
      SELECT 
        m.code,
        m.name,
        up.can_view,
        up.can_create,
        up.can_update,
        up.can_delete
      FROM user_permissions up
      JOIN modules m ON up.module_id = m.id
      WHERE up.user_id = ${userId} AND m.is_active = true
    `;

    const permissions = {};
    permissionsResult.forEach(p => {
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
        user: userResult[0],
        divisions: divisionsResult,
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
export const getMyPermissions = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    console.log(`[DEBUG] Getting permissions for user: ${userId} (${userRole})`);

    // For superadmin - query modules and divisions in parallel
    if (userRole === 'superadmin') {
      console.log('[DEBUG] User is superadmin, granting all permissions');
      
      const [divisionsResult, modulesResult] = await Promise.all([
        db`SELECT d.id, d.name, d.code, ud.is_division_admin
           FROM user_divisions ud
           JOIN divisions d ON ud.division_id = d.id
           WHERE ud.user_id = ${userId} AND d.is_active = true`,
        db`SELECT id, code, name, icon, route, sort_order 
           FROM modules WHERE is_active = true ORDER BY sort_order ASC`
      ]);
      
      const permissions = {};
      modulesResult.forEach(m => {
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
          divisions: divisionsResult,
          permissions,
          modules: modulesResult
        }
      });
    }

    // For non-superadmin - run all queries in parallel
    console.log('[DEBUG] Querying permissions in parallel...');
    const [divisionsResult, modulesResult, permissionsResult] = await Promise.all([
      db`SELECT d.id, d.name, d.code, ud.is_division_admin
         FROM user_divisions ud
         JOIN divisions d ON ud.division_id = d.id
         WHERE ud.user_id = ${userId} AND d.is_active = true`,
      db`SELECT id, code, name, icon, route, sort_order 
         FROM modules WHERE is_active = true ORDER BY sort_order ASC`,
      db`SELECT 
          m.code,
          m.name,
          m.icon,
          m.route,
          COALESCE(up.can_view, false) as can_view,
          COALESCE(up.can_create, false) as can_create,
          COALESCE(up.can_update, false) as can_update,
          COALESCE(up.can_delete, false) as can_delete
        FROM modules m
        LEFT JOIN user_permissions up ON m.id = up.module_id AND up.user_id = ${userId}
        WHERE m.is_active = true
        ORDER BY m.sort_order ASC`
    ]);
    
    console.log(`[DEBUG] Found ${divisionsResult.length} divisions, ${modulesResult.length} modules, ${permissionsResult.length} permission entries`);

    const permissions = {};
    permissionsResult.forEach(p => {
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

    console.log('[DEBUG] Sending successful response');
    res.json({
      success: true,
      data: {
        user: req.user,
        divisions: divisionsResult,
        permissions,
        modules: modulesResult
      }
    });
  } catch (error) {
    console.error('[ERROR] Error getting my permissions:', error);
    console.error('[ERROR] Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch permissions: ' + error.message
    });
  }
};

/**
 * Set permissions for a user (admin/superadmin)
 */
export const setUserPermissions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { permissions } = req.body;

    if (!permissions || typeof permissions !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'permissions object is required'
      });
    }

    const userResult = await db`SELECT id, role FROM users WHERE id = ${userId}`;

    if (userResult.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (userResult[0].role === 'superadmin') {
      return res.status(400).json({
        success: false,
        error: 'Cannot modify permissions for superadmin'
      });
    }

    if (req.user.role === 'admin' && userResult[0].role === 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin cannot modify permissions for another admin'
      });
    }

    const modulesResult = await db`SELECT id, code FROM modules WHERE is_active = true`;
    const moduleMap = {};
    modulesResult.forEach(m => {
      moduleMap[m.code] = m.id;
    });

    const results = [];
    for (const [moduleCode, perms] of Object.entries(permissions)) {
      const moduleId = moduleMap[moduleCode];
      if (!moduleId) continue;

      const result = await db`
        INSERT INTO user_permissions (user_id, module_id, can_view, can_create, can_update, can_delete, granted_by)
        VALUES (${userId}, ${moduleId}, ${perms.view ?? false}, ${perms.create ?? false}, ${perms.update ?? false}, ${perms.delete ?? false}, ${req.user.id})
        ON CONFLICT (user_id, module_id) 
        DO UPDATE SET 
          can_view = ${perms.view ?? false},
          can_create = ${perms.create ?? false},
          can_update = ${perms.update ?? false},
          can_delete = ${perms.delete ?? false},
          granted_by = ${req.user.id},
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `;
      results.push(result[0]);
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
export const bulkSetPermissions = async (req, res) => {
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

    const modulesResult = await db`SELECT id, code FROM modules WHERE is_active = true`;
    const moduleMap = {};
    modulesResult.forEach(m => {
      moduleMap[m.code] = m.id;
    });

    let totalUpdated = 0;

    for (const userId of user_ids) {
      const userResult = await db`SELECT id, role FROM users WHERE id = ${userId}`;

      if (userResult.length === 0 || userResult[0].role === 'superadmin') {
        continue;
      }

      for (const [moduleCode, perms] of Object.entries(permissions)) {
        const moduleId = moduleMap[moduleCode];
        if (!moduleId) continue;

        await db`
          INSERT INTO user_permissions (user_id, module_id, can_view, can_create, can_update, can_delete, granted_by)
          VALUES (${userId}, ${moduleId}, ${perms.view ?? false}, ${perms.create ?? false}, ${perms.update ?? false}, ${perms.delete ?? false}, ${req.user.id})
          ON CONFLICT (user_id, module_id) 
          DO UPDATE SET 
            can_view = ${perms.view ?? false},
            can_create = ${perms.create ?? false},
            can_update = ${perms.update ?? false},
            can_delete = ${perms.delete ?? false},
            granted_by = ${req.user.id},
            updated_at = CURRENT_TIMESTAMP
        `;
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
