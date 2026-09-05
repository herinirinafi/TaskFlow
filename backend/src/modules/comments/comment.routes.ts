import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import {
  createCommentHandler,
  deleteCommentHandler,
  listCommentsHandler,
  updateCommentHandler,
} from './comment.controller';
import {
  commentIdSchema,
  createCommentSchema,
  listCommentsSchema,
  updateCommentSchema,
} from './comment.validation';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Task comments
 */

/**
 * @swagger
 * /tasks/{taskId}/comments:
 *   get:
 *     summary: List comments of a task
 *     tags: [Comments]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: taskId, in: path, required: true, schema: { type: string } }
 *       - { name: page, in: query, schema: { type: integer } }
 *       - { name: limit, in: query, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/tasks/:taskId/comments', validate(listCommentsSchema), listCommentsHandler);

/**
 * @swagger
 * /tasks/{taskId}/comments:
 *   post:
 *     summary: Add a comment to a task
 *     tags: [Comments]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: taskId, in: path, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content: { type: string }
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/tasks/:taskId/comments', validate(createCommentSchema), createCommentHandler);

/**
 * @swagger
 * /comments/{id}:
 *   patch:
 *     summary: Update a comment
 *     tags: [Comments]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content: { type: string }
 *     responses:
 *       200:
 *         description: OK
 */
router.patch('/comments/:id', validate(updateCommentSchema), updateCommentHandler);

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: OK
 */
router.delete('/comments/:id', validate(commentIdSchema), deleteCommentHandler);

export default router;