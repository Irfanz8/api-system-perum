import express from 'express';
import * as divisionAdminController from '../controllers/divisionAdminController.js';
import { authenticateUser, isDivisionAdmin, canManageUser } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/division-admin/my-division:
 *   get:
 *     summary: Get division admin's own division information
 *     tags: [Division Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Division information
 *       403:
 *         description: User is not a division admin
 */
router.get('/my-division', authenticateUser, isDivisionAdmin, divisionAdminController.getMyDivision);

/**
 * @swagger
 * /api/division-admin/team:
 *   get:
 *     summary: Get all team members in division admin's division
 *     tags: [Division Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Team members list
 *       403:
 *         description: User is not a division admin
 */
router.get('/team', authenticateUser, isDivisionAdmin, divisionAdminController.getMyTeamMembers);

/**
 * @swagger
 * /api/division-admin/team/{userId}/permissions:
 *   patch:
 *     summary: Update team member's permissions (division admin only)
 *     tags: [Division Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - moduleCode
 *               - permissions
 *             properties:
 *               moduleCode:
 *                 type: string
 *               permissions:
 *                 type: object
 *                 properties:
 *                   can_view:
 *                     type: boolean
 *                   can_create:
 *                     type: boolean
 *                   can_update:
 *                     type: boolean
 *                   can_delete:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: Permissions updated successfully
 *       403:
 *         description: Not authorized to manage this user
 */
router.patch('/team/:userId/permissions', authenticateUser, isDivisionAdmin, canManageUser, divisionAdminController.updateMemberPermissions);

/**
 * @swagger
 * /api/division-admin/permissions-matrix:
 *   get:
 *     summary: Get permissions matrix for division admin's team
 *     tags: [Division Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Permissions matrix
 *       403:
 *         description: User is not a division admin
 */
router.get('/permissions-matrix', authenticateUser, isDivisionAdmin, divisionAdminController.getTeamPermissionsMatrix);

export default router;
