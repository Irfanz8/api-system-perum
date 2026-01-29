const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permissionController');
const { authenticateUser, isAdmin, isSuperAdmin } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     UserPermissions:
 *       type: object
 *       properties:
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *             email:
 *               type: string
 *             role:
 *               type: string
 *         divisions:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *         permissions:
 *           type: object
 *           additionalProperties:
 *             type: object
 *             properties:
 *               view:
 *                 type: boolean
 *               create:
 *                 type: boolean
 *               update:
 *                 type: boolean
 *               delete:
 *                 type: boolean
 */

/**
 * @swagger
 * /api/permissions/me:
 *   get:
 *     summary: Get current user's permissions (for frontend)
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserPermissions'
 */
router.get('/me', authenticateUser, permissionController.getMyPermissions);

/**
 * @swagger
 * /api/permissions/user/{userId}:
 *   get:
 *     summary: Get permissions for a specific user (Admin/Superadmin)
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User permissions
 */
router.get('/user/:userId', authenticateUser, isAdmin, permissionController.getUserPermissions);

/**
 * @swagger
 * /api/permissions/user/{userId}:
 *   put:
 *     summary: Set permissions for a user (Admin/Superadmin)
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
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
 *               - permissions
 *             properties:
 *               permissions:
 *                 type: object
 *                 description: Object with module codes as keys
 *                 example:
 *                   keuangan:
 *                     view: true
 *                     create: true
 *                     update: false
 *                     delete: false
 *                   properti:
 *                     view: true
 *                     create: false
 *                     update: false
 *                     delete: false
 *     responses:
 *       200:
 *         description: Permissions updated
 */
router.put('/user/:userId', authenticateUser, isAdmin, permissionController.setUserPermissions);

/**
 * @swagger
 * /api/permissions/bulk:
 *   post:
 *     summary: Bulk set permissions for multiple users (Admin/Superadmin)
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_ids
 *               - permissions
 *             properties:
 *               user_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *               permissions:
 *                 type: object
 *                 description: Object with module codes as keys
 *     responses:
 *       200:
 *         description: Permissions updated for all users
 */
router.post('/bulk', authenticateUser, isAdmin, permissionController.bulkSetPermissions);

module.exports = router;
