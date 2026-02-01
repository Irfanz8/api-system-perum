import express from 'express';
import * as propertiController from '../controllers/propertiController.js';
import * as penjualanController from '../controllers/penjualanController.js';
import { authenticateUser } from '../middleware/auth.js';
import { checkPermission } from '../middleware/permissions.js';

const router = express.Router();

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
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of properties
 */
router.get('/', authenticateUser, checkPermission('PROPERTI_READ'), propertiController.getAllProperties);

/**
 * @swagger
 * /api/properti/available:
 *   get:
 *     summary: Get available properties
 *     tags: [Properti]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of available properties
 */
router.get('/available', authenticateUser, checkPermission('PROPERTI_READ'), propertiController.getAvailableProperties);

/**
 * @swagger
 * /api/properti/stats:
 *   get:
 *     summary: Get property statistics
 *     tags: [Properti]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Property statistics
 */
router.get('/stats', authenticateUser, checkPermission('PROPERTI_READ'), propertiController.getPropertyStats);

/**
 * @swagger
 * /api/properti/{id}:
 *   get:
 *     summary: Get property by ID
 *     tags: [Properti]
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
 *         description: Property details
 */
router.get('/:id', authenticateUser, checkPermission('PROPERTI_READ'), propertiController.getPropertyById);

/**
 * @swagger
 * /api/properti/{id}/sales:
 *   get:
 *     summary: Get property sales history
 *     tags: [Properti]
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
 *         description: Sales history
 */
router.get('/:id/sales', authenticateUser, checkPermission('PROPERTI_READ'), propertiController.getPropertySalesHistory);

/**
 * @swagger
 * /api/properti:
 *   post:
 *     summary: Create new property (Admin/Superadmin only)
 *     tags: [Properti]
 *     security:
 *       - bearerAuth: []
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
router.post('/', authenticateUser, checkPermission('PROPERTI_CREATE'), propertiController.createProperty);

/**
 * @swagger
 * /api/properti/{id}:
 *   put:
 *     summary: Update property (Admin/Superadmin only)
 *     tags: [Properti]
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
router.put('/:id', authenticateUser, checkPermission('PROPERTI_UPDATE'), propertiController.updateProperty);

/**
 * @swagger
 * /api/properti/{id}:
 *   delete:
 *     summary: Delete property (Admin/Superadmin only)
 *     tags: [Properti]
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
 *         description: Property deleted successfully
 */
router.delete('/:id', authenticateUser, checkPermission('PROPERTI_DELETE'), propertiController.deleteProperty);

/**
 * @swagger
 * /api/properti/{id}/status:
 *   patch:
 *     summary: Update property status (Admin/Superadmin only)
 *     tags: [Properti]
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
 *                 enum: [available, sold, reserved]
 *     responses:
 *       200:
 *         description: Status updated successfully
 */
router.patch('/:id/status', authenticateUser, checkPermission('PROPERTI_UPDATE_STATUS'), propertiController.updatePropertyStatus);

// Property sales routes
router.get('/:propertyId/sales', authenticateUser, checkPermission('PENJUALAN_READ'), penjualanController.getAllSales);
router.post('/:propertyId/sales', authenticateUser, checkPermission('PENJUALAN_CREATE'), penjualanController.createSale);

export default router;