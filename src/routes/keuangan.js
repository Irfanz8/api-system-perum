const express = require('express');
const router = express.Router();
const keuanganController = require('../controllers/keuanganController');

/**
 * @swagger
 * /api/keuangan:
 *   get:
 *     summary: Get all financial transactions
 *     tags: [Keuangan]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [income, expense]
 *       - in: query
 *         name: category
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
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of transactions
 */
router.get('/', keuanganController.getAllTransactions);

/**
 * @swagger
 * /api/keuangan/summary:
 *   get:
 *     summary: Get financial summary
 *     tags: [Keuangan]
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
 *         description: Financial summary
 */
router.get('/summary', keuanganController.getFinancialSummary);

/**
 * @swagger
 * /api/keuangan/{id}:
 *   get:
 *     summary: Get transaction by ID
 *     tags: [Keuangan]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Transaction details
 *       404:
 *         description: Transaction not found
 */
router.get('/:id', keuanganController.getTransactionById);

/**
 * @swagger
 * /api/keuangan:
 *   post:
 *     summary: Create new financial transaction
 *     tags: [Keuangan]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - category
 *               - amount
 *               - transaction_date
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *               category:
 *                 type: string
 *                 example: penjualan
 *               amount:
 *                 type: number
 *                 example: 500000000
 *               description:
 *                 type: string
 *               transaction_date:
 *                 type: string
 *                 format: date
 *               property_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Transaction created successfully
 */
router.post('/', keuanganController.createTransaction);

/**
 * @swagger
 * /api/keuangan/{id}:
 *   put:
 *     summary: Update transaction
 *     tags: [Keuangan]
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
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *               category:
 *                 type: string
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *               transaction_date:
 *                 type: string
 *                 format: date
 *               property_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Transaction updated successfully
 */
router.put('/:id', keuanganController.updateTransaction);

/**
 * @swagger
 * /api/keuangan/{id}:
 *   delete:
 *     summary: Delete transaction
 *     tags: [Keuangan]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Transaction deleted successfully
 */
router.delete('/:id', keuanganController.deleteTransaction);

module.exports = router;