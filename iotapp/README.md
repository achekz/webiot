# Smart Salle

Application de gestion intelligente de salles connectées avec une interface modernisée.

## Fonctionnalités clés

L'application présente et pilote exclusivement ces 5 composants :
- Température
- Humidité
- Qualité de l'air
- Climatiseur
- Vidéo/projecteur

## Technologies utilisées

- Flutter avec Material 3
- Firebase pour l'authentification
- Internationalisation complète en français
- Architecture propre et modulaire

## Guide de style et recommandations UX

### Thème et couleurs

- **Couleur primaire** : Bleu (`0xFF0052CC`)
- **Couleur secondaire** : Bleu ciel (`0xFF00B8D9`)
- **Arrière-plan** : Gris très clair (`0xFFF5F8FA`)
- **Couleurs d'état** : Success (`0xFF36B37E`), Warning (`0xFFFFAB00`), Error (`0xFFFF5630`)

### Typographie

- Police principale : Poppins (via Google Fonts)
- Hiérarchie de tailles optimisée pour la lisibilité

### Composants UI

- **Boutons** : Coins arrondis (20px), ombres légères
- **Cartes** : Elevation de 2dp, coins arrondis (20px)
- **Champs de formulaire** : Contour visible, icônes d'assistance
- **Espacement** : Système cohérent (8px, 16px, 24px)

### Accessibilité

- Contraste élevé pour la lisibilité
- Taille de texte adaptée
- Feedback visuel clair pour les interactions

## Structure du projet

- `/lib/screens` : Pages principales de l'application
- `/lib/widgets` : Composants réutilisables
- `/lib/models` : Modèles de données
- `/lib/services` : Services (authentification, capteurs, etc.)
- `/lib/theme` : Configuration du thème
- `/lib/l10n` : Fichiers d'internationalisation

## Page de connexion

Interface minimaliste avec :
- Logo centré en haut
- Champ pour l'adresse e-mail
- Champ pour le mot de passe
- Bouton de connexion

## Tableau de bord

Interface moderne présentant :
- Logo dans la barre d'application
- 3 capteurs (Température, Humidité, Qualité de l'air)
- 2 dispositifs contrôlables (Climatiseur, Vidéo/projecteur)
- Mode économie d'énergie avec interrupteur
- Affichage en temps réel des données simulées
