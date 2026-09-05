import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import { UserRole } from '../users/user.model';
import {
  addTeamMemberHandler,
  createTeamHandler,
  deleteTeamHandler,
  getTeamHandler,
  listTeamsHandler,
  removeTeamMemberHandler,
  updateTeamHandler,
} from './team.controller';
import {
  addTeamMemberSchema,
  createTeamSchema,
  listTeamsSchema,
  removeTeamMemberSchema,
  teamIdSchema,
  updateTeamSchema,
} from './team.validation';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Teams
 *   description: Team management
 */

/**
 * @swagger
 * /teams:
 *   post:
 *     summary: Create a team (PM/ADMIN)
 *     tags: [Teams]
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
 *               members: { type: array, items: { type: string } }
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', requireRole(UserRole.ADMIN, UserRole.PROJECT_MANAGER), validate(createTeamSchema), createTeamHandler);

/**
 * @swagger
 * /teams:
 *   get:
 *     summary: List teams
 *     tags: [Teams]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: page, in: query, schema: { type: integer } }
 *       - { name: limit, in: query, schema: { type: integer } }
 *       - { name: search, in: query, schema: { type: string } }
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/', validate(listTeamsSchema), listTeamsHandler);

/**
 * @swagger
 * /teams/{id}:
 *   get:
 *     summary: Get a team
 *     tags: [Teams]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/:id', validate(teamIdSchema), getTeamHandler);

/**
 * @swagger
 * /teams/{id}:
 *   patch:
 *     summary: Update a team
 *     tags: [Teams]
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
 *               status: { type: string, enum: [ACTIVE, ARCHIVED] }
 *     responses:
 *       200:
 *         description: OK
 */
router.patch('/:id', validate(updateTeamSchema), updateTeamHandler);

/**
 * @swagger
 * /teams/{id}:
 *   delete:
 *     summary: Delete a team
 *     tags: [Teams]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: OK
 */
router.delete('/:id', validate(teamIdSchema), deleteTeamHandler);

/**
 * @swagger
 * /teams/{id}/members:
 *   post:
 *     summary: Add a member to the team
 *     tags: [Teams]
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
router.post('/:id/members', validate(addTeamMemberSchema), addTeamMemberHandler);

/**
 * @swagger
 * /teams/{id}/members/{userId}:
 *   delete:
 *     summary: Remove a member from the team
 *     tags: [Teams]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *       - { name: userId, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: OK
 */
router.delete('/:id/members/:userId', validate(removeTeamMemberSchema), removeTeamMemberHandler);

export default router;