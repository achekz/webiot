import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../utils/constants.dart';
import '../widgets/common_drawer.dart';
import '../services/access_control_service.dart';
import '../models/access_log.dart';

/// Écran de contrôle d'accès à la salle
///
/// Affiche les logs d'accès en temps réel et permet de simuler des tentatives d'accès via RFID
class AccessControlPage extends StatefulWidget {
  static const routeName = '/access_control';

  const AccessControlPage({Key? key}) : super(key: key);

  @override
  _AccessControlPageState createState() => _AccessControlPageState();
}

class _AccessControlPageState extends State<AccessControlPage> {
  final AccessControlService _accessService = AccessControlService();
  final TextEditingController _userIdController = TextEditingController();

  @override
  void dispose() {
    _userIdController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: offWhite,
        elevation: 1,
        title: Text(
          'Contrôle d\'accès',
          style: TextStyle(color: fsmBlue),
        ),
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
        foregroundColor: Colors.black87,
      ),
      drawer: const CommonDrawer(),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Journaux d\'accès',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: fsmBlue,
              ),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: StreamBuilder<List<AccessLog>>(
                stream: _accessService.accessLogStream,
                builder: (context, snapshot) {
                  if (snapshot.hasError) {
                    return const Center(
                      child: Text(
                        'Erreur lors du chargement des journaux.',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: Colors.red),
                      ),
                    );
                  }

                  if (!snapshot.hasData) {
                    return const Center(child: CircularProgressIndicator());
                  }

                  final logs = snapshot.data!;

                  if (logs.isEmpty) {
                    return const Center(
                      child: Text(
                        'Aucun journal d\'accès disponible. Simulez une demande d\'accès pour en créer.',
                        textAlign: TextAlign.center,
                      ),
                    );
                  }

                  return ListView.builder(
                    itemCount: logs.length,
                    itemBuilder: (context, index) {
                      final log = logs[index];
                      return Card(
                        margin: const EdgeInsets.only(bottom: 8),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: ListTile(
                          leading: Icon(
                            log.granted ? Icons.check_circle : Icons.cancel,
                            color: log.granted ? Colors.green : Colors.red,
                            size: 32,
                          ),
                          title: Text(
                            log.userId,
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                          subtitle: Text(
                            _formatDateTime(log.timestamp),
                          ),
                          trailing: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: log.granted
                                  ? Colors.green.withOpacity(0.2)
                                  : Colors.red.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Text(
                              log.granted ? 'Accordé' : 'Refusé',
                              style: TextStyle(
                                color: log.granted ? Colors.green : Colors.red,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),
                      );
                    },
                  );
                },
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _userIdController,
              decoration: InputDecoration(
                labelText: 'ID Utilisateur',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () {
                final userId = _userIdController.text.trim();
                if (userId.isNotEmpty) {
                  _accessService.simulateAccessRequest(userId);
                  _userIdController.clear();
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Veuillez entrer un ID utilisateur.'),
                    ),
                  );
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: fsmBlue,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
                minimumSize: const Size(double.infinity, 50),
              ),
              child: const Text(
                'Simuler une analyse RFID',
                style: TextStyle(fontSize: 18, color: Colors.white),
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Formate une date et heure pour affichage
  String _formatDateTime(DateTime dateTime) {
    return DateFormat('dd/MM/yyyy HH:mm').format(dateTime);
  }
}