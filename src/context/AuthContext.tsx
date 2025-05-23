// Contexte d'authentification pour Smart Salle
// Gère l'état de connexion et les informations utilisateur à travers l'application

// types
import type { ReactNode } from 'react';
import type { User } from 'firebase/auth';

import { doc, getDoc } from 'firebase/firestore';
import { useState, useEffect, useContext, createContext } from 'react';
import { signOut, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';

import { db, auth } from '../services/firebaseClient';

// Type pour les informations utilisateur étendues
export interface UserInfo extends User {
  role?: 'admin' | 'professeur';
  salleAssignee?: string | null;
  nom?: string;
  prenom?: string;
}

// Type pour les résultats d'authentification
interface AuthResult {
  utilisateur: UserInfo | null;
  erreur: string | null;
}

// Type pour le contexte d'authentification
interface AuthContextType {
  currentUser: UserInfo | null;
  loading: boolean;
  error: string | null;
  deconnexion: () => Promise<void>;
  connexion: (email: string, motDePasse: string) => Promise<AuthResult>;
}

// Création du contexte avec valeurs par défaut
const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  error: null,
  deconnexion: async () => {},
  connexion: async () => ({ utilisateur: null, erreur: null })
});

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => useContext(AuthContext);

// Provider du contexte d'authentification
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Effet pour surveiller l'état d'authentification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          // L'utilisateur est connecté, récupérer ses informations supplémentaires
          const userDocRef = doc(db, 'utilisateurs', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            // Combiner les données Firebase Auth avec celles de Firestore
            const userData = userDoc.data();
            
            // Log des données récupérées pour débogage
            console.log('Données Firestore brutes:', userData);
            console.log('Valeur du rôle dans Firestore:', userData.role);
            
            // S'assurer que le rôle est correct pour éviter les problèmes de casse
            let userRole: 'admin' | 'professeur' = 'professeur'; // Valeur par défaut
            
            if (userData.role) {
              const roleValue = String(userData.role).toLowerCase();
              if (roleValue === 'admin' || roleValue === 'administrateur') {
                userRole = 'admin';
              }
            }
            
            const enhancedUser: UserInfo = {
              ...user,
              role: userRole,
              salleAssignee: userData.salleAssignee || null,
              nom: userData.nom || '',
              prenom: userData.prenom || ''
            };
            
            console.log('Utilisateur enrichi créé:', {
              uid: enhancedUser.uid,
              email: enhancedUser.email,
              role: enhancedUser.role,
              nom: enhancedUser.nom,
              prenom: enhancedUser.prenom
            });
            
            setCurrentUser(enhancedUser);
          } else {
            // Utilisateur existe dans Auth mais pas dans Firestore
            console.log('Document utilisateur introuvable dans Firestore');
            setCurrentUser(user as UserInfo);
          }
        } else {
          // L'utilisateur est déconnecté
          setCurrentUser(null);
        }
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors de la récupération des informations utilisateur:", err);
        setError("Impossible de récupérer les informations utilisateur. Veuillez réessayer.");
        setLoading(false);
      }
    });

    // Nettoyage lors du démontage du composant
    return () => unsubscribe();
  }, []);

  // Méthode de connexion
  const connexion = async (email: string, motDePasse: string): Promise<AuthResult> => {
    try {
      setError(null);
      
      // Tentative de connexion avec Firebase Auth
      const { user } = await signInWithEmailAndPassword(auth, email, motDePasse);
      
      // La mise à jour de currentUser sera gérée par l'écouteur d'événements onAuthStateChanged
      return { utilisateur: user as UserInfo, erreur: null };
      
    } catch (err: any) {
      console.error("Erreur de connexion:", err);
      
      let messageErreur = "Échec de la connexion. Veuillez vérifier vos identifiants.";
      
      if (err?.code === 'auth/user-not-found' || err?.code === 'auth/wrong-password') {
        messageErreur = "Email ou mot de passe incorrect.";
      } else if (err?.code === 'auth/too-many-requests') {
        messageErreur = "Trop de tentatives de connexion. Veuillez réessayer plus tard.";
      } else if (err?.code === 'auth/user-disabled') {
        messageErreur = "Ce compte a été désactivé. Veuillez contacter un administrateur.";
      }
      
      setError(messageErreur);
      return { utilisateur: null, erreur: messageErreur };
    }
  };

  // Implémentation de la déconnexion
  const deconnexion = async (): Promise<void> => {
    try {
      await signOut(auth);
      // Rediriger vers la page de connexion se fait automatiquement grâce à l'écouteur d'état d'authentification
    } catch (err) {
      console.error("Erreur lors de la déconnexion:", err);
      setError("Impossible de se déconnecter. Veuillez réessayer.");
    }
  };

  // Valeur fournie par le contexte
  const value = {
    currentUser,
    loading,
    error,
    deconnexion,
    connexion
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
