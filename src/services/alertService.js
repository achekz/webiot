// Service de gestion des alertes environnementales pour Smart Salle
// Gère les notifications et alertes basées sur les données des capteurs

import { doc, addDoc, updateDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, push, query, update, onValue, limitToLast, orderByChild } from 'firebase/database';

import { db, auth, realtimeDb } from './firebaseClient';

// Définition des seuils d'alerte
const SEUILS = {
  TEMPERATURE: {
    MIN: 17, // °C - Trop froid
    MAX: 28  // °C - Trop chaud
  },
  HUMIDITE: {
    MIN: 30, // % - Trop sec
    MAX: 70  // % - Trop humide
  },
  QUALITE_AIR: {
    MAX: 1000 // ppm - Qualité d&apos;air dégradée (CO2)
  }
};

// Types d'alertes
export const TYPE_ALERTE = {
  TEMPERATURE_BASSE: 'temperature-basse',
  TEMPERATURE_HAUTE: 'temperature-haute',
  HUMIDITE_BASSE: 'humidite-basse',
  HUMIDITE_HAUTE: 'humidite-haute',
  QUALITE_AIR: 'qualite-air'
};

// Niveaux de gravité
export const GRAVITE = {
  INFO: 'info',         // Information
  WARNING: 'warning',   // Avertissement
  DANGER: 'danger'      // Critique
};

// Service pour la gestion des alertes
export const alertService = {
  // Vérifie les valeurs et crée une alerte si nécessaire
  async verifierEtCreerAlerte(salleId, donneesCapteurs) {
    const alertes = [];
    
    // Vérification de la température
    if (donneesCapteurs.temperature !== null) {
      if (donneesCapteurs.temperature < SEUILS.TEMPERATURE.MIN) {
        alertes.push(await this.creerAlerte(
          salleId, 
          TYPE_ALERTE.TEMPERATURE_BASSE,
          `La température est trop basse: ${donneesCapteurs.temperature}°C`,
          donneesCapteurs.temperature <= SEUILS.TEMPERATURE.MIN - 3 ? GRAVITE.DANGER : GRAVITE.WARNING
        ));
      } else if (donneesCapteurs.temperature > SEUILS.TEMPERATURE.MAX) {
        alertes.push(await this.creerAlerte(
          salleId, 
          TYPE_ALERTE.TEMPERATURE_HAUTE,
          `La température est trop élevée: ${donneesCapteurs.temperature}°C`,
          donneesCapteurs.temperature >= SEUILS.TEMPERATURE.MAX + 3 ? GRAVITE.DANGER : GRAVITE.WARNING
        ));
      }
    }
    
    // Vérification de l'humidité
    if (donneesCapteurs.humidity !== null) {
      if (donneesCapteurs.humidity < SEUILS.HUMIDITE.MIN) {
        alertes.push(await this.creerAlerte(
          salleId, 
          TYPE_ALERTE.HUMIDITE_BASSE,
          `L&apos;humidité est trop basse: ${donneesCapteurs.humidity}%`,
          GRAVITE.WARNING
        ));
      } else if (donneesCapteurs.humidity > SEUILS.HUMIDITE.MAX) {
        alertes.push(await this.creerAlerte(
          salleId, 
          TYPE_ALERTE.HUMIDITE_HAUTE,
          `L&apos;humidité est trop élevée: ${donneesCapteurs.humidity}%`,
          GRAVITE.WARNING
        ));
      }
    }
    
    // Vérification de la qualité de l'air
    if (donneesCapteurs.airQuality !== null && donneesCapteurs.airQuality > SEUILS.QUALITE_AIR.MAX) {
      alertes.push(await this.creerAlerte(
        salleId, 
        TYPE_ALERTE.QUALITE_AIR,
        `La qualité de l&apos;air est dégradée: ${donneesCapteurs.airQuality} ppm`,
        donneesCapteurs.airQuality >= SEUILS.QUALITE_AIR.MAX + 500 ? GRAVITE.DANGER : GRAVITE.WARNING
      ));
    }
    
    return alertes.filter(alerte => alerte !== null);
  },
  
  // Crée une alerte dans la base de données
  async creerAlerte(salleId, type, message, gravite = GRAVITE.WARNING) {
    try {
      // Référence vers la collection d'alertes dans Firestore
      const alerteRef = collection(db, `salles/${salleId}/alertes`);
      
      // Création de l'alerte
      const alerte = {
        type,
        message,
        gravite,
        datetime: serverTimestamp(),
        traitee: false,
        utilisateur: auth.currentUser ? auth.currentUser.uid : null
      };
      
      // Ajout dans Firestore
      const docRef = await addDoc(alerteRef, alerte);
      
      // Ajout dans la Realtime Database pour notification côté ESP32 et Flutter
      const alerteRTRef = ref(realtimeDb, `salles/${salleId}/alertes`);
      await push(alerteRTRef, {
        ...alerte,
        datetime: new Date().toISOString(), // Date formatée pour Realtime DB
        id: docRef.id // ID du document Firestore pour référence
      });
      
      console.log(`Alerte créée pour la salle ${salleId}:`, message);
      
      return {
        id: docRef.id,
        ...alerte
      };
    } catch (erreur) {
      console.error("Erreur lors de la création de l&apos;alerte:", erreur);
      return null;
    }
  },
  
  // Récupère les alertes actives pour une salle
  async getAlertesActives(salleId) {
    try {
      // Récupération des alertes non traitées depuis la Realtime Database
      const alertesRef = ref(realtimeDb, `salles/${salleId}/alertes`);
      const alertesQuery = query(alertesRef, orderByChild('traitee'), limitToLast(10));
      
      return new Promise((resolve, reject) => {
        onValue(alertesQuery, (snapshot) => {
          if (snapshot.exists()) {
            const alertes = [];
            snapshot.forEach((childSnapshot) => {
              const alerte = {
                id: childSnapshot.key,
                ...childSnapshot.val()
              };
              if (!alerte.traitee) {
                alertes.push(alerte);
              }
            });
            resolve(alertes);
          } else {
            resolve([]);
          }
        }, (error) => {
          console.error("Erreur lors de la récupération des alertes:", error);
          reject(error);
        });
      });
    } catch (erreur) {
      console.error("Erreur lors de la récupération des alertes:", erreur);
      return [];
    }
  },
  
  // Marque une alerte comme traitée
  async traiterAlerte(salleId, alerteId) {
    try {
      // Mise à jour dans Firestore
      const alerteRef = doc(db, `salles/${salleId}/alertes`, alerteId);
      await updateDoc(alerteRef, {
        traitee: true,
        dateTraitement: serverTimestamp()
      });
      
      // Mise à jour dans Realtime Database
      const alerteRTRef = ref(realtimeDb, `salles/${salleId}/alertes/${alerteId}`);
      await update(alerteRTRef, {
        traitee: true,
        dateTraitement: new Date().toISOString()
      });
      
      return { success: true };
    } catch (erreur) {
      console.error("Erreur lors du traitement de l&apos;alerte:", erreur);
      return { 
        success: false, 
        erreur: "Impossible de traiter l&apos;alerte. Veuillez réessayer." 
      };
    }
  }
};

export default alertService;
