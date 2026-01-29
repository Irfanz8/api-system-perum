const db = require('../config/database');

/**
 * Get all modules
 */
const getAllModules = async (req, res) => {
  try {
    const query = `
      SELECT * FROM modules
      ORDER BY sort_order ASC, name ASC
    `;
    const result = await db.query(query);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error getting modules:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch modules'
    });
  }
};

/**
 * Get module by ID
 */
const getModuleById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = 'SELECT * FROM modules WHERE id = $1';
    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Module not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error getting module:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch module'
    });
  }
};

/**
 * Create new module (superadmin only)
 */
const createModule = async (req, res) => {
  try {
    const { name, code, description, icon, route, sort_order } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        error: 'Name and code are required'
      });
    }

    const query = `
      INSERT INTO modules (name, code, description, icon, route, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const result = await db.query(query, [name, code.toLowerCase(), description, icon, route, sort_order || 0]);

    res.status(201).json({
      success: true,
      message: 'Module created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating module:', error);
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        error: 'Module code already exists'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to create module'
    });
  }
};

/**
 * Update module (superadmin only)
 */
const updateModule = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description, icon, route, is_active, sort_order } = req.body;

    const query = `
      UPDATE modules
      SET name = COALESCE($1, name),
          code = COALESCE($2, code),
          description = COALESCE($3, description),
          icon = COALESCE($4, icon),
          route = COALESCE($5, route),
          is_active = COALESCE($6, is_active),
          sort_order = COALESCE($7, sort_order)
      WHERE id = $8
      RETURNING *
    `;
    const result = await db.query(query, [name, code?.toLowerCase(), description, icon, route, is_active, sort_order, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Module not found'
      });
    }

    res.json({
      success: true,
      message: 'Module updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating module:', error);
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        error: 'Module code already exists'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to update module'
    });
  }
};

/**
 * Delete module (superadmin only)
 */
const deleteModule = async (req, res) => {
  try {
    const { id } = req.params;

    const query = 'DELETE FROM modules WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Module not found'
      });
    }

    res.json({
      success: true,
      message: 'Module deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting module:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete module'
    });
  }
};

module.exports = {
  getAllModules,
  getModuleById,
  createModule,
  updateModule,
  deleteModule
};
