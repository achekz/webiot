// Hook personnalisé pour récupérer les données des capteurs en temps réel
// Gère les capteurs DHT11 (température, humidité) et MQ135 (qualité d'air)

import { useState, useEffect } from 'react';
import { ref, off, onValue } from 'firebase/database';

import { realtimeDb } from '../services/firebaseClient';

/**
 * Hook pour obtenir les données des capteurs d'une salle en temps réel
 * @param {string} salleId - L'identifiant de la salle
 * @returns {Object} Données des capteurs et états de chargement/erreur
 */
export function useSensorData(salleId) {
  // État initial pour les valeurs des capteurs
  const [sensorData, setSensorData] = useState({
    temperature: null,  // Température en °C
    humidity: null,     // Humidité en %
    airQuality: null,   // Qualité de l'air en ppm
    timestamp: null,    // Date/heure de la dernière mise à jour
    loading: true,      // Indicateur de chargement
    error: null         // Erreur éventuelle
  });

  useEffect(() => {
    // Si aucun ID de salle, ne rien faire
    if (!salleId) {
      setSensorData(prev => ({
        ...prev,
        loading: false,
        error: "Identifiant de salle requis"
      }));
      return () => {};
    }

    // Référence vers les données des capteurs dans Realtime Database
    const sensorRef = ref(realtimeDb, `salles/${salleId}/capteurs`);
    
    // Message d'information
    console.log(`Connexion aux capteurs de la salle ${salleId}...`);
    
    // On configure un écouteur pour les mises à jour en temps réel
    // Le DHT11 et MQ135 envoient leurs données à la BD Firebase
    const unsubscribe = onValue(sensorRef, (snapshot) => {
      const data = snapshot.val();
      
      if (data) {
        // Récupération réussie, mise à jour de l'état
        setSensorData({
          temperature: data.temperature || null,
          humidity: data.humidite || null,
          airQuality: data.qualiteAir || null,
          timestamp: data.timestamp || new Date().toISOString(),
          loading: false,
          error: null
        });
        
        // Petit message de debug avec les valeurs
        console.log(`Mise à jour capteurs: ${data.temperature}°C, ${data.humidite}%, ${data.qualiteAir}ppm`);
      } else {
        // Aucune donnée disponible
        setSensorData(prev => ({
          ...prev,
          loading: false,
          error: "Aucune donnée disponible pour cette salle"
        }));
      }
    }, (error) => {
      // Gestion des erreurs de connexion ou de lecture
      console.error("Erreur de lecture des capteurs:", error);
      setSensorData(prev => ({
        ...prev,
        loading: false,
        error: `Erreur de lecture des capteurs: ${error.message}`
      }));
    });

    // Nettoyage lors du démontage du composant
    return () => {
      // Désabonnement pour éviter les fuites mémoire
      off(sensorRef);
      console.log(`Déconnexion des capteurs de la salle ${salleId}`);
    };
  }, [salleId]); // Relancer l'effet si l'ID de la salle change

  // Fonction utilitaire pour vérifier si la valeur est dans la plage normale
  const isInNormalRange = (type, value) => {
    if (value === null) return false;
    
    switch (type) {
      case 'temperature':
        // Plage normale: 18-26°C pour une salle de classe
        return value >= 18 && value <= 26;
      case 'humidity':
        // Plage normale: 30-60% d'humidité
        return value >= 30 && value <= 60;
      case 'airQuality':
        // Moins de 800ppm est considéré bon pour MQ135
        return value < 800;
      default:
        return true;
    }
  };

  // On enrichit les données avec des méthodes utiles
  return {
    ...sensorData,
    // Vérifie si la température est dans la plage normale
    isTemperatureNormal: isInNormalRange('temperature', sensorData.temperature),
    // Vérifie si l'humidité est dans la plage normale
    isHumidityNormal: isInNormalRange('humidity', sensorData.humidity),
    // Vérifie si la qualité de l'air est acceptable
    isAirQualityNormal: isInNormalRange('airQuality', sensorData.airQuality)
  };
}

export default useSensorData;
