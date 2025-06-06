import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

/// Configuration options for Firebase pour le projet Smart Salle
class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      case TargetPlatform.macOS:
        return macos;
      case TargetPlatform.windows:
        return windows;
      case TargetPlatform.linux:
        return linux;
      default:
        throw UnsupportedError(
          'DefaultFirebaseOptions are not supported for this platform.',
        );
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyAMsoTwijlhDbRNbIiz8UjGY_jvOVI7hWE',
    appId: '1:487521949996:web:123456789abcdef',
    messagingSenderId: '487521949996',
    projectId: 'iotfsm',
    authDomain: 'iotfsm.firebaseapp.com',
    storageBucket: 'iotfsm.appspot.com',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyAMsoTwijlhDbRNbIiz8UjGY_jvOVI7hWE',
    appId: '1:487521949996:android:123456789abcdef',
    messagingSenderId: '487521949996',
    projectId: 'iotfsm',
    storageBucket: 'iotfsm.appspot.com',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyAMsoTwijlhDbRNbIiz8UjGY_jvOVI7hWE',
    appId: '1:487521949996:ios:123456789abcdef',
    messagingSenderId: '487521949996',
    projectId: 'iotfsm',
    storageBucket: 'iotfsm.appspot.com',
    iosClientId: '487521949996-iosid.apps.googleusercontent.com',
    iosBundleId: 'com.example.iotfsm',
  );

  static const FirebaseOptions macos = FirebaseOptions(
    apiKey: 'AIzaSyAMsoTwijlhDbRNbIiz8UjGY_jvOVI7hWE',
    appId: '1:487521949996:macos:123456789abcdef',
    messagingSenderId: '487521949996',
    projectId: 'iotfsm',
    storageBucket: 'iotfsm.appspot.com',
    iosClientId: '487521949996-macosid.apps.googleusercontent.com',
    iosBundleId: 'com.example.iotfsm',
  );

  static const FirebaseOptions windows = FirebaseOptions(
    apiKey: 'AIzaSyAMsoTwijlhDbRNbIiz8UjGY_jvOVI7hWE',
    appId: '1:487521949996:windows:123456789abcdef',
    messagingSenderId: '487521949996',
    projectId: 'iotfsm',
    storageBucket: 'iotfsm.appspot.com',
  );

  static const FirebaseOptions linux = FirebaseOptions(
    apiKey: 'AIzaSyAMsoTwijlhDbRNbIiz8UjGY_jvOVI7hWE',
    appId: '1:487521949996:linux:123456789abcdef',
    messagingSenderId: '487521949996',
    projectId: 'iotfsm',
    storageBucket: 'iotfsm.appspot.com',
  );
}
