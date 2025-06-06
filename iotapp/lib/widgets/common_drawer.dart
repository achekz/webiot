import 'package:flutter/material.dart';
import '../services/theme_service.dart';
import '../services/auth_service.dart';
import '../screens/login_page.dart';
import '../screens/dashboard_screen.dart';
import '../screens/devices_page.dart';
import '../screens/settings_page.dart';
import '../screens/profile_page.dart' as profile;
import '../screens/access_control_page.dart';
import '../screens/room_detail_screen.dart';
import '../screens/environmental_data_screen.dart';
import '../screens/alerts_history_screen.dart';
import '../widgets/notification_listener.dart';
import '../utils/constants.dart';

class CommonDrawer extends StatelessWidget {
  const CommonDrawer({super.key}); // Use super parameter

  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          DrawerHeader(
            decoration: BoxDecoration(color: fsmBlue), // From constants.dart
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                CircleAvatar(
                  radius: 30,
                  backgroundImage: NetworkImage(userAvatarUrl), // From constants.dart
                ),
                const SizedBox(height: 8),
                Text(
                  defaultUsername, // From constants.dart
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  defaultEmail, // From constants.dart
                  style: const TextStyle(
                    color: Colors.white70,
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),
          ListTile(
            leading: const Icon(Icons.dashboard),
            title: const Text('Dashboard'),
            onTap: () {
              Navigator.pop(context);
              Navigator.pushNamed(context, '/');
            },
          ),
          ListTile(
            leading: const Icon(Icons.meeting_room),
            title: const Text('Ma Salle'),
            onTap: () {
              Navigator.pop(context);
              Navigator.pushNamed(context, RoomDetailScreen.routeName);
            },
          ),
          ListTile(
            leading: const Icon(Icons.devices),
            title: const Text('Appareils'),
            onTap: () {
              Navigator.pop(context);
              Navigator.pushNamed(context, DevicesPage.routeName);
            },
          ),
          ListTile(
            leading: const Icon(Icons.show_chart),
            title: const Text('Analyse Environnementale'),
            onTap: () {
              Navigator.pop(context);
              // Récupérer l'ID de la salle assignée au professeur
              // depuis le context ou les services
              Navigator.push(
                context, 
                MaterialPageRoute(
                  builder: (context) => EnvironmentalDataScreen(roomId: 'ROOM_ID_HERE'),
                ),
              );
            },
          ),
          ListTile(
            leading: const Icon(Icons.notification_important),
            title: const Text('Alertes'),
            onTap: () {
              Navigator.pop(context);
              Navigator.pushNamed(context, AlertsHistoryScreen.routeName);
            },
          ),
          ListTile(
            leading: const Icon(Icons.vpn_key),
            title: const Text('Contrôle d\'Accès'),
            onTap: () {
              Navigator.pop(context);
              Navigator.pushNamed(context, AccessControlPage.routeName);
            },
          ),
          ListTile(
            leading: const Icon(Icons.settings),
            title: const Text('Paramètres'),
            onTap: () {
              Navigator.pop(context);
              Navigator.pushNamed(context, SettingsPage.routeName);
            },
          ),
          ListTile(
            leading: const Icon(Icons.person),
            title: const Text('Profil'),
            onTap: () {
              Navigator.pop(context);
              Navigator.pushNamed(context, profile.ProfilePage.routeName);
            },
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.logout),
            title: const Text('Logout'),
            onTap: () async {
              await AuthService().logout();
              // ignore: use_build_context_synchronously
              Navigator.pushReplacementNamed(context, LoginPage.routeName);
            },
          ),
        ],
      ),
    );
  }
}