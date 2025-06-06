import 'package:flutter/material.dart';
import '../models/device_control.dart';
import '../utils/constants.dart';

/// Widget de carte pour afficher un appareil contrôlable
///
/// Affiche l'état de l'appareil et permet de l'allumer/éteindre
class DeviceCard extends StatelessWidget {
  final DeviceControl device;
  final VoidCallback onTap;

  const DeviceCard({
    Key? key,
    required this.device,
    required this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isOn = device.isOn;
    final background = isOn ? fsmBlue : offWhite;
    final iconColor = isOn ? fsmYellow : Colors.black87;
    final labelColor = isOn ? Colors.white : Colors.black87;

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: background,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(device.icon, size: 36, color: iconColor),
            const Spacer(),
            Text(
              device.name.toUpperCase(),
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: labelColor,
              ),
            ),
            const SizedBox(height: 8),
            Align(
              alignment: Alignment.centerRight,
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                width: 50,
                height: 26,
                padding: const EdgeInsets.symmetric(horizontal: 4),
                decoration: BoxDecoration(
                  color: isOn ? fsmYellow : Colors.grey.shade400,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: AnimatedAlign(
                  duration: const Duration(milliseconds: 300),
                  alignment: isOn ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    width: 20,
                    height: 20,
                    decoration: BoxDecoration(
                      color: isOn ? fsmBlue : Colors.white,
                      shape: BoxShape.circle,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}