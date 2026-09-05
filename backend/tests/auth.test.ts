import request from 'supertest';
import { Express } from 'express';
import { cleanCollections, setupDatabase, teardownDatabase } from './helpers/setupDatabase';

let app: Express;

beforeAll(async () => {
  await setupDatabase();
  app = (await import('../src/app')).default;
});

afterAll(async () => {
  await teardownDatabase();
});

describe('Auth', () => {
  afterEach(async () => {
    await cleanCollections(['users', 'refreshtokens', 'projects', 'tasks', 'comments', 'teams', 'notifications']);
  });

  it('GET /api/health returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ok');
  });

  describe('POST /api/auth/register', () => {
    it('registers a user and returns tokens', async () => {
      const res = await request(app).post('/api/auth/register').send({
        firstName: "Fi'tia",
        lastName: 'HERINIRINA',
        email: 'fitia@example.com',
        password: 'Password123',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('fitia@example.com');
      expect(res.body.data.user.role).toBe('ADMIN'); // premier utilisateur
      expect(typeof res.body.data.accessToken).toBe('string');
      expect(typeof res.body.data.refreshToken).toBe('string');
      expect(res.body.data.user.password).toBeUndefined();
    });

    it('rejects invalid payloads', async () => {
      const res = await request(app).post('/api/auth/register').send({
        firstName: 'A',
        lastName: 'B',
        email: 'not-an-email',
        password: 'short',
      });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('rejects duplicate email with 409', async () => {
      const payload = {
        firstName: 'Fitia',
        lastName: 'Rabe',
        email: 'duplicate@example.com',
        password: 'Password123',
      };
      await request(app).post('/api/auth/register').send(payload);
      const res = await request(app).post('/api/auth/register').send(payload);
      expect(res.status).toBe(409);
    });
  });

  describe('POST /api/auth/login', () => {
    it('logs in with valid credentials', async () => {
      await request(app).post('/api/auth/register').send({
        firstName: 'Fitia',
        lastName: 'Rabe',
        email: 'login@example.com',
        password: 'Password123',
      });

      const res = await request(app).post('/api/auth/login').send({
        email: 'login@example.com',
        password: 'Password123',
      });

      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('rejects wrong credentials with 401', async () => {
      await request(app).post('/api/auth/register').send({
        firstName: 'Fitia',
        lastName: 'Rabe',
        email: 'wrong@example.com',
        password: 'Password123',
      });

      const res = await request(app).post('/api/auth/login').send({
        email: 'wrong@example.com',
        password: 'WrongPass123',
      });
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('rotates the refresh token', async () => {
      const register = await request(app).post('/api/auth/register').send({
        firstName: 'Fitia',
        lastName: 'Rabe',
        email: 'refresh@example.com',
        password: 'Password123',
      });
      const refreshToken = register.body.data.refreshToken;

      const res = await request(app).post('/api/auth/refresh').send({ refreshToken });
      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).not.toBe(refreshToken);
    });

    it('rejects a used refresh token', async () => {
      const register = await request(app).post('/api/auth/register').send({
        firstName: 'Fitia',
        lastName: 'Rabe',
        email: 'refresh2@example.com',
        password: 'Password123',
      });
      await request(app).post('/api/auth/refresh').send({ refreshToken: register.body.data.refreshToken });

      const res = await request(app).post('/api/auth/refresh').send({
        refreshToken: register.body.data.refreshToken,
      });
      expect(res.status).toBe(401);
    });
  });

  describe('Protected routes', () => {
    it('returns 401 without a token', async () => {
      const res = await request(app).get('/api/users/me');
      expect(res.status).toBe(401);
    });

    it('returns 401 with an invalid token', async () => {
      const res = await request(app).get('/api/users/me').set('Authorization', 'Bearer invalid-token');
      expect(res.status).toBe(401);
    });
  });
});