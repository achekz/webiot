import 'package:flutter/material.dart';

/// Modèle pour les éléments du tableau de bord
/// 
/// Représente un élément de tableau de bord affichant des données
/// provenant des capteurs (température, humidité, luminosité, présence)
class DashboardItem {
  /// Titre de l'élément (ex: "Température")
  final String title;
  
  /// Icône représentant le type de capteur
  final IconData icon;
  
  /// Valeur actuelle du capteur (ex: "24°C")
  String value;
  
  /// Couleur associée à cet élément pour la cohérence visuelle
  final Color color;
  
  /// Seuil au-delà duquel une alerte peut être déclenchée
  final double threshold;

  DashboardItem({
    required this.title,
    required this.icon,
    required this.value,
    required this.color,
    required this.threshold,
  });
}