import 'dart:async';
import 'dart:math';
import 'package:iotapp/models/access_log.dart';
import 'package:iotapp/services/notification_service.dart';
import 'package:iotapp/models/notification.dart';
import 'package:flutter/material.dart';

/// Service de gestion du contrôle d'accès
///
/// Gère les accès à la salle et enregistre les logs
class AccessControlService {
  static final AccessControlService _instance = AccessControlService._internal();
  
  /// Constructeur factory pour assurer un singleton
  factory AccessControlService() => _instance;
  
  AccessControlService._internal();

  final _accessLogController = StreamController<List<AccessLog>>.broadcast();
  
  /// Flux des logs d'accès accessible aux écouteurs
  Stream<List<AccessLog>> get accessLogStream => _accessLogController.stream;
  
  final List<AccessLog> _logs = [];
  final Random _random = Random();

  /// Simule une demande d'accès à la salle
  ///
  /// Crée un log d'accès avec un résultat aléatoire (accès accordé ou refusé)
  void simulateAccessRequest(String userId) {
    final granted = _random.nextBool();
    final log = AccessLog(
      userId: userId,
      timestamp: DateTime.now(),
      granted: granted,
    );
    
    // Ajoute le log à la liste et notifie les écouteurs
    _logs.add(log);
    _accessLogController.add(_logs);
    
    // Envoie une notification d'accès
    NotificationService().sendNotification(
      title: 'Demande d\'accès',
      message: 'Accès ${granted ? 'accorde' : 'refuse'} pour $userId',
      type: granted ? NotificationType.success : NotificationType.error,
      icon: granted ? Icons.check_circle : Icons.cancel,
    );
  }

  /// Libère les ressources lors de la fermeture de l'application
  void dispose() {
    _accessLogController.close();
  }
}