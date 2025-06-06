import 'dart:async';
import 'package:flutter/material.dart';
import '../models/notification.dart';

/// Service de gestion des notifications de l'application
///
/// Permet d'envoyer des notifications aux utilisateurs et les afficher
/// dans l'interface graphique
class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  
  /// Constructeur factory pour assurer un singleton
  factory NotificationService() => _instance;
  
  NotificationService._internal();

  /// Contrôleur de flux pour émettre les notifications
  final StreamController<AppNotification> _notificationController =
      StreamController<AppNotification>.broadcast();

  /// Flux de notifications accessible aux écouteurs
  Stream<AppNotification> get notificationStream => _notificationController.stream;

  /// Envoie une notification aux écouteurs
  void sendNotification({
    required String title,
    required String message,
    NotificationType type = NotificationType.info,
    IconData? icon,
  }) {
    final notification = AppNotification(
      title: title,
      message: message,
      type: type,
      icon: icon ?? _getDefaultIcon(type),
    );
    _notificationController.add(notification);
  }

  /// Retourne l'icône par défaut selon le type de notification
  IconData _getDefaultIcon(NotificationType type) {
    switch (type) {
      case NotificationType.success:
        return Icons.check_circle;
      case NotificationType.error:
        return Icons.error;
      case NotificationType.warning:
        return Icons.warning;
      case NotificationType.info:
      default:
        return Icons.info;
    }
  }

  /// Libère les ressources lors de la fermeture de l'application
  void dispose() {
    _notificationController.close();
  }
}