import db from '../config/database.js';

/**
 * Get all divisions
 */
export const getAllDivisions = async (req, res) => {
  try {
    const result = await db`
      SELECT 
        d.*,
        COUNT(DISTINCT ud.user_id) as user_count,
        COUNT(DISTINCT CASE WHEN ud.is_division_admin = true THEN ud.user_id END) as admin_count
      FROM divisions d
      LEFT JOIN user_divisions ud ON d.id = ud.division_id
      GROUP BY d.id
      ORDER BY d.name ASC
    `;

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting divisions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch divisions'
    });
  }
};

/**
 * Get division by ID
 */
export const getDivisionById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db`
      SELECT 
        d.*,
        COUNT(DISTINCT ud.user_id) as user_count,
        COUNT(DISTINCT CASE WHEN ud.is_division_admin = true THEN ud.user_id END) as admin_count
      FROM divisions d
      LEFT JOIN user_divisions ud ON d.id = ud.division_id
      WHERE d.id = ${id}
      GROUP BY d.id
    `;

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Division not found'
      });
    }

    res.json({
      success: true,
      data: result[0]
    });
  } catch (error) {
    console.error('Error getting division:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch division'
    });
  }
};

/**
 * Create new division (superadmin only)
 */
export const createDivision = async (req, res) => {
  try {
    const { name, code, description } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        error: 'Name and code are required'
      });
    }

    const result = await db`
      INSERT INTO divisions (name, code, description)
      VALUES (${name}, ${code.toUpperCase()}, ${description})
      RETURNING *
    `;

    res.status(201).json({
      success: true,
      message: 'Division created successfully',
      data: result[0]
    });
  } catch (error) {
    console.error('Error creating division:', error);
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        error: 'Division code already exists'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to create division'
    });
  }
};

/**
 * Update division (superadmin only)
 */
export const updateDivision = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description, is_active } = req.body;

    const result = await db`
      UPDATE divisions
      SET name = COALESCE(${name}, name),
          code = COALESCE(${code?.toUpperCase() || null}, code),
          description = COALESCE(${description}, description),
          is_active = COALESCE(${is_active}, is_active)
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Division not found'
      });
    }

    res.json({
      success: true,
      message: 'Division updated successfully',
      data: result[0]
    });
  } catch (error) {
    console.error('Error updating division:', error);
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        error: 'Division code already exists'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to update division'
    });
  }
};

/**
 * Delete division (superadmin only)
 */
export const deleteDivision = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db`DELETE FROM divisions WHERE id = ${id} RETURNING *`;

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Division not found'
      });
    }

    res.json({
      success: true,
      message: 'Division deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting division:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete division'
    });
  }
};

/**
 * Get all members in a division (superadmin only)
 */
export const getDivisionMembers = async (req, res) => {
  try {
    const { id } = req.params;

    // Get division info
    const divisionInfo = await db`
      SELECT id, name, code, description 
      FROM divisions 
      WHERE id = ${id}
    `;

    if (divisionInfo.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Division not found'
      });
    }

    // Get all members
    const members = await db`
      SELECT 
        u.id,
        u.email,
        u.username,
        u.role,
        ud.is_division_admin,
        ud.created_at as assigned_at,
        assigner.email as assigned_by_email
      FROM user_divisions ud
      JOIN users u ON ud.user_id = u.id
      LEFT JOIN users assigner ON ud.assigned_by = assigner.id
      WHERE ud.division_id = ${id} AND u.is_active = true
      ORDER BY ud.is_division_admin DESC, u.email ASC
    `;

    res.json({
      success: true,
      division: divisionInfo[0],
      count: members.length,
      data: members
    });
  } catch (error) {
    console.error('Error getting division members:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch division members'
    });
  }
};

/**
 * Assign user as division admin (superadmin only)
 */
export const assignDivisionAdmin = async (req, res) => {
  try {
    const { id } = req.params; // division id
    const { userId } = req.body;
    const assignedBy = req.user.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }

    // Check if division exists
    const divisionCheck = await db`
      SELECT id, name FROM divisions WHERE id = ${id}
    `;

    if (divisionCheck.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Division not found'
      });
    }

    // Check if user exists
    const userCheck = await db`
      SELECT id, email, username, role FROM users WHERE id = ${userId}
    `;

    if (userCheck.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if user is already in division
    const existingAssignment = await db`
      SELECT id, is_division_admin 
      FROM user_divisions 
      WHERE user_id = ${userId} AND division_id = ${id}
    `;

    if (existingAssignment.length > 0) {
      if (existingAssignment[0].is_division_admin) {
        return res.status(400).json({
          success: false,
          error: 'User is already division admin'
        });
      }
      
      // Update to admin
      const result = await db`
        UPDATE user_divisions
        SET is_division_admin = true, assigned_by = ${assignedBy}
        WHERE user_id = ${userId} AND division_id = ${id}
        RETURNING *
      `;

      return res.json({
        success: true,
        message: `${userCheck[0].username} promoted to division admin`,
        data: {
          division: divisionCheck[0],
          admin: userCheck[0],
          assignment: result[0]
        }
      });
    }

    // Insert as new division admin
    const result = await db`
      INSERT INTO user_divisions (user_id, division_id, is_division_admin, assigned_by)
      VALUES (${userId}, ${id}, true, ${assignedBy})
      RETURNING *
    `;

    res.json({
      success: true,
      message: `${userCheck[0].username} assigned as division admin`,
      data: {
        division: divisionCheck[0],
        admin: userCheck[0],
        assignment: result[0]
      }
    });
  } catch (error) {
    console.error('Error assigning division admin:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to assign division admin'
    });
  }
};

/**
 * Remove division admin (superadmin only)
 */
export const removeDivisionAdmin = async (req, res) => {
  try {
    const { id, userId } = req.params;

    // Check if user is division admin
    const check = await db`
      SELECT 
        ud.is_division_admin,
        u.username,
        d.name as division_name
      FROM user_divisions ud
      JOIN users u ON ud.user_id = u.id
      JOIN divisions d ON ud.division_id = d.id
      WHERE ud.division_id = ${id} AND ud.user_id = ${userId}
    `;

    if (check.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found in this division'
      });
    }

    if (!check[0].is_division_admin) {
      return res.status(400).json({
        success: false,
        error: 'User is not a division admin'
      });
    }

    // Demote from admin (but keep in division)
    const result = await db`
      UPDATE user_divisions
      SET is_division_admin = false
      WHERE division_id = ${id} AND user_id = ${userId}
      RETURNING *
    `;

    res.json({
      success: true,
      message: `${check[0].username} removed as division admin (masih di divisi ${check[0].division_name})`,
      data: result[0]
    });
  } catch (error) {
    console.error('Error removing division admin:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove division admin'
    });
  }
};

/**
 * Add member to division (superadmin only)
 */
export const addMemberToDivision = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }

    const result = await db`
      INSERT INTO user_divisions (user_id, division_id, assigned_by)
      VALUES (${userId}, ${id}, ${req.user.id})
      RETURNING *
    `;

    res.status(201).json({
      success: true,
      message: 'User added to division successfully',
      data: result[0]
    });
  } catch (error) {
    console.error('Error adding member to division:', error);
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        error: 'User already in this division'
      });
    }
    if (error.code === '23503') {
      return res.status(400).json({
        success: false,
        error: 'User or division not found'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to add member to division'
    });
  }
};

/**
 * Remove member from division (superadmin only)
 */
export const removeMemberFromDivision = async (req, res) => {
  try {
    const { id, userId } = req.params;

    const result = await db`
      DELETE FROM user_divisions 
      WHERE division_id = ${id} AND user_id = ${userId}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found in this division'
      });
    }

    res.json({
      success: true,
      message: 'User removed from division successfully'
    });
  } catch (error) {
    console.error('Error removing member from division:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove member from division'
    });
  }
};
