/// Modèle pour les logs d'accès à la salle
///
/// Enregistre les tentatives d'accès à la salle avec
/// les informations sur l'utilisateur et le résultat
class AccessLog {
  /// Identifiant de l'utilisateur ayant tenté d'accéder
  final String userId;
  
  /// Date et heure de la tentative d'accès
  final DateTime timestamp;
  
  /// Indique si l'accès a été accordé ou refusé
  final bool granted;

  AccessLog({
    required this.userId,
    required this.timestamp,
    required this.granted,
  });
}