import 'dart:async';
import 'package:flutter/material.dart';
import '../models/notification.dart';
import '../services/notification_service.dart';
import '../utils/constants.dart';

/// Widget qui écoute les notifications et les affiche
///
/// Intercepte les notifications du service et les affiche à l'utilisateur
/// sous forme de SnackBar
class NotificationListenerWidget extends StatefulWidget {
  final Widget child;

  const NotificationListenerWidget({Key? key, required this.child}) : super(key: key);

  @override
  _NotificationListenerWidgetState createState() => _NotificationListenerWidgetState();
}

class _NotificationListenerWidgetState extends State<NotificationListenerWidget> {
  final NotificationService _notificationService = NotificationService();
  late StreamSubscription _subscription;

  @override
  void initState() {
    super.initState();
    
    // S'abonne au flux de notifications
    _subscription = _notificationService.notificationStream.listen((notification) {
      _showNotification(notification);
    });
  }

  @override
  void dispose() {
    // Annule l'abonnement lors de la destruction du widget
    _subscription.cancel();
    super.dispose();
  }

  /// Affiche une notification sous forme de SnackBar
  void _showNotification(AppNotification notification) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(
              notification.icon,
              color: _getColorForNotificationType(notification.type),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    notification.title,
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  Text(notification.message),
                ],
              ),
            ),
          ],
        ),
        backgroundColor: _getBackgroundColorForNotificationType(notification.type),
        duration: const Duration(seconds: 3),
      ),
    );
  }

  /// Retourne la couleur d'icône en fonction du type de notification
  Color _getColorForNotificationType(NotificationType type) {
    switch (type) {
      case NotificationType.success:
        return Colors.green;
      case NotificationType.error:
        return Colors.red;
      case NotificationType.warning:
        return Colors.orange;
      case NotificationType.info:
      default:
        return fsmBlue;
    }
  }

  /// Retourne la couleur de fond en fonction du type de notification
  Color _getBackgroundColorForNotificationType(NotificationType type) {
    switch (type) {
      case NotificationType.success:
        return Colors.green.shade50;
      case NotificationType.error:
        return Colors.red.shade50;
      case NotificationType.warning:
        return Colors.orange.shade50;
      case NotificationType.info:
      default:
        return offWhite;
    }
  }

  @override
  Widget build(BuildContext context) {
    return widget.child;
  }
}