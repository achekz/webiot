import 'package:flutter/material.dart';
import '../utils/constants.dart';

/// Widget pour afficher les éléments de statut dans l'écran d'accueil
/// 
/// Affiche un élément de statut avec une icône, un titre et une valeur
class StatusItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final String status;

  const StatusItem({
    Key? key,
    required this.icon,
    required this.label,
    required this.status,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Icon(icon, color: fsmBlue, size: 32),
        const SizedBox(height: 4),
        Text(label, style: TextStyle(color: fsmBlue)),
        Text(
          status,
          style: TextStyle(
            color: fsmBlue.withOpacity(0.8),
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }
}

/// Widget pour afficher la carte de statut de la salle
///
/// Regroupe plusieurs éléments de statut dans une carte
class RoomStatusCard extends StatelessWidget {
  final bool energySavingMode;

  const RoomStatusCard({
    Key? key,
    required this.energySavingMode,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: offWhite,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Room Status',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: fsmBlue,
            ),
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              StatusItem(icon: Icons.power, label: 'Power', status: 'On'),
              StatusItem(
                icon: Icons.ac_unit, 
                label: 'AC', 
                status: energySavingMode ? 'Auto' : 'Manual'
              ),
              StatusItem(
                icon: Icons.light, 
                label: 'Lights', 
                status: energySavingMode ? 'Auto' : 'Manual'
              ),
            ],
          ),
        ],
      ),
    );
  }
}