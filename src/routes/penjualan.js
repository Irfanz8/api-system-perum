const express = require('express');
const router = express.Router();
const penjualanController = require('../controllers/penjualanController');

// Get all sales
router.get('/', penjualanController.getAllSales);

// Get sales statistics
router.get('/stats', penjualanController.getSalesStats);

// Get monthly revenue
router.get('/revenue/:year', penjualanController.getMonthlyRevenue);

// Get sale by ID
router.get('/:id', penjualanController.getSaleById);

// Create new sale
router.post('/', penjualanController.createSale);

// Update sale
router.put('/:id', penjualanController.updateSale);

// Delete sale
router.delete('/:id', penjualanController.deleteSale);

// Update sale status
router.patch('/:id/status', penjualanController.updateSaleStatus);

// Complete sale
router.post('/:id/complete', penjualanController.completeSale);

module.exports = router;