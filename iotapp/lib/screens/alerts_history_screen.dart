import 'package:flutter/material.dart';
// import 'package:cloud_firestore/cloud_firestore.dart';
// import 'package:firebase_auth/firebase_auth.dart';
import 'package:intl/intl.dart';
import 'package:iotapp/models/app_notification.dart';

class AlertsHistoryScreen extends StatefulWidget {
  static const routeName = '/alerts-history';

  const AlertsHistoryScreen({Key? key}) : super(key: key);

  @override
  _AlertsHistoryScreenState createState() => _AlertsHistoryScreenState();
}

class _AlertsHistoryScreenState extends State<AlertsHistoryScreen> {
  // Mock data instead of Firebase
  // final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  // final FirebaseAuth _auth = FirebaseAuth.instance;
  
  List<Notification> _alerts = [];
  bool _isLoading = true;
  String? _roomId = 'room-123'; // Mock room ID
  String _filterType = 'all'; // all, temperature, humidity, co2, presence
  
  @override
  void initState() {
    super.initState();
    // Using mock data instead of Firebase queries
    // _getUserRoomId();
    _loadMockAlerts();
  }
  
  /// Charge des données de test au lieu de Firebase
  Future<void> _loadMockAlerts() async {
    // Simulate network delay
    await Future.delayed(const Duration(seconds: 1));
    
    setState(() {
      _alerts = [
        Notification(
          id: '1',
          type: 'temperature',
          titre: 'Alerte température',
          message: 'La température a dépassé 28°C dans la salle 123',
          timestamp: DateTime.now().subtract(const Duration(hours: 2)),
          estTraitee: false,
          salleId: 'room-123',
          salleName: 'Salle 123',
        ),
        Notification(
          id: '2',
          type: 'humidity',
          titre: 'Alerte humidité',
          message: 'Taux d\'humidité anormalement bas (25%)',
          timestamp: DateTime.now().subtract(const Duration(days: 1)),
          estTraitee: true,
          salleId: 'room-123',
          salleName: 'Salle 123',
        ),
        Notification(
          id: '3',
          type: 'co2',
          titre: 'Alerte CO2',
          message: 'Niveau de CO2 élevé (> 1000 ppm)',
          timestamp: DateTime.now().subtract(const Duration(hours: 5)),
          estTraitee: false,
          salleId: 'room-123',
          salleName: 'Salle 123',
        ),
      ];
      _isLoading = false;
    });
  }
  
  /// Charge les alertes (version avec données de test)
  Future<void> _loadAlerts() async {
    setState(() {
      _isLoading = true;
    });
    
    // Simulate network delay
    await Future.delayed(const Duration(milliseconds: 800));
    
    // Filter alerts based on _filterType
    setState(() {
      if (_filterType == 'all') {
        // No filtering needed
      } else {
        _alerts = _alerts.where((alert) => alert.type == _filterType).toList();
      }
      _isLoading = false;
    });
  }
  
  /// Marque une alerte comme lue/traitée (version locale)
  Future<void> _markAsRead(String alertId) async {
    try {
      // Update locally instead of Firebase
      setState(() {
        _alerts = _alerts.map((alert) {
          if (alert.id == alertId) {
            return Notification(
              id: alert.id,
              type: alert.type,
              titre: alert.titre,
              message: alert.message,
              timestamp: alert.timestamp,
              estTraitee: true,
              salleId: alert.salleId,
              salleName: alert.salleName,
              dateTraitement: DateTime.now(),
            );
          }
          return alert;
        }).toList();
      });
      
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Alerte marquée comme traitée')),
      );
    } catch (e) {
      print('Erreur lors du marquage de l\'alerte: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Erreur lors du marquage de l\'alerte')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Historique des Alertes'),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: _showFilterDialog,
            tooltip: 'Filtrer',
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadAlerts,
            tooltip: 'Actualiser',
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _roomId == null
              ? const Center(child: Text('Aucune salle assignu00e9e'))
              : _alerts.isEmpty
                  ? _buildEmptyState()
                  : _buildAlertsList(),
    );
  }
  
  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.notifications_off, size: 80, color: Colors.grey[400]),
          const SizedBox(height: 16),
          Text(
            'Aucune alerte',
            style: TextStyle(fontSize: 18, color: Colors.grey[600]),
          ),
          const SizedBox(height: 8),
          Text(
            _filterType != 'all'
                ? 'Essayez de modifier le filtre'
                : 'Tout fonctionne normalement dans votre salle',
            style: TextStyle(color: Colors.grey[600]),
          ),
        ],
      ),
    );
  }
  
  Widget _buildAlertsList() {
    return ListView.builder(
      itemCount: _alerts.length,
      itemBuilder: (context, index) {
        final alert = _alerts[index];
        return Card(
          margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          color: alert.estTraitee ? null : Colors.amber[50],
          child: ListTile(
            leading: _getAlertIcon(alert.type),
            title: Text(alert.message),
            subtitle: Text(
              DateFormat('dd/MM/yyyy HH:mm').format(alert.timestamp),
              style: const TextStyle(fontSize: 12),
            ),
            trailing: alert.estTraitee
                ? const Icon(Icons.done_all, color: Colors.green)
                : IconButton(
                    icon: const Icon(Icons.check_circle_outline),
                    onPressed: () => _markAsRead(alert.id),
                    tooltip: 'Marquer comme traitu00e9e',
                  ),
          ),
        );
      },
    );
  }
  
  Widget _getAlertIcon(String type) {
    switch (type) {
      case 'temperature':
        return const CircleAvatar(
          backgroundColor: Colors.red,
          child: Icon(Icons.thermostat, color: Colors.white, size: 20),
        );
      case 'humidity':
        return const CircleAvatar(
          backgroundColor: Colors.blue,
          child: Icon(Icons.water_drop, color: Colors.white, size: 20),
        );
      case 'co2':
        return const CircleAvatar(
          backgroundColor: Colors.purple,
          child: Icon(Icons.air, color: Colors.white, size: 20),
        );
      case 'presence':
        return const CircleAvatar(
          backgroundColor: Colors.orange,
          child: Icon(Icons.person, color: Colors.white, size: 20),
        );
      case 'securite':
        return const CircleAvatar(
          backgroundColor: Colors.red,
          child: Icon(Icons.security, color: Colors.white, size: 20),
        );
      default:
        return const CircleAvatar(
          backgroundColor: Colors.grey,
          child: Icon(Icons.warning, color: Colors.white, size: 20),
        );
    }
  }
  
  /// Affiche une boîte de dialogue pour filtrer les alertes
  void _showFilterDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Filtrer par type'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildFilterOption('all', 'Toutes les alertes', Icons.all_inclusive),
              _buildFilterOption('temperature', 'Tempu00e9rature', Icons.thermostat),
              _buildFilterOption('humidity', 'Humiditu00e9', Icons.water_drop),
              _buildFilterOption('co2', 'Qualitu00e9 de l\'air', Icons.air),
              _buildFilterOption('presence', 'Pru00e9sence', Icons.person),
              _buildFilterOption('securite', 'Su00e9curitu00e9', Icons.security),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('FERMER'),
          ),
        ],
      ),
    );
  }
  
  Widget _buildFilterOption(String value, String label, IconData icon) {
    return ListTile(
      leading: Icon(icon),
      title: Text(label),
      selected: _filterType == value,
      onTap: () {
        setState(() {
          _filterType = value;
        });
        Navigator.of(context).pop();
        _loadAlerts();
      },
    );
  }
}
