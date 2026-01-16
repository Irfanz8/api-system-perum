const db = require('../config/database');

class Property {
  static async getAll(filters = {}) {
    let query = 'SELECT * FROM properties WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (filters.type) {
      query += ` AND type = $${paramIndex}`;
      params.push(filters.type);
      paramIndex++;
    }

    if (filters.status) {
      query += ` AND status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters.min_price) {
      query += ` AND price >= $${paramIndex}`;
      params.push(filters.min_price);
      paramIndex++;
    }

    if (filters.max_price) {
      query += ` AND price <= $${paramIndex}`;
      params.push(filters.max_price);
      paramIndex++;
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
    const query = 'SELECT * FROM properties WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async create(propertyData) {
    const { 
      name, 
      type, 
      address, 
      price, 
      status, 
      description, 
      luas_tanah, 
      luas_bangunan, 
      jumlah_kamar, 
      jumlah_kamar_mandi 
    } = propertyData;
    
    const query = `
      INSERT INTO properties (name, type, address, price, status, description, luas_tanah, luas_bangunan, jumlah_kamar, jumlah_kamar_mandi)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    
    const values = [
      name, 
      type, 
      address, 
      price, 
      status || 'available', 
      description, 
      luas_tanah, 
      luas_bangunan, 
      jumlah_kamar, 
      jumlah_kamar_mandi
    ];
    
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async update(id, propertyData) {
    const { 
      name, 
      type, 
      address, 
      price, 
      status, 
      description, 
      luas_tanah, 
      luas_bangunan, 
      jumlah_kamar, 
      jumlah_kamar_mandi 
    } = propertyData;
    
    const query = `
      UPDATE properties
      SET name = $1, type = $2, address = $3, price = $4, status = $5, description = $6, 
          luas_tanah = $7, luas_bangunan = $8, jumlah_kamar = $9, jumlah_kamar_mandi = $10
      WHERE id = $11
      RETURNING *
    `;
    
    const values = [
      name, 
      type, 
      address, 
      price, 
      status, 
      description, 
      luas_tanah, 
      luas_bangunan, 
      jumlah_kamar, 
      jumlah_kamar_mandi,
      id
    ];
    
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM properties WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async updateStatus(id, status) {
    const query = 'UPDATE properties SET status = $1 WHERE id = $2 RETURNING *';
    const result = await db.query(query, [status, id]);
    return result.rows[0];
  }

  static async getSalesHistory(propertyId) {
    const query = `
      SELECT ps.*, u.username as created_by_name
      FROM property_sales ps
      LEFT JOIN users u ON ps.created_by = u.id
      WHERE ps.property_id = $1
      ORDER BY ps.sale_date DESC
    `;
    const result = await db.query(query, [propertyId]);
    return result.rows;
  }

  static async getAvailableProperties() {
    const query = 'SELECT * FROM properties WHERE status = $1 ORDER BY created_at DESC';
    const result = await db.query(query, ['available']);
    return result.rows;
  }

  static async getPropertyStats() {
    const query = `
      SELECT 
        status,
        COUNT(*) as count,
        AVG(price) as avg_price,
        MIN(price) as min_price,
        MAX(price) as max_price
      FROM properties
      GROUP BY status
    `;
    const result = await db.query(query);
    return result.rows;
  }
}

module.exports = Property;