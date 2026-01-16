const express = require('express');
const router = express.Router();
const propertiController = require('../controllers/propertiController');
const penjualanController = require('../controllers/penjualanController');

// Property routes
router.get('/', propertiController.getAllProperties);
router.get('/available', propertiController.getAvailableProperties);
router.get('/stats', propertiController.getPropertyStats);
router.get('/:id', propertiController.getPropertyById);
router.get('/:id/sales', propertiController.getPropertySalesHistory);
router.post('/', propertiController.createProperty);
router.put('/:id', propertiController.updateProperty);
router.delete('/:id', propertiController.deleteProperty);
router.patch('/:id/status', propertiController.updatePropertyStatus);

// Property sales routes
router.get('/:propertyId/sales', penjualanController.getAllSales);
router.post('/:propertyId/sales', penjualanController.createSale);

module.exports = router;