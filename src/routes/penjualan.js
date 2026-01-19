const express = require('express');
const router = express.Router();
const penjualanController = require('../controllers/penjualanController');
const { authenticateUser } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

/**
 * @swagger
 * /api/penjualan:
 *   get:
 *     summary: Get all property sales
 *     tags: [Penjualan]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, cancelled]
 *       - in: query
 *         name: buyer_name
 *         schema:
 *           type: string
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of sales
 */
router.get('/', authenticateUser, checkPermission('PENJUALAN_READ'), penjualanController.getAllSales);

/**
 * @swagger
 * /api/penjualan/stats:
 *   get:
 *     summary: Get sales statistics
 *     tags: [Penjualan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Sales statistics
 */
router.get('/stats', authenticateUser, checkPermission('PENJUALAN_READ'), penjualanController.getSalesStats);

/**
 * @swagger
 * /api/penjualan/revenue/{year}:
 *   get:
 *     summary: Get monthly revenue for a year
 *     tags: [Penjualan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *           example: 2024
 *     responses:
 *       200:
 *         description: Monthly revenue data
 */
router.get('/revenue/:year', authenticateUser, checkPermission('PENJUALAN_READ'), penjualanController.getMonthlyRevenue);

/**
 * @swagger
 * /api/penjualan/{id}:
 *   get:
 *     summary: Get sale by ID
 *     tags: [Penjualan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Sale details
 */
router.get('/:id', authenticateUser, checkPermission('PENJUALAN_READ'), penjualanController.getSaleById);

/**
 * @swagger
 * /api/penjualan:
 *   post:
 *     summary: Create new property sale (Admin/Superadmin only)
 *     tags: [Penjualan]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - property_id
 *               - buyer_name
 *               - sale_price
 *               - sale_date
 *             properties:
 *               property_id:
 *                 type: integer
 *               buyer_name:
 *                 type: string
 *               buyer_email:
 *                 type: string
 *                 format: email
 *               buyer_phone:
 *                 type: string
 *               sale_price:
 *                 type: number
 *               sale_date:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [pending, completed, cancelled]
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Sale created successfully
 */
router.post('/', authenticateUser, checkPermission('PENJUALAN_CREATE'), penjualanController.createSale);

/**
 * @swagger
 * /api/penjualan/{id}:
 *   put:
 *     summary: Update sale (Admin/Superadmin only)
 *     tags: [Penjualan]
 *     security:
 *       - bearerAuth: []
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
 *               property_id:
 *                 type: integer
 *               buyer_name:
 *                 type: string
 *               sale_price:
 *                 type: number
 *               sale_date:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sale updated successfully
 */
router.put('/:id', authenticateUser, checkPermission('PENJUALAN_UPDATE'), penjualanController.updateSale);

/**
 * @swagger
 * /api/penjualan/{id}:
 *   delete:
 *     summary: Delete sale (Admin/Superadmin only)
 *     tags: [Penjualan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Sale deleted successfully
 */
router.delete('/:id', authenticateUser, checkPermission('PENJUALAN_DELETE'), penjualanController.deleteSale);

/**
 * @swagger
 * /api/penjualan/{id}/status:
 *   patch:
 *     summary: Update sale status (Admin/Superadmin only)
 *     tags: [Penjualan]
 *     security:
 *       - bearerAuth: []
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
 *                 enum: [pending, completed, cancelled]
 *     responses:
 *       200:
 *         description: Status updated successfully
 */
router.patch('/:id/status', authenticateUser, checkPermission('PENJUALAN_UPDATE'), penjualanController.updateSaleStatus);

/**
 * @swagger
 * /api/penjualan/{id}/complete:
 *   post:
 *     summary: Complete sale (creates financial transaction and updates property status) (Admin/Superadmin only)
 *     tags: [Penjualan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Sale completed successfully
 */
router.post('/:id/complete', authenticateUser, checkPermission('PENJUALAN_COMPLETE'), penjualanController.completeSale);

module.exports = router;