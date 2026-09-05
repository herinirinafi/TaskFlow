import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import { UserRole } from './user.model';
import {
  changePasswordHandler,
  getMeHandler,
  getUserByIdHandler,
  listUsersHandler,
  updateMeHandler,
  updateUserHandler,
} from './user.controller';
import {
  changePasswordSchema,
  listUsersSchema,
  updateMeSchema,
  updateUserBodySchema,
  updateUserParamsSchema,
} from './user.validation';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { $ref: '#/components/schemas/User' }
 */
router.get('/me', getMeHandler);

/**
 * @swagger
 * /users/me:
 *   patch:
 *     summary: Update current user profile
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               avatar: { type: string, nullable: true }
 *     responses:
 *       200:
 *         description: OK
 */
router.patch('/me', validate(updateMeSchema), updateMeHandler);

/**
 * @swagger
 * /users/me/password:
 *   patch:
 *     summary: Change current user password
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: string }
 *               newPassword: { type: string }
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Wrong current password
 */
router.patch('/me/password', validate(changePasswordSchema), changePasswordHandler);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: List users (admin)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: page, in: query, schema: { type: integer } }
 *       - { name: limit, in: query, schema: { type: integer } }
 *       - { name: search, in: query, schema: { type: string } }
 *       - { name: role, in: query, schema: { type: string, enum: [ADMIN, PROJECT_MANAGER, MEMBER] } }
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/', requireRole(UserRole.ADMIN, UserRole.PROJECT_MANAGER), validate(listUsersSchema), listUsersHandler);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by id (admin)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not found
 */
router.get('/:id', requireRole(UserRole.ADMIN, UserRole.PROJECT_MANAGER), validate(updateUserParamsSchema), getUserByIdHandler);

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: Update user role/status (admin)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               role: { type: string, enum: [ADMIN, PROJECT_MANAGER, MEMBER] }
 *               isActive: { type: boolean }
 *     responses:
 *       200:
 *         description: OK
 */
router.patch('/:id', requireRole(UserRole.ADMIN), validate(updateUserParamsSchema), validate(updateUserBodySchema), updateUserHandler);

export default router;