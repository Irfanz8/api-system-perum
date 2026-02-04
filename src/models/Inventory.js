import db from '../config/database.js';

class Inventory {
  static async getAll(filters = {}) {
    const conditions = [];
    
    if (filters.category) {
      conditions.push(db`category = ${filters.category}`);
    }
    if (filters.supplier) {
      conditions.push(db`supplier = ${filters.supplier}`);
    }
    if (filters.low_stock) {
      conditions.push(db`quantity <= min_stock`);
    }

    const whereClause = conditions.length > 0 
      ? db`WHERE ${conditions.reduce((a, b) => db`${a} AND ${b}`)}`
      : db``;

    const result = await db`
      SELECT * FROM inventory
      ${whereClause}
      ORDER BY created_at DESC
      ${filters.limit ? db`LIMIT ${filters.limit}` : db``}
    `;
    return result;
  }

  static async getAllPaginated(filters = {}, pagination = {}) {
    const { limit = 10, offset = 0, sortBy = 'created_at', sortOrder = 'desc' } = pagination;
    
    const conditions = [];
    
    if (filters.category) {
      conditions.push(db`category = ${filters.category}`);
    }
    if (filters.supplier) {
      conditions.push(db`supplier = ${filters.supplier}`);
    }
    if (filters.low_stock) {
      conditions.push(db`quantity <= min_stock`);
    }
    if (filters.search) {
      conditions.push(db`(name ILIKE ${'%' + filters.search + '%'} OR description ILIKE ${'%' + filters.search + '%'})`);
    }

    const whereClause = conditions.length > 0 
      ? db`WHERE ${conditions.reduce((a, b) => db`${a} AND ${b}`)}`
      : db``;

    // Get total count
    const countResult = await db`
      SELECT COUNT(*) as total FROM inventory
      ${whereClause}
    `;
    const totalItems = parseInt(countResult[0].total);

    // Build ORDER BY - using safe column mapping
    const sortColumns = {
      'created_at': db`created_at`,
      'updated_at': db`updated_at`,
      'name': db`name`,
      'quantity': db`quantity`,
      'unit_price': db`unit_price`,
      'category': db`category`
    };
    const sortColumn = sortColumns[sortBy] || sortColumns['created_at'];
    const orderDirection = sortOrder === 'asc' ? db`ASC` : db`DESC`;

    // Get paginated data
    const data = await db`
      SELECT * FROM inventory
      ${whereClause}
      ORDER BY ${sortColumn} ${orderDirection}
      LIMIT ${limit} OFFSET ${offset}
    `;

    return { data, totalItems };
  }

  static async getById(id) {
    const result = await db`SELECT * FROM inventory WHERE id = ${id}`;
    return result[0];
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
    
    const result = await db`
      INSERT INTO inventory (name, category, quantity, unit, unit_price, supplier, min_stock, description)
      VALUES (${name}, ${category}, ${quantity || 0}, ${unit}, ${unit_price}, ${supplier}, ${min_stock || 0}, ${description})
      RETURNING *
    `;
    return result[0];
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
    
    const result = await db`
      UPDATE inventory
      SET name = ${name}, category = ${category}, quantity = ${quantity}, unit = ${unit}, unit_price = ${unit_price}, 
          supplier = ${supplier}, min_stock = ${min_stock}, description = ${description}
      WHERE id = ${id}
      RETURNING *
    `;
    return result[0];
  }

  static async delete(id) {
    const result = await db`DELETE FROM inventory WHERE id = ${id} RETURNING *`;
    return result[0];
  }

  static async updateQuantity(id, quantity) {
    const result = await db`UPDATE inventory SET quantity = ${quantity} WHERE id = ${id} RETURNING *`;
    return result[0];
  }

  static async getTransactionHistory(inventoryId) {
    const result = await db`
      SELECT it.*, u.username as created_by_name
      FROM inventory_transactions it
      LEFT JOIN users u ON it.created_by = u.id
      WHERE it.inventory_id = ${inventoryId}
      ORDER BY it.transaction_date DESC
    `;
    return result;
  }

  static async addTransaction(transactionData) {
    const { inventory_id, type, quantity, description, transaction_date, created_by } = transactionData;
    
    // Use postgres.js transaction
    return await db.begin(async sql => {
      // Add transaction record
      const [transaction] = await sql`
        INSERT INTO inventory_transactions (inventory_id, type, quantity, description, transaction_date, created_by)
        VALUES (${inventory_id}, ${type}, ${quantity}, ${description}, ${transaction_date}, ${created_by})
        RETURNING *
      `;
      
      // Get current inventory quantity
      const [currentInventory] = await sql`SELECT quantity FROM inventory WHERE id = ${inventory_id}`;
      const currentQuantity = currentInventory.quantity;
      
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
      
      await sql`UPDATE inventory SET quantity = ${newQuantity} WHERE id = ${inventory_id}`;
      
      return {
        transaction,
        new_quantity: newQuantity
      };
    });
  }

  static async getLowStockItems() {
    const result = await db`SELECT * FROM inventory WHERE quantity <= min_stock ORDER BY quantity ASC`;
    return result;
  }

  static async getInventoryStats() {
    const result = await db`
      SELECT 
        category,
        COUNT(*) as item_count,
        SUM(quantity) as total_quantity,
        SUM(quantity * unit_price) as total_value
      FROM inventory
      GROUP BY category
      ORDER BY total_value DESC
    `;
    return result;
  }
}

export default Inventory;