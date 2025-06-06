import 'dart:io' show File;

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart'; // Added for profile picture selection
import '../utils/constants.dart'; // Assuming this contains constants
import '../widgets/common_drawer.dart'; // Assuming this is a custom drawer widget
import '../services/auth_service.dart'; // Assuming this handles authentication
import 'login_page.dart'; // Assuming this is the login page

/// Écran de profil utilisateur
///
/// Permet à l'utilisateur de consulter et modifier ses informations de profil
class ProfilePage extends StatefulWidget {
  static const routeName = '/profile';

  const ProfilePage({Key? key}) : super(key: key);

  @override
  _ProfilePageState createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  final _formKey = GlobalKey<FormState>();
  String _name = defaultUsername; // Replace with actual value or constant
  String _email = defaultEmail; // Replace with actual value or constant
  String _department = 'Computer Science';
  String _studentId = 'FSM2025-IT-123';
  bool _isEditMode = false;
  late TextEditingController _nameController;
  late TextEditingController _emailController;
  late TextEditingController _departmentController;
  XFile? _profileImage; // Added for profile picture

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: _name);
    _emailController = TextEditingController(text: _email);
    _departmentController = TextEditingController(text: _department);
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _departmentController.dispose();
    super.dispose();
  }

  void _toggleEditMode() {
    setState(() {
      if (_isEditMode) {
        // Save changes
        if (_formKey.currentState!.validate()) {
          _name = _nameController.text;
          _email = _emailController.text;
          _department = _departmentController.text;

          // Show success notification
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Profil mis à jour avec succès')),
          );
        }
      }
      _isEditMode = !_isEditMode;
    });
  }

  Future<void> _changeProfilePicture() async {
    try {
      final ImagePicker picker = ImagePicker();
      final XFile? image = await picker.pickImage(source: ImageSource.gallery);
      if (image != null) {
        setState(() {
          _profileImage = image;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Photo de profil mise à jour')),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Aucune image sélectionnée')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erreur lors de la sélection de l\'image : $e')),
      );
    }
  }

  Widget _buildProfileField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    bool isEditable = false,
    TextInputType keyboardType = TextInputType.text,
  }) {
    return TextFormField(
      controller: controller,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon, color: fsmBlue), // Replace with actual color
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
        ),
        enabled: isEditable,
      ),
      keyboardType: keyboardType,
      readOnly: !isEditable,
      validator: (value) {
        if (value == null || value.isEmpty) {
          return 'Veuillez entrer $label';
        }
        return null;
      },
    );
  }

  Widget _buildReadOnlyField({
    required String label,
    required String value,
    required IconData icon,
  }) {
    return TextFormField(
      initialValue: value,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon, color: fsmBlue), // Replace with actual color
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
        ),
        enabled: false,
      ),
      readOnly: true,
    );
  }

  Widget _buildInfoRow({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Icon(icon, color: fsmBlue), // Replace with actual color
          const SizedBox(width: 16),
          Text(
            label,
            style: const TextStyle(fontWeight: FontWeight.bold),
          ),
          const Spacer(),
          Text(
            value,
            style: const TextStyle(color: Colors.black54),
          ),
        ],
      ),
    );
  }

  Widget _buildProfileSection() {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Informations supplémentaires',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: fsmBlue, // Replace with actual color
              ),
            ),
            const SizedBox(height: 16),
            _buildInfoRow(
              icon: Icons.calendar_today,
              label: 'Inscrit le',
              value: 'Septembre 2022',
            ),
            _buildInfoRow(
              icon: Icons.book,
              label: 'Niveau actuel',
              value: '3ème année',
            ),
            _buildInfoRow(
              icon: Icons.qr_code,
              label: 'Niveau d\'accès',
              value: 'Étudiant',
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: offWhite, // Replace with actual color
        elevation: 1,
        title: Text('Profil', style: TextStyle(color: fsmBlue)), // Replace with actual color
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
        actions: [
          IconButton(
            icon: Icon(
              _isEditMode ? Icons.save : Icons.edit,
              color: Colors.black87,
            ),
            onPressed: _toggleEditMode,
          ),
        ],
      ),
      drawer: const CommonDrawer(),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            CircleAvatar(
              radius: 60,
              backgroundImage: _profileImage != null
                  ? FileImage(_profileImage!.path as File)
                  : const NetworkImage(userAvatarUrl), // Replace with actual URL
              child: _isEditMode
                  ? Align(
                      alignment: Alignment.bottomRight,
                      child: CircleAvatar(
                        radius: 20,
                        backgroundColor: fsmBlue, // Replace with actual color
                        child: IconButton(
                          icon: const Icon(Icons.camera_alt,
                              size: 20, color: Colors.white),
                          onPressed: _changeProfilePicture,
                        ),
                      ),
                    )
                  : null,
            ),
            const SizedBox(height: 16),
            Form(
              key: _formKey,
              child: Column(
                children: [
                  _buildProfileField(
                    controller: _nameController,
                    label: 'Nom complet',
                    icon: Icons.person,
                    isEditable: _isEditMode,
                  ),
                  const SizedBox(height: 16),
                  _buildProfileField(
                    controller: _emailController,
                    label: 'Email',
                    icon: Icons.email,
                    isEditable: _isEditMode,
                    keyboardType: TextInputType.emailAddress,
                  ),
                  const SizedBox(height: 16),
                  _buildProfileField(
                    controller: _departmentController,
                    label: 'Département',
                    icon: Icons.school,
                    isEditable: _isEditMode,
                  ),
                  const SizedBox(height: 16),
                  _buildReadOnlyField(
                    label: 'ID Étudiant',
                    value: _studentId,
                    icon: Icons.badge,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            _buildProfileSection(),
          ],
        ),
      ),
    );
  }
}

// Placeholder constants (replace with actual values from your constants.dart)
const String defaultUsername = 'John Doe';
const String defaultEmail = 'john.doe@example.com';
const Color fsmBlue = Colors.blue; // Replace with actual color
const Color offWhite = Color(0xFFF5F5F5); // Replace with actual color
const String userAvatarUrl = 'https://example.com/avatar.png'; // Replace with actual URL
const String notImplementedMessage = 'Fonctionnalité non implémentée';