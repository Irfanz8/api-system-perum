const express = require('express');
const router = express.Router();
const persediaanController = require('../controllers/persediaanController');

// Get all inventory items
router.get('/', persediaanController.getAllInventory);

// Get low stock items
router.get('/low-stock', persediaanController.getLowStockItems);

// Get inventory statistics
router.get('/stats', persediaanController.getInventoryStats);

// Get inventory item by ID
router.get('/:id', persediaanController.getInventoryById);

// Get inventory transaction history
router.get('/:id/history', persediaanController.getInventoryTransactionHistory);

// Create new inventory item
router.post('/', persediaanController.createInventory);

// Update inventory item
router.put('/:id', persediaanController.updateInventory);

// Delete inventory item
router.delete('/:id', persediaanController.deleteInventory);

// Update inventory quantity
router.patch('/:id/quantity', persediaanController.updateInventoryQuantity);

// Add inventory transaction (in/out)
router.post('/:id/transaction', persediaanController.addInventoryTransaction);

module.exports = router;