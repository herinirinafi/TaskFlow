import mongoose from 'mongoose';
import { connectDatabase } from '../config/database';
import { env } from '../config/environment';
import UserModel, { UserRole } from '../modules/users/user.model';
import TeamModel from '../modules/teams/team.model';
import ProjectModel, { ProjectStatus } from '../modules/projects/project.model';
import TaskModel, { TaskPriority, TaskStatus } from '../modules/tasks/task.model';

const users = [
  { firstName: 'Admin', lastName: 'TaskFlow', email: 'admin@taskflow.io', password: 'Admin123!', role: UserRole.ADMIN },
  { firstName: 'Ando', lastName: 'Manager', email: 'manager@taskflow.io', password: 'Manager123!', role: UserRole.PROJECT_MANAGER },
  { firstName: 'Fitia', lastName: 'Member', email: 'member@taskflow.io', password: 'Member123!', role: UserRole.MEMBER },
  { firstName: 'Lova', lastName: 'Member', email: 'lova@taskflow.io', password: 'Member123!', role: UserRole.MEMBER },
  { firstName: 'Miora', lastName: 'Member', email: 'miora@taskflow.io', password: 'Member123!', role: UserRole.MEMBER },
];

async function seed(): Promise<void> {
  if (env.NODE_ENV === 'production') {
    // eslint-disable-next-line no-console
    console.warn('Seed refused in production.');
    process.exit(0);
  }

  await connectDatabase();
  await mongoose.connection.dropDatabase();

  // eslint-disable-next-line no-console
  console.log('[seed] Creating users...');
  const createdUsers = [];
  for (const u of users) {
    const user = await UserModel.create(u);
    createdUsers.push(user);
    // eslint-disable-next-line no-console
    console.log(`[seed]   ${user.email} (${user.role})`);
  }
  const [admin, manager, member, lova, miora] = createdUsers;

  // eslint-disable-next-line no-console
  console.log('[seed] Creating team...');
  const team = await TeamModel.create({
    name: 'Équipe Produit',
    description: "L'équipe en charge du développement produit chez TaskFlow.",
    owner: manager._id,
    members: [manager._id, member._id, lova._id, miora._id, admin._id],
  });

  // eslint-disable-next-line no-console
  console.log('[seed] Creating projects...');
  const projects: mongoose.Types.ObjectId[] = [];
  const projectData = [
    { name: 'TaskFlow SaaS', status: ProjectStatus.ACTIVE, description: 'La plateforme elle-même.' },
    { name: 'Refonte Marketing', status: ProjectStatus.PLANNING, description: 'Nouveau site vitrine et campagnes.' },
    { name: 'Mobile App', status: ProjectStatus.ON_HOLD, description: 'Application mobile React Native.' },
  ];
  for (const p of projectData) {
    const project = await ProjectModel.create({
      name: p.name,
      description: p.description,
      owner: manager._id,
      team: team._id,
      members: [manager._id, member._id, lova._id, miora._id, admin._id],
      status: p.status,
      startDate: new Date(),
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    });
    projects.push(project._id);
    // eslint-disable-next-line no-console
    console.log(`[seed]   ${project.name} (${project.status})`);
  }

  // eslint-disable-next-line no-console
  console.log('[seed] Creating tasks...');
  const tasksData = [
    { title: 'Authentification JWT', priority: TaskPriority.HIGH, project: 0, status: TaskStatus.DONE, assignee: 1 },
    { title: 'Tableau Kanban', priority: TaskPriority.HIGH, project: 0, status: TaskStatus.IN_PROGRESS, assignee: 2 },
    { title: 'Dashboard KPIs', priority: TaskPriority.MEDIUM, project: 0, status: TaskStatus.IN_PROGRESS, assignee: 1 },
    { title: 'Notifications échéance', priority: TaskPriority.URGENT, project: 0, status: TaskStatus.TODO, assignee: 3 },
    { title: 'Système de commentaires', priority: TaskPriority.MEDIUM, project: 0, status: TaskStatus.TODO, assignee: 4, dueInDays: 2 },
    { title: 'Recherche globale', priority: TaskPriority.LOW, project: 0, status: TaskStatus.TODO, assignee: 2, dueInDays: 9 },
    { title: 'Landing page v2', priority: TaskPriority.HIGH, project: 1, status: TaskStatus.TODO, assignee: 4 },
    { title: 'Logo & identité', priority: TaskPriority.MEDIUM, project: 1, status: TaskStatus.DONE, assignee: 1 },
    { title: 'Specs application mobile', priority: TaskPriority.LOW, project: 2, status: TaskStatus.IN_PROGRESS, assignee: 2 },
  ];

  const projectTasks: Record<number, number> = { 0: 0, 1: 0, 2: 0 };
  for (const t of tasksData) {
    const projectId = projects[t.project];
    const order = projectTasks[t.project];
    projectTasks[t.project] += 1;
    await TaskModel.create({
      title: t.title,
      description: `Description de la tâche « ${t.title} ».`,
      priority: t.priority,
      project: projectId,
      status: t.status,
      assignedTo: createdUsers[t.assignee]._id,
      createdBy: manager._id,
      dueDate: new Date(Date.now() + (t.dueInDays ?? 5) * 24 * 60 * 60 * 1000),
      tags: ['core', t.status.toLowerCase()],
      order,
      checklist: [
        { text: 'Analyser les besoins', completed: true },
        { text: 'Implémenter', completed: false },
      ],
    });
  }
  // eslint-disable-next-line no-console
  console.log(`[seed]   ${tasksData.length} tasks created`);

  // eslint-disable-next-line no-console
  console.log('\n[seed] Done. Comptes disponibles :');
  // eslint-disable-next-line no-console
  console.log('  admin@taskflow.io  / Admin123!');
  // eslint-disable-next-line no-console
  console.log('  manager@taskflow.io / Manager123!');
  // eslint-disable-next-line no-console
  console.log('  member@taskflow.io / Member123!');

  await mongoose.disconnect();
}

seed()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('[seed] Error:', err);
    process.exit(1);
  })
  .then(() => process.exit(0));