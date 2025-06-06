import 'package:cloud_firestore/cloud_firestore.dart';

class Room {
  final String id;
  final String nom;
  final String batiment;
  final int etage;
  final int capacite;
  final Map<String, dynamic> capteurs;
  final Map<String, dynamic> equipements;
  final bool estOccupee;

  Room({
    required this.id,
    required this.nom,
    this.batiment = '',
    this.etage = 0,
    this.capacite = 0,
    this.capteurs = const {},
    this.equipements = const {},
    this.estOccupee = false,
  });

  factory Room.fromFirestore(DocumentSnapshot doc) {
    Map<String, dynamic> data = doc.data() as Map<String, dynamic>;
    return Room(
      id: doc.id,
      nom: data['nom'] ?? '',
      batiment: data['batiment'] ?? '',
      etage: data['etage'] ?? 0,
      capacite: data['capacite'] ?? 0,
      capteurs: data['capteurs'] ?? {},
      equipements: data['equipements'] ?? {},
      estOccupee: data['estOccupee'] ?? false,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'nom': nom,
      'batiment': batiment,
      'etage': etage,
      'capacite': capacite,
      'capteurs': capteurs,
      'equipements': equipements,
      'estOccupee': estOccupee,
    };
  }
}
