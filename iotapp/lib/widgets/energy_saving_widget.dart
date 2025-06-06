import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

/// Widget qui permet de contrôler et d'afficher le mode économie d'énergie
/// Cela correspond au diagramme d'état du mode économie d'énergie
class EnergySavingWidget extends StatefulWidget {
  final String roomId;
  final bool initialValue;
  final Function(bool) onChanged;

  const EnergySavingWidget({
    Key? key,
    required this.roomId,
    this.initialValue = false,
    required this.onChanged,
  }) : super(key: key);

  @override
  _EnergySavingWidgetState createState() => _EnergySavingWidgetState();
}

class _EnergySavingWidgetState extends State<EnergySavingWidget> {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  bool _economyMode = false;
  String _currentState = 'Inactif'; // États possibles: Inactif, Normal, Économie, Anomalie, SiègeVacant
  bool _isLoading = false;
  String _stateDescription = '';
  
  @override
  void initState() {
    super.initState();
    _economyMode = widget.initialValue;
    _updateStateDescription();
    
    // Interroger Firestore pour obtenir l'état actuel si disponible
    _loadCurrentState();
  }
  
  Future<void> _loadCurrentState() async {
    setState(() {
      _isLoading = true;
    });
    
    try {
      // Vérifier si le paramètre existe déjà
      final configQuery = await _firestore.collection('parametres')
          .where('salleId', isEqualTo: widget.roomId)
          .where('cle', isEqualTo: 'modeEconomie')
          .limit(1)
          .get();
          
      if (configQuery.docs.isNotEmpty) {
        final configDoc = configQuery.docs.first.data();
        setState(() {
          _economyMode = configDoc['valeur'] == 'true';
        });
      }
      
      // Obtenir l'état actuel
      final stateQuery = await _firestore.collection('parametres')
          .where('salleId', isEqualTo: widget.roomId)
          .where('cle', isEqualTo: 'etatActuel')
          .limit(1)
          .get();
          
      if (stateQuery.docs.isNotEmpty) {
        final stateDoc = stateQuery.docs.first.data();
        setState(() {
          _currentState = stateDoc['valeur'] ?? 'Inactif';
        });
      }
      
      _updateStateDescription();
    } catch (e) {
      print('Erreur lors du chargement de l\'état: $e');
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }
  
  void _updateStateDescription() {
    switch (_currentState) {
      case 'Inactif':
        _stateDescription = 'Le système est inactif. Activez le mode normal pour commencer.';
        break;
      case 'Normal':
        _stateDescription = 'Mode normal : contrôle manuel des équipements.';
        break;
      case 'Économie':
        _stateDescription = 'Mode économie : optimisation automatique de la consommation énergétique.';
        break;
      case 'Anomalie':
        _stateDescription = 'Anomalie détectée : vérifiez les alertes pour plus d\'informations.';
        break;
      case 'SiègeVacant':
        _stateDescription = 'Siège vacant : mise en veille progressive des équipements.';
        break;
      default:
        _stateDescription = 'État inconnu.';
    }
  }
  
  Future<void> _toggleEconomyMode() async {
    setState(() {
      _isLoading = true;
    });
    
    try {
      // Mise à jour du mode économie
      final newValue = !_economyMode;
      
      // Mettre à jour Firestore
      final configQuery = await _firestore.collection('parametres')
          .where('salleId', isEqualTo: widget.roomId)
          .where('cle', isEqualTo: 'modeEconomie')
          .limit(1)
          .get();
          
      if (configQuery.docs.isNotEmpty) {
        await _firestore.collection('parametres')
            .doc(configQuery.docs.first.id)
            .update({
              'valeur': newValue.toString(),
              'dateModification': FieldValue.serverTimestamp(),
            });
      } else {
        await _firestore.collection('parametres').add({
          'cle': 'modeEconomie',
          'valeur': newValue.toString(),
          'salleId': widget.roomId,
          'description': 'Mode économie d\'énergie',
          'categorie': 'energie',
          'dateModification': FieldValue.serverTimestamp(),
        });
      }
      
      // Mettre à jour l'état actuel
      final stateQuery = await _firestore.collection('parametres')
          .where('salleId', isEqualTo: widget.roomId)
          .where('cle', isEqualTo: 'etatActuel')
          .limit(1)
          .get();
          
      final newState = newValue ? 'Économie' : 'Normal';
      
      if (stateQuery.docs.isNotEmpty) {
        await _firestore.collection('parametres')
            .doc(stateQuery.docs.first.id)
            .update({
              'valeur': newState,
              'dateModification': FieldValue.serverTimestamp(),
            });
      } else {
        await _firestore.collection('parametres').add({
          'cle': 'etatActuel',
          'valeur': newState,
          'salleId': widget.roomId,
          'description': 'État actuel du système',
          'categorie': 'systeme',
          'dateModification': FieldValue.serverTimestamp(),
        });
      }
      
      // Mettre à jour l'état local
      setState(() {
        _economyMode = newValue;
        _currentState = newState;
        _updateStateDescription();
      });
      
      // Appeler le callback
      widget.onChanged(newValue);
      
    } catch (e) {
      print('Erreur lors de la mise à jour du mode économie: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Erreur lors de la mise à jour')),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 4,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Mode Économie d\'Énergie',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        _stateDescription,
                        style: TextStyle(
                          fontSize: 12,
                          color: _getStateColor(),
                        ),
                      ),
                    ],
                  ),
                ),
                _isLoading
                    ? const SizedBox(
                        width: 24,
                        height: 24,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : Switch(
                        value: _economyMode,
                        onChanged: (_) => _toggleEconomyMode(),
                        activeColor: Colors.green,
                      ),
              ],
            ),
            const SizedBox(height: 16),
            LinearProgressIndicator(
              value: _getStateProgress(),
              backgroundColor: Colors.grey[200],
              valueColor: AlwaysStoppedAnimation<Color>(_getStateColor()),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              children: [
                _buildStateChip('Inactif', Icons.power_settings_new),
                _buildStateChip('Normal', Icons.check_circle),
                _buildStateChip('Économie', Icons.eco),
                _buildStateChip('Anomalie', Icons.warning),
                _buildStateChip('SiègeVacant', Icons.event_seat),
              ],
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildStateChip(String state, IconData icon) {
    final isCurrentState = _currentState == state;
    return Chip(
      avatar: Icon(
        icon,
        size: 16,
        color: isCurrentState ? Colors.white : Colors.grey[600],
      ),
      label: Text(
        state,
        style: TextStyle(
          color: isCurrentState ? Colors.white : Colors.grey[800],
          fontSize: 12,
        ),
      ),
      backgroundColor: isCurrentState ? _getStateColor() : Colors.grey[200],
    );
  }
  
  Color _getStateColor() {
    switch (_currentState) {
      case 'Inactif':
        return Colors.grey;
      case 'Normal':
        return Colors.blue;
      case 'Économie':
        return Colors.green;
      case 'Anomalie':
        return Colors.red;
      case 'SiègeVacant':
        return Colors.orange;
      default:
        return Colors.grey;
    }
  }
  
  double _getStateProgress() {
    switch (_currentState) {
      case 'Inactif':
        return 0.0;
      case 'Normal':
        return 0.25;
      case 'Économie':
        return 0.5;
      case 'SiègeVacant':
        return 0.75;
      case 'Anomalie':
        return 1.0;
      default:
        return 0.0;
    }
  }
}
