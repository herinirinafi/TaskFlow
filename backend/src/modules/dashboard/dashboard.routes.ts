import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { getDashboardHandler } from './dashboard.controller';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Global statistics
 */

/**
 * @swagger
 * /dashboard/summary:
 *   get:
 *     summary: Get KPIs, activity, recent/urgent tasks, member & project progress
 *     tags: [Dashboard]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/summary', getDashboardHandler);

export default router;