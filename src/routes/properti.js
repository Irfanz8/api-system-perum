const express = require('express');
const router = express.Router();
const propertiController = require('../controllers/propertiController');
const penjualanController = require('../controllers/penjualanController');

/**
 * @swagger
 * /api/properti:
 *   get:
 *     summary: Get all properties
 *     tags: [Properti]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [available, sold, reserved]
 *       - in: query
 *         name: min_price
 *         schema:
 *           type: number
 *       - in: query
 *         name: max_price
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: List of properties
 */
router.get('/', propertiController.getAllProperties);

/**
 * @swagger
 * /api/properti/available:
 *   get:
 *     summary: Get available properties
 *     tags: [Properti]
 *     responses:
 *       200:
 *         description: List of available properties
 */
router.get('/available', propertiController.getAvailableProperties);

/**
 * @swagger
 * /api/properti/stats:
 *   get:
 *     summary: Get property statistics
 *     tags: [Properti]
 *     responses:
 *       200:
 *         description: Property statistics
 */
router.get('/stats', propertiController.getPropertyStats);

/**
 * @swagger
 * /api/properti/{id}:
 *   get:
 *     summary: Get property by ID
 *     tags: [Properti]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Property details
 */
router.get('/:id', propertiController.getPropertyById);

/**
 * @swagger
 * /api/properti/{id}/sales:
 *   get:
 *     summary: Get property sales history
 *     tags: [Properti]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Sales history
 */
router.get('/:id/sales', propertiController.getPropertySalesHistory);

/**
 * @swagger
 * /api/properti:
 *   post:
 *     summary: Create new property
 *     tags: [Properti]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *               - address
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 example: rumah
 *               address:
 *                 type: string
 *               price:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [available, sold, reserved]
 *               description:
 *                 type: string
 *               luas_tanah:
 *                 type: number
 *               luas_bangunan:
 *                 type: number
 *               jumlah_kamar:
 *                 type: integer
 *               jumlah_kamar_mandi:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Property created successfully
 */
router.post('/', propertiController.createProperty);

/**
 * @swagger
 * /api/properti/{id}:
 *   put:
 *     summary: Update property
 *     tags: [Properti]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *               address:
 *                 type: string
 *               price:
 *                 type: number
 *               status:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Property updated successfully
 */
router.put('/:id', propertiController.updateProperty);

/**
 * @swagger
 * /api/properti/{id}:
 *   delete:
 *     summary: Delete property
 *     tags: [Properti]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Property deleted successfully
 */
router.delete('/:id', propertiController.deleteProperty);

/**
 * @swagger
 * /api/properti/{id}/status:
 *   patch:
 *     summary: Update property status
 *     tags: [Properti]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [available, sold, reserved]
 *     responses:
 *       200:
 *         description: Status updated successfully
 */
router.patch('/:id/status', propertiController.updatePropertyStatus);

// Property sales routes
router.get('/:propertyId/sales', penjualanController.getAllSales);
router.post('/:propertyId/sales', penjualanController.createSale);

module.exports = router;