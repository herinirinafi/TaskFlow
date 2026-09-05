import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { env, isProduction } from './config/environment';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { apiLimiter, authLimiter } from './middleware/rateLimit.middleware';
import authRoutes from './modules/auth/auth.routes';
import commentRoutes from './modules/comments/comment.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import notificationRoutes from './modules/notifications/notification.routes';
import projectRoutes from './modules/projects/project.routes';
import taskRoutes from './modules/tasks/task.routes';
import teamRoutes from './modules/teams/team.routes';
import userRoutes from './modules/users/user.routes';

const app: Application = express();

// ————— Sécurité & parsing —————
app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (!isProduction) {
  app.use(morgan('dev'));
}

// ————— Swagger / OpenAPI —————
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TaskFlow API',
      version: '1.0.0',
      description: 'API de TaskFlow — plateforme collaborative de gestion de tâches',
    },
    servers: [{ url: '/api', description: 'API' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            fullName: { type: 'string' },
            email: { type: 'string' },
            avatar: { type: 'string', nullable: true },
            role: { type: 'string', enum: ['ADMIN', 'PROJECT_MANAGER', 'MEMBER'] },
          },
        },
        Task: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'DONE'] },
            priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] },
            project: { type: 'string' },
            assignedTo: { $ref: '#/components/schemas/User' },
            dueDate: { type: 'string', format: 'date-time' },
            tags: { type: 'array', items: { type: 'string' } },
          },
        },
        Project: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            owner: { $ref: '#/components/schemas/User' },
            members: { type: 'array', items: { $ref: '#/components/schemas/User' } },
            status: { type: 'string' },
            deadline: { type: 'string', format: 'date-time' },
          },
        },
        Comment: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            content: { type: 'string' },
            author: { $ref: '#/components/schemas/User' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  },
  apis: ['./src/modules/**/*.routes.ts'],
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ————— Rate limiting —————
if (isProduction) {
  app.use('/api/auth', authLimiter);
  app.use('/api', apiLimiter);
}

// ————— Routes —————
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: { status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api', commentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/', (_req: Request, res: Response) => {
  res.redirect('/api-docs');
});

// ————— 404 & erreurs —————
app.use(notFoundHandler);
app.use(errorHandler);

export default app;