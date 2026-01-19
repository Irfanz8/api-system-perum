const express = require('express');
const router = express.Router();
const persediaanController = require('../controllers/persediaanController');

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
 *     responses:
 *       200:
 *         description: List of inventory items
 */
router.get('/', persediaanController.getAllInventory);

/**
 * @swagger
 * /api/persediaan/low-stock:
 *   get:
 *     summary: Get low stock items
 *     tags: [Persediaan]
 *     responses:
 *       200:
 *         description: List of items with low stock
 */
router.get('/low-stock', persediaanController.getLowStockItems);

/**
 * @swagger
 * /api/persediaan/stats:
 *   get:
 *     summary: Get inventory statistics
 *     tags: [Persediaan]
 *     responses:
 *       200:
 *         description: Inventory statistics
 */
router.get('/stats', persediaanController.getInventoryStats);

/**
 * @swagger
 * /api/persediaan/{id}:
 *   get:
 *     summary: Get inventory item by ID
 *     tags: [Persediaan]
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
router.get('/:id', persediaanController.getInventoryById);

/**
 * @swagger
 * /api/persediaan/{id}/history:
 *   get:
 *     summary: Get inventory transaction history
 *     tags: [Persediaan]
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
router.get('/:id/history', persediaanController.getInventoryTransactionHistory);

/**
 * @swagger
 * /api/persediaan:
 *   post:
 *     summary: Create new inventory item
 *     tags: [Persediaan]
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
router.post('/', persediaanController.createInventory);

/**
 * @swagger
 * /api/persediaan/{id}:
 *   put:
 *     summary: Update inventory item
 *     tags: [Persediaan]
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
router.put('/:id', persediaanController.updateInventory);

/**
 * @swagger
 * /api/persediaan/{id}:
 *   delete:
 *     summary: Delete inventory item
 *     tags: [Persediaan]
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
router.delete('/:id', persediaanController.deleteInventory);

/**
 * @swagger
 * /api/persediaan/{id}/quantity:
 *   patch:
 *     summary: Update inventory quantity
 *     tags: [Persediaan]
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
router.patch('/:id/quantity', persediaanController.updateInventoryQuantity);

/**
 * @swagger
 * /api/persediaan/{id}/transaction:
 *   post:
 *     summary: Add inventory transaction (in/out)
 *     tags: [Persediaan]
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
router.post('/:id/transaction', persediaanController.addInventoryTransaction);

module.exports = router;