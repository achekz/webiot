// Service de gestion des salles pour Smart Salle
// Gère les opérations liées aux équipements comme les climatiseurs et vidéoprojecteurs

import { ref, set, onValue } from 'firebase/database';
import { doc, setDoc, getDocs, collection } from 'firebase/firestore';

import { db, realtimeDb } from './firebaseClient';

// Service pour la gestion des salles
export const roomService = {
  // Récupère la liste des salles disponibles
  async getSalles() {
    try {
      const sallesCollection = collection(db, 'salles');
      const sallesSnapshot = await getDocs(sallesCollection);
      const sallesList = sallesSnapshot.docs.map(docSnapshot => ({
        id: docSnapshot.id,
        ...docSnapshot.data()
      }));
      
      return { salles: sallesList, erreur: null };
    } catch (erreur) {
      console.error("Erreur lors de la récupération des salles:", erreur);
      return { 
        salles: [], 
        erreur: "Impossible de récupérer la liste des salles. Veuillez réessayer." 
      };
    }
  },

  // Écoute les changements sur une salle spécifique
  onSalleChange(salleId, callback) {
    const salleRef = ref(realtimeDb, `salles/${salleId}`);
    return onValue(salleRef, (snapshot) => {
      const data = snapshot.val();
      
      // Débogage pour voir les données reçues
      console.log('Données reçues de Firebase pour la salle:', data);
      
      // Correction pour assurer la cohérence des noms projecteur/vidéoprojecteur
      if (data && data.equipements) {
        // Si projecteur existe mais videoprojecteur n'existe pas, copier les données
        if (data.equipements.projecteur && !data.equipements.videoprojecteur) {
          data.equipements.videoprojecteur = data.equipements.projecteur;
        }
        // Si videoprojecteur existe mais projecteur n'existe pas, copier les données
        else if (data.equipements.videoprojecteur && !data.equipements.projecteur) {
          data.equipements.projecteur = data.equipements.videoprojecteur;
        }
      }
      
      callback(data);
    }, (error) => {
      console.error("Erreur lors de l'écoute des changements de la salle:", error);
      callback(null, error);
    });
  },

  // Active ou désactive le climatiseur dans une salle spécifique
  async toggleClimatiseur(salleId, etat) {
    try {
      // Référence vers le nœud climatiseur de la salle dans Realtime Database
      const climatiseurRef = ref(realtimeDb, `salles/${salleId}/equipements/climatiseur`);
      
      // Enregistre l'état du climatiseur (true = activé, false = désactivé)
      await set(climatiseurRef, {
        actif: etat,
        dernierChangement: new Date().toISOString(),
      });
      
      // Journalise l'opération dans Firestore pour historique
      const historiqueRef = doc(collection(db, `salles/${salleId}/historique`));
      await setDoc(historiqueRef, {
        type: 'climatiseur',
        action: etat ? 'activation' : 'désactivation',
        timestamp: new Date().toISOString(),
        utilisateur: 'utilisateur_actuel' // Idéalement, remplacer par l'ID de l'utilisateur connecté
      });
      
      console.log(`Climatiseur ${etat ? 'activé' : 'désactivé'} dans la salle ${salleId}`);
      
      return { success: true };
    } catch (erreur) {
      console.error("Erreur lors du changement d'état du climatiseur:", erreur);
      return { 
        success: false, 
        erreur: "Impossible de modifier l'état du climatiseur. Veuillez réessayer." 
      };
    }
  },
  
  // Active ou désactive le vidéoprojecteur dans une salle spécifique
  async toggleProjecteur(salleId, etat) {
    try {
      console.log(`Demande d'activation/désactivation du vidéoprojecteur pour la salle ${salleId} avec état: ${etat}`);
      
      // Gérer à la fois projecteur et videoprojecteur pour éviter les incohérences
      const projecteurRef = ref(realtimeDb, `salles/${salleId}/equipements/projecteur`);
      const videoprojecteurRef = ref(realtimeDb, `salles/${salleId}/equipements/videoprojecteur`);
      
      // Même structure pour les deux entrées
      const equipementData = {
        actif: etat,
        dernierChangement: new Date().toISOString(),
      };
      
      // Mettre à jour les deux références pour assurer la cohérence
      await Promise.all([
        set(projecteurRef, equipementData),
        set(videoprojecteurRef, equipementData)
      ]);
      
      // Journaliser l'opération dans Firestore pour l'historique
      const historiqueRef = doc(collection(db, `salles/${salleId}/historique`));
      await setDoc(historiqueRef, {
        type: 'videoprojecteur',
        action: etat ? 'activation' : 'désactivation',
        timestamp: new Date().toISOString(),
        utilisateur: 'utilisateur_actuel' // Idéalement, remplacer par l'ID de l'utilisateur connecté
      });
      
      console.log(`Vidéoprojecteur ${etat ? 'activé' : 'désactivé'} dans la salle ${salleId}`);
      
      return { success: true };
    } catch (erreur) {
      console.error("Erreur lors du changement d'état du vidéoprojecteur:", erreur);
      return {
        success: false,
        erreur: "Impossible de modifier l'état du vidéoprojecteur. Veuillez réessayer."
      };
    }
  }
};

export default roomService;
