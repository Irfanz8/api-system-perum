const express = require('express');
const router = express.Router();
const keuanganController = require('../controllers/keuanganController');

// Get all transactions
router.get('/', keuanganController.getAllTransactions);

// Get financial summary
router.get('/summary', keuanganController.getFinancialSummary);

// Get transaction by ID
router.get('/:id', keuanganController.getTransactionById);

// Create new transaction
router.post('/', keuanganController.createTransaction);

// Update transaction
router.put('/:id', keuanganController.updateTransaction);

// Delete transaction
router.delete('/:id', keuanganController.deleteTransaction);

module.exports = router;