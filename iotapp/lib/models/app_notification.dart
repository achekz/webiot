import 'package:cloud_firestore/cloud_firestore.dart';

class Notification {
  final String id;
  final String titre;
  final String message;
  final String type;
  final String salleId;
  final String salleName;
  final DateTime timestamp;
  final bool estTraitee;
  final DateTime? dateTraitement;

  Notification({
    required this.id,
    required this.titre,
    required this.message,
    required this.type,
    required this.salleId,
    required this.salleName,
    required this.timestamp,
    this.estTraitee = false,
    this.dateTraitement,
  });

  factory Notification.fromFirestore(DocumentSnapshot doc) {
    Map<String, dynamic> data = doc.data() as Map<String, dynamic>;
    return Notification(
      id: doc.id,
      titre: data['titre'] ?? '',
      message: data['message'] ?? '',
      type: data['type'] ?? 'info',
      salleId: data['salleId'] ?? '',
      salleName: data['salleName'] ?? '',
      timestamp: (data['dateCreation'] is Timestamp) 
          ? (data['dateCreation'] as Timestamp).toDate() 
          : DateTime.now(),
      estTraitee: data['estTraitee'] ?? false,
      dateTraitement: (data['dateTraitement'] is Timestamp) 
          ? (data['dateTraitement'] as Timestamp).toDate() 
          : null,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'titre': titre,
      'message': message,
      'type': type,
      'salleId': salleId,
      'salleName': salleName,
      'dateCreation': FieldValue.serverTimestamp(),
      'estTraitee': estTraitee,
      'dateTraitement': dateTraitement != null ? Timestamp.fromDate(dateTraitement!) : null,
    };
  }

  Notification copyWith({
    String? id,
    String? titre,
    String? message,
    String? type,
    String? salleId,
    String? salleName,
    DateTime? timestamp,
    bool? estTraitee,
    DateTime? dateTraitement,
  }) {
    return Notification(
      id: id ?? this.id,
      titre: titre ?? this.titre,
      message: message ?? this.message,
      type: type ?? this.type,
      salleId: salleId ?? this.salleId,
      salleName: salleName ?? this.salleName,
      timestamp: timestamp ?? this.timestamp,
      estTraitee: estTraitee ?? this.estTraitee,
      dateTraitement: dateTraitement ?? this.dateTraitement,
    );
  }
}
