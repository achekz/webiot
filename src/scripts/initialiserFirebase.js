// Script d'initialisation des collections Firebase pour Smart Salle
// Ce script crée toutes les collections nécessaires pour le fonctionnement de l&apos;application

import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

import { db } from '../services/firebaseClient';

/**
 * Initialise les collections Firestore avec des données de départ
 * @returns {Promise<void>}
 */
export const initialiserCollections = async () => {
  console.log('Début de l&apos;initialisation des collections...');
  
  try {
    // Création des utilisateurs
    console.log('Création des utilisateurs...');
    await creerUtilisateurs();
    
    // Création des salles
    console.log('Création des salles...');
    await creerSalles();
    
    // Création des capteurs
    console.log('Création des capteurs...');
    await creerCapteurs();
    
    // Création des données des capteurs
    console.log('Création des données des capteurs...');
    await creerDonneesCapteurs();
    
    // Création des équipements
    console.log('Création des équipements...');
    await creerEquipements();
    
    // Création des plannings
    console.log('Création des plannings...');
    await creerPlannings();
    
    // Création des maintenances
    console.log('Création des maintenances...');
    await creerMaintenances();
    
    // Création des alertes
    console.log('Création des alertes...');
    await creerAlertes();
    
    console.log('Initialisation des collections terminée avec succès !');
    return { success: true, message: 'Toutes les collections ont été initialisées avec succès !' };
    
  } catch (erreur) {
    console.error('Erreur lors de l&apos;initialisation des collections:', erreur);
    return { success: false, message: 'Erreur lors de l&apos;initialisation des collections.', erreur };
  }
};

/**
 * Crée des utilisateurs de test
 */
const creerUtilisateurs = async () => {
  // Utilisateur administrateur
  await setDoc(doc(db, 'utilisateurs', 'admin123'), {
    nom: 'Administrateur',
    prenom: 'Système',
    email: 'admin@smartsalle.edu',
    role: 'admin',
    salleAssignee: null,
    dateCreation: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  
  // Utilisateur professeur 1
  await setDoc(doc(db, 'utilisateurs', 'prof123'), {
    nom: 'Dupont',
    prenom: 'Jean',
    email: 'jean.dupont@smartsalle.edu',
    role: 'professeur',
    salleAssignee: 'salle101',
    dateCreation: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  
  // Utilisateur professeur 2
  await setDoc(doc(db, 'utilisateurs', 'prof456'), {
    nom: 'Martin',
    prenom: 'Marie',
    email: 'marie.martin@smartsalle.edu',
    role: 'professeur',
    salleAssignee: 'salle102',
    dateCreation: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

/**
 * Crée des salles de test
 */
const creerSalles = async () => {
  // Salle 101
  await setDoc(doc(db, 'salles', 'salle101'), {
    nom: 'Salle 101',
    batiment: 'Bâtiment A',
    etage: 1,
    numero: '101',
    capacite: 30,
    equipements: {
      climatiseur: true,
      videoprojecteur: true,
      ordinateurs: 1,
      tableauInteractif: false
    },
    responsable: 'prof123',
    dateCreation: serverTimestamp()
  });
  
  // Salle 102
  await setDoc(doc(db, 'salles', 'salle102'), {
    nom: 'Salle 102',
    batiment: 'Bâtiment A',
    etage: 1,
    numero: '102',
    capacite: 25,
    equipements: {
      climatiseur: true,
      videoprojecteur: true,
      ordinateurs: 15,
      tableauInteractif: true
    },
    responsable: 'prof456',
    dateCreation: serverTimestamp()
  });
  
  // Salle 201
  await setDoc(doc(db, 'salles', 'salle201'), {
    nom: 'Salle 201',
    batiment: 'Bâtiment B',
    etage: 2,
    numero: '201',
    capacite: 40,
    equipements: {
      climatiseur: true,
      videoprojecteur: true,
      ordinateurs: 0,
      tableauInteractif: false
    },
    responsable: null,
    dateCreation: serverTimestamp()
  });
};

/**
 * Crée des capteurs de test pour les salles
 */
const creerCapteurs = async () => {
  // Capteurs pour la salle 101
  await setDoc(doc(db, 'salles', 'salle101', 'capteurs', 'capteur-temp-101'), {
    type: 'temperature',
    statut: 'actif',
    derniereMiseAJour: serverTimestamp()
  });
  
  await setDoc(doc(db, 'salles', 'salle101', 'capteurs', 'capteur-hum-101'), {
    type: 'humidite',
    statut: 'actif',
    derniereMiseAJour: serverTimestamp()
  });
  
  await setDoc(doc(db, 'salles', 'salle101', 'capteurs', 'capteur-air-101'), {
    type: 'qualiteAir',
    statut: 'actif',
    derniereMiseAJour: serverTimestamp()
  });
  
  // Capteurs pour la salle 102
  await setDoc(doc(db, 'salles', 'salle102', 'capteurs', 'capteur-temp-102'), {
    type: 'temperature',
    statut: 'actif',
    derniereMiseAJour: serverTimestamp()
  });
  
  await setDoc(doc(db, 'salles', 'salle102', 'capteurs', 'capteur-hum-102'), {
    type: 'humidite',
    statut: 'maintenance',
    derniereMiseAJour: serverTimestamp()
  });
  
  // Capteurs pour la salle 201
  await setDoc(doc(db, 'salles', 'salle201', 'capteurs', 'capteur-temp-201'), {
    type: 'temperature',
    statut: 'actif',
    derniereMiseAJour: serverTimestamp()
  });
};

/**
 * Crée des données de capteurs de test
 */
const creerDonneesCapteurs = async () => {
  const maintenant = new Date();
  const tempsActuel = maintenant.getTime();
  
  // Données pour le capteur de température de la salle 101
  for (let i = 0; i < 24; i++) {
    const temps = new Date(tempsActuel - i * 3600000); // Une heure en arrière à chaque itération
    const valeur = 20 + Math.random() * 5; // Température entre 20 et 25°C
    
    await setDoc(doc(db, 'donneesCapteurs', 'salle101', 'capteur-temp-101', 'historique', temps.toISOString()), {
      valeur: valeur.toFixed(1),
      unite: '°C',
      date: temps
    });
  }
  
  // Données pour le capteur d'humidité de la salle 101
  for (let i = 0; i < 24; i++) {
    const temps = new Date(tempsActuel - i * 3600000);
    const valeur = 40 + Math.random() * 20; // Humidité entre 40% et 60%
    
    await setDoc(doc(db, 'donneesCapteurs', 'salle101', 'capteur-hum-101', 'historique', temps.toISOString()), {
      valeur: valeur.toFixed(1),
      unite: '%',
      date: temps
    });
  }
  
  // Données pour le capteur de qualité d'air de la salle 101
  for (let i = 0; i < 24; i++) {
    const temps = new Date(tempsActuel - i * 3600000);
    const valeur = 400 + Math.random() * 300; // CO2 entre 400 et 700 ppm
    
    await setDoc(doc(db, 'donneesCapteurs', 'salle101', 'capteur-air-101', 'historique', temps.toISOString()), {
      valeur: Math.round(valeur),
      unite: 'ppm',
      date: temps
    });
  }
};

/**
 * Crée des équipements de test
 */
const creerEquipements = async () => {
  // Climatiseur salle 101
  await setDoc(doc(db, 'equipements', 'clim-101'), {
    type: 'climatiseur',
    marque: 'Daikin',
    modele: 'FTX-JV',
    salleId: 'salle101',
    dateInstallation: new Date('2023-09-01'),
    statut: 'actif',
    derniereMiseAJour: serverTimestamp()
  });
  
  // Vidéoprojecteur salle 101
  await setDoc(doc(db, 'equipements', 'vp-101'), {
    type: 'videoprojecteur',
    marque: 'Epson',
    modele: 'EB-X49',
    salleId: 'salle101',
    dateInstallation: new Date('2023-09-01'),
    statut: 'actif',
    derniereMiseAJour: serverTimestamp()
  });
  
  // Ordinateur salle 101
  await setDoc(doc(db, 'equipements', 'ordi-101'), {
    type: 'ordinateur',
    marque: 'Dell',
    modele: 'OptiPlex 7090',
    salleId: 'salle101',
    dateInstallation: new Date('2023-09-01'),
    statut: 'actif',
    derniereMiseAJour: serverTimestamp()
  });
  
  // Climatiseur salle 102
  await setDoc(doc(db, 'equipements', 'clim-102'), {
    type: 'climatiseur',
    marque: 'Mitsubishi',
    modele: 'MSZ-AP',
    salleId: 'salle102',
    dateInstallation: new Date('2023-08-15'),
    statut: 'maintenance',
    derniereMiseAJour: serverTimestamp()
  });
};

/**
 * Crée des plannings de test
 */
const creerPlannings = async () => {
  const aujourdhui = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
  
  // Planning pour la salle 101 aujourd'hui
  await setDoc(doc(db, 'plannings', 'salle101', aujourdhui, 'creneaux', 'creneau1'), {
    debut: new Date(`${aujourdhui}T08:00:00`),
    fin: new Date(`${aujourdhui}T10:00:00`),
    professeur: 'prof123',
    matiere: 'Mathématiques',
    groupe: 'L1 Informatique',
    statut: 'programme'
  });
  
  await setDoc(doc(db, 'plannings', 'salle101', aujourdhui, 'creneaux', 'creneau2'), {
    debut: new Date(`${aujourdhui}T10:15:00`),
    fin: new Date(`${aujourdhui}T12:15:00`),
    professeur: 'prof456',
    matiere: 'Physique',
    groupe: 'L1 Informatique',
    statut: 'programme'
  });
  
  // Planning pour la salle 102 aujourd'hui
  await setDoc(doc(db, 'plannings', 'salle102', aujourdhui, 'creneaux', 'creneau1'), {
    debut: new Date(`${aujourdhui}T13:30:00`),
    fin: new Date(`${aujourdhui}T15:30:00`),
    professeur: 'prof456',
    matiere: 'Algorithmique',
    groupe: 'L2 Informatique',
    statut: 'programme'
  });
};

/**
 * Crée des maintenances de test
 */
const creerMaintenances = async () => {
  // Maintenance pour le climatiseur de la salle 102
  await setDoc(doc(db, 'maintenances', 'maintenance1'), {
    equipementId: 'clim-102',
    salleId: 'salle102',
    technicien: 'Dupuis Maintenance',
    description: 'Remplacement du filtre et nettoyage des conduits',
    dateDebut: new Date('2025-05-20T09:00:00'),
    dateFin: null,
    statut: 'enCours',
    commentaire: 'Intervention en cours'
  });
  
  // Maintenance programmée pour le vidéoprojecteur de la salle 101
  await setDoc(doc(db, 'maintenances', 'maintenance2'), {
    equipementId: 'vp-101',
    salleId: 'salle101',
    technicien: 'Tech Vision',
    description: 'Calibration et mise à jour du firmware',
    dateDebut: new Date('2025-05-22T14:00:00'),
    dateFin: null,
    statut: 'programmee',
    commentaire: 'Intervention programmée'
  });
};

/**
 * Crée des alertes de test
 */
const creerAlertes = async () => {
  // Alerte de température pour la salle 101
  await setDoc(doc(db, 'salles', 'salle101', 'alertes', 'alerte1'), {
    type: 'temperature',
    valeur: 29.5,
    message: 'Température trop élevée',
    date: new Date('2025-05-20T14:30:00'),
    traitee: false,
    dateTraitement: null
  });
  
  // Alerte d'équipement pour la salle 102
  await setDoc(doc(db, 'salles', 'salle102', 'alertes', 'alerte1'), {
    type: 'equipement',
    valeur: 0,
    message: 'Dysfonctionnement du climatiseur',
    date: new Date('2025-05-20T08:15:00'),
    traitee: true,
    dateTraitement: new Date('2025-05-20T09:30:00')
  });
};
