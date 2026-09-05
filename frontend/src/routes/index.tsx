import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { Calendar } from '@/pages/Calendar';
import { Dashboard } from '@/pages/Dashboard';
import { ForgotPassword } from '@/pages/ForgotPassword';
import { Kanban } from '@/pages/Kanban';
import { Landing } from '@/pages/Landing';
import { Login } from '@/pages/Login';
import { NotFound } from '@/pages/NotFound';
import { Notifications } from '@/pages/Notifications';
import { Profile } from '@/pages/Profile';
import { Projects } from '@/pages/Projects';
import { Register } from '@/pages/Register';
import { ResetPassword } from '@/pages/ResetPassword';
import { Settings } from '@/pages/Settings';
import { Tasks } from '@/pages/Tasks';
import { Team } from '@/pages/Team';
import { USER_ROLES } from '@/utils/constants';

export const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  { path: '/reset-password', element: <ResetPassword /> },
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'tasks', element: <Tasks /> },
      { path: 'kanban', element: <Kanban /> },
      { path: 'calendar', element: <Calendar /> },
      { path: 'projects', element: <Projects /> },
      { path: 'projects/:id', element: <Projects /> },
      { path: 'team', element: <Team /> },
      { path: 'notifications', element: <Notifications /> },
      { path: 'profile', element: <Profile /> },
      {
        path: 'settings',
        element: (
          <ProtectedRoute roles={[...USER_ROLES]}>
            <Settings />
          </ProtectedRoute>
        ),
      },
    ],
  },
  { path: '/404', element: <NotFound /> },
  { path: '*', element: <Navigate to="/404" replace /> },
]);