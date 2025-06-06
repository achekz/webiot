import 'package:flutter/material.dart';

/// Types d'appareils pouvant être contrôlés dans la salle
enum DeviceType {
  light,
  airConditioner,
  projector,
  fan,
}

/// Modèle pour les appareils contrôlables dans la salle
/// 
/// Représente un appareil connecté pouvant être contrôlé
/// via l'application (allumer/éteindre)
class DeviceControl {
  /// Nom de l'appareil
  String name;
  
  /// Icône représentant l'appareil
  IconData icon;
  
  /// État actuel de l'appareil (allumé/éteint)
  bool isOn;
  
  /// Type d'appareil (éclairage, climatiseur, etc.)
  DeviceType type;

  DeviceControl({
    required this.name,
    required this.icon,
    required this.isOn,
    required this.type,
  });
}