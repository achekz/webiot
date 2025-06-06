// Fichier principal qui initialise l'application
import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'app.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Disable Firebase for now
  if (kDebugMode) {
    print('Running in debug mode without Firebase');
  }
  
  runApp(const SmartSalleApp());
}