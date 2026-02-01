import db from '../config/database.js';

/**
 * Get all divisions
 */
export const getAllDivisions = async (req, res) => {
  try {
    const result = await db`
      SELECT 
        d.*,
        COUNT(ud.user_id) as user_count
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
        COUNT(ud.user_id) as user_count
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
 * Get users in a division
 */
export const getDivisionUsers = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db`
      SELECT 
        u.id,
        u.email,
        u.username,
        u.role,
        ud.created_at as assigned_at,
        assigner.email as assigned_by_email
      FROM user_divisions ud
      JOIN users u ON ud.user_id = u.id
      LEFT JOIN users assigner ON ud.assigned_by = assigner.id
      WHERE ud.division_id = ${id}
      ORDER BY u.email ASC
    `;

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting division users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch division users'
    });
  }
};

/**
 * Assign user to division (admin/superadmin)
 */
export const assignUserToDivision = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'user_id is required'
      });
    }

    const result = await db`
      INSERT INTO user_divisions (user_id, division_id, assigned_by)
      VALUES (${user_id}, ${id}, ${req.user.id})
      RETURNING *
    `;

    res.status(201).json({
      success: true,
      message: 'User assigned to division successfully',
      data: result[0]
    });
  } catch (error) {
    console.error('Error assigning user to division:', error);
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        error: 'User already assigned to this division'
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
      error: 'Failed to assign user to division'
    });
  }
};

/**
 * Remove user from division
 */
export const removeUserFromDivision = async (req, res) => {
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
    console.error('Error removing user from division:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove user from division'
    });
  }
};
