const db = require('../config/database');

/**
 * Get all divisions
 */
const getAllDivisions = async (req, res) => {
  try {
    const query = `
      SELECT 
        d.*,
        COUNT(ud.user_id) as user_count
      FROM divisions d
      LEFT JOIN user_divisions ud ON d.id = ud.division_id
      GROUP BY d.id
      ORDER BY d.name ASC
    `;
    const result = await db.query(query);

    res.json({
      success: true,
      data: result.rows
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
const getDivisionById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        d.*,
        COUNT(ud.user_id) as user_count
      FROM divisions d
      LEFT JOIN user_divisions ud ON d.id = ud.division_id
      WHERE d.id = $1
      GROUP BY d.id
    `;
    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Division not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
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
const createDivision = async (req, res) => {
  try {
    const { name, code, description } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        error: 'Name and code are required'
      });
    }

    const query = `
      INSERT INTO divisions (name, code, description)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await db.query(query, [name, code.toUpperCase(), description]);

    res.status(201).json({
      success: true,
      message: 'Division created successfully',
      data: result.rows[0]
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
const updateDivision = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description, is_active } = req.body;

    const query = `
      UPDATE divisions
      SET name = COALESCE($1, name),
          code = COALESCE($2, code),
          description = COALESCE($3, description),
          is_active = COALESCE($4, is_active)
      WHERE id = $5
      RETURNING *
    `;
    const result = await db.query(query, [name, code?.toUpperCase(), description, is_active, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Division not found'
      });
    }

    res.json({
      success: true,
      message: 'Division updated successfully',
      data: result.rows[0]
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
const deleteDivision = async (req, res) => {
  try {
    const { id } = req.params;

    const query = 'DELETE FROM divisions WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
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
const getDivisionUsers = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
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
      WHERE ud.division_id = $1
      ORDER BY u.email ASC
    `;
    const result = await db.query(query, [id]);

    res.json({
      success: true,
      data: result.rows
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
const assignUserToDivision = async (req, res) => {
  try {
    const { id } = req.params; // division_id
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'user_id is required'
      });
    }

    const query = `
      INSERT INTO user_divisions (user_id, division_id, assigned_by)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await db.query(query, [user_id, id, req.user.id]);

    res.status(201).json({
      success: true,
      message: 'User assigned to division successfully',
      data: result.rows[0]
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
const removeUserFromDivision = async (req, res) => {
  try {
    const { id, userId } = req.params;

    const query = `
      DELETE FROM user_divisions 
      WHERE division_id = $1 AND user_id = $2
      RETURNING *
    `;
    const result = await db.query(query, [id, userId]);

    if (result.rows.length === 0) {
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

module.exports = {
  getAllDivisions,
  getDivisionById,
  createDivision,
  updateDivision,
  deleteDivision,
  getDivisionUsers,
  assignUserToDivision,
  removeUserFromDivision
};
