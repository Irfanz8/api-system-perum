const PropertySale = require('../models/PropertySale');

// Get all property sales
exports.getAllSales = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      buyer_name: req.query.buyer_name,
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      limit: req.query.limit ? parseInt(req.query.limit) : null
    };

    const sales = await PropertySale.getAll(filters);
    res.json({
      success: true,
      count: sales.length,
      data: sales
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get sale by ID
exports.getSaleById = async (req, res) => {
  try {
    const { id } = req.params;
    const sale = await PropertySale.getById(id);

    if (!sale) {
      return res.status(404).json({
        success: false,
        error: 'Penjualan tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: sale
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Create new sale
exports.createSale = async (req, res) => {
  try {
    const { 
      property_id, 
      buyer_name, 
      buyer_email, 
      buyer_phone, 
      sale_price, 
      sale_date, 
      status, 
      notes 
    } = req.body;

    // Validation
    if (!property_id || !buyer_name || !sale_price || !sale_date) {
      return res.status(400).json({
        success: false,
        error: 'Field property_id, buyer_name, sale_price, dan sale_date wajib diisi'
      });
    }

    if (sale_price <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Sale price harus lebih dari 0'
      });
    }

    const saleData = {
      property_id,
      buyer_name,
      buyer_email,
      buyer_phone,
      sale_price: parseFloat(sale_price),
      sale_date,
      status,
      notes,
      created_by: req.user ? req.user.id : null
    };

    const sale = await PropertySale.create(saleData);

    res.status(201).json({
      success: true,
      message: 'Penjualan berhasil dibuat',
      data: sale
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update sale
exports.updateSale = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      property_id, 
      buyer_name, 
      buyer_email, 
      buyer_phone, 
      sale_price, 
      sale_date, 
      status, 
      notes 
    } = req.body;

    // Validation
    if (sale_price && sale_price <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Sale price harus lebih dari 0'
      });
    }

    const saleData = {
      property_id,
      buyer_name,
      buyer_email,
      buyer_phone,
      sale_price: sale_price ? parseFloat(sale_price) : undefined,
      sale_date,
      status,
      notes
    };

    const sale = await PropertySale.update(id, saleData);

    if (!sale) {
      return res.status(404).json({
        success: false,
        error: 'Penjualan tidak ditemukan'
      });
    }

    res.json({
      success: true,
      message: 'Penjualan berhasil diupdate',
      data: sale
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Delete sale
exports.deleteSale = async (req, res) => {
  try {
    const { id } = req.params;
    const sale = await PropertySale.delete(id);

    if (!sale) {
      return res.status(404).json({
        success: false,
        error: 'Penjualan tidak ditemukan'
      });
    }

    res.json({
      success: true,
      message: 'Penjualan berhasil dihapus',
      data: sale
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update sale status
exports.updateSaleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status wajib diisi'
      });
    }

    const validStatuses = ['pending', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Status harus salah satu dari: ${validStatuses.join(', ')}`
      });
    }

    const sale = await PropertySale.updateStatus(id, status);

    if (!sale) {
      return res.status(404).json({
        success: false,
        error: 'Penjualan tidak ditemukan'
      });
    }

    res.json({
      success: true,
      message: 'Status penjualan berhasil diupdate',
      data: sale
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Complete sale (creates financial transaction and updates property status)
exports.completeSale = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await PropertySale.completeSale(id);

    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Penjualan tidak ditemukan'
      });
    }

    res.json({
      success: true,
      message: 'Penjualan berhasil diselesaikan',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get sales statistics
exports.getSalesStats = async (req, res) => {
  try {
    const filters = {
      start_date: req.query.start_date,
      end_date: req.query.end_date
    };

    const stats = await PropertySale.getSalesStats(filters);
    
    // Calculate totals
    let totalSales = 0;
    let totalRevenue = 0;

    stats.forEach(item => {
      totalSales += parseInt(item.sale_count);
      totalRevenue += parseFloat(item.total_revenue);
    });

    res.json({
      success: true,
      data: {
        total_sales: totalSales,
        total_revenue: totalRevenue,
        breakdown: stats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get monthly revenue
exports.getMonthlyRevenue = async (req, res) => {
  try {
    const { year } = req.params;
    const revenue = await PropertySale.getMonthlyRevenue(parseInt(year));
    
    res.json({
      success: true,
      year: parseInt(year),
      data: revenue
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};