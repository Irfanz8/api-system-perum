const Property = require('../models/Property');

// Get all properties
exports.getAllProperties = async (req, res) => {
  try {
    const filters = {
      type: req.query.type,
      status: req.query.status,
      min_price: req.query.min_price ? parseFloat(req.query.min_price) : null,
      max_price: req.query.max_price ? parseFloat(req.query.max_price) : null,
      limit: req.query.limit ? parseInt(req.query.limit) : null
    };

    const properties = await Property.getAll(filters);
    res.json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get property by ID
exports.getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.getById(id);

    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Properti tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Create new property
exports.createProperty = async (req, res) => {
  try {
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
    } = req.body;

    // Validation
    if (!name || !type || !address || !price) {
      return res.status(400).json({
        success: false,
        error: 'Field name, type, address, dan price wajib diisi'
      });
    }

    if (price <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Price harus lebih dari 0'
      });
    }

    const propertyData = {
      name,
      type,
      address,
      price: parseFloat(price),
      status,
      description,
      luas_tanah: luas_tanah ? parseFloat(luas_tanah) : null,
      luas_bangunan: luas_bangunan ? parseFloat(luas_bangunan) : null,
      jumlah_kamar: jumlah_kamar ? parseInt(jumlah_kamar) : null,
      jumlah_kamar_mandi: jumlah_kamar_mandi ? parseInt(jumlah_kamar_mandi) : null
    };

    const property = await Property.create(propertyData);

    res.status(201).json({
      success: true,
      message: 'Properti berhasil dibuat',
      data: property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update property
exports.updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
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
    } = req.body;

    // Validation
    if (price && price <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Price harus lebih dari 0'
      });
    }

    const propertyData = {
      name,
      type,
      address,
      price: price ? parseFloat(price) : undefined,
      status,
      description,
      luas_tanah: luas_tanah ? parseFloat(luas_tanah) : undefined,
      luas_bangunan: luas_bangunan ? parseFloat(luas_bangunan) : undefined,
      jumlah_kamar: jumlah_kamar ? parseInt(jumlah_kamar) : undefined,
      jumlah_kamar_mandi: jumlah_kamar_mandi ? parseInt(jumlah_kamar_mandi) : undefined
    };

    const property = await Property.update(id, propertyData);

    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Properti tidak ditemukan'
      });
    }

    res.json({
      success: true,
      message: 'Properti berhasil diupdate',
      data: property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Delete property
exports.deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.delete(id);

    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Properti tidak ditemukan'
      });
    }

    res.json({
      success: true,
      message: 'Properti berhasil dihapus',
      data: property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update property status
exports.updatePropertyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status wajib diisi'
      });
    }

    const validStatuses = ['available', 'sold', 'reserved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Status harus salah satu dari: ${validStatuses.join(', ')}`
      });
    }

    const property = await Property.updateStatus(id, status);

    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Properti tidak ditemukan'
      });
    }

    res.json({
      success: true,
      message: 'Status properti berhasil diupdate',
      data: property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get property sales history
exports.getPropertySalesHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const salesHistory = await Property.getSalesHistory(id);
    
    res.json({
      success: true,
      count: salesHistory.length,
      data: salesHistory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get available properties
exports.getAvailableProperties = async (req, res) => {
  try {
    const properties = await Property.getAvailableProperties();
    
    res.json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get property statistics
exports.getPropertyStats = async (req, res) => {
  try {
    const stats = await Property.getPropertyStats();
    
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