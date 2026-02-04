import db from '../config/database.js';

class FinancialTransaction {
  static async getAll(filters = {}) {
    const conditions = [];
    const values = [];
    
    if (filters.type) {
      conditions.push(db`ft.type = ${filters.type}`);
    }
    if (filters.category) {
      conditions.push(db`ft.category = ${filters.category}`);
    }
    if (filters.start_date) {
      conditions.push(db`ft.transaction_date >= ${filters.start_date}`);
    }
    if (filters.end_date) {
      conditions.push(db`ft.transaction_date <= ${filters.end_date}`);
    }

    const whereClause = conditions.length > 0 
      ? db`WHERE ${conditions.reduce((a, b) => db`${a} AND ${b}`)}`
      : db``;

    const result = await db`
      SELECT ft.*, p.name as property_name, u.username as created_by_name
      FROM financial_transactions ft
      LEFT JOIN properties p ON ft.property_id = p.id
      LEFT JOIN users u ON ft.created_by = u.id
      ${whereClause}
      ORDER BY ft.transaction_date DESC, ft.created_at DESC
      ${filters.limit ? db`LIMIT ${filters.limit}` : db``}
    `;
    return result;
  }

  static async getAllPaginated(filters = {}, pagination = {}) {
    const { limit = 10, offset = 0, sortBy = 'transaction_date', sortOrder = 'desc' } = pagination;
    
    const conditions = [];
    
    if (filters.type) {
      conditions.push(db`ft.type = ${filters.type}`);
    }
    if (filters.category) {
      conditions.push(db`ft.category = ${filters.category}`);
    }
    if (filters.start_date) {
      conditions.push(db`ft.transaction_date >= ${filters.start_date}`);
    }
    if (filters.end_date) {
      conditions.push(db`ft.transaction_date <= ${filters.end_date}`);
    }
    if (filters.search) {
      conditions.push(db`(ft.description ILIKE ${'%' + filters.search + '%'} OR ft.category ILIKE ${'%' + filters.search + '%'})`);
    }

    const whereClause = conditions.length > 0 
      ? db`WHERE ${conditions.reduce((a, b) => db`${a} AND ${b}`)}`
      : db``;

    // Get total count
    const countResult = await db`
      SELECT COUNT(*) as total FROM financial_transactions ft
      ${whereClause}
    `;
    const totalItems = parseInt(countResult[0].total);

    // Build ORDER BY - using safe column mapping
    const sortColumns = {
      'transaction_date': db`ft.transaction_date`,
      'created_at': db`ft.created_at`,
      'amount': db`ft.amount`,
      'type': db`ft.type`,
      'category': db`ft.category`
    };
    const sortColumn = sortColumns[sortBy] || sortColumns['transaction_date'];
    const orderDirection = sortOrder === 'asc' ? db`ASC` : db`DESC`;

    // Get paginated data
    const data = await db`
      SELECT ft.*, p.name as property_name, u.username as created_by_name
      FROM financial_transactions ft
      LEFT JOIN properties p ON ft.property_id = p.id
      LEFT JOIN users u ON ft.created_by = u.id
      ${whereClause}
      ORDER BY ${sortColumn} ${orderDirection}
      LIMIT ${limit} OFFSET ${offset}
    `;

    return { data, totalItems };
  }

  static async getById(id) {
    const result = await db`
      SELECT ft.*, p.name as property_name, u.username as created_by_name
      FROM financial_transactions ft
      LEFT JOIN properties p ON ft.property_id = p.id
      LEFT JOIN users u ON ft.created_by = u.id
      WHERE ft.id = ${id}
    `;
    return result[0];
  }

  static async create(transactionData) {
    const { type, category, amount, description, transaction_date, property_id, created_by } = transactionData;
    const result = await db`
      INSERT INTO financial_transactions (type, category, amount, description, transaction_date, property_id, created_by)
      VALUES (${type}, ${category}, ${amount}, ${description}, ${transaction_date}, ${property_id}, ${created_by})
      RETURNING *
    `;
    return result[0];
  }

  static async update(id, transactionData) {
    const { type, category, amount, description, transaction_date, property_id } = transactionData;
    const result = await db`
      UPDATE financial_transactions
      SET type = ${type}, category = ${category}, amount = ${amount}, 
          description = ${description}, transaction_date = ${transaction_date}, property_id = ${property_id}
      WHERE id = ${id}
      RETURNING *
    `;
    return result[0];
  }

  static async delete(id) {
    const result = await db`DELETE FROM financial_transactions WHERE id = ${id} RETURNING *`;
    return result[0];
  }

  static async getSummary(filters = {}) {
    const conditions = [];
    
    if (filters.start_date) {
      conditions.push(db`transaction_date >= ${filters.start_date}`);
    }
    if (filters.end_date) {
      conditions.push(db`transaction_date <= ${filters.end_date}`);
    }

    const whereClause = conditions.length > 0 
      ? db`WHERE ${conditions.reduce((a, b) => db`${a} AND ${b}`)}`
      : db``;

    const result = await db`
      SELECT 
        type,
        category,
        SUM(amount) as total_amount,
        COUNT(*) as transaction_count
      FROM financial_transactions
      ${whereClause}
      GROUP BY type, category 
      ORDER BY type, category
    `;
    return result;
  }
}

export default FinancialTransaction;