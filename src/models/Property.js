import db from '../config/database.js';

class Property {
  static async getAll(filters = {}) {
    const conditions = [];
    
    if (filters.type) {
      conditions.push(db`type = ${filters.type}`);
    }
    if (filters.status) {
      conditions.push(db`status = ${filters.status}`);
    }
    if (filters.min_price) {
      conditions.push(db`price >= ${filters.min_price}`);
    }
    if (filters.max_price) {
      conditions.push(db`price <= ${filters.max_price}`);
    }

    const whereClause = conditions.length > 0 
      ? db`WHERE ${conditions.reduce((a, b) => db`${a} AND ${b}`)}`
      : db``;

    const result = await db`
      SELECT * FROM properties
      ${whereClause}
      ORDER BY created_at DESC
      ${filters.limit ? db`LIMIT ${filters.limit}` : db``}
    `;
    return result;
  }

  static async getAllPaginated(filters = {}, pagination = {}) {
    const { limit = 10, offset = 0, sortBy = 'created_at', sortOrder = 'desc' } = pagination;
    
    const conditions = [];
    
    if (filters.type) {
      conditions.push(db`type = ${filters.type}`);
    }
    if (filters.status) {
      conditions.push(db`status = ${filters.status}`);
    }
    if (filters.min_price) {
      conditions.push(db`price >= ${filters.min_price}`);
    }
    if (filters.max_price) {
      conditions.push(db`price <= ${filters.max_price}`);
    }
    if (filters.search) {
      conditions.push(db`(name ILIKE ${'%' + filters.search + '%'} OR address ILIKE ${'%' + filters.search + '%'})`);
    }

    const whereClause = conditions.length > 0 
      ? db`WHERE ${conditions.reduce((a, b) => db`${a} AND ${b}`)}`
      : db``;

    // Get total count
    const countResult = await db`
      SELECT COUNT(*) as total FROM properties
      ${whereClause}
    `;
    const totalItems = parseInt(countResult[0].total);

    // Build ORDER BY - using safe column mapping
    const sortColumns = {
      'created_at': db`created_at`,
      'updated_at': db`updated_at`,
      'name': db`name`,
      'price': db`price`,
      'type': db`type`,
      'status': db`status`
    };
    const sortColumn = sortColumns[sortBy] || sortColumns['created_at'];
    const orderDirection = sortOrder === 'asc' ? db`ASC` : db`DESC`;

    // Get paginated data
    const data = await db`
      SELECT * FROM properties
      ${whereClause}
      ORDER BY ${sortColumn} ${orderDirection}
      LIMIT ${limit} OFFSET ${offset}
    `;

    return { data, totalItems };
  }

  static async getById(id) {
    const result = await db`SELECT * FROM properties WHERE id = ${id}`;
    return result[0];
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
    
    const result = await db`
      INSERT INTO properties (name, type, address, price, status, description, luas_tanah, luas_bangunan, jumlah_kamar, jumlah_kamar_mandi)
      VALUES (${name}, ${type}, ${address}, ${price}, ${status || 'available'}, ${description}, ${luas_tanah}, ${luas_bangunan}, ${jumlah_kamar}, ${jumlah_kamar_mandi})
      RETURNING *
    `;
    return result[0];
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
    
    const result = await db`
      UPDATE properties
      SET name = ${name}, type = ${type}, address = ${address}, price = ${price}, status = ${status}, description = ${description}, 
          luas_tanah = ${luas_tanah}, luas_bangunan = ${luas_bangunan}, jumlah_kamar = ${jumlah_kamar}, jumlah_kamar_mandi = ${jumlah_kamar_mandi}
      WHERE id = ${id}
      RETURNING *
    `;
    return result[0];
  }

  static async delete(id) {
    const result = await db`DELETE FROM properties WHERE id = ${id} RETURNING *`;
    return result[0];
  }

  static async updateStatus(id, status) {
    const result = await db`UPDATE properties SET status = ${status} WHERE id = ${id} RETURNING *`;
    return result[0];
  }

  static async getSalesHistory(propertyId) {
    const result = await db`
      SELECT ps.*, u.username as created_by_name
      FROM property_sales ps
      LEFT JOIN users u ON ps.created_by = u.id
      WHERE ps.property_id = ${propertyId}
      ORDER BY ps.sale_date DESC
    `;
    return result;
  }

  static async getAvailableProperties() {
    const result = await db`SELECT * FROM properties WHERE status = 'available' ORDER BY created_at DESC`;
    return result;
  }

  static async getPropertyStats() {
    const result = await db`
      SELECT 
        status,
        COUNT(*) as count,
        AVG(price) as avg_price,
        MIN(price) as min_price,
        MAX(price) as max_price
      FROM properties
      GROUP BY status
    `;
    return result;
  }
}

export default Property;