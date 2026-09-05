import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import {
  deleteNotificationHandler,
  listNotificationsHandler,
  markAllAsReadHandler,
  markAsReadHandler,
  unreadCountHandler,
} from './notification.controller';
import { listNotificationsSchema, notificationIdSchema } from './notification.validation';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: User notifications
 */

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: List notifications
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: page, in: query, schema: { type: integer } }
 *       - { name: limit, in: query, schema: { type: integer } }
 *       - { name: unreadOnly, in: query, schema: { type: boolean } }
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/', validate(listNotificationsSchema), listNotificationsHandler);

/**
 * @swagger
 * /notifications/unread-count:
 *   get:
 *     summary: Get unread notifications count
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/unread-count', unreadCountHandler);

/**
 * @swagger
 * /notifications/read-all:
 *   patch:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: OK
 */
router.patch('/read-all', markAllAsReadHandler);

router.patch('/:id/read', validate(notificationIdSchema), markAsReadHandler);

/**
 * @swagger
 * /notifications/{id}:
 *   patch:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: OK
 */
router.patch('/:id', validate(notificationIdSchema), markAsReadHandler);

/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     summary: Delete a notification
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200:
 *         description: OK
 */
router.delete('/:id', validate(notificationIdSchema), deleteNotificationHandler);

export default router;