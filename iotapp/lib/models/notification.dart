import 'package:flutter/material.dart';

/// Types de notifications pouvant être affichées dans l'application
enum NotificationType {
  success,
  error,
  warning,
  info,
}

/// Modèle pour les notifications de l'application
///
/// Utilisé pour afficher des messages informatifs à l'utilisateur
class AppNotification {
  /// Titre de la notification
  final String title;
  
  /// Contenu du message
  final String message;
  
  /// Type de notification (succès, erreur, avertissement, info)
  final NotificationType type;
  
  /// Icône associée à la notification
  final IconData icon;

  AppNotification({
    required this.title,
    required this.message,
    required this.type,
    required this.icon,
  });
}