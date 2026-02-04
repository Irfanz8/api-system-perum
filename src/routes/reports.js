import { Router } from 'express';
import { authenticateUser, isSuperAdmin } from '../middleware/auth.js';
import {
  exportKeuangan,
  exportProperti,
  exportPenjualan,
  exportPersediaan,
  exportUsers
} from '../controllers/exportController.js';

const router = Router();

/**
 * @route GET /api/reports/keuangan/export
 * @desc Export financial transactions report
 * @query format - Export format: csv (default: csv)
 * @query startDate - Filter start date (ISO format)
 * @query endDate - Filter end date (ISO format)
 * @query columns - Comma-separated list of columns to include
 */
router.get('/keuangan/export', authenticateUser, exportKeuangan);

/**
 * @route GET /api/reports/properti/export
 * @desc Export properties report
 * @query format - Export format: csv (default: csv)
 * @query status - Filter by status (available, sold, reserved)
 * @query type - Filter by property type
 * @query columns - Comma-separated list of columns to include
 */
router.get('/properti/export', authenticateUser, exportProperti);

/**
 * @route GET /api/reports/penjualan/export
 * @desc Export sales report
 * @query format - Export format: csv (default: csv)
 * @query startDate - Filter start date (ISO format)
 * @query endDate - Filter end date (ISO format)
 * @query status - Filter by status (pending, completed, cancelled)
 * @query columns - Comma-separated list of columns to include
 */
router.get('/penjualan/export', authenticateUser, exportPenjualan);

/**
 * @route GET /api/reports/persediaan/export
 * @desc Export inventory report
 * @query format - Export format: csv (default: csv)
 * @query category - Filter by category
 * @query lowStock - Filter low stock items only (true/false)
 * @query columns - Comma-separated list of columns to include
 */
router.get('/persediaan/export', authenticateUser, exportPersediaan);

/**
 * @route GET /api/reports/users/export
 * @desc Export users report (superadmin only)
 * @query format - Export format: csv (default: csv)
 * @query role - Filter by role
 * @query columns - Comma-separated list of columns to include
 */
router.get('/users/export', authenticateUser, isSuperAdmin, exportUsers);

export default router;
