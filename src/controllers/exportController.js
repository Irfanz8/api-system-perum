import db from '../config/database.js';

/**
 * Generic function to format data for Excel export
 */
const formatDataForExport = (data, columns) => {
  if (!columns || columns.length === 0) {
    return data;
  }
  return data.map(row => {
    const filtered = {};
    columns.forEach(col => {
      if (row.hasOwnProperty(col)) {
        filtered[col] = row[col];
      }
    });
    return filtered;
  });
};

/**
 * Generate CSV content from data
 */
const generateCSV = (data) => {
  if (!data || data.length === 0) {
    return '';
  }
  
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];
  
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      if (value === null || value === undefined) {
        return '';
      }
      // Escape quotes and wrap in quotes if contains comma
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    });
    csvRows.push(values.join(','));
  });
  
  return csvRows.join('\n');
};

/**
 * Export financial transactions report
 */
export const exportKeuangan = async (req, res) => {
  try {
    const { format = 'csv', startDate, endDate, columns } = req.query;
    
    // Build query conditions
    const conditions = [];
    if (startDate) {
      conditions.push(db`ft.transaction_date >= ${startDate}`);
    }
    if (endDate) {
      conditions.push(db`ft.transaction_date <= ${endDate}`);
    }
    
    const whereClause = conditions.length > 0 
      ? db`WHERE ${conditions.reduce((a, b) => db`${a} AND ${b}`)}`
      : db``;

    const data = await db`
      SELECT 
        ft.id,
        ft.type,
        ft.category,
        ft.amount,
        ft.description,
        ft.transaction_date,
        p.name as property_name,
        u.username as created_by,
        ft.created_at
      FROM financial_transactions ft
      LEFT JOIN properties p ON ft.property_id = p.id
      LEFT JOIN users u ON ft.created_by = u.id
      ${whereClause}
      ORDER BY ft.transaction_date DESC
    `;

    // Filter columns if specified
    const columnsArray = columns ? columns.split(',') : null;
    const exportData = columnsArray ? formatDataForExport(data, columnsArray) : data;

    if (format === 'csv') {
      const csv = generateCSV(exportData);
      const filename = `laporan-keuangan-${new Date().toISOString().split('T')[0]}.csv`;
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(csv);
    }

    // JSON format as fallback
    res.json({
      success: true,
      count: exportData.length,
      data: exportData
    });
  } catch (error) {
    console.error('Export keuangan error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Export properties report
 */
export const exportProperti = async (req, res) => {
  try {
    const { format = 'csv', status, type, columns } = req.query;
    
    const conditions = [];
    if (status) {
      conditions.push(db`status = ${status}`);
    }
    if (type) {
      conditions.push(db`type = ${type}`);
    }
    
    const whereClause = conditions.length > 0 
      ? db`WHERE ${conditions.reduce((a, b) => db`${a} AND ${b}`)}`
      : db``;

    const data = await db`
      SELECT 
        id,
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
        created_at
      FROM properties
      ${whereClause}
      ORDER BY created_at DESC
    `;

    const columnsArray = columns ? columns.split(',') : null;
    const exportData = columnsArray ? formatDataForExport(data, columnsArray) : data;

    if (format === 'csv') {
      const csv = generateCSV(exportData);
      const filename = `laporan-properti-${new Date().toISOString().split('T')[0]}.csv`;
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(csv);
    }

    res.json({
      success: true,
      count: exportData.length,
      data: exportData
    });
  } catch (error) {
    console.error('Export properti error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Export sales report
 */
export const exportPenjualan = async (req, res) => {
  try {
    const { format = 'csv', startDate, endDate, status, columns } = req.query;
    
    const conditions = [];
    if (startDate) {
      conditions.push(db`ps.sale_date >= ${startDate}`);
    }
    if (endDate) {
      conditions.push(db`ps.sale_date <= ${endDate}`);
    }
    if (status) {
      conditions.push(db`ps.status = ${status}`);
    }
    
    const whereClause = conditions.length > 0 
      ? db`WHERE ${conditions.reduce((a, b) => db`${a} AND ${b}`)}`
      : db``;

    const data = await db`
      SELECT 
        ps.id,
        p.name as property_name,
        p.type as property_type,
        ps.buyer_name,
        ps.buyer_email,
        ps.buyer_phone,
        ps.sale_price,
        ps.sale_date,
        ps.status,
        ps.notes,
        u.username as created_by,
        ps.created_at
      FROM property_sales ps
      LEFT JOIN properties p ON ps.property_id = p.id
      LEFT JOIN users u ON ps.created_by = u.id
      ${whereClause}
      ORDER BY ps.sale_date DESC
    `;

    const columnsArray = columns ? columns.split(',') : null;
    const exportData = columnsArray ? formatDataForExport(data, columnsArray) : data;

    if (format === 'csv') {
      const csv = generateCSV(exportData);
      const filename = `laporan-penjualan-${new Date().toISOString().split('T')[0]}.csv`;
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(csv);
    }

    res.json({
      success: true,
      count: exportData.length,
      data: exportData
    });
  } catch (error) {
    console.error('Export penjualan error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Export inventory report
 */
export const exportPersediaan = async (req, res) => {
  try {
    const { format = 'csv', category, lowStock, columns } = req.query;
    
    const conditions = [];
    if (category) {
      conditions.push(db`category = ${category}`);
    }
    if (lowStock === 'true') {
      conditions.push(db`quantity <= min_stock`);
    }
    
    const whereClause = conditions.length > 0 
      ? db`WHERE ${conditions.reduce((a, b) => db`${a} AND ${b}`)}`
      : db``;

    const data = await db`
      SELECT 
        id,
        name,
        category,
        quantity,
        unit,
        unit_price,
        supplier,
        min_stock,
        description,
        created_at
      FROM inventory
      ${whereClause}
      ORDER BY category, name
    `;

    const columnsArray = columns ? columns.split(',') : null;
    const exportData = columnsArray ? formatDataForExport(data, columnsArray) : data;

    if (format === 'csv') {
      const csv = generateCSV(exportData);
      const filename = `laporan-persediaan-${new Date().toISOString().split('T')[0]}.csv`;
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(csv);
    }

    res.json({
      success: true,
      count: exportData.length,
      data: exportData
    });
  } catch (error) {
    console.error('Export persediaan error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Export users report (superadmin only)
 */
export const exportUsers = async (req, res) => {
  try {
    const { format = 'csv', role, columns } = req.query;
    
    const conditions = [];
    if (role) {
      conditions.push(db`role = ${role}`);
    }
    
    const whereClause = conditions.length > 0 
      ? db`WHERE ${conditions.reduce((a, b) => db`${a} AND ${b}`)}`
      : db``;

    const data = await db`
      SELECT 
        id,
        username,
        email,
        role,
        is_active,
        created_at,
        updated_at
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
    `;

    const columnsArray = columns ? columns.split(',') : null;
    const exportData = columnsArray ? formatDataForExport(data, columnsArray) : data;

    if (format === 'csv') {
      const csv = generateCSV(exportData);
      const filename = `laporan-users-${new Date().toISOString().split('T')[0]}.csv`;
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(csv);
    }

    res.json({
      success: true,
      count: exportData.length,
      data: exportData
    });
  } catch (error) {
    console.error('Export users error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
