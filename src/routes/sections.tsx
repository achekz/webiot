import type { RouteObject } from 'react-router';

import { lazy, Suspense } from 'react';
import { Outlet, Navigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { AuthLayout } from 'src/layouts/auth';
import MainLayout from 'src/layouts/main-layout';

// ----------------------------------------------------------------------

export const DashboardPage = lazy(() => import('src/pages/dashboard'));
export const SignInPage = lazy(() => import('src/pages/sign-in'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));

// Pages spécifiques à Smart Salle
export const AdminUtilisateursPage = lazy(() => import('src/pages/admin-utilisateurs'));
export const ControleSallePage = lazy(() => import('src/pages/controle-salle'));
export const StatistiquesPage = lazy(() => import('src/pages/statistiques'));
export const ProfilPage = lazy(() => import('src/pages/profil'));
export const InitialisationDBPage = lazy(() => import('src/pages/initialisation-db'));
export const CapteursPage = lazy(() => import('src/pages/capteurs'));
export const AdminParametresPage = lazy(() => import('src/pages/admin-parametres'));

const renderFallback = () => (
  <Box
    sx={{
      display: 'flex',
      flex: '1 1 auto',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <LinearProgress
      sx={{
        width: 1,
        maxWidth: 320,
        bgcolor: (theme) => theme.vars.palette.action.hover,
        [`& .${linearProgressClasses.bar}`]: { bgcolor: 'text.primary' },
      }}
    />
  </Box>
);

// Composant de garde pour protéger les routes qui nécessitent une authentification
const AuthGuard = lazy(() => import('../auth/auth-guard'));

export const routesSection: RouteObject[] = [
  {
    // Route racine redirige vers login
    path: '/',
    element: <Navigate to="/sign-in" />,
    index: true
  },
  {
    path: '/',
    element: (
      <AuthGuard>
        <MainLayout>
          <Suspense fallback={renderFallback()}>
            <Outlet />
          </Suspense>
        </MainLayout>
      </AuthGuard>
    ),
    children: [
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'controle-salle', element: <ControleSallePage /> },
      { path: 'statistiques', element: <StatistiquesPage /> },
      { path: 'admin-utilisateurs', element: <AdminUtilisateursPage /> },
      { path: 'profil', element: <ProfilPage /> },
      { path: 'initialisation-db', element: <InitialisationDBPage /> },
      { path: 'capteurs', element: <CapteursPage /> },
      { path: 'admin-parametres', element: <AdminParametresPage /> },
    ],
  },
  {
    path: 'sign-in',
    element: (
      <AuthLayout>
        <SignInPage />
      </AuthLayout>
    ),
  },
  {
    path: '404',
    element: <Page404 />,
  },
  { path: '*', element: <Page404 /> },
];
