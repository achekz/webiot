// Hook personnalisé pour la gestion de l'authentification
// Fournit toutes les fonctions nécessaires pour gérer l'authentification

import type {
  User} from 'firebase/auth';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';

import { db, auth } from '../services/firebaseClient';

// Types pour les résultats de fonction
interface AuthResult {
  utilisateur: User | null;
  erreur: string | null;
}

interface SuccessResult {
  success: boolean;
  erreur?: string;
}

interface UserData {
  email: string;
  nom: string;
  prenom: string;
  role: 'admin' | 'professeur';
  salleAssignee: string | null;
  dateCreation: string;
}

const useAuthHook = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();

  // Surveiller les changements d'état d'authentification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          // Récupérer les données utilisateur depuis Firestore
          const userDocRef = doc(db, 'utilisateurs', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            // Convertir les données Firestore en UserData
            const data = userDoc.data();
            setUserData({
              email: data.email || '',
              nom: data.nom || '',
              prenom: data.prenom || '',
              role: (data.role as 'admin' | 'professeur') || 'professeur',
              salleAssignee: data.salleAssignee || null,
              dateCreation: data.dateCreation || ''
            });
          } else {
            setUserData(null);
          }
        } catch (err) {
          console.error("Erreur lors de la récupération des données utilisateur:", err);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  // Fonction de connexion
  const connexion = async (email: string, motDePasse: string): Promise<AuthResult> => {
    try {
      setError(null);
      const userCredential = await signInWithEmailAndPassword(auth, email, motDePasse);
      return { utilisateur: userCredential.user, erreur: null };
    } catch (err: unknown) {
      console.error("Erreur de connexion:", err);
      
      let messageErreur = "Échec de la connexion. Veuillez vérifier vos identifiants.";
      
      if (err && typeof err === 'object' && 'code' in err) {
        const firebaseError = err as { code: string };
        
        if (firebaseError.code === 'auth/user-not-found' || firebaseError.code === 'auth/wrong-password') {
          messageErreur = "Email ou mot de passe incorrect.";
        } else if (firebaseError.code === 'auth/too-many-requests') {
          messageErreur = "Trop de tentatives de connexion. Veuillez réessayer plus tard.";
        } else if (firebaseError.code === 'auth/user-disabled') {
          messageErreur = "Ce compte a été désactivé. Veuillez contacter un administrateur.";
        }
      }
      
      setError(messageErreur);
      return { utilisateur: null, erreur: messageErreur };
    }
  };

  // Fonction de déconnexion
  const deconnexion = async (): Promise<SuccessResult> => {
    try {
      await signOut(auth);
      navigate('/sign-in');
      return { success: true };
    } catch (err: unknown) {
      console.error("Erreur de déconnexion:", err);
      setError("Erreur lors de la déconnexion. Veuillez réessayer.");
      return { success: false, erreur: "Erreur lors de la déconnexion." };
    }
  };

  // Fonction d'inscription
  const inscription = async (
    email: string, 
    motDePasse: string, 
    nom: string, 
    prenom: string, 
    role: 'admin' | 'professeur' = 'professeur', 
    salleAssignee: string | null = null
  ): Promise<AuthResult> => {
    try {
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, motDePasse);
      const user = userCredential.user;
      
      // Créer un document utilisateur dans Firestore
      await setDoc(doc(db, 'utilisateurs', user.uid), {
        email,
        nom,
        prenom,
        role,
        salleAssignee,
        dateCreation: new Date().toISOString()
      });
      
      return { utilisateur: user, erreur: null };
    } catch (err: unknown) {
      console.error("Erreur d'inscription:", err);
      
      let messageErreur = "Échec de l'inscription. Veuillez réessayer.";
      
      if (err && typeof err === 'object' && 'code' in err) {
        const firebaseError = err as { code: string };
        
        if (firebaseError.code === 'auth/email-already-in-use') {
          messageErreur = "Cet email est déjà utilisé.";
        } else if (firebaseError.code === 'auth/weak-password') {
          messageErreur = "Le mot de passe est trop faible (minimum 6 caractères).";
        } else if (firebaseError.code === 'auth/invalid-email') {
          messageErreur = "L'adresse email n'est pas valide.";
        }
      }
      
      setError(messageErreur);
      return { utilisateur: null, erreur: messageErreur };
    }
  };

  // Fonction de réinitialisation du mot de passe
  const reinitialiserMotDePasse = async (email: string): Promise<SuccessResult> => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (err: unknown) {
      console.error("Erreur de réinitialisation du mot de passe:", err);
      
      let messageErreur = "Erreur lors de la réinitialisation du mot de passe.";
      
      if (err && typeof err === 'object' && 'code' in err) {
        const firebaseError = err as { code: string };
        
        if (firebaseError.code === 'auth/user-not-found') {
          messageErreur = "Aucun compte n'est associé à cet email.";
        } else if (firebaseError.code === 'auth/invalid-email') {
          messageErreur = "L'adresse email n'est pas valide.";
        }
      }
      
      setError(messageErreur);
      return { success: false, erreur: messageErreur };
    }
  };

  // Fonction pour vérifier si l'utilisateur est admin
  const estAdmin = (): boolean => !!(userData && userData.role === 'admin');

  // Fonction pour vérifier si l'utilisateur est professeur
  const estProfesseur = (): boolean => !!(userData && userData.role === 'professeur');

  // Fonction pour obtenir la salle assignée
  const getSalleAssignee = (): string | null => userData ? userData.salleAssignee : null;

  return {
    currentUser,
    userData,
    loading,
    error,
    connexion,
    deconnexion,
    inscription,
    reinitialiserMotDePasse,
    estAdmin,
    estProfesseur,
    getSalleAssignee
  };
}

export { useAuthHook as useAuth };
