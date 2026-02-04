import PropertySale from '../models/PropertySale.js';
import { parsePaginationParams, buildPaginatedApiResponse } from '../utils/pagination.js';
import { createSaleNotification, createSaleCompleteNotification } from '../utils/notificationService.js';

// Get all property sales with pagination
export const getAllSales = async (req, res) => {
  try {
    const { page, limit, offset, sortBy, sortOrder } = parsePaginationParams(req.query, {
      defaultSortBy: 'sale_date',
      allowedSortFields: ['sale_date', 'created_at', 'sale_price', 'status', 'buyer_name']
    });

    const filters = {
      status: req.query.status,
      buyer_name: req.query.buyer_name,
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      search: req.query.search || null
    };

    const { data, totalItems } = await PropertySale.getAllPaginated(filters, { limit, offset, sortBy, sortOrder });
    
    res.json(buildPaginatedApiResponse(data, totalItems, page, limit));
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get sale by ID
export const getSaleById = async (req, res) => {
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
export const createSale = async (req, res) => {
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

    // Send notification to admins (async, don't wait)
    createSaleNotification(sale, req.user?.id).catch(err => 
      console.error('Failed to send sale notification:', err)
    );

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
export const updateSale = async (req, res) => {
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
export const deleteSale = async (req, res) => {
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
export const updateSaleStatus = async (req, res) => {
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

// Complete sale
export const completeSale = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await PropertySale.completeSale(id);

    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Penjualan tidak ditemukan'
      });
    }

    // Send notification about completed sale (async, don't wait)
    createSaleCompleteNotification(result.sale).catch(err => 
      console.error('Failed to send sale complete notification:', err)
    );

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
export const getSalesStats = async (req, res) => {
  try {
    const filters = {
      start_date: req.query.start_date,
      end_date: req.query.end_date
    };

    const stats = await PropertySale.getSalesStats(filters);
    
    let totalSales = 0;
    let totalRevenue = 0;

    stats.forEach(item => {
      totalSales += parseInt(item.sale_count);
      totalRevenue += parseFloat(item.total_revenue || 0);
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
export const getMonthlyRevenue = async (req, res) => {
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