import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import { UserRole } from '../users/user.model';
import {
  addMemberHandler,
  createProjectHandler,
  deleteProjectHandler,
  getProjectHandler,
  listProjectsHandler,
  projectStatsHandler,
  removeMemberHandler,
  updateProjectHandler,
} from './project.controller';
import {
  addMemberSchema,
  createProjectSchema,
  listProjectsSchema,
  projectIdSchema,
  removeMemberSchema,
  updateProjectSchema,
} from './project.validation';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Project management
 */

/**
 * @swagger
 * /projects:
 *   post:
 *     summary: Create a project (PM/ADMIN)
 *     tags: [Projects]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               team: { type: string }
 *               members: { type: array, items: { type: string } }
 *               startDate: { type: string, format: date-time }
 *               deadline: { type: string, format: date-time }
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', requireRole(UserRole.ADMIN, UserRole.PROJECT_MANAGER), validate(createProjectSchema), createProjectHandler);

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: List projects
 *     tags: [Projects]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: page, in: query, schema: { type: integer } }
 *       - { name: limit, in: query, schema: { type: integer } }
 *       - { name: status, in: query, schema: { type: string } }
 *       - { name: search, in: query, schema: { type: string } }
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/', validate(listProjectsSchema), listProjectsHandler);

/**
 * @swagger
 * /projects/{id}:
 *   get:
 *     summary: Get a project
 *     tags: [Projects]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/:id', validate(projectIdSchema), getProjectHandler);

/**
 * @swagger
 * /projects/{id}:
 *   patch:
 *     summary: Update a project
 *     tags: [Projects]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               status: { type: string }
 *               deadline: { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: OK
 */
router.patch('/:id', validate(updateProjectSchema), updateProjectHandler);

/**
 * @swagger
 * /projects/{id}:
 *   delete:
 *     summary: Delete a project
 *     tags: [Projects]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: OK
 */
router.delete('/:id', validate(projectIdSchema), deleteProjectHandler);

/**
 * @swagger
 * /projects/{id}/members:
 *   post:
 *     summary: Add a member to the project
 *     tags: [Projects]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId: { type: string }
 *     responses:
 *       200:
 *         description: OK
 */
router.post('/:id/members', validate(addMemberSchema), addMemberHandler);

/**
 * @swagger
 * /projects/{id}/members/{userId}:
 *   delete:
 *     summary: Remove a member from the project
 *     tags: [Projects]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *       - { name: userId, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: OK
 */
router.delete('/:id/members/:userId', validate(removeMemberSchema), removeMemberHandler);

/**
 * @swagger
 * /projects/{id}/stats:
 *   get:
 *     summary: Get project statistics
 *     tags: [Projects]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/:id/stats', validate(projectIdSchema), projectStatsHandler);

export default router;