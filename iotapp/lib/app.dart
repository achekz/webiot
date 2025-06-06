import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:iotapp/generated/l10n.dart';
import 'package:iotapp/services/theme_service.dart';
import 'package:iotapp/theme/app_theme.dart';
import 'package:iotapp/services/auth_service.dart';
import 'package:iotapp/screens/login_screen.dart';
import 'package:iotapp/screens/dashboard_screen.dart';
import 'package:iotapp/screens/devices_page.dart';
import 'package:iotapp/screens/settings_page.dart';
import 'package:iotapp/screens/profile_page.dart';
import 'package:iotapp/screens/access_control_page.dart';
import 'package:iotapp/screens/room_detail_screen.dart';
import 'package:iotapp/screens/environmental_data_screen.dart';
import 'package:iotapp/screens/alerts_history_screen.dart';
// import 'package:iotapp/widgets/notification_listener.dart';

/// Configuration principale de l'application Smart Salle
/// Définit les thèmes, les routes et la structure globale
class SmartSalleApp extends StatefulWidget {
  const SmartSalleApp({Key? key}) : super(key: key);

  @override
  _SmartSalleAppState createState() => _SmartSalleAppState();
}

class _SmartSalleAppState extends State<SmartSalleApp> {
  final ThemeService _themeService = ThemeService();
  final AuthService _authService = AuthService();

  @override
  void initState() {
    super.initState();
    // Set up a listener for theme changes
    _themeService.themeStream.listen((themeMode) {
      setState(() {});
    });
  }

  @override
  void dispose() {
    // Clean up resources
    _themeService.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Smart Salle',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme(), // Theme applied from ThemeService
      // Localization support
      localizationsDelegates: const [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [
        Locale('fr'), // French only
      ],
      locale: const Locale('fr'),
      // Set initial route based on authentication status
      initialRoute: _authService.isAuthenticated ? '/' : LoginScreen.routeName,
      routes: {
        LoginScreen.routeName: (context) => const LoginScreen(),
        '/': (context) => const AuthGuard(child: DashboardScreen()),
        DevicesPage.routeName: (context) => const AuthGuard(child: DevicesPage()),
        SettingsPage.routeName: (context) => const AuthGuard(child: SettingsPage()),
        ProfilePage.routeName: (context) => const AuthGuard(child: ProfilePage()),
        AccessControlPage.routeName: (context) => const AuthGuard(child: AccessControlPage()),
        RoomDetailScreen.routeName: (context) => const AuthGuard(child: RoomDetailScreen()),
        AlertsHistoryScreen.routeName: (context) => const AuthGuard(child: AlertsHistoryScreen()),
        // Note: EnvironmentalDataScreen requires roomId parameter, so it's handled in the drawer
      },
      builder: (context, child) {
        // Simple builder - notification listener temporarily disabled
        return child!;
      },
    );
  }
}

/// Garde d'authentification pour protéger les routes
/// Redirige vers la page de connexion si l'utilisateur n'est pas authentifié
class AuthGuard extends StatelessWidget {
  final Widget child;

  const AuthGuard({Key? key, required this.child}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final authService = AuthService();

    if (!authService.isAuthenticated) {
      // Redirect to login screen if not authenticated
      WidgetsBinding.instance.addPostFrameCallback((_) {
        Navigator.of(context).pushReplacementNamed(LoginScreen.routeName);
      });
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }
    return child; // Return the protected screen if authenticated
  }
}