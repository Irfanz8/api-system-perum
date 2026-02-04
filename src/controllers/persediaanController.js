import Inventory from '../models/Inventory.js';
import { parsePaginationParams, buildPaginatedApiResponse } from '../utils/pagination.js';
import { createLowStockNotification } from '../utils/notificationService.js';

// Get all inventory items with pagination
export const getAllInventory = async (req, res) => {
  try {
    const { page, limit, offset, sortBy, sortOrder } = parsePaginationParams(req.query, {
      defaultSortBy: 'created_at',
      allowedSortFields: ['created_at', 'updated_at', 'name', 'quantity', 'unit_price', 'category']
    });

    const filters = {
      category: req.query.category,
      supplier: req.query.supplier,
      low_stock: req.query.low_stock === 'true',
      search: req.query.search || null
    };

    const { data, totalItems } = await Inventory.getAllPaginated(filters, { limit, offset, sortBy, sortOrder });
    
    res.json(buildPaginatedApiResponse(data, totalItems, page, limit));
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get inventory item by ID
export const getInventoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const inventory = await Inventory.getById(id);

    if (!inventory) {
      return res.status(404).json({
        success: false,
        error: 'Item persediaan tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: inventory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Create new inventory item
export const createInventory = async (req, res) => {
  try {
    const { 
      name, 
      category, 
      quantity, 
      unit, 
      unit_price, 
      supplier, 
      min_stock, 
      description 
    } = req.body;

    if (!name || !category || !quantity || !unit) {
      return res.status(400).json({
        success: false,
        error: 'Field name, category, quantity, dan unit wajib diisi'
      });
    }

    if (quantity < 0) {
      return res.status(400).json({
        success: false,
        error: 'Quantity tidak boleh negatif'
      });
    }

    const inventoryData = {
      name,
      category,
      quantity: parseInt(quantity),
      unit,
      unit_price: unit_price ? parseFloat(unit_price) : null,
      supplier,
      min_stock: min_stock ? parseInt(min_stock) : 0,
      description
    };

    const inventory = await Inventory.create(inventoryData);

    res.status(201).json({
      success: true,
      message: 'Item persediaan berhasil dibuat',
      data: inventory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update inventory item
export const updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      category, 
      quantity, 
      unit, 
      unit_price, 
      supplier, 
      min_stock, 
      description 
    } = req.body;

    if (quantity !== undefined && quantity < 0) {
      return res.status(400).json({
        success: false,
        error: 'Quantity tidak boleh negatif'
      });
    }

    const inventoryData = {
      name,
      category,
      quantity: quantity !== undefined ? parseInt(quantity) : undefined,
      unit,
      unit_price: unit_price !== undefined ? parseFloat(unit_price) : undefined,
      supplier,
      min_stock: min_stock !== undefined ? parseInt(min_stock) : undefined,
      description
    };

    const inventory = await Inventory.update(id, inventoryData);

    if (!inventory) {
      return res.status(404).json({
        success: false,
        error: 'Item persediaan tidak ditemukan'
      });
    }

    res.json({
      success: true,
      message: 'Item persediaan berhasil diupdate',
      data: inventory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Delete inventory item
export const deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const inventory = await Inventory.delete(id);

    if (!inventory) {
      return res.status(404).json({
        success: false,
        error: 'Item persediaan tidak ditemukan'
      });
    }

    res.json({
      success: true,
      message: 'Item persediaan berhasil dihapus',
      data: inventory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update inventory quantity
export const updateInventoryQuantity = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || quantity === null) {
      return res.status(400).json({
        success: false,
        error: 'Quantity wajib diisi'
      });
    }

    if (quantity < 0) {
      return res.status(400).json({
        success: false,
        error: 'Quantity tidak boleh negatif'
      });
    }

    const inventory = await Inventory.updateQuantity(id, parseInt(quantity));

    if (!inventory) {
      return res.status(404).json({
        success: false,
        error: 'Item persediaan tidak ditemukan'
      });
    }

    res.json({
      success: true,
      message: 'Quantity persediaan berhasil diupdate',
      data: inventory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get inventory transaction history
export const getInventoryTransactionHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const history = await Inventory.getTransactionHistory(id);
    
    res.json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Add inventory transaction (in/out)
export const addInventoryTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, quantity, description, transaction_date } = req.body;

    if (!type || !quantity) {
      return res.status(400).json({
        success: false,
        error: 'Field type dan quantity wajib diisi'
      });
    }

    if (!['in', 'out'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Type harus berupa in atau out'
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Quantity harus lebih dari 0'
      });
    }

    const transactionData = {
      inventory_id: parseInt(id),
      type,
      quantity: parseInt(quantity),
      description,
      transaction_date: transaction_date || new Date().toISOString().split('T')[0],
      created_by: req.user ? req.user.id : null
    };

    const result = await Inventory.addTransaction(transactionData);

    // Check if stock is now low and send notification
    if (type === 'out') {
      const inventory = await Inventory.getById(id);
      if (inventory && inventory.quantity <= inventory.min_stock) {
        createLowStockNotification(inventory).catch(err => 
          console.error('Failed to send low stock notification:', err)
        );
      }
    }

    res.status(201).json({
      success: true,
      message: 'Transaksi persediaan berhasil ditambahkan',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get low stock items
export const getLowStockItems = async (req, res) => {
  try {
    const items = await Inventory.getLowStockItems();
    
    res.json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get inventory statistics
export const getInventoryStats = async (req, res) => {
  try {
    const stats = await Inventory.getInventoryStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};