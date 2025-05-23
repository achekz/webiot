// Configuration et initialisation de Firebase pour Smart Salle
// Ce service gère la connexion à Firebase et expose les fonctions d'authentification et de base de données

import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';
import { getAuth, sendPasswordResetEmail, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

// Configuration de Firebase - À remplacer par vos propres identifiants
const firebaseConfig = {
  apiKey: "AIzaSyAMsoTwijlhDbRNbIiz8UjGY_jvOVI7hWE",
  authDomain: "iotfsm.firebaseapp.com",
  projectId: "iotfsm",
  storageBucket: "iotfsm.firebasestorage.app",
  messagingSenderId: "487521949996",
  appId: "1:487521949996:web:933a1af2f685afe9553489"
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);

// Instances des services Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const realtimeDb = getDatabase(app);

// Service d'authentification
export const authService = {
  // Connexion avec email et mot de passe
  async connexion(email, motDePasse) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, motDePasse);
      return { utilisateur: userCredential.user, erreur: null };
    } catch (erreur) {
      console.error("Erreur de connexion:", erreur.code, erreur.message);
      let messageErreur = "Erreur de connexion. Veuillez réessayer.";
      
      switch (erreur.code) {
        case 'auth/invalid-email':
          messageErreur = "L'adresse email n'est pas valide.";
          break;
        case 'auth/user-disabled':
          messageErreur = "Ce compte a été désactivé.";
          break;
        case 'auth/user-not-found':
          messageErreur = "Aucun compte ne correspond à cette adresse email.";
          break;
        case 'auth/wrong-password':
          messageErreur = "Mot de passe incorrect.";
          break;
        default:
          messageErreur = "Erreur lors de la connexion : " + erreur.message;
          break;
      }
      
      return { utilisateur: null, erreur: messageErreur };
    }
  },

  // Inscription avec email et mot de passe
  async inscription(email, motDePasse) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, motDePasse);
      return { utilisateur: userCredential.user, erreur: null };
    } catch (erreur) {
      console.error("Erreur d'inscription:", erreur.code, erreur.message);
      let messageErreur = "Erreur lors de la création du compte.";
      
      switch (erreur.code) {
        case 'auth/email-already-in-use':
          messageErreur = "Cette adresse email est déjà utilisée.";
          break;
        case 'auth/invalid-email':
          messageErreur = "L'adresse email n'est pas valide.";
          break;
        case 'auth/weak-password':
          messageErreur = "Le mot de passe est trop faible. Utilisez au moins 6 caractères.";
          break;
        default:
          messageErreur = "Erreur lors de la création du compte : " + erreur.message;
          break;
      }
      
      return { utilisateur: null, erreur: messageErreur };
    }
  },

  // Réinitialisation du mot de passe
  async reinitialiserMotDePasse(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true, erreur: null };
    } catch (erreur) {
      console.error("Erreur de réinitialisation:", erreur.code, erreur.message);
      let messageErreur = "Erreur lors de l'envoi de l'email de réinitialisation.";
      
      switch (erreur.code) {
        case 'auth/invalid-email':
          messageErreur = "L'adresse email n'est pas valide.";
          break;
        case 'auth/user-not-found':
          messageErreur = "Aucun compte ne correspond à cette adresse email.";
          break;
        default:
          messageErreur = "Erreur lors de la réinitialisation du mot de passe : " + erreur.message;
          break;
      }
      
      return { success: false, erreur: messageErreur };
    }
  },

  // Déconnexion
  async deconnexion() {
    try {
      await auth.signOut();
      return { success: true };
    } catch (erreur) {
      console.error("Erreur de déconnexion:", erreur);
      return { success: false, erreur: "Erreur lors de la déconnexion." };
    }
  }
};

export default {
  auth,
  db,
  realtimeDb,
  authService
};
