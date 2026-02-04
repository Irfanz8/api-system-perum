import { Router } from 'express';
import { authenticateUser } from '../middleware/auth.js';
import {
  getDashboardStats,
  getFinanceChart,
  getPropertyStatus,
  getRecentTransactions,
  getSalesChart
} from '../controllers/dashboardController.js';

const router = Router();

/**
 * @route GET /api/dashboard/stats
 * @desc Get dashboard statistics with date filter
 * @query startDate - Start date (ISO format, default: 30 days ago)
 * @query endDate - End date (ISO format, default: today)
 */
router.get('/stats', authenticateUser, getDashboardStats);

/**
 * @route GET /api/dashboard/finance-chart
 * @desc Get financial chart data with date filter
 * @query startDate - Start date (ISO format)
 * @query endDate - End date (ISO format)
 * @query groupBy - Grouping: day | week | month (default: day)
 */
router.get('/finance-chart', authenticateUser, getFinanceChart);

/**
 * @route GET /api/dashboard/sales-chart
 * @desc Get sales chart data with date filter
 * @query startDate - Start date (ISO format)
 * @query endDate - End date (ISO format)
 * @query groupBy - Grouping: day | week | month (default: day)
 */
router.get('/sales-chart', authenticateUser, getSalesChart);

/**
 * @route GET /api/dashboard/property-status
 * @desc Get property status distribution
 */
router.get('/property-status', authenticateUser, getPropertyStatus);

/**
 * @route GET /api/dashboard/recent-transactions
 * @desc Get recent transactions (sales and financial)
 * @query limit - Number of items (default: 10, max: 50)
 */
router.get('/recent-transactions', authenticateUser, getRecentTransactions);

export default router;
