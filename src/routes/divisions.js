import express from 'express';
import * as divisionController from '../controllers/divisionController.js';
import { authenticateUser, isAdmin, isSuperAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Division:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         code:
 *           type: string
 *         description:
 *           type: string
 *         is_active:
 *           type: boolean
 *         user_count:
 *           type: integer
 *         created_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/divisions:
 *   get:
 *     summary: Get all divisions
 *     tags: [Divisions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of divisions
 */
router.get('/', authenticateUser, divisionController.getAllDivisions);

/**
 * @swagger
 * /api/divisions/{id}:
 *   get:
 *     summary: Get division by ID
 *     tags: [Divisions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Division details
 */
router.get('/:id', authenticateUser, divisionController.getDivisionById);

/**
 * @swagger
 * /api/divisions:
 *   post:
 *     summary: Create new division (Superadmin only)
 *     tags: [Divisions]
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
 *               - code
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Division created
 */
router.post('/', authenticateUser, isSuperAdmin, divisionController.createDivision);

/**
 * @swagger
 * /api/divisions/{id}:
 *   put:
 *     summary: Update division (Superadmin only)
 *     tags: [Divisions]
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
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               description:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Division updated
 */
router.put('/:id', authenticateUser, isSuperAdmin, divisionController.updateDivision);

/**
 * @swagger
 * /api/divisions/{id}:
 *   delete:
 *     summary: Delete division (Superadmin only)
 *     tags: [Divisions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Division deleted
 */
router.delete('/:id', authenticateUser, isSuperAdmin, divisionController.deleteDivision);

/**
 * @swagger
 * /api/divisions/{id}/users:
 *   get:
 *     summary: Get users in a division
 *     tags: [Divisions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of users in division
 */
router.get('/:id/users', authenticateUser, isAdmin, divisionController.getDivisionMembers);

/**
 * @swagger
 * /api/divisions/{id}/admin:
 *   post:
 *     summary: Assign user as division admin (Superadmin only)
 *     tags: [Divisions]
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
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: User assigned as division admin
 */
router.post('/:id/admin', authenticateUser, isSuperAdmin, divisionController.assignDivisionAdmin);

/**
 * @swagger
 * /api/divisions/{id}/admin/{userId}:
 *   delete:
 *     summary: Remove division admin (Superadmin only)
 *     tags: [Divisions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Division admin removed
 */
router.delete('/:id/admin/:userId', authenticateUser, isSuperAdmin, divisionController.removeDivisionAdmin);

/**
 * @swagger
 * /api/divisions/{id}/members:
 *   post:
 *     summary: Add member to division (Superadmin only)
 *     tags: [Divisions]
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
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Member added to division
 */
router.post('/:id/members', authenticateUser, isSuperAdmin, divisionController.addMemberToDivision);

/**
 * @swagger
 * /api/divisions/{id}/members/{userId}:
 *   delete:
 *     summary: Remove member from division (Superadmin only)
 *     tags: [Divisions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Member removed from division
 */
router.delete('/:id/members/:userId', authenticateUser, isSuperAdmin, divisionController.removeMemberFromDivision);

/**
 * @swagger
 * /api/divisions/{id}/users:
 *   post:
 *     summary: Assign user to division (Admin/Superadmin) - DEPRECATED, use /members
 *     tags: [Divisions]
 *     deprecated: true
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
 *               - user_id
 *             properties:
 *               user_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: User assigned to division
 */
router.post('/:id/users', authenticateUser, isAdmin, divisionController.addMemberToDivision);

/**
 * @swagger
 * /api/divisions/{id}/users/{userId}:
 *   delete:
 *     summary: Remove user from division (Admin/Superadmin) - DEPRECATED, use /members
 *     tags: [Divisions]
 *     deprecated: true
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User removed from division
 */
router.delete('/:id/users/:userId', authenticateUser, isAdmin, divisionController.removeMemberFromDivision);

export default router;
