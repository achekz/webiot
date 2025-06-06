import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:iotapp/models/room.dart';
import 'package:iotapp/widgets/sensor_card.dart';
import 'package:iotapp/widgets/device_card.dart';

class RoomDetailScreen extends StatefulWidget {
  static const routeName = '/room-detail';

  const RoomDetailScreen({Key? key}) : super(key: key);

  @override
  _RoomDetailScreenState createState() => _RoomDetailScreenState();
}

class _RoomDetailScreenState extends State<RoomDetailScreen> {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final FirebaseAuth _auth = FirebaseAuth.instance;
  
  Room? _room;
  bool _isLoading = true;
  List<Map<String, dynamic>> _devices = [];
  List<Map<String, dynamic>> _sensors = [];
  bool _economyMode = false;
  
  @override
  void initState() {
    super.initState();
    _loadRoomData();
  }
  
  /// Charge les données de la salle assignée au professeur connecté
  Future<void> _loadRoomData() async {
    setState(() {
      _isLoading = true;
    });
    
    try {
      // Récupérer l'utilisateur actuel
      final user = _auth.currentUser;
      if (user != null) {
        // Récupérer les données de l'utilisateur
        final userDoc = await _firestore.collection('utilisateurs')
            .where('email', isEqualTo: user.email)
            .limit(1)
            .get();
            
        if (userDoc.docs.isNotEmpty) {
          final userData = userDoc.docs.first.data();
          final salleAssignee = userData['salleAssignee'];
          
          if (salleAssignee != null) {
            // Récupérer les données de la salle
            final roomDoc = await _firestore.collection('salles')
                .doc(salleAssignee)
                .get();
                
            if (roomDoc.exists) {
              // Créer l'objet Room
              _room = Room.fromFirestore(roomDoc);
              
              // Récupérer les équipements de la salle
              final devicesQuery = await _firestore.collection('equipements')
                  .where('salleId', isEqualTo: salleAssignee)
                  .get();
              _devices = devicesQuery.docs
                  .map((doc) => {
                    'id': doc.id,
                    ...doc.data(),
                  })
                  .toList();
              
              // Récupérer les capteurs de la salle
              final sensorsQuery = await _firestore.collection('capteurs')
                  .where('salleId', isEqualTo: salleAssignee)
                  .get();
              _sensors = sensorsQuery.docs
                  .map((doc) => {
                    'id': doc.id,
                    ...doc.data(),
                  })
                  .toList();
              
              // Vérifier si le mode économie est activé
              final configQuery = await _firestore.collection('parametres')
                  .where('salleId', isEqualTo: salleAssignee)
                  .where('cle', isEqualTo: 'modeEconomie')
                  .limit(1)
                  .get();
              if (configQuery.docs.isNotEmpty) {
                _economyMode = configQuery.docs.first.data()['valeur'] == 'true';
              }
            }
          }
        }
      }
    } catch (e) {
      print('Erreur lors du chargement des données: $e');
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }
  
  /// Active ou désactive le mode économie d'énergie
  Future<void> _toggleEconomyMode() async {
    if (_room == null) return;
    
    try {
      // Mettre à jour le paramètre dans Firestore
      final configQuery = await _firestore.collection('parametres')
          .where('salleId', isEqualTo: _room!.id)
          .where('cle', isEqualTo: 'modeEconomie')
          .limit(1)
          .get();
          
      if (configQuery.docs.isNotEmpty) {
        await _firestore.collection('parametres')
            .doc(configQuery.docs.first.id)
            .update({'valeur': (!_economyMode).toString()});
      } else {
        // Créer le paramètre s'il n'existe pas
        await _firestore.collection('parametres').add({
          'cle': 'modeEconomie',
          'valeur': (!_economyMode).toString(),
          'salleId': _room!.id,
          'description': 'Mode économie d\'énergie',
          'categorie': 'energie',
          'dateModification': FieldValue.serverTimestamp(),
        });
      }
      
      setState(() {
        _economyMode = !_economyMode;
      });
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(_economyMode 
            ? 'Mode économie d\'énergie activé' 
            : 'Mode économie d\'énergie désactivé')),
      );
      
    } catch (e) {
      print('Erreur lors de la mise à jour du mode économie: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Erreur lors de la mise à jour')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_room?.name ?? 'Ma Salle'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadRoomData,
            tooltip: 'Actualiser',
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _room == null
              ? const Center(child: Text('Aucune salle assignée'))
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Informations sur la salle
                      _buildRoomInfoCard(),
                      
                      const SizedBox(height: 16),
                      
                      // Mode économie d'énergie
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  const Text(
                                    'Mode Économie d\'Énergie',
                                    style: TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  Switch(
                                    value: _economyMode,
                                    onChanged: (value) => _toggleEconomyMode(),
                                    activeColor: Colors.green,
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Text(
                                _economyMode
                                    ? 'Actif - Optimisation de la consommation d\'énergie'
                                    : 'Inactif - Contrôle manuel des équipements',
                                style: TextStyle(
                                  color: _economyMode ? Colors.green : Colors.grey,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      
                      const SizedBox(height: 24),
                      
                      // Capteurs
                      const Text(
                        'Capteurs',
                        style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      _sensors.isEmpty
                          ? const Card(
                              child: Padding(
                                padding: EdgeInsets.all(16.0),
                                child: Text('Aucun capteur disponible'),
                              ),
                            )
                          : ListView.builder(
                              shrinkWrap: true,
                              physics: const NeverScrollableScrollPhysics(),
                              itemCount: _sensors.length,
                              itemBuilder: (context, index) {
                                final sensor = _sensors[index];
                                return SensorCard(
                                  id: sensor['id'],
                                  type: sensor['type'] ?? 'Inconnu',
                                  value: sensor['valeurActuelle']?.toString() ?? 'N/A',
                                  unit: sensor['unite'] ?? '',
                                  status: sensor['statut'] ?? 'normal',
                                  lastUpdate: sensor['derniereMiseAJour'] != null
                                      ? (sensor['derniereMiseAJour'] as Timestamp).toDate()
                                      : DateTime.now(),
                                );
                              },
                            ),
                      
                      const SizedBox(height: 24),
                      
                      // Équipements
                      const Text(
                        'Équipements',
                        style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      _devices.isEmpty
                          ? const Card(
                              child: Padding(
                                padding: EdgeInsets.all(16.0),
                                child: Text('Aucun équipement disponible'),
                              ),
                            )
                          : ListView.builder(
                              shrinkWrap: true,
                              physics: const NeverScrollableScrollPhysics(),
                              itemCount: _devices.length,
                              itemBuilder: (context, index) {
                                final device = _devices[index];
                                return DeviceCard(
                                  id: device['id'],
                                  name: device['nom'] ?? 'Équipement',
                                  type: device['type'] ?? 'Inconnu',
                                  isActive: device['actif'] ?? false,
                                  isControlled: !_economyMode, // Désactivé en mode économie
                                );
                              },
                            ),
                    ],
                  ),
                ),
    );
  }
  
  Widget _buildRoomInfoCard() {
    if (_room == null) return const SizedBox.shrink();
    
    return Card(
      elevation: 4,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              _room!.name,
              style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(Icons.location_on, size: 16, color: Colors.grey),
                const SizedBox(width: 4),
                Text('Bâtiment ${_room!.building}, Étage ${_room!.floor}, Salle ${_room!.number}'),
              ],
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                const Icon(Icons.people, size: 16, color: Colors.grey),
                const SizedBox(width: 4),
                Text('Capacité: ${_room!.capacity} personnes'),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildStatusItem(
                  icon: Icons.person,
                  label: 'Occupation',
                  value: _room!.isOccupied ? 'Occupée' : 'Libre',
                  color: _room!.isOccupied ? Colors.red : Colors.green,
                ),
                _buildStatusItem(
                  icon: Icons.thermostat,
                  label: 'Température',
                  value: '${_room!.currentTemperature.toStringAsFixed(1)}°C',
                  color: _getTemperatureColor(_room!.currentTemperature),
                ),
                _buildStatusItem(
                  icon: Icons.water_drop,
                  label: 'Humidité',
                  value: '${_room!.currentHumidity.toStringAsFixed(1)}%',
                  color: Colors.blue,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildStatusItem({
    required IconData icon,
    required String label,
    required String value,
    required Color color,
  }) {
    return Column(
      children: [
        Icon(icon, color: color, size: 28),
        const SizedBox(height: 4),
        Text(label, style: const TextStyle(fontSize: 12, color: Colors.grey)),
        Text(value, style: TextStyle(fontSize: 14, color: color, fontWeight: FontWeight.bold)),
      ],
    );
  }
  
  Color _getTemperatureColor(double temperature) {
    if (temperature < 18) return Colors.blue;
    if (temperature > 25) return Colors.red;
    return Colors.green;
  }
}
