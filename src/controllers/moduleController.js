import db from '../config/database.js';

/**
 * Get all modules
 */
export const getAllModules = async (req, res) => {
  try {
    const result = await db`
      SELECT * FROM modules
      ORDER BY sort_order ASC, name ASC
    `;

    res.json({
      success: true,
      data: result
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
export const getModuleById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db`SELECT * FROM modules WHERE id = ${id}`;

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Module not found'
      });
    }

    res.json({
      success: true,
      data: result[0]
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
export const createModule = async (req, res) => {
  try {
    const { name, code, description, icon, route, sort_order } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        error: 'Name and code are required'
      });
    }

    const result = await db`
      INSERT INTO modules (name, code, description, icon, route, sort_order)
      VALUES (${name}, ${code.toLowerCase()}, ${description}, ${icon}, ${route}, ${sort_order || 0})
      RETURNING *
    `;

    res.status(201).json({
      success: true,
      message: 'Module created successfully',
      data: result[0]
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
export const updateModule = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description, icon, route, is_active, sort_order } = req.body;

    const result = await db`
      UPDATE modules
      SET name = COALESCE(${name}, name),
          code = COALESCE(${code?.toLowerCase() || null}, code),
          description = COALESCE(${description}, description),
          icon = COALESCE(${icon}, icon),
          route = COALESCE(${route}, route),
          is_active = COALESCE(${is_active}, is_active),
          sort_order = COALESCE(${sort_order}, sort_order)
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Module not found'
      });
    }

    res.json({
      success: true,
      message: 'Module updated successfully',
      data: result[0]
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
export const deleteModule = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db`DELETE FROM modules WHERE id = ${id} RETURNING *`;

    if (result.length === 0) {
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
