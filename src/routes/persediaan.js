import express from 'express';
import * as persediaanController from '../controllers/persediaanController.js';
import { authenticateUser } from '../middleware/auth.js';
import { checkPermission } from '../middleware/permissions.js';

const router = express.Router();

/**
 * @swagger
 * /api/persediaan:
 *   get:
 *     summary: Get all inventory items
 *     tags: [Persediaan]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: supplier
 *         schema:
 *           type: string
 *       - in: query
 *         name: low_stock
 *         schema:
 *           type: boolean
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of inventory items
 */
router.get('/', authenticateUser, checkPermission('PERSEDIAAN_READ'), persediaanController.getAllInventory);

/**
 * @swagger
 * /api/persediaan/low-stock:
 *   get:
 *     summary: Get low stock items
 *     tags: [Persediaan]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of items with low stock
 */
router.get('/low-stock', authenticateUser, checkPermission('PERSEDIAAN_READ'), persediaanController.getLowStockItems);

/**
 * @swagger
 * /api/persediaan/stats:
 *   get:
 *     summary: Get inventory statistics
 *     tags: [Persediaan]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventory statistics
 */
router.get('/stats', authenticateUser, checkPermission('PERSEDIAAN_READ'), persediaanController.getInventoryStats);

/**
 * @swagger
 * /api/persediaan/{id}:
 *   get:
 *     summary: Get inventory item by ID
 *     tags: [Persediaan]
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
 *         description: Inventory item details
 */
router.get('/:id', authenticateUser, checkPermission('PERSEDIAAN_READ'), persediaanController.getInventoryById);

/**
 * @swagger
 * /api/persediaan/{id}/history:
 *   get:
 *     summary: Get inventory transaction history
 *     tags: [Persediaan]
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
 *         description: Transaction history
 */
router.get('/:id/history', authenticateUser, checkPermission('PERSEDIAAN_READ'), persediaanController.getInventoryTransactionHistory);

/**
 * @swagger
 * /api/persediaan:
 *   post:
 *     summary: Create new inventory item (Admin/Superadmin only)
 *     tags: [Persediaan]
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
 *               - category
 *               - quantity
 *               - unit
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *                 example: material
 *               quantity:
 *                 type: integer
 *               unit:
 *                 type: string
 *                 example: pcs
 *               unit_price:
 *                 type: number
 *               supplier:
 *                 type: string
 *               min_stock:
 *                 type: integer
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Inventory item created successfully
 */
router.post('/', authenticateUser, checkPermission('PERSEDIAAN_CREATE'), persediaanController.createInventory);

/**
 * @swagger
 * /api/persediaan/{id}:
 *   put:
 *     summary: Update inventory item (Admin/Superadmin only)
 *     tags: [Persediaan]
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
 *               category:
 *                 type: string
 *               quantity:
 *                 type: integer
 *               unit:
 *                 type: string
 *     responses:
 *       200:
 *         description: Inventory item updated successfully
 */
router.put('/:id', authenticateUser, checkPermission('PERSEDIAAN_UPDATE'), persediaanController.updateInventory);

/**
 * @swagger
 * /api/persediaan/{id}:
 *   delete:
 *     summary: Delete inventory item (Admin/Superadmin only)
 *     tags: [Persediaan]
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
 *         description: Inventory item deleted successfully
 */
router.delete('/:id', authenticateUser, checkPermission('PERSEDIAAN_DELETE'), persediaanController.deleteInventory);

/**
 * @swagger
 * /api/persediaan/{id}/quantity:
 *   patch:
 *     summary: Update inventory quantity (Admin/Superadmin only)
 *     tags: [Persediaan]
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
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Quantity updated successfully
 */
router.patch('/:id/quantity', authenticateUser, checkPermission('PERSEDIAAN_UPDATE'), persediaanController.updateInventoryQuantity);

/**
 * @swagger
 * /api/persediaan/{id}/transaction:
 *   post:
 *     summary: Add inventory transaction (in/out) (Admin/Superadmin only)
 *     tags: [Persediaan]
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
 *               - type
 *               - quantity
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [in, out]
 *               quantity:
 *                 type: integer
 *               description:
 *                 type: string
 *               transaction_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Transaction added successfully
 */
router.post('/:id/transaction', authenticateUser, checkPermission('PERSEDIAAN_TRANSACTION'), persediaanController.addInventoryTransaction);

export default router;