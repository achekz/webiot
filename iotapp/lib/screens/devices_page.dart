import 'package:flutter/material.dart';
import '../utils/constants.dart';
import '../widgets/common_drawer.dart';
import '../models/device_control.dart';

/// Écran de gestion des appareils
///
/// Permet de consulter et contrôler les appareils connectés dans la salle
class DevicesPage extends StatefulWidget {
  static const routeName = '/devices';

  const DevicesPage({Key? key}) : super(key: key);

  @override
  _DevicesPageState createState() => _DevicesPageState();
}

class _DevicesPageState extends State<DevicesPage> {
  final List<DeviceControl> _devices = [
    DeviceControl(
      name: 'Climatiseur',
      icon: Icons.ac_unit,
      isOn: false,
      type: DeviceType.airConditioner,
    ),
    DeviceControl(
      name: 'Vidéo/projecteur',
      icon: Icons.videocam,
      isOn: false,
      type: DeviceType.projector,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: offWhite,
        elevation: 1,
        title: const Text('Gestion des appareils', style: TextStyle(color: fsmBlue)),
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
      ),
      drawer: const CommonDrawer(),
      body: ListView.builder(
        itemCount: _devices.length,
        itemBuilder: (context, index) {
          final device = _devices[index];
          return SwitchListTile(
            title: Text(device.name),
            secondary: Icon(device.icon),
            value: device.isOn,
            onChanged: (bool value) {
              setState(() {
                device.isOn = value;
              });
            },
          );
        },
      ),
    );
  }
}