const express = require('express');
const router = express.Router();
const moduleController = require('../controllers/moduleController');
const { authenticateUser, isAdmin, isSuperAdmin } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     Module:
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
 *         icon:
 *           type: string
 *         route:
 *           type: string
 *         is_active:
 *           type: boolean
 *         sort_order:
 *           type: integer
 */

/**
 * @swagger
 * /api/modules:
 *   get:
 *     summary: Get all modules
 *     tags: [Modules]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of modules
 */
router.get('/', authenticateUser, moduleController.getAllModules);

/**
 * @swagger
 * /api/modules/{id}:
 *   get:
 *     summary: Get module by ID
 *     tags: [Modules]
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
 *         description: Module details
 */
router.get('/:id', authenticateUser, moduleController.getModuleById);

/**
 * @swagger
 * /api/modules:
 *   post:
 *     summary: Create new module (Superadmin only)
 *     tags: [Modules]
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
 *               icon:
 *                 type: string
 *               route:
 *                 type: string
 *               sort_order:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Module created
 */
router.post('/', authenticateUser, isSuperAdmin, moduleController.createModule);

/**
 * @swagger
 * /api/modules/{id}:
 *   put:
 *     summary: Update module (Superadmin only)
 *     tags: [Modules]
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
 *               icon:
 *                 type: string
 *               route:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *               sort_order:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Module updated
 */
router.put('/:id', authenticateUser, isSuperAdmin, moduleController.updateModule);

/**
 * @swagger
 * /api/modules/{id}:
 *   delete:
 *     summary: Delete module (Superadmin only)
 *     tags: [Modules]
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
 *         description: Module deleted
 */
router.delete('/:id', authenticateUser, isSuperAdmin, moduleController.deleteModule);

module.exports = router;
