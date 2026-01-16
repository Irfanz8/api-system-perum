const db = require('../config/database');

class PropertySale {
  static async getAll(filters = {}) {
    let query = `
      SELECT ps.*, p.name as property_name, p.type as property_type, 
             u.username as created_by_name
      FROM property_sales ps
      LEFT JOIN properties p ON ps.property_id = p.id
      LEFT JOIN users u ON ps.created_by = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (filters.status) {
      query += ` AND ps.status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters.buyer_name) {
      query += ` AND ps.buyer_name ILIKE $${paramIndex}`;
      params.push(`%${filters.buyer_name}%`);
      paramIndex++;
    }

    if (filters.start_date) {
      query += ` AND ps.sale_date >= $${paramIndex}`;
      params.push(filters.start_date);
      paramIndex++;
    }

    if (filters.end_date) {
      query += ` AND ps.sale_date <= $${paramIndex}`;
      params.push(filters.end_date);
      paramIndex++;
    }

    query += ` ORDER BY ps.sale_date DESC, ps.created_at DESC`;

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
      SELECT ps.*, p.name as property_name, p.type as property_type, 
             p.address as property_address, p.price as property_price,
             u.username as created_by_name
      FROM property_sales ps
      LEFT JOIN properties p ON ps.property_id = p.id
      LEFT JOIN users u ON ps.created_by = u.id
      WHERE ps.id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async create(saleData) {
    const { 
      property_id, 
      buyer_name, 
      buyer_email, 
      buyer_phone, 
      sale_price, 
      sale_date, 
      status, 
      notes, 
      created_by 
    } = saleData;
    
    const query = `
      INSERT INTO property_sales (property_id, buyer_name, buyer_email, buyer_phone, sale_price, sale_date, status, notes, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const values = [
      property_id, 
      buyer_name, 
      buyer_email, 
      buyer_phone, 
      sale_price, 
      sale_date, 
      status || 'pending', 
      notes, 
      created_by
    ];
    
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async update(id, saleData) {
    const { 
      property_id, 
      buyer_name, 
      buyer_email, 
      buyer_phone, 
      sale_price, 
      sale_date, 
      status, 
      notes 
    } = saleData;
    
    const query = `
      UPDATE property_sales
      SET property_id = $1, buyer_name = $2, buyer_email = $3, buyer_phone = $4, 
          sale_price = $5, sale_date = $6, status = $7, notes = $8
      WHERE id = $9
      RETURNING *
    `;
    
    const values = [
      property_id, 
      buyer_name, 
      buyer_email, 
      buyer_phone, 
      sale_price, 
      sale_date, 
      status, 
      notes,
      id
    ];
    
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM property_sales WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async updateStatus(id, status) {
    const query = 'UPDATE property_sales SET status = $1 WHERE id = $2 RETURNING *';
    const result = await db.query(query, [status, id]);
    return result.rows[0];
  }

  static async completeSale(id) {
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Get sale details
      const saleQuery = 'SELECT * FROM property_sales WHERE id = $1 FOR UPDATE';
      const saleResult = await client.query(saleQuery, [id]);
      const sale = saleResult.rows[0];
      
      if (!sale) {
        throw new Error('Sale not found');
      }
      
      // Update sale status
      const updateSaleQuery = 'UPDATE property_sales SET status = $1 WHERE id = $2';
      await client.query(updateSaleQuery, ['completed', id]);
      
      // Update property status
      const updatePropertyQuery = 'UPDATE properties SET status = $1 WHERE id = $2';
      await client.query(updatePropertyQuery, ['sold', sale.property_id]);
      
      // Add financial transaction
      const transactionQuery = `
        INSERT INTO financial_transactions (type, category, amount, description, transaction_date, property_id, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      const transactionData = {
        type: 'income',
        category: 'penjualan',
        amount: sale.sale_price,
        description: `Penjualan properti: ${sale.buyer_name}`,
        transaction_date: sale.sale_date,
        property_id: sale.property_id,
        created_by: sale.created_by
      };
      
      const transactionResult = await client.query(transactionQuery, [
        transactionData.type,
        transactionData.category,
        transactionData.amount,
        transactionData.description,
        transactionData.transaction_date,
        transactionData.property_id,
        transactionData.created_by
      ]);
      
      await client.query('COMMIT');
      
      return {
        sale: { ...sale, status: 'completed' },
        transaction: transactionResult.rows[0]
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getSalesStats(filters = {}) {
    let query = `
      SELECT 
        status,
        COUNT(*) as sale_count,
        SUM(sale_price) as total_revenue
      FROM property_sales
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (filters.start_date) {
      query += ` AND sale_date >= $${paramIndex}`;
      params.push(filters.start_date);
      paramIndex++;
    }

    if (filters.end_date) {
      query += ` AND sale_date <= $${paramIndex}`;
      params.push(filters.end_date);
      paramIndex++;
    }

    query += ` GROUP BY status`;

    const result = await db.query(query, params);
    return result.rows;
  }

  static async getMonthlyRevenue(year) {
    const query = `
      SELECT 
        EXTRACT(MONTH FROM sale_date) as month,
        COUNT(*) as sale_count,
        SUM(sale_price) as total_revenue
      FROM property_sales
      WHERE EXTRACT(YEAR FROM sale_date) = $1
        AND status = 'completed'
      GROUP BY EXTRACT(MONTH FROM sale_date)
      ORDER BY month
    `;
    const result = await db.query(query, [year]);
    return result.rows;
  }
}

module.exports = PropertySale;