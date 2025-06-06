import 'dart:async';
import 'dart:math';
import '../models/sensor_data.dart';

/// Service de simulation des capteurs
///
/// Génère des données simulées pour les capteurs de la salle
class SensorService {
  static final SensorService _instance = SensorService._internal();
  
  /// Constructeur factory pour assurer un singleton
  factory SensorService() => _instance;
  
  SensorService._internal() {
    // Démarre la simulation automatiquement lors de la création
    startSimulation();
  }

  final _sensorController = StreamController<SensorData>.broadcast();
  
  /// Flux de données des capteurs accessible aux écouteurs
  Stream<SensorData> get sensorStream => _sensorController.stream;
  
  final Random _random = Random();
  Timer? _timer;

  /// Démarre la simulation périodique des données des capteurs
  void startSimulation() {
    // Envoie des données immédiatement
    refreshData();
    
    // Configure un timer pour envoyer des données toutes les 5 secondes
    _timer = Timer.periodic(const Duration(seconds: 5), (_) {
      refreshData();
    });
  }

  /// Rafraîchit les données des capteurs avec de nouvelles valeurs simulées
  void refreshData() {
    // Génère une qualité d'air aléatoire
    final List<String> airQualityLevels = ['Excellente', 'Bonne', 'Moyenne', 'Mauvaise'];
    final String airQuality = airQualityLevels[_random.nextInt(airQualityLevels.length)];
    
    _sensorController.add(SensorData(
      temperature: 20 + _random.nextDouble() * 10, // 20-30°C
      humidity: 30 + _random.nextDouble() * 40,    // 30-70%
      airQuality: airQuality,                      // Qualité de l'air
      luminosity: 100 + _random.nextDouble() * 900, // 100-1000 lx
      presence: _random.nextInt(5),               // 0-4 personnes
    ));
  }

  /// Libère les ressources lors de la fermeture de l'application
  void dispose() {
    _timer?.cancel();
    _sensorController.close();
  }
}