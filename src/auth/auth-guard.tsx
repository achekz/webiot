// Composant garde d'authentification pour Smart Salle
// Protège les routes en vérifiant si l'utilisateur est authentifié

import type { ReactNode} from 'react';

import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

// ----------------------------------------------------------------------

interface AuthGuardProps {
  children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { currentUser, loading } = useAuth();
  const { pathname } = useLocation();

  // Si le chargement est en cours, on peut afficher un indicateur de chargement
  if (loading) {
    return (
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid rgba(0, 0, 0, 0.1)', borderRadius: '50%', borderTopColor: '#3f51b5', animation: 'spin 1s ease-in-out infinite' }} />
        <p>Vérification de l&apos;authentification...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Si l'utilisateur n'est pas authentifié, rediriger vers la page de connexion
  if (!currentUser) {
    return <Navigate to="/sign-in" state={{ from: pathname }} replace />;
  }

  // Si l'utilisateur est authentifié, afficher les enfants (le contenu protégé)
  return <>{children}</>;
}
