import 'package:flutter/material.dart';
import 'package:iotapp/utils/constants.dart';
import 'package:iotapp/widgets/common_drawer.dart';
import 'package:iotapp/services/theme_service.dart';

/// Écran des paramètres de l'application
/// Permet à l'utilisateur de configurer les options de l'application
class SettingsPage extends StatefulWidget {
  static const routeName = '/settings';

  const SettingsPage({Key? key}) : super(key: key);

  @override
  _SettingsPageState createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  bool _notificationsEnabled = true;
  bool _darkModeEnabled = false; // You may want to sync with ThemeService
  String _selectedLanguage = 'Français'; // Match the displayed language

  final ThemeService _themeService = ThemeService();

  @override
  void initState() {
    super.initState();
    // Optional: Initialize _darkModeEnabled from ThemeService if possible
    // _darkModeEnabled = _themeService.isDarkModeEnabled();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: offWhite,
        elevation: 1,
        title: Text('Paramètres', style: TextStyle(color: fsmBlue)),
        leading: Builder(
          builder: (BuildContext context) {
            return IconButton(
              icon: const Icon(Icons.menu, color: Colors.black87),
              onPressed: () {
                Scaffold.of(context).openDrawer();
              },
            );
          },
        ),
      ),
      drawer: const CommonDrawer(),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildSettingsSection(
            title: 'Notifications',
            children: [
              SwitchListTile(
                title: const Text('Activer les notifications'),
                value: _notificationsEnabled,
                onChanged: (bool value) {
                  setState(() {
                    _notificationsEnabled = value;
                  });
                },
              ),
            ],
          ),
          _buildSettingsSection(
            title: 'Affichage',
            children: [
              SwitchListTile(
                title: const Text('Mode sombre'),
                value: _darkModeEnabled,
                onChanged: (bool value) {
                  setState(() {
                    _darkModeEnabled = value;
                    _themeService.toggleTheme();
                  });
                },
              ),
              ListTile(
                title: const Text('Langue'),
                trailing: Text(_selectedLanguage),
                onTap: _showLanguageDialog,
              ),
            ],
          ),
          _buildSettingsSection(
            title: 'À propos',
            children: [
              ListTile(
                title: const Text('Version de l\'application'),
                trailing: const Text(appVersion),
              ),
              ListTile(
                title: const Text('Licences'),
                trailing: const Icon(Icons.chevron_right),
                onTap: _showLicensesPage,
              ),
            ],
          ),
        ],
      ),
    );
  }

  /// Construit une section de paramètres
  Widget _buildSettingsSection({
    required String title,
    required List<Widget> children,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 8),
          child: Text(
            title,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: fsmBlue,
            ),
          ),
        ),
        Card(
          elevation: 2,
          margin: const EdgeInsets.only(bottom: 16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          child: Column(children: children),
        ),
      ],
    );
  }

  /// Affiche la boîte de dialogue pour choisir la langue
  void _showLanguageDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Sélectionner la langue'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildLanguageOption('Français'),
              _buildLanguageOption('Anglais'),
              _buildLanguageOption('Arabe'),
            ],
          ),
        );
      },
    );
  }

  /// Construit une option de langue dans la boîte de dialogue
  Widget _buildLanguageOption(String language) {
    return ListTile(
      title: Text(language),
      trailing: _selectedLanguage == language
          ? Icon(Icons.check, color: fsmBlue)
          : null,
      onTap: () {
        setState(() {
          _selectedLanguage = language;
        });
        Navigator.of(context).pop();
      },
    );
  }

  /// Affiche la page des licences
  void _showLicensesPage() {
    showLicensePage(
      context: context,
      applicationName: appName,
      applicationVersion: appVersion,
    );
  }
}
