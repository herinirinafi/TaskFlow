import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import { UserRole } from '../users/user.model';
import {
  addChecklistItemHandler,
  assignTaskHandler,
  createTaskHandler,
  deleteTaskHandler,
  getTaskHandler,
  listTasksHandler,
  moveTaskHandler,
  removeChecklistItemHandler,
  updateChecklistItemHandler,
  updateTaskHandler,
  updateTaskStatusHandler,
} from './task.controller';
import {
  addChecklistItemSchema,
  assignTaskSchema,
  checklistSchema,
  createTaskSchema,
  listTasksSchema,
  moveTaskSchema,
  taskIdSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
} from './task.validation';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management
 */

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create a task (PM/ADMIN)
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, project]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               status: { type: string, enum: [TODO, IN_PROGRESS, DONE] }
 *               priority: { type: string, enum: [LOW, MEDIUM, HIGH, URGENT] }
 *               project: { type: string }
 *               assignedTo: { type: string, nullable: true }
 *               dueDate: { type: string, format: date-time }
 *               tags: { type: array, items: { type: string } }
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', requireRole(UserRole.ADMIN, UserRole.PROJECT_MANAGER), validate(createTaskSchema), createTaskHandler);

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: List tasks
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: page, in: query, schema: { type: integer } }
 *       - { name: limit, in: query, schema: { type: integer } }
 *       - { name: project, in: query, schema: { type: string } }
 *       - { name: status, in: query, schema: { type: string, enum: [TODO, IN_PROGRESS, DONE] } }
 *       - { name: priority, in: query, schema: { type: string } }
 *       - { name: assignedTo, in: query, schema: { type: string } }
 *       - { name: search, in: query, schema: { type: string } }
 *       - { name: sort, in: query, schema: { type: string, enum: [createdAt, dueDate, priority, updatedAt] } }
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/', validate(listTasksSchema), listTasksHandler);

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Get a task
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/:id', validate(taskIdSchema), getTaskHandler);

/**
 * @swagger
 * /tasks/{id}:
 *   patch:
 *     summary: Update a task
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               priority: { type: string, enum: [LOW, MEDIUM, HIGH, URGENT] }
 *               assignedTo: { type: string, nullable: true }
 *               dueDate: { type: string, format: date-time }
 *               tags: { type: array, items: { type: string } }
 *     responses:
 *       200:
 *         description: OK
 */
router.patch('/:id', validate(updateTaskSchema), updateTaskHandler);

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: OK
 */
router.delete('/:id', validate(taskIdSchema), deleteTaskHandler);

/**
 * @swagger
 * /tasks/{id}/status:
 *   patch:
 *     summary: Update task status
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [TODO, IN_PROGRESS, DONE] }
 *     responses:
 *       200:
 *         description: OK
 */
router.patch('/:id/status', validate(updateTaskStatusSchema), updateTaskStatusHandler);

/**
 * @swagger
 * /tasks/{id}/assign:
 *   patch:
 *     summary: Assign a task to a user
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [assignedTo]
 *             properties:
 *               assignedTo: { type: string, nullable: true }
 *     responses:
 *       200:
 *         description: OK
 */
router.patch('/:id/assign', validate(assignTaskSchema), assignTaskHandler);

/**
 * @swagger
 * /tasks/{id}/move:
 *   patch:
 *     summary: Move a task (Kanban drag & drop)
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status, order]
 *             properties:
 *               status: { type: string, enum: [TODO, IN_PROGRESS, DONE] }
 *               order: { type: integer }
 *     responses:
 *       200:
 *         description: OK
 */
router.patch('/:id/move', validate(moveTaskSchema), moveTaskHandler);

/**
 * @swagger
 * /tasks/{id}/checklist:
 *   post:
 *     summary: Add checklist item
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [text]
 *             properties:
 *               text: { type: string }
 *     responses:
 *       200:
 *         description: OK
 */
router.post('/:id/checklist', validate(addChecklistItemSchema), addChecklistItemHandler);

/**
 * @swagger
 * /tasks/{id}/checklist/{itemId}:
 *   patch:
 *     summary: Update checklist item
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *       - { name: itemId, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: OK
 */
router.patch('/:id/checklist/:itemId', validate(checklistSchema), updateChecklistItemHandler);

/**
 * @swagger
 * /tasks/{id}/checklist/{itemId}:
 *   delete:
 *     summary: Remove checklist item
 *     tags: [Tasks]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *       - { name: itemId, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: OK
 */
router.delete('/:id/checklist/:itemId', validate(checklistSchema), removeChecklistItemHandler);

export default router;