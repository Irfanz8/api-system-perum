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
router.get('/:id/users', authenticateUser, isAdmin, divisionController.getDivisionUsers);

/**
 * @swagger
 * /api/divisions/{id}/users:
 *   post:
 *     summary: Assign user to division (Admin/Superadmin)
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
 *               - user_id
 *             properties:
 *               user_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: User assigned to division
 */
router.post('/:id/users', authenticateUser, isAdmin, divisionController.assignUserToDivision);

/**
 * @swagger
 * /api/divisions/{id}/users/{userId}:
 *   delete:
 *     summary: Remove user from division (Admin/Superadmin)
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
 *         description: User removed from division
 */
router.delete('/:id/users/:userId', authenticateUser, isAdmin, divisionController.removeUserFromDivision);

export default router;
