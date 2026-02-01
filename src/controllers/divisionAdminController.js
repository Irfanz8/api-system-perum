import db from '../config/database.js';
import { ROLES } from '../utils/roles.js';

/**
 * Get division admin's own division information
 */
export const getMyDivision = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db`
      SELECT 
        d.id,
        d.name,
        d.code,
        d.description,
        d.is_active,
        COUNT(DISTINCT ud.user_id) as member_count,
        ud.created_at as admin_since
      FROM user_divisions ud
      JOIN divisions d ON ud.division_id = d.id
      LEFT JOIN user_divisions ud2 ON ud2.division_id = d.id
      WHERE ud.user_id = ${userId} 
      AND ud.is_division_admin = true
      GROUP BY d.id, d.name, d.code, d.description, d.is_active, ud.created_at
      LIMIT 1
    `;

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Anda belum ditugaskan sebagai admin divisi manapun'
      });
    }

    res.json({
      success: true,
      data: result[0]
    });
  } catch (error) {
    console.error('Get my division error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get division information'
    });
  }
};

/**
 * Get all team members in division admin's division
 */
export const getMyTeamMembers = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get division where user is admin
    const divisionResult = await db`
      SELECT division_id 
      FROM user_divisions 
      WHERE user_id = ${userId} AND is_division_admin = true
      LIMIT 1
    `;

    if (divisionResult.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'Anda bukan admin divisi'
      });
    }

    const divisionId = divisionResult[0].division_id;

    // Get all members in the division
    const members = await db`
      SELECT 
        u.id,
        u.username,
        u.email,
        u.role,
        ud.is_division_admin,
        ud.created_at as joined_at,
        (
          SELECT json_agg(
            json_build_object(
              'module_id', m.id,
              'module_code', m.code,
              'module_name', m.name,
              'can_view', up.can_view,
              'can_create', up.can_create,
              'can_update', up.can_update,
              'can_delete', up.can_delete
            )
          )
          FROM user_permissions up
          JOIN modules m ON up.module_id = m.id
          WHERE up.user_id = u.id AND m.is_active = true
        ) as permissions
      FROM user_divisions ud
      JOIN users u ON ud.user_id = u.id
      WHERE ud.division_id = ${divisionId} AND u.is_active = true
      ORDER BY ud.is_division_admin DESC, u.created_at ASC
    `;

    // Get division info
    const divisionInfo = await db`
      SELECT id, name, code, description 
      FROM divisions 
      WHERE id = ${divisionId}
    `;

    res.json({
      success: true,
      division: divisionInfo[0],
      count: members.length,
      data: members
    });
  } catch (error) {
    console.error('Get team members error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get team members'
    });
  }
};

/**
 * Update team member's permissions (division admin only)
 */
export const updateMemberPermissions = async (req, res) => {
  try {
    const { userId: targetUserId } = req.params;
    const { moduleCode, permissions } = req.body;
    const currentUserId = req.user.id;

    if (!moduleCode || !permissions) {
      return res.status(400).json({
        success: false,
        error: 'Module code dan permissions wajib diisi'
      });
    }

    // Get division where current user is admin
    const divisionResult = await db`
      SELECT division_id 
      FROM user_divisions 
      WHERE user_id = ${currentUserId} AND is_division_admin = true
      LIMIT 1
    `;

    if (divisionResult.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'Anda bukan admin divisi'
      });
    }

    const divisionId = divisionResult[0].division_id;

    // Check if target user is in the same division
    const memberCheck = await db`
      SELECT 1 FROM user_divisions 
      WHERE user_id = ${targetUserId} AND division_id = ${divisionId}
    `;

    if (memberCheck.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'User tidak ada dalam divisi Anda'
      });
    }

    // Prevent modifying superadmin or division admin
    const targetUserInfo = await db`
      SELECT u.role, ud.is_division_admin
      FROM users u
      JOIN user_divisions ud ON u.id = ud.user_id
      WHERE u.id = ${targetUserId} AND ud.division_id = ${divisionId}
    `;

    if (targetUserInfo[0].role === ROLES.SUPERADMIN) {
      return res.status(403).json({
        success: false,
        error: 'Tidak bisa mengubah permissions superadmin'
      });
    }

    if (targetUserInfo[0].is_division_admin && targetUserId !== currentUserId) {
      return res.status(403).json({
        success: false,
        error: 'Tidak bisa mengubah permissions division admin lain'
      });
    }

    // Get module ID
    const moduleResult = await db`
      SELECT id FROM modules WHERE code = ${moduleCode} AND is_active = true
    `;

    if (moduleResult.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Module tidak ditemukan'
      });
    }

    const moduleId = moduleResult[0].id;

    // Update or insert permissions
    const result = await db`
      INSERT INTO user_permissions (
        user_id, 
        module_id, 
        can_view, 
        can_create, 
        can_update, 
        can_delete,
        granted_by
      )
      VALUES (
        ${targetUserId},
        ${moduleId},
        ${permissions.can_view || false},
        ${permissions.can_create || false},
        ${permissions.can_update || false},
        ${permissions.can_delete || false},
        ${currentUserId}
      )
      ON CONFLICT (user_id, module_id) DO UPDATE SET
        can_view = ${permissions.can_view || false},
        can_create = ${permissions.can_create || false},
        can_update = ${permissions.can_update || false},
        can_delete = ${permissions.can_delete || false},
        granted_by = ${currentUserId},
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    res.json({
      success: true,
      message: 'Permissions berhasil diupdate',
      data: result[0]
    });
  } catch (error) {
    console.error('Update member permissions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update member permissions'
    });
  }
};

/**
 * Get permissions matrix for division admin's team
 */
export const getTeamPermissionsMatrix = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get division where user is admin
    const divisionResult = await db`
      SELECT division_id 
      FROM user_divisions 
      WHERE user_id = ${userId} AND is_division_admin = true
      LIMIT 1
    `;

    if (divisionResult.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'Anda bukan admin divisi'
      });
    }

    const divisionId = divisionResult[0].division_id;

    // Get all active modules
    const modules = await db`
      SELECT id, code, name, icon, route
      FROM modules
      WHERE is_active = true
      ORDER BY sort_order ASC
    `;

    // Get all team members
    const members = await db`
      SELECT u.id, u.username, u.email, u.role
      FROM user_divisions ud
      JOIN users u ON ud.user_id = u.id
      WHERE ud.division_id = ${divisionId} AND u.is_active = true
      ORDER BY u.email ASC
    `;

    // Build permissions matrix
    const matrix = [];

    for (const member of members) {
      const memberPermissions = {};

      for (const module of modules) {
        const permResult = await db`
          SELECT can_view, can_create, can_update, can_delete
          FROM user_permissions
          WHERE user_id = ${member.id} AND module_id = ${module.id}
        `;

        memberPermissions[module.code] = permResult.length > 0
          ? permResult[0]
          : { can_view: false, can_create: false, can_update: false, can_delete: false };
      }

      matrix.push({
        user: {
          id: member.id,
          username: member.username,
          email: member.email,
          role: member.role
        },
        permissions: memberPermissions
      });
    }

    res.json({
      success: true,
      modules: modules.map(m => ({ code: m.code, name: m.name, icon: m.icon })),
      matrix
    });
  } catch (error) {
    console.error('Get team permissions matrix error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get permissions matrix'
    });
  }
};
