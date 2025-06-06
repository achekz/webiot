import 'dart:math';
import 'package:flutter/material.dart';
import 'package:iotapp/generated/l10n.dart'; // Added import
import '../models/dashboard_item.dart';
import '../models/device_control.dart';
import '../services/sensor_service.dart';
import '../services/notification_service.dart';
import '../models/notification.dart';
import '../widgets/common_drawer.dart';
import '../widgets/device_card.dart';
import '../widgets/sensor_card.dart';
import '../widgets/status_items.dart';
import '../utils/constants.dart';
import '../theme/app_theme.dart';

/// Écran principal du tableau de bord
///
/// Affiche l'état de la salle, les capteurs et les appareils contrôlables
class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key}); // Use super.key

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final SensorService _sensorService = SensorService();
  bool _energySavingMode = false;

  /// Liste des éléments du tableau de bord (capteurs)
  final List<DashboardItem> _dashboardItems = [
    DashboardItem(
      title: 'Température',
      icon: Icons.thermostat,
      value: '24°C',
      color: AppTheme.primaryColor,
      threshold: 26.0,
    ),
    DashboardItem(
      title: 'Humidité',
      icon: Icons.water_drop,
      value: '45%',
      color: AppTheme.secondaryColor,
      threshold: 60.0,
    ),
    DashboardItem(
      title: 'Qualité de l\'air',
      icon: Icons.air,
      value: 'Bonne',
      color: AppTheme.successColor,
      threshold: 50.0,
    ),
  ];

  /// Liste des appareils contrôlables (uniquement les 2 appareils requis)
  final List<DeviceControl> _devices = [
    DeviceControl(
      name: 'Climatiseur',
      icon: Icons.ac_unit,
      isOn: false,
      type: DeviceType.airConditioner,
    ),
    DeviceControl(
      name: 'Vidéo/projecteur',
      icon: Icons.videocam,
      isOn: false,
      type: DeviceType.projector,
    ),
  ];

  @override
  void initState() {
    super.initState();

    // Écoute les mises à jour des capteurs
    _sensorService.sensorStream.listen((data) {
      setState(() {
        // Met à jour les valeurs des capteurs
        _dashboardItems[0].value = '${data.temperature.toStringAsFixed(1)}°C';
        _dashboardItems[1].value = '${data.humidity.toStringAsFixed(1)}%';
        _dashboardItems[2].value = data.airQuality; // Remove unnecessary interpolation

        // Vérifie les anomalies et envoie des notifications
        if (data.temperature > _dashboardItems[0].threshold) {
          NotificationService().sendNotification(
            title: 'Temperature Alert',
            message: 'Room temperature exceeds ${_dashboardItems[0].threshold}°C',
            type: NotificationType.warning,
            icon: Icons.warning,
          );
        }
        if (data.humidity > _dashboardItems[1].threshold) {
          NotificationService().sendNotification(
            title: 'Humidity Alert',
            message: 'Room humidity exceeds ${_dashboardItems[1].threshold}%',
            type: NotificationType.warning,
            icon: Icons.warning,
          );
        }
      });

      // Logique du mode économie d'énergie
      if (_energySavingMode) {
        setState(() {
          // Allume/éteint les lumières en fonction de la présence et de la luminosité
          _devices[0].isOn = data.presence > 0 && data.luminosity < 500;
          // Allume/éteint la climatisation en fonction de la présence et de la température
          _devices[1].isOn = data.presence > 0 && data.temperature > 24;
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final localizations = AppLocalizations.of(context)!; // Fixed localizations

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            // Logo de l'application
            Image.asset(
              'assets/logo.png',
              height: 36,
              fit: BoxFit.contain,
            ),
            const SizedBox(width: 12),
            Text(localizations.appName),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications),
            onPressed: () => _showNotifications(context),
          ),
        ],
      ),
      drawer: const CommonDrawer(),
      body: RefreshIndicator(
        onRefresh: () async {
          _sensorService.refreshData();
          await Future.delayed(const Duration(milliseconds: 800));
        },
        child: SingleChildScrollView( // Replaced ListView with SingleChildScrollView
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start, // Moved crossAxisAlignment here
            children: [
              Padding(
                padding: const EdgeInsets.all(16.0), // Add padding for better layout
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      organizationName,
                      style: TextStyle(fontSize: 18, color: Colors.black54),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      defaultUsername,
                      style: TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.2,
                      ),
                    ),
                    const SizedBox(height: 24),
                    RoomStatusCard(energySavingMode: _energySavingMode),
                    const SizedBox(height: 24),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          localizations.energySavingMode,
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w600,
                            color: AppTheme.primaryColor,
                          ),
                        ),
                        Switch(
                          value: _energySavingMode,
                          onChanged: (value) {
                            setState(() {
                              _energySavingMode = value;
                              if (value) {
                                NotificationService().sendNotification(
                                  title: 'Energy Saving Mode',
                                  message: 'Energy-saving mode activated',
                                  type: NotificationType.info,
                                );
                              }
                            });
                          },
                          activeColor: AppTheme.primaryColor,
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        crossAxisSpacing: 16,
                        mainAxisSpacing: 16,
                        childAspectRatio: 1,
                      ),
                      itemCount: _devices.length,
                      itemBuilder: (_, index) {
                        final device = _devices[index];
                        return DeviceCard(
                          device: device,
                          onTap: () => setState(() => device.isOn = !device.isOn),
                        );
                      },
                    ),
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          localizations.smartSensors,
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w600,
                            color: AppTheme.primaryColor,
                          ),
                        ),
                        IconButton(
                          icon: Icon(Icons.refresh, color: AppTheme.primaryColor),
                          onPressed: () => _sensorService.refreshData(),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        childAspectRatio: 1.2,
                        crossAxisSpacing: 16,
                        mainAxisSpacing: 16,
                      ),
                      itemCount: _dashboardItems.length,
                      itemBuilder: (context, index) {
                        return SensorCard(item: _dashboardItems[index]);
                      },
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  /// Affiche les notifications récentes
  void _showNotifications(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (BuildContext context) {
        return Container(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                AppLocalizations.of(context)!.notifications, // Fixed localizations
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.primaryColor,
                ),
              ),
              const SizedBox(height: 16),
              _buildNotificationItem(
                'Temperature Alert',
                'Room temperature exceeds 26°C',
                Icons.warning,
                Colors.orange,
              ),
              _buildNotificationItem(
                'Door Opened',
                'Main entrance door opened at 14:30',
                Icons.door_back_door,
                fsmBlue,
              ),
            ],
          ),
        );
      },
    );
  }

  /// Construit un élément de notification
  Widget _buildNotificationItem(
      String title, String subtitle, IconData icon, Color color) {
    return ListTile(
      leading: Icon(icon, color: color),
      title: Text(
        title,
        style: const TextStyle(fontWeight: FontWeight.bold),
      ),
      subtitle: Text(subtitle),
      trailing: const Icon(Icons.chevron_right),
    );
  }
}