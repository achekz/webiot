# Smart Salle – Application web de gestion de salles intelligentes

![license](https://img.shields.io/badge/license-MIT-blue.svg)

Ce projet a été développé dans le cadre d'un projet de fin d'études en licence informatique.

## Présentation

Smart Salle est une application web moderne permettant la gestion et le monitoring de salles de classe connectées. L'application offre un ensemble de fonctionnalités pour contrôler à distance les équipements des salles (climatiseurs, vidéoprojecteurs) et surveiller les conditions environnementales grâce à des capteurs.

## Fonctionnalités principales

- **Tableau de bord**: Vue d'ensemble des salles et de leur état
- **Contrôle des équipements**: Gestion à distance des climatiseurs et vidéoprojecteurs
- **Monitoring environnemental**: Suivi des données des capteurs (température, humidité, qualité de l'air)
- **Gestion des utilisateurs**: Administration des droits d'accès
- **Statistiques**: Analyse des données historiques
- **Profil utilisateur**: Personnalisation du compte

## Technologies utilisées

- **Frontend**: React.js, TypeScript, Material-UI
- **Backend**: Firebase (Firestore, Authentication)
- **Déploiement**: Vite.js

## Installation et démarrage

1. Assurez-vous d'avoir Node.js v20.x installé
2. Clonez ce dépôt
3. Installez les dépendances: `npm install` ou `yarn install`
4. Lancez l'application en mode développement: `npm run dev` ou `yarn dev`
5. Ouvrez votre navigateur à l'adresse: `http://localhost:3039`

## Structure du projet

- `/src/components` - Composants réutilisables
- `/src/layouts` - Structures de mise en page
- `/src/pages` - Pages principales de l'application
- `/src/services` - Services d'accès aux données (Firebase)
- `/src/context` - Contextes React (authentification, thème)
- `/src/hooks` - Hooks personnalisés pour la gestion des capteurs

## Licence

Ce projet est distribué sous licence MIT.
