import request from 'supertest';
import { Express } from 'express';
import { cleanCollections, setupDatabase, teardownDatabase } from './helpers/setupDatabase';

let app: Express;
let adminToken: string;
let memberToken: string;
let memberId: string;
let projectId: string;

beforeAll(async () => {
  await setupDatabase();
  app = (await import('../src/app')).default;
});

afterAll(async () => {
  await teardownDatabase();
});

beforeEach(async () => {
  await cleanCollections(['users', 'refreshtokens', 'projects', 'tasks', 'comments', 'teams', 'notifications']);

  const admin = await request(app).post('/api/auth/register').send({
    firstName: 'Admin',
    lastName: 'Root',
    email: 'admin.dash@example.com',
    password: 'Password123',
  });
  const member = await request(app).post('/api/auth/register').send({
    firstName: 'Fitia',
    lastName: 'Member',
    email: 'member.dash@example.com',
    password: 'Password123',
  });

  adminToken = admin.body.data.accessToken;
  memberToken = member.body.data.accessToken;
  memberId = member.body.data.user.id;

  const project = await request(app)
    .post('/api/projects')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: 'Projet Dashboard', members: [memberId] });
  projectId = project.body.data._id;

  await request(app)
    .post('/api/tasks')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ title: 'Tâche 1', project: projectId, priority: 'URGENT', assignedTo: memberId });
  await request(app)
    .post('/api/tasks')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ title: 'Tâche 2', project: projectId, status: 'IN_PROGRESS' });
});

describe('Dashboard', () => {
  it('returns KPIs for a member', async () => {
    const res = await request(app)
      .get('/api/dashboard/summary')
      .set('Authorization', `Bearer ${memberToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.kpis.totalTasks).toBe(2);
    expect(res.body.data.kpis.todo).toBe(1);
    expect(res.body.data.kpis.inProgress).toBe(1);
    expect(res.body.data.kpis.done).toBe(0);
    expect(res.body.data.kpis.urgent).toBe(1);
    expect(res.body.data.activity).toHaveLength(7);
    expect(Array.isArray(res.body.data.urgentTasks)).toBe(true);
    expect(res.body.data.global).toBeUndefined();
  });

  it('returns global stats for an admin', async () => {
    const res = await request(app)
      .get('/api/dashboard/summary')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.global.totalUsers).toBe(2);
    expect(res.body.data.global.totalProjects).toBe(1);
  });
});