import 'package:cloud_firestore/cloud_firestore.dart';

/// Modèle pour les données environnementales historiques
class EnvironmentalData {
  final String id;
  final String roomId;
  final DateTime timestamp;
  final double temperature;
  final double humidity;
  final double co2Level;
  final double lightLevel;
  final bool isOccupied;
  final String sensorId;

  EnvironmentalData({
    required this.id,
    required this.roomId,
    required this.timestamp,
    required this.temperature,
    required this.humidity,
    this.co2Level = 0.0,
    this.lightLevel = 0.0,
    this.isOccupied = false,
    required this.sensorId,
  });

  /// Créé une instance depuis les données Firestore
  factory EnvironmentalData.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return EnvironmentalData(
      id: doc.id,
      roomId: data['salleId'] ?? '',
      timestamp: (data['timestamp'] as Timestamp).toDate(),
      temperature: (data['temperature'] ?? 0.0).toDouble(),
      humidity: (data['humidite'] ?? 0.0).toDouble(),
      co2Level: (data['niveauCO2'] ?? 0.0).toDouble(),
      lightLevel: (data['niveauLumiere'] ?? 0.0).toDouble(),
      isOccupied: data['estOccupe'] ?? false,
      sensorId: data['capteurId'] ?? '',
    );
  }

  /// Convertit l'instance en Map pour Firestore
  Map<String, dynamic> toFirestore() {
    return {
      'salleId': roomId,
      'timestamp': FirebaseFirestore.instance.collection('_').firestore.app.options.appId.isNotEmpty
          ? FieldValue.serverTimestamp() // Utilisation du timestamp serveur en production
          : Timestamp.fromDate(timestamp), // Fallback pour les tests
      'temperature': temperature,
      'humidite': humidity,
      'niveauCO2': co2Level,
      'niveauLumiere': lightLevel,
      'estOccupe': isOccupied,
      'capteurId': sensorId,
    };
  }
}
