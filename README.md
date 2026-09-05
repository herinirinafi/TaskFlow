# TaskFlow — Organize. Collaborate. Achieve.

TaskFlow est une application web collaborative de gestion de tâches (mini-plateforme SaaS).
Elle permet à une équipe de créer des projets et des tâches, de les affecter, de suivre leur
progression via un tableau Kanban, de commenter, de recevoir des notifications et de suivre
les performances globales.

## Stack

| Couche              | Technologie              |
| ------------------- | ------------------------ |
| Frontend            | React.js                 |
| Langage             | TypeScript               |
| UI                  | Tailwind CSS             |
| State management    | Zustand                  |
| API Client          | Axios                    |
| Backend             | Node.js + Express.js     |
| Langage backend     | TypeScript               |
| Database            | MongoDB (Mongoose ODM)   |
| Auth                | JWT (access + refresh)   |
| Validation          | Zod                      |
| Tests               | Jest + Supertest         |
| API documentation   | Swagger / OpenAPI        |
| Sécurité            | Helmet, CORS, rate limiting |

## Structure du monorepo

```
TaskFlow/
├── backend/     # API Express + TypeScript + MongoDB
├── frontend/    # React + Vite + TypeScript + Tailwind
├── docker-compose.yml
└── README.md
```

## Fonctionnalités

- **Landing page** publique avec présentation du produit, fonctionnalités, technologies et CTA.
- **Auth** : inscription, connexion, refresh token, mot de passe oublié / réinitialisation.
- **Dashboard** : KPIs, graphique d'activité, tâches urgentes, membres actifs, progression des projets (vue globale pour ADMIN).
- **Tâches** : liste filtrable (statut, priorité, projet, « Mes tâches », recherche), détail avec checklist et commentaires.
- **Kanban** : drag & drop natif entre colonnes (TODO / IN_PROGRESS / DONE).
- **Calendrier** : vue mensuelle des échéances.
- **Projets** : CRUD, membres, statistiques d'avancement.
- **Équipe** : équipes + gestion des utilisateurs (ADMIN) et invitations aux projets.
- **Notifications** : tocante (dropdown) + page dédiée, marquage lu, tout-marquer-lu.
- **Profil / Paramètres** : présentation du profil, changement de mot de passe, édition des informations.

## Rôles

- **ADMIN** : gère les utilisateurs, les équipes, les projets et les permissions, consulte les statistiques globales.
- **PROJECT_MANAGER** : crée des projets, invite des membres, crée/affecte des tâches, gère les priorités, suit les performances.
- **MEMBER** : consulte ses tâches, modifie leur statut, commente, consulte ses projets, reçoit des notifications.

## API (résumé)

| Méthode | Route | Description |
| ------- | ----- | ----------- |
| POST    | `/api/auth/register` | Inscription |
| POST    | `/api/auth/login` | Connexion |
| POST    | `/api/auth/refresh` | Rafraîchir le token |
| POST    | `/api/auth/logout` | Déconnexion |
| POST    | `/api/auth/forgot-password` | Demande de réinitialisation |
| POST    | `/api/auth/reset-password` | Réinitialisation |
| GET/PATCH | `/api/users` · `/api/users/me` · `/api/users/me/password` | Utilisateurs |
| GET/POST/PATCH/DELETE | `/api/projects[/:id]`, `/api/projects/:id/members`, `/api/projects/:id/stats` | Projets |
| GET/POST/PATCH/DELETE | `/api/tasks[/:id]`, `/api/tasks/:id/status`, `/api/tasks/:id/assign`, `/api/tasks/:id/move`, `/api/tasks/:id/checklist` | Tâches |
| GET/POST | `/api/tasks/:id/comments` · PATCH/DELETE `/api/comments/:id` | Commentaires |
| GET/PATCH/DELETE | `/api/notifications`, `/api/notifications/unread-count`, `/api/notifications/:id/read`, `/api/notifications/read-all` | Notifications |
| GET/POST/PATCH/DELETE | `/api/teams` et membres | Équipes |
| GET    | `/api/dashboard/summary` | Statistiques |
| GET    | `/api/health` | Healthcheck |

## Démarrage rapide

### Prérequis
- Node.js 18+
- MongoDB (local ou Atlas)
- npm

### Installation

```bash
# Backend
cd backend
npm install
cp .env.example .env   # puis éditer les variables
npm run dev            # http://localhost:5000/api

# Documentation API disponible
# http://localhost:5000/api-docs

# Frontend
cd frontend
npm install
npm run dev            # http://localhost:5173
```

### Avec Docker

```bash
docker compose up --build
```

## Scripts

### Backend
| Script            | Description                                   |
| ----------------- | --------------------------------------------- |
| `npm run dev`     | Démarre le serveur avec rechargement (tsx)    |
| `npm run build`   | Compile TypeScript vers `dist/`               |
| `npm start`       | Lance le serveur compilé                     |
| `npm test`        | Lance Jest (unit + integration)              |
| `npm run lint`    | Vérifie le code avec ESLint                   |

### Frontend
| Script            | Description                                   |
| ----------------- | --------------------------------------------- |
| `npm run dev`     | Serveur de développement Vite                 |
| `npm run build`   | Build de production                           |
| `npm run preview` | Prévisualisation du build                     |

## Comptes de démonstration

Un script de seed (optionnel) peut créer les comptes suivants :
- `admin@taskflow.io` / `Admin123!`
- `manager@taskflow.io` / `Manager123!`
- `member@taskflow.io` / `Member123!`

## Déploiement

- **Frontend** : Vercel
- **Backend** : Render / Railway
- **Base de données** : MongoDB Atlas