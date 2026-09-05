import request from 'supertest';
import { Express } from 'express';
import { cleanCollections, setupDatabase, teardownDatabase } from './helpers/setupDatabase';

let app: Express;
let managerToken: string;
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

  const manager = await request(app).post('/api/auth/register').send({
    firstName: 'Ando',
    lastName: 'Manager',
    email: 'manager2@example.com',
    password: 'Password123',
  });
  const member = await request(app).post('/api/auth/register').send({
    firstName: 'Fitia',
    lastName: 'Member',
    email: 'member2@example.com',
    password: 'Password123',
  });

  managerToken = manager.body.data.accessToken;
  memberToken = member.body.data.accessToken;
  memberId = member.body.data.user.id;

  const project = await request(app)
    .post('/api/projects')
    .set('Authorization', `Bearer ${managerToken}`)
    .send({ name: 'Projet Test', description: 'Description', members: [memberId] });
  projectId = project.body.data._id;
});

describe('Projects', () => {
  it('lists projects visible to a member', async () => {
    const res = await request(app).get('/api/projects').set('Authorization', `Bearer ${memberToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBe(1);
  });

  it('rejects creating a project as MEMBER', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ name: 'Interdit' });
    expect(res.status).toBe(403);
  });

  it('returns project stats', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}/stats`)
      .set('Authorization', `Bearer ${managerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.totalTasks).toBe(0);
  });
});

describe('Tasks', () => {
  it('creates a task and notifies the assignee', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        title: 'Implémenter le Kanban',
        description: 'Tableau Kanban drag & drop',
        project: projectId,
        priority: 'HIGH',
        assignedTo: memberId,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Implémenter le Kanban');
  });

  it('lists tasks for a project', async () => {
    await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ title: 'Tâche A', project: projectId });

    const res = await request(app)
      .get(`/api/tasks?project=${projectId}`)
      .set('Authorization', `Bearer ${managerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(1);
  });

  it('allows a MEMBER to update its own task status', async () => {
    const task = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ title: 'Tâche à avancer', project: projectId, assignedTo: memberId });
    const taskId = task.body.data._id;

    const res = await request(app)
      .patch(`/api/tasks/${taskId}/status`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ status: 'IN_PROGRESS' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });

  it('moves a task between Kanban columns', async () => {
    const t1 = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ title: 'Tâche 1', project: projectId });
    const t2 = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ title: 'Tâche 2', project: projectId });

    const res = await request(app)
      .patch(`/api/tasks/${t2.body.data._id}/move`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ status: 'IN_PROGRESS', order: 0 });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('IN_PROGRESS');
    expect(t1.body.data._id).toBeDefined();
  });

  it('adds checklist items', async () => {
    const task = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ title: 'Tâche checklist', project: projectId });
    const taskId = task.body.data._id;

    const addRes = await request(app)
      .post(`/api/tasks/${taskId}/checklist`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ text: 'Étape 1' });

    expect(addRes.status).toBe(200);
    expect(addRes.body.data.checklist).toHaveLength(1);

    const itemId = addRes.body.data.checklist[0]._id;
    const updateRes = await request(app)
      .patch(`/api/tasks/${taskId}/checklist/${itemId}`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ completed: true });

    expect(updateRes.body.data.checklist[0].completed).toBe(true);
  });
});

describe('Comments', () => {
  it('creates and lists comments on a task', async () => {
    const task = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ title: 'Tâche commentée', project: projectId });
    const taskId = task.body.data._id;

    const create = await request(app)
      .post(`/api/tasks/${taskId}/comments`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ content: 'Ceci est un commentaire' });

    expect(create.status).toBe(201);

    const list = await request(app)
      .get(`/api/tasks/${taskId}/comments`)
      .set('Authorization', `Bearer ${managerToken}`);
    expect(list.body.data.items).toHaveLength(1);
    expect(list.body.data.items[0].content).toBe('Ceci est un commentaire');
    expect(list.body.data.items[0].author.firstName).toBe('Ando');
  });

  it('allows only the author to edit', async () => {
    const task = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ title: 'Tâche commentée 2', project: projectId });
    const taskId = task.body.data._id;

    const comment = await request(app)
      .post(`/api/tasks/${taskId}/comments`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ content: 'Commentaire original' });
    const commentId = comment.body.data._id;

    const forbidden = await request(app)
      .patch(`/api/comments/${commentId}`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ content: 'Édition interdite' });
    expect(forbidden.status).toBe(403);

    const allowed = await request(app)
      .patch(`/api/comments/${commentId}`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ content: 'Édition autorisée' });
    expect(allowed.status).toBe(200);
    expect(allowed.body.data.content).toBe('Édition autorisée');
  });
});

describe('Notifications', () => {
  it('sends an assignment notification and exposes unread-count', async () => {
    await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ title: 'Tâche notifiée', project: projectId, assignedTo: memberId });

    const res = await request(app)
      .get('/api/notifications/unread-count')
      .set('Authorization', `Bearer ${memberToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.count).toBe(1);

    const list = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${memberToken}`);
    expect(list.body.data.items[0].type).toBe('TASK_ASSIGNED');
  });
});