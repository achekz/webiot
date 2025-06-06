/// Modèle pour les données des capteurs
///
/// Représente les valeurs actuelles des différents capteurs
/// de la salle connectée
class SensorData {
  /// Température actuelle en degrés Celsius
  final double temperature;
  
  /// Taux d'humidité en pourcentage
  final double humidity;
  
  /// Qualité de l'air (description textuelle)
  final String airQuality;
  
  /// Niveau de luminosité en lux
  final double luminosity;
  
  /// Nombre de personnes détectées dans la salle
  final int presence;

  SensorData({
    required this.temperature,
    required this.humidity,
    required this.airQuality,
    required this.luminosity,
    required this.presence,
  });
}