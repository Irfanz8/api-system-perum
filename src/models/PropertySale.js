import db from '../config/database.js';

class PropertySale {
  static async getAll(filters = {}) {
    const conditions = [];
    
    if (filters.status) {
      conditions.push(db`ps.status = ${filters.status}`);
    }
    if (filters.buyer_name) {
      conditions.push(db`ps.buyer_name ILIKE ${'%' + filters.buyer_name + '%'}`);
    }
    if (filters.start_date) {
      conditions.push(db`ps.sale_date >= ${filters.start_date}`);
    }
    if (filters.end_date) {
      conditions.push(db`ps.sale_date <= ${filters.end_date}`);
    }

    const whereClause = conditions.length > 0 
      ? db`WHERE ${conditions.reduce((a, b) => db`${a} AND ${b}`)}`
      : db``;

    const result = await db`
      SELECT ps.*, p.name as property_name, p.type as property_type, 
             u.username as created_by_name
      FROM property_sales ps
      LEFT JOIN properties p ON ps.property_id = p.id
      LEFT JOIN users u ON ps.created_by = u.id
      ${whereClause}
      ORDER BY ps.sale_date DESC, ps.created_at DESC
      ${filters.limit ? db`LIMIT ${filters.limit}` : db``}
    `;
    return result;
  }

  static async getById(id) {
    const result = await db`
      SELECT ps.*, p.name as property_name, p.type as property_type, 
             p.address as property_address, p.price as property_price,
             u.username as created_by_name
      FROM property_sales ps
      LEFT JOIN properties p ON ps.property_id = p.id
      LEFT JOIN users u ON ps.created_by = u.id
      WHERE ps.id = ${id}
    `;
    return result[0];
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
    
    const result = await db`
      INSERT INTO property_sales (property_id, buyer_name, buyer_email, buyer_phone, sale_price, sale_date, status, notes, created_by)
      VALUES (${property_id}, ${buyer_name}, ${buyer_email}, ${buyer_phone}, ${sale_price}, ${sale_date}, ${status || 'pending'}, ${notes}, ${created_by})
      RETURNING *
    `;
    return result[0];
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
    
    const result = await db`
      UPDATE property_sales
      SET property_id = ${property_id}, buyer_name = ${buyer_name}, buyer_email = ${buyer_email}, buyer_phone = ${buyer_phone}, 
          sale_price = ${sale_price}, sale_date = ${sale_date}, status = ${status}, notes = ${notes}
      WHERE id = ${id}
      RETURNING *
    `;
    return result[0];
  }

  static async delete(id) {
    const result = await db`DELETE FROM property_sales WHERE id = ${id} RETURNING *`;
    return result[0];
  }

  static async updateStatus(id, status) {
    const result = await db`UPDATE property_sales SET status = ${status} WHERE id = ${id} RETURNING *`;
    return result[0];
  }

  static async completeSale(id) {
    return await db.begin(async sql => {
      // Get sale details with lock
      const [sale] = await sql`SELECT * FROM property_sales WHERE id = ${id} FOR UPDATE`;
      
      if (!sale) {
        throw new Error('Sale not found');
      }
      
      // Update sale status
      await sql`UPDATE property_sales SET status = 'completed' WHERE id = ${id}`;
      
      // Update property status
      await sql`UPDATE properties SET status = 'sold' WHERE id = ${sale.property_id}`;
      
      // Add financial transaction
      const [transaction] = await sql`
        INSERT INTO financial_transactions (type, category, amount, description, transaction_date, property_id, created_by)
        VALUES ('income', 'penjualan', ${sale.sale_price}, ${'Penjualan properti: ' + sale.buyer_name}, ${sale.sale_date}, ${sale.property_id}, ${sale.created_by})
        RETURNING *
      `;
      
      return {
        sale: { ...sale, status: 'completed' },
        transaction
      };
    });
  }

  static async getSalesStats(filters = {}) {
    const conditions = [];
    
    if (filters.start_date) {
      conditions.push(db`sale_date >= ${filters.start_date}`);
    }
    if (filters.end_date) {
      conditions.push(db`sale_date <= ${filters.end_date}`);
    }

    const whereClause = conditions.length > 0 
      ? db`WHERE ${conditions.reduce((a, b) => db`${a} AND ${b}`)}`
      : db``;

    const result = await db`
      SELECT 
        status,
        COUNT(*) as sale_count,
        SUM(sale_price) as total_revenue
      FROM property_sales
      ${whereClause}
      GROUP BY status
    `;
    return result;
  }

  static async getMonthlyRevenue(year) {
    const result = await db`
      SELECT 
        EXTRACT(MONTH FROM sale_date) as month,
        COUNT(*) as sale_count,
        SUM(sale_price) as total_revenue
      FROM property_sales
      WHERE EXTRACT(YEAR FROM sale_date) = ${year}
        AND status = 'completed'
      GROUP BY EXTRACT(MONTH FROM sale_date)
      ORDER BY month
    `;
    return result;
  }
}

export default PropertySale;