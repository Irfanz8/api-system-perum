const db = require('../config/database');

class Inventory {
  static async getAll(filters = {}) {
    let query = 'SELECT * FROM inventory WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (filters.category) {
      query += ` AND category = $${paramIndex}`;
      params.push(filters.category);
      paramIndex++;
    }

    if (filters.supplier) {
      query += ` AND supplier = $${paramIndex}`;
      params.push(filters.supplier);
      paramIndex++;
    }

    if (filters.low_stock) {
      query += ` AND quantity <= min_stock`;
    }

    query += ` ORDER BY created_at DESC`;

    if (filters.limit) {
      query += ` LIMIT $${paramIndex}`;
      params.push(filters.limit);
      paramIndex++;
    }

    const result = await db.query(query, params);
    return result.rows;
  }

  static async getById(id) {
    const query = 'SELECT * FROM inventory WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async create(inventoryData) {
    const { 
      name, 
      category, 
      quantity, 
      unit, 
      unit_price, 
      supplier, 
      min_stock, 
      description 
    } = inventoryData;
    
    const query = `
      INSERT INTO inventory (name, category, quantity, unit, unit_price, supplier, min_stock, description)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const values = [
      name, 
      category, 
      quantity || 0, 
      unit, 
      unit_price, 
      supplier, 
      min_stock || 0, 
      description
    ];
    
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async update(id, inventoryData) {
    const { 
      name, 
      category, 
      quantity, 
      unit, 
      unit_price, 
      supplier, 
      min_stock, 
      description 
    } = inventoryData;
    
    const query = `
      UPDATE inventory
      SET name = $1, category = $2, quantity = $3, unit = $4, unit_price = $5, 
          supplier = $6, min_stock = $7, description = $8
      WHERE id = $9
      RETURNING *
    `;
    
    const values = [
      name, 
      category, 
      quantity, 
      unit, 
      unit_price, 
      supplier, 
      min_stock, 
      description,
      id
    ];
    
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM inventory WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async updateQuantity(id, quantity) {
    const query = 'UPDATE inventory SET quantity = $1 WHERE id = $2 RETURNING *';
    const result = await db.query(query, [quantity, id]);
    return result.rows[0];
  }

  static async getTransactionHistory(inventoryId) {
    const query = `
      SELECT it.*, u.username as created_by_name
      FROM inventory_transactions it
      LEFT JOIN users u ON it.created_by = u.id
      WHERE it.inventory_id = $1
      ORDER BY it.transaction_date DESC
    `;
    const result = await db.query(query, [inventoryId]);
    return result.rows;
  }

  static async addTransaction(transactionData) {
    const { inventory_id, type, quantity, description, transaction_date, created_by } = transactionData;
    
    // Start transaction
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Add transaction record
      const transactionQuery = `
        INSERT INTO inventory_transactions (inventory_id, type, quantity, description, transaction_date, created_by)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      const transactionResult = await client.query(transactionQuery, [
        inventory_id, type, quantity, description, transaction_date, created_by
      ]);
      
      // Update inventory quantity
      const currentInventoryQuery = 'SELECT quantity FROM inventory WHERE id = $1';
      const currentInventoryResult = await client.query(currentInventoryQuery, [inventory_id]);
      const currentQuantity = currentInventoryResult.rows[0].quantity;
      
      let newQuantity;
      if (type === 'in') {
        newQuantity = currentQuantity + quantity;
      } else if (type === 'out') {
        newQuantity = currentQuantity - quantity;
      } else {
        throw new Error('Invalid transaction type');
      }
      
      if (newQuantity < 0) {
        throw new Error('Insufficient inventory quantity');
      }
      
      const updateInventoryQuery = 'UPDATE inventory SET quantity = $1 WHERE id = $2';
      await client.query(updateInventoryQuery, [newQuantity, inventory_id]);
      
      await client.query('COMMIT');
      
      return {
        transaction: transactionResult.rows[0],
        new_quantity: newQuantity
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getLowStockItems() {
    const query = 'SELECT * FROM inventory WHERE quantity <= min_stock ORDER BY quantity ASC';
    const result = await db.query(query);
    return result.rows;
  }

  static async getInventoryStats() {
    const query = `
      SELECT 
        category,
        COUNT(*) as item_count,
        SUM(quantity) as total_quantity,
        SUM(quantity * unit_price) as total_value
      FROM inventory
      GROUP BY category
      ORDER BY total_value DESC
    `;
    const result = await db.query(query);
    return result.rows;
  }
}

module.exports = Inventory;