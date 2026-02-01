import express from 'express';
import * as roleController from '../controllers/roleController.js';
import { authenticateUser, isSuperAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/roles/hierarchy:
 *   get:
 *     summary: Get role hierarchy dan informasi (Superadmin only)
 *     tags: [Role Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Role hierarchy information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     superadmin:
 *                       type: object
 *                       properties:
 *                         level:
 *                           type: integer
 *                         description:
 *                           type: string
 *                         permissions:
 *                           type: array
 *                         canManage:
 *                           type: array
 */
router.get('/hierarchy', authenticateUser, isSuperAdmin, roleController.getRoleHierarchy);

/**
 * @swagger
 * /api/roles/{role}/permissions:
 *   get:
 *     summary: Get permissions untuk suatu role (Superadmin only)
 *     tags: [Role Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: role
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, admin, superadmin]
 *     responses:
 *       200:
 *         description: Role permissions
 */
router.get('/:role/permissions', authenticateUser, isSuperAdmin, roleController.getRolePermissionsHandler);

/**
 * @swagger
 * /api/roles/permissions/matrix:
 *   get:
 *     summary: Get permissions matrix untuk semua role (Superadmin only)
 *     tags: [Role Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Permissions matrix
 */
router.get('/permissions/matrix', authenticateUser, isSuperAdmin, roleController.getPermissionsMatrix);

/**
 * @swagger
 * /api/roles/users:
 *   get:
 *     summary: Get all users dengan role dan permissions mereka (Superadmin only)
 *     tags: [Role Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users with roles and permissions
 */
router.get('/users', authenticateUser, isSuperAdmin, roleController.getUsersWithRoles);

/**
 * @swagger
 * /api/roles/users/{role}:
 *   get:
 *     summary: Get users by role (Superadmin only)
 *     tags: [Role Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: role
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, admin, superadmin]
 *     responses:
 *       200:
 *         description: List of users with the specified role
 */
router.get('/users/:role', authenticateUser, isSuperAdmin, roleController.getUsersByRole);

/**
 * @swagger
 * /api/roles/users/{id}/role:
 *   patch:
 *     summary: Update user role dengan validasi hierarki (Superadmin only)
 *     tags: [Role Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, admin, superadmin]
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       403:
 *         description: Permission denied (cannot change role of user with same or higher level)
 */
router.patch('/users/:id/role', authenticateUser, isSuperAdmin, roleController.updateUserRole);

/**
 * @swagger
 * /api/roles/statistics:
 *   get:
 *     summary: Get role statistics (Superadmin only)
 *     tags: [Role Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Role statistics
 */
router.get('/statistics', authenticateUser, isSuperAdmin, roleController.getRoleStatistics);

/**
 * @swagger
 * /api/roles/{role}/features:
 *   get:
 *     summary: Get feature access untuk suatu role dengan detail endpoint (Superadmin only)
 *     tags: [Role Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: role
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, admin, superadmin]
 *     responses:
 *       200:
 *         description: Feature access details for the role
 */
router.get('/:role/features', authenticateUser, isSuperAdmin, roleController.getRoleFeatureAccess);

export default router;
