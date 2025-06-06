import 'dart:async';
import 'package:flutter/material.dart';
import '../utils/constants.dart';

/// Service de gestion des thèmes de l'application
///
/// Permet de basculer entre les thèmes clair et sombre
class ThemeService {
  static final ThemeService _instance = ThemeService._internal();
  
  /// Constructeur factory pour assurer un singleton
  factory ThemeService() => _instance;
  
  ThemeService._internal();

  final _themeController = StreamController<ThemeMode>.broadcast();
  
  /// Flux du thème actuel accessible aux écouteurs
  Stream<ThemeMode> get themeStream => _themeController.stream;

  ThemeMode _currentTheme = ThemeMode.light;
  
  /// Mode de thème actuellement utilisé (clair ou sombre)
  ThemeMode get currentTheme => _currentTheme;

  /// Bascule entre les thèmes clair et sombre
  void toggleTheme() {
    _currentTheme = _currentTheme == ThemeMode.light
        ? ThemeMode.dark
        : ThemeMode.light;
    _themeController.add(_currentTheme);
  }

  /// Définit explicitement le mode de thème à utiliser
  void setTheme(ThemeMode mode) {
    _currentTheme = mode;
    _themeController.add(_currentTheme);
  }

  /// Libère les ressources lors de la fermeture de l'application
  void dispose() {
    _themeController.close();
  }

  /// Retourne le thème clair de l'application
  ThemeData getLightTheme() {
    return ThemeData(
      primarySwatch: Colors.blue,
      brightness: Brightness.light,
      scaffoldBackgroundColor: offWhite,
      fontFamily: 'Roboto',
      colorScheme: ColorScheme.fromSeed(
        seedColor: fsmBlue,
        brightness: Brightness.light,
      ),
      appBarTheme: const AppBarTheme(
        color: offWhite,
        iconTheme: IconThemeData(color: Colors.black87),
        elevation: 1,
      ),
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: fsmBlue,
          foregroundColor: Colors.white,
        ),
      ),
    );
  }

  /// Retourne le thème sombre de l'application
  ThemeData getDarkTheme() {
    return ThemeData(
      primarySwatch: Colors.blue,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: Colors.grey[900],
      fontFamily: 'Roboto',
      colorScheme: ColorScheme.fromSeed(
        seedColor: fsmBlue,
        brightness: Brightness.dark,
      ),
      appBarTheme: const AppBarTheme(
        elevation: 1,
        color: Colors.grey,
      ),
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: fsmBlue,
          foregroundColor: Colors.white,
        ),
      ),
    );
  }
}