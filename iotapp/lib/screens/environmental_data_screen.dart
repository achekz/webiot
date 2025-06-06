import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:intl/intl.dart';
import 'package:iotapp/models/environmental_data.dart';
import 'package:fl_chart/fl_chart.dart';

class EnvironmentalDataScreen extends StatefulWidget {
  static const routeName = '/environmental-data';
  final String roomId;

  const EnvironmentalDataScreen({Key? key, required this.roomId}) : super(key: key);

  @override
  _EnvironmentalDataScreenState createState() => _EnvironmentalDataScreenState();
}

class _EnvironmentalDataScreenState extends State<EnvironmentalDataScreen> with SingleTickerProviderStateMixin {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  late TabController _tabController;
  
  List<EnvironmentalData> _allData = [];
  bool _isLoading = true;
  String _selectedTimeRange = '24h'; // 24h, 7d, 30d
  String _selectedDataType = 'temperature'; // temperature, humidity, co2, light
  
  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadEnvironmentalData();
  }
  
  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }
  
  /// Charge les donnu00e9es environnementales depuis Firestore
  Future<void> _loadEnvironmentalData() async {
    setState(() {
      _isLoading = true;
    });
    
    try {
      // Du00e9terminer la date limite en fonction de la plage de temps su00e9lectionnu00e9e
      DateTime limitDate;
      switch (_selectedTimeRange) {
        case '24h':
          limitDate = DateTime.now().subtract(const Duration(hours: 24));
          break;
        case '7d':
          limitDate = DateTime.now().subtract(const Duration(days: 7));
          break;
        case '30d':
          limitDate = DateTime.now().subtract(const Duration(days: 30));
          break;
        default:
          limitDate = DateTime.now().subtract(const Duration(hours: 24));
      }
      
      final Timestamp limitTimestamp = Timestamp.fromDate(limitDate);
      
      // Ru00e9cupu00e9rer les donnu00e9es depuis Firestore
      final querySnapshot = await _firestore.collection('donneesCapteurs')
          .where('salleId', isEqualTo: widget.roomId)
          .where('timestamp', isGreaterThanOrEqualTo: limitTimestamp)
          .orderBy('timestamp', descending: true)
          .get();
      
      // Convertir les documents en objets EnvironmentalData
      _allData = querySnapshot.docs
          .map((doc) => EnvironmentalData.fromFirestore(doc))
          .toList();
          
    } catch (e) {
      print('Erreur lors du chargement des donnu00e9es environnementales: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Erreur lors du chargement des donnu00e9es')),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Analyse Environnementale'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Graphiques'),
            Tab(text: 'Historique'),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : TabBarView(
              controller: _tabController,
              children: [
                _buildGraphTab(),
                _buildHistoryTab(),
              ],
            ),
    );
  }
  
  Widget _buildGraphTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildTimeRangeSelector(),
          const SizedBox(height: 16),
          _buildDataTypeSelector(),
          const SizedBox(height: 24),
          SizedBox(
            height: 300,
            child: _buildChart(),
          ),
          const SizedBox(height: 24),
          _buildDataSummary(),
        ],
      ),
    );
  }
  
  Widget _buildTimeRangeSelector() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            _buildTimeRangeButton('24h', 'Derniu00e8res 24h'),
            _buildTimeRangeButton('7d', '7 jours'),
            _buildTimeRangeButton('30d', '30 jours'),
          ],
        ),
      ),
    );
  }
  
  Widget _buildTimeRangeButton(String value, String label) {
    return ElevatedButton(
      onPressed: () {
        setState(() {
          _selectedTimeRange = value;
        });
        _loadEnvironmentalData();
      },
      style: ElevatedButton.styleFrom(
        primary: _selectedTimeRange == value ? Theme.of(context).primaryColor : null,
        onPrimary: _selectedTimeRange == value ? Colors.white : null,
      ),
      child: Text(label),
    );
  }
  
  Widget _buildDataTypeSelector() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Padding(
              padding: EdgeInsets.all(8.0),
              child: Text('Type de donnu00e9es', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildDataTypeButton('temperature', 'Tempu00e9rature', Icons.thermostat),
                  _buildDataTypeButton('humidity', 'Humiditu00e9', Icons.water_drop),
                  _buildDataTypeButton('co2', 'CO\u2082', Icons.air),
                  _buildDataTypeButton('light', 'Lumiu00e8re', Icons.wb_sunny),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildDataTypeButton(String value, String label, IconData icon) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 4.0),
      child: ChoiceChip(
        label: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon, 
              size: 16, 
              color: _selectedDataType == value ? Colors.white : Colors.grey,
            ),
            const SizedBox(width: 4),
            Text(label),
          ],
        ),
        selected: _selectedDataType == value,
        onSelected: (selected) {
          if (selected) {
            setState(() {
              _selectedDataType = value;
            });
          }
        },
      ),
    );
  }
  
  Widget _buildChart() {
    if (_allData.isEmpty) {
      return const Center(child: Text('Aucune donnu00e9e disponible'));
    }
    
    // Trier les donnu00e9es par horodatage (du plus ancien au plus ru00e9cent)
    final sortedData = List<EnvironmentalData>.from(_allData)
      ..sort((a, b) => a.timestamp.compareTo(b.timestamp));
    
    // Cru00e9er les points pour le graphique
    final List<FlSpot> spots = [];
    for (int i = 0; i < sortedData.length; i++) {
      final data = sortedData[i];
      final x = i.toDouble();
      double y;
      
      switch (_selectedDataType) {
        case 'temperature':
          y = data.temperature;
          break;
        case 'humidity':
          y = data.humidity;
          break;
        case 'co2':
          y = data.co2Level;
          break;
        case 'light':
          y = data.lightLevel;
          break;
        default:
          y = data.temperature;
      }
      
      spots.add(FlSpot(x, y));
    }
    
    return LineChart(
      LineChartData(
        gridData: FlGridData(show: true),
        titlesData: FlTitlesData(
          bottomTitles: SideTitles(
            showTitles: true,
            reservedSize: 30,
            getTextStyles: (context, value) => const TextStyle(fontSize: 10),
            getTitles: (value) {
              final int index = value.toInt();
              if (index >= 0 && index < sortedData.length) {
                if (sortedData.length <= 10) {
                  // Si peu de donnu00e9es, afficher plus de labels
                  return DateFormat('HH:mm').format(sortedData[index].timestamp);
                } else {
                  // Sinon, espacer les labels
                  if (index % (sortedData.length ~/ 5) == 0) {
                    if (_selectedTimeRange == '24h') {
                      return DateFormat('HH:mm').format(sortedData[index].timestamp);
                    } else {
                      return DateFormat('dd/MM').format(sortedData[index].timestamp);
                    }
                  }
                }
              }
              return '';
            },
          ),
          leftTitles: SideTitles(
            showTitles: true,
            getTextStyles: (context, value) => const TextStyle(fontSize: 10),
            getTitles: (value) => value.toStringAsFixed(1),
          ),
        ),
        borderData: FlBorderData(show: true),
        lineBarsData: [
          LineChartBarData(
            spots: spots,
            isCurved: true,
            colors: _getDataTypeColors(),
            barWidth: 3,
            dotData: FlDotData(show: spots.length < 20),
          ),
        ],
      ),
    );
  }
  
  List<Color> _getDataTypeColors() {
    switch (_selectedDataType) {
      case 'temperature':
        return [Colors.red, Colors.orange];
      case 'humidity':
        return [Colors.blue, Colors.lightBlue];
      case 'co2':
        return [Colors.purple, Colors.deepPurple];
      case 'light':
        return [Colors.amber, Colors.yellow];
      default:
        return [Theme.of(context).primaryColor];
    }
  }
  
  Widget _buildDataSummary() {
    if (_allData.isEmpty) {
      return const SizedBox.shrink();
    }
    
    // Calculer les statistiques
    double min = double.infinity;
    double max = double.negativeInfinity;
    double sum = 0;
    double average = 0;
    
    for (final data in _allData) {
      double value;
      switch (_selectedDataType) {
        case 'temperature':
          value = data.temperature;
          break;
        case 'humidity':
          value = data.humidity;
          break;
        case 'co2':
          value = data.co2Level;
          break;
        case 'light':
          value = data.lightLevel;
          break;
        default:
          value = data.temperature;
      }
      
      min = value < min ? value : min;
      max = value > max ? value : max;
      sum += value;
    }
    
    average = sum / _allData.length;
    
    // Unitu00e9 en fonction du type de donnu00e9es
    String unit;
    switch (_selectedDataType) {
      case 'temperature':
        unit = 'u00b0C';
        break;
      case 'humidity':
        unit = '%';
        break;
      case 'co2':
        unit = 'ppm';
        break;
      case 'light':
        unit = 'lux';
        break;
      default:
        unit = '';
    }
    
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Ru00e9sumu00e9 ${_getDataTypeName(_selectedDataType)}',
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildStatItem('Min', '${min.toStringAsFixed(1)}$unit'),
                _buildStatItem('Max', '${max.toStringAsFixed(1)}$unit'),
                _buildStatItem('Moyenne', '${average.toStringAsFixed(1)}$unit'),
              ],
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildStatItem(String label, String value) {
    return Column(
      children: [
        Text(label, style: TextStyle(color: Colors.grey[600])),
        const SizedBox(height: 4),
        Text(value, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
      ],
    );
  }
  
  String _getDataTypeName(String dataType) {
    switch (dataType) {
      case 'temperature':
        return 'Tempu00e9rature';
      case 'humidity':
        return 'Humiditu00e9';
      case 'co2':
        return 'CO\u2082';
      case 'light':
        return 'Lumiu00e8re';
      default:
        return '';
    }
  }
  
  Widget _buildHistoryTab() {
    if (_allData.isEmpty) {
      return const Center(child: Text('Aucune donnu00e9e disponible'));
    }
    
    return ListView.builder(
      itemCount: _allData.length,
      itemBuilder: (context, index) {
        final data = _allData[index];
        return Card(
          margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          child: ListTile(
            title: Text(
              DateFormat('dd/MM/yyyy HH:mm').format(data.timestamp),
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 4),
                Row(
                  children: [
                    _buildDataPoint(Icons.thermostat, 'Temp:', '${data.temperature.toStringAsFixed(1)}u00b0C'),
                    const SizedBox(width: 16),
                    _buildDataPoint(Icons.water_drop, 'Hum:', '${data.humidity.toStringAsFixed(1)}%'),
                  ],
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    _buildDataPoint(Icons.air, 'CO\u2082:', '${data.co2Level.toStringAsFixed(1)} ppm'),
                    const SizedBox(width: 16),
                    _buildDataPoint(Icons.wb_sunny, 'Lum:', '${data.lightLevel.toStringAsFixed(1)} lux'),
                  ],
                ),
              ],
            ),
            trailing: Icon(
              data.isOccupied ? Icons.person : Icons.person_outline,
              color: data.isOccupied ? Colors.green : Colors.grey,
            ),
          ),
        );
      },
    );
  }
  
  Widget _buildDataPoint(IconData icon, String label, String value) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 16, color: Colors.grey[600]),
        const SizedBox(width: 4),
        Text('$label $value'),
      ],
    );
  }
}
