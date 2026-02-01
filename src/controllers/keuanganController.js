import FinancialTransaction from '../models/FinancialTransaction.js';

// Get all financial transactions
export const getAllTransactions = async (req, res) => {
  try {
    const filters = {
      type: req.query.type,
      category: req.query.category,
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      limit: req.query.limit ? parseInt(req.query.limit) : null
    };

    const transactions = await FinancialTransaction.getAll(filters);
    res.json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get transaction by ID
export const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await FinancialTransaction.getById(id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaksi tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Create new transaction
export const createTransaction = async (req, res) => {
  try {
    const { type, category, amount, description, transaction_date, property_id } = req.body;

    if (!type || !category || !amount || !transaction_date) {
      return res.status(400).json({
        success: false,
        error: 'Field type, category, amount, dan transaction_date wajib diisi'
      });
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Type harus berupa income atau expense'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount harus lebih dari 0'
      });
    }

    const transactionData = {
      type,
      category,
      amount: parseFloat(amount),
      description,
      transaction_date,
      property_id,
      created_by: req.user ? req.user.id : null
    };

    const transaction = await FinancialTransaction.create(transactionData);

    res.status(201).json({
      success: true,
      message: 'Transaksi berhasil dibuat',
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update transaction
export const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, category, amount, description, transaction_date, property_id } = req.body;

    if (type && !['income', 'expense'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Type harus berupa income atau expense'
      });
    }

    if (amount && amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount harus lebih dari 0'
      });
    }

    const transactionData = {
      type,
      category,
      amount: amount ? parseFloat(amount) : undefined,
      description,
      transaction_date,
      property_id
    };

    const transaction = await FinancialTransaction.update(id, transactionData);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaksi tidak ditemukan'
      });
    }

    res.json({
      success: true,
      message: 'Transaksi berhasil diupdate',
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Delete transaction
export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await FinancialTransaction.delete(id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaksi tidak ditemukan'
      });
    }

    res.json({
      success: true,
      message: 'Transaksi berhasil dihapus',
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get financial summary
export const getFinancialSummary = async (req, res) => {
  try {
    const filters = {
      start_date: req.query.start_date,
      end_date: req.query.end_date
    };

    const summary = await FinancialTransaction.getSummary(filters);

    let totalIncome = 0;
    let totalExpense = 0;

    summary.forEach(item => {
      if (item.type === 'income') {
        totalIncome += parseFloat(item.total_amount);
      } else if (item.type === 'expense') {
        totalExpense += parseFloat(item.total_amount);
      }
    });

    const balance = totalIncome - totalExpense;

    res.json({
      success: true,
      data: {
        total_income: totalIncome,
        total_expense: totalExpense,
        balance: balance,
        summary: summary
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};