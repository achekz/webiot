import 'package:flutter/material.dart';
// import 'package:firebase_auth/firebase_auth.dart';

/// Service de gestion de l'authentification
///
/// Gère la connexion et déconnexion des utilisateurs
class AuthService {
  static final AuthService _instance = AuthService._internal();
  
  /// Constructeur factory pour assurer un singleton
  factory AuthService() => _instance;
  
  AuthService._internal() {
    // For testing purposes only
    _mockAuthenticated = false;
  }

  // Mock data for testing
  bool _mockAuthenticated = false;
  String? _mockUserEmail;

  /// Vérifie si un utilisateur est actuellement authentifié
  bool get isAuthenticated => _mockAuthenticated; // _firebaseAuth.currentUser != null;
  
  /// Nom de l'utilisateur actuellement connecté
  String? get currentUser => _mockUserEmail; // _firebaseAuth.currentUser?.email;

  /// Authentifie un utilisateur avec son adresse e-mail et mot de passe
  ///
  /// Retourne true si l'authentification réussit, false sinon
  Future<bool> login(String email, String password) async {
    try {
      // For testing, accept any email/password combination
      // In production, use Firebase Auth
      // await _firebaseAuth.signInWithEmailAndPassword(email: email, password: password);
      _mockAuthenticated = true;
      _mockUserEmail = email;
      return true;
    } catch (e) {
      return false;
    }
  }

  /// Déconnecte l'utilisateur actuellement authentifié
  Future<void> logout() async {
    // await _firebaseAuth.signOut();
    _mockAuthenticated = false;
    _mockUserEmail = null;
  }
}