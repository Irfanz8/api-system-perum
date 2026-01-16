const db = require('../config/database');

class FinancialTransaction {
  static async getAll(filters = {}) {
    let query = `
      SELECT ft.*, p.name as property_name, u.username as created_by_name
      FROM financial_transactions ft
      LEFT JOIN properties p ON ft.property_id = p.id
      LEFT JOIN users u ON ft.created_by = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (filters.type) {
      query += ` AND ft.type = $${paramIndex}`;
      params.push(filters.type);
      paramIndex++;
    }

    if (filters.category) {
      query += ` AND ft.category = $${paramIndex}`;
      params.push(filters.category);
      paramIndex++;
    }

    if (filters.start_date) {
      query += ` AND ft.transaction_date >= $${paramIndex}`;
      params.push(filters.start_date);
      paramIndex++;
    }

    if (filters.end_date) {
      query += ` AND ft.transaction_date <= $${paramIndex}`;
      params.push(filters.end_date);
      paramIndex++;
    }

    query += ` ORDER BY ft.transaction_date DESC, ft.created_at DESC`;

    if (filters.limit) {
      query += ` LIMIT $${paramIndex}`;
      params.push(filters.limit);
      paramIndex++;
    }

    const result = await db.query(query, params);
    return result.rows;
  }

  static async getById(id) {
    const query = `
      SELECT ft.*, p.name as property_name, u.username as created_by_name
      FROM financial_transactions ft
      LEFT JOIN properties p ON ft.property_id = p.id
      LEFT JOIN users u ON ft.created_by = u.id
      WHERE ft.id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async create(transactionData) {
    const { type, category, amount, description, transaction_date, property_id, created_by } = transactionData;
    const query = `
      INSERT INTO financial_transactions (type, category, amount, description, transaction_date, property_id, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [type, category, amount, description, transaction_date, property_id, created_by];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async update(id, transactionData) {
    const { type, category, amount, description, transaction_date, property_id } = transactionData;
    const query = `
      UPDATE financial_transactions
      SET type = $1, category = $2, amount = $3, description = $4, transaction_date = $5, property_id = $6
      WHERE id = $7
      RETURNING *
    `;
    const values = [type, category, amount, description, transaction_date, property_id, id];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM financial_transactions WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async getSummary(filters = {}) {
    let query = `
      SELECT 
        type,
        category,
        SUM(amount) as total_amount,
        COUNT(*) as transaction_count
      FROM financial_transactions
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (filters.start_date) {
      query += ` AND transaction_date >= $${paramIndex}`;
      params.push(filters.start_date);
      paramIndex++;
    }

    if (filters.end_date) {
      query += ` AND transaction_date <= $${paramIndex}`;
      params.push(filters.end_date);
      paramIndex++;
    }

    query += ` GROUP BY type, category ORDER BY type, category`;

    const result = await db.query(query, params);
    return result.rows;
  }
}

module.exports = FinancialTransaction;