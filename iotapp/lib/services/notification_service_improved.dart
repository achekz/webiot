import 'dart:async';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:iotapp/models/notification.dart';

class NotificationService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final StreamController<Notification> _notificationController = StreamController<Notification>.broadcast();
  
  String? _assignedRoomId;
  StreamSubscription<QuerySnapshot>? _userNotificationsSubscription;
  StreamSubscription<QuerySnapshot>? _roomAlertsSubscription;

  // Stream of notifications that UI can listen to
  Stream<Notification> get notificationStream => _notificationController.stream;

  NotificationService() {
    // Start listening to notification changes when service is initialized
    _initialize();
  }

  Future<void> _initialize() async {
    // Get current user
    final User? user = _auth.currentUser;
    if (user == null) return;
    
    try {
      // Get assigned room ID for the current user
      final userDoc = await _firestore.collection('utilisateurs')
          .where('email', isEqualTo: user.email)
          .limit(1)
          .get();
          
      if (userDoc.docs.isNotEmpty) {
        final userData = userDoc.docs.first.data();
        _assignedRoomId = userData['salleAssignee'];
      }
      
      // Set up listeners
      _setupNotificationListener();
      _setupRoomAlertsListener();
    } catch (e) {
      print('Error initializing notification service: $e');
    }
  }

  void _setupNotificationListener() {
    // Get current user
    final User? user = _auth.currentUser;
    if (user == null) return;

    // Cancel existing subscription if any
    _userNotificationsSubscription?.cancel();

    // Listen to notifications for this user
    _userNotificationsSubscription = _firestore
        .collection('notifications')
        .where('userId', isEqualTo: user.uid)
        .where('read', isEqualTo: false)
        .snapshots()
        .listen((snapshot) {
      for (var change in snapshot.docChanges) {
        if (change.type == DocumentChangeType.added) {
          // New unread notification
          final data = change.doc.data() as Map<String, dynamic>;
          final notification = Notification(
            id: change.doc.id,
            type: data['type'] ?? 'info',
            message: data['message'] ?? '',
            timestamp: (data['timestamp'] as Timestamp).toDate(),
            read: data['read'] ?? false,
            roomId: data['roomId'] ?? '',
          );
          _notificationController.add(notification);
        }
      }
    });
  }
  
  void _setupRoomAlertsListener() {
    // Return if no assigned room
    if (_assignedRoomId == null) return;
    
    // Cancel existing subscription if any
    _roomAlertsSubscription?.cancel();
    
    // Listen to alerts for the assigned room
    _roomAlertsSubscription = _firestore
        .collection('alertes')
        .where('salleId', isEqualTo: _assignedRoomId)
        .where('traitee', isEqualTo: false)
        .orderBy('dateCreation', descending: true)
        .snapshots()
        .listen((snapshot) {
      for (var change in snapshot.docChanges) {
        if (change.type == DocumentChangeType.added) {
          // New unread alert
          final data = change.doc.data() as Map<String, dynamic>;
          final notification = Notification(
            id: change.doc.id,
            type: data['type'] ?? 'alert',
            message: data['message'] ?? 'Alerte: ${data['type'] ?? "inconnue"}',
            timestamp: (data['dateCreation'] as Timestamp).toDate(),
            read: false,
            roomId: data['salleId'] ?? '',
          );
          _notificationController.add(notification);
        }
      }
    });
  }

  // Mark a notification as read
  Future<void> markAsRead(String notificationId, {bool isAlert = false}) async {
    try {
      final collection = isAlert ? 'alertes' : 'notifications';
      final updateData = isAlert 
          ? {
              'traitee': true,
              'dateTraitement': FieldValue.serverTimestamp(),
            }
          : {
              'read': true,
              'readAt': FieldValue.serverTimestamp(),
            };
            
      await _firestore.collection(collection).doc(notificationId).update(updateData);
    } catch (e) {
      print('Error marking notification as read: $e');
    }
  }
  
  // Get room alerts count
  Future<int> getUnreadAlertsCount() async {
    if (_assignedRoomId == null) return 0;
    
    try {
      final alertsSnapshot = await _firestore
          .collection('alertes')
          .where('salleId', isEqualTo: _assignedRoomId)
          .where('traitee', isEqualTo: false)
          .get();
          
      return alertsSnapshot.docs.length;
    } catch (e) {
      print('Error getting unread alerts count: $e');
      return 0;
    }
  }
  
  // Get assigned room ID
  String? get assignedRoomId => _assignedRoomId;

  // Dispose resources
  void dispose() {
    _userNotificationsSubscription?.cancel();
    _roomAlertsSubscription?.cancel();
    _notificationController.close();
  }
}
