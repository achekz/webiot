import 'package:flutter/material.dart';
import '../models/dashboard_item.dart';

/// Widget de carte pour afficher les données d'un capteur
///
/// Affiche les informations d'un capteur (température, humidité, etc.)
/// avec une icône et une couleur distinctives
class SensorCard extends StatelessWidget {
  final DashboardItem item;

  const SensorCard({
    Key? key,
    required this.item,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: item.color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: item.color.withOpacity(0.3), width: 1),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(item.icon, size: 48, color: item.color),
          const SizedBox(height: 8),
          Text(
            item.title,
            style: TextStyle(
              fontSize: 16,
              color: item.color,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            item.value,
            style: TextStyle(
              fontSize: 20,
              color: item.color,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}