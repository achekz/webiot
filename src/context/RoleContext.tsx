// Contexte de gestion des rôles pour Smart Salle
// Gère les permissions et restrictions d'accès aux fonctionnalités selon le rôle

import type { ReactNode} from 'react';

import { useMemo, useContext, createContext } from 'react';

import { useAuth } from './AuthContext';

// Types de rôles disponibles dans l'application
export type Role = 'admin' | 'professeur' | 'non-authentifie';

// Type pour le contexte de rôles
interface RoleContextType {
  role: Role;
  isAdmin: boolean;
  isProfesseur: boolean;
  isAuthenticated: boolean;
  // Permissions
  canManageUsers: boolean;
  canViewAllRooms: boolean;
  canModifyRoomSettings: boolean;
  canViewStatistics: boolean;
}

// Création du contexte avec valeurs par défaut
const RoleContext = createContext<RoleContextType>({
  role: 'non-authentifie',
  isAdmin: false,
  isProfesseur: false,
  isAuthenticated: false,
  canManageUsers: false,
  canViewAllRooms: false,
  canModifyRoomSettings: false,
  canViewStatistics: false
});

// Hook personnalisé pour utiliser le contexte de rôles
export const useRole = () => useContext(RoleContext);

// Provider du contexte de rôles
interface RoleProviderProps {
  children: ReactNode;
}

export function RoleProvider({ children }: RoleProviderProps) {
  // Utilisation du contexte d'authentification
  const { currentUser } = useAuth();
  
  // Calcul des valeurs du contexte basé sur l'utilisateur actuel
  const value = useMemo(() => {
    // Déterminer le rôle de l'utilisateur
    const role: Role = currentUser 
      ? (currentUser.role === 'admin' ? 'admin' : 'professeur') 
      : 'non-authentifie';
    
    const isAdmin = role === 'admin';
    const isProfesseur = role === 'professeur';
    const isAuthenticated = !!currentUser;
    
    // Définir les permissions selon le rôle
    const canManageUsers = isAdmin;
    const canViewAllRooms = isAdmin;
    const canModifyRoomSettings = isAuthenticated;
    const canViewStatistics = isAuthenticated;
    
    return {
      role,
      isAdmin,
      isProfesseur,
      isAuthenticated,
      canManageUsers,
      canViewAllRooms,
      canModifyRoomSettings,
      canViewStatistics
    };
  }, [currentUser]);
  
  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
}

export default RoleContext;
