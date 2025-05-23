import type { SelectChangeEvent } from '@mui/material/Select';

import { useState, useEffect } from 'react';

import AirIcon from '@mui/icons-material/Air';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import OpacityIcon from '@mui/icons-material/Opacity';
// Icônes Material UI
import ThermostatIcon from '@mui/icons-material/Thermostat';
import { Box, Tab, Grid, Card, Tabs, Alert, Select, MenuItem, CardHeader, InputLabel, CardContent, FormControl } from '@mui/material';

import { useSensorData } from 'src/hooks/useSensorData';

import { CONFIG } from 'src/config-global';
// Services et hooks
import { roomService } from 'src/services/roomService';

// Composant de graphique - utilisation du composant Chart avec type 'line'
import { Chart } from 'src/components/chart';
// Utilisation d'Iconify pour les icônes personnalisées

// ----------------------------------------------------------------------
// Page des statistiques environnementales
// Affiche les graphiques et tendances des données des capteurs

export default function StatistiquesPage() {
  const [salleSelectionnee, setSalleSelectionnee] = useState('');
  // Interface pour définir le type d'une salle
  interface Salle {
    id: string;
    nom: string;
    [key: string]: any; // Autres propriétés possibles
  }
  
  const [salles, setSalles] = useState<Salle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Onglet actif (0 = Température, 1 = Humidité, 2 = Qualité de l'air)
  const [ongletActif, setOngletActif] = useState(0);
  
  // Période sélectionnée pour les graphiques
  type PeriodeType = 'jour' | 'semaine' | 'mois';
  const [periode, setPeriode] = useState<PeriodeType>('jour');
  
  // Types pour les données
  interface DonneesCapteur {
    date: string;
    valeur: number;
  }
  
  // Type pour les données historiques
  interface DonneePoint {
    value: number;
    time: string;
  }
  
  interface DonneesHistoriques {
    temperature: DonneePoint[];
    humidite: DonneePoint[];
    qualiteAir: DonneePoint[];
  }
  
  // Données historiques simulées pour les graphiques
  // Dans une application réelle, ces données viendraient de Firebase
  const [donneesHistoriques, setDonneesHistoriques] = useState<DonneesHistoriques>({
    temperature: [],
    humidite: [],
    qualiteAir: []
  });
  
  // Types pour les données des capteurs
  interface SensorDataType {
    temperature: number | null;
    humidity: number | null;
    airQuality: number | null;
    loading: boolean;
    error: string | null;
    isTemperatureNormal: boolean;
    isHumidityNormal: boolean;
    isAirQualityNormal: boolean;
  }
  
  // Données actuelles des capteurs
  const { 
    temperature, 
    humidity, 
    airQuality, 
    loading: loadingSensors,
    error: errorSensors,
    isTemperatureNormal,
    isHumidityNormal,
    isAirQualityNormal
  } = useSensorData(salleSelectionnee) as SensorDataType;

  // Chargement initial des salles
  useEffect(() => {
    const fetchSalles = async () => {
      try {
        setLoading(true);
        const response = await roomService.getSalles();
        if (response.salles && response.salles.length > 0) {
          // Cast des salles avant traitement pour éviter les erreurs de typage
          const sallesBrutes = response.salles as Array<any>;
          
          // S'assurer que les salles récupérées ont toutes les propriétés requises
          const sallesTypees = sallesBrutes.map(salle => ({
            id: salle.id,
            nom: salle.nom || `Salle ${salle.id}`, // Valeur par défaut si nom n'existe pas
            equipements: salle.equipements || {}
          })) as Salle[];
          
          setSalles(sallesTypees);
          // Sélectionner la première salle par défaut
          setSalleSelectionnee(sallesTypees[0].id);
        } else {
          setError("Aucune salle disponible" as any);
        }
      } catch (err) {
        setError("Erreur lors du chargement des salles" as any);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSalles();
  }, []);

  // Simulation de chargement des données historiques
  // Dans une application réelle, cette fonction récupérerait les données depuis Firebase
  useEffect(() => {
    if (!salleSelectionnee) return;
    
    // Fonction pour générer des données aléatoires pour la simulation
    interface DonneesSimulation {
      date: string;
      valeur: number;
    }

    const genererDonneesAleatoires = (min: number, max: number, count: number): DonneesCapteur[] => {
      const maintenant = new Date();
      const donnees = [];
      
      for (let i = 0; i < count; i++) {
        const valeur = (Math.random() * (max - min) + min).toFixed(1);
        
        const date = new Date(maintenant);
        date.setHours(date.getHours() - (count - i));
        
        donnees.push({
          date: date.toISOString(),
          valeur: Number(valeur)
        });
      }
      
      return donnees;
    };
    
    // Nombre de points de données selon la période
    const periodesMapping = { jour: 24, semaine: 7, mois: 30 };
    const nombrePoints = periodesMapping[periode as keyof typeof periodesMapping];
    
    // Fonction de conversion de DonneesSimulation à DonneePoint
    const convertirVersPoint = (donnees: DonneesSimulation[]): DonneePoint[] => donnees.map(d => ({
        value: d.valeur,
        time: d.date
      }));
    
    // Simulation de données pour chaque type de capteur
    setDonneesHistoriques({
      temperature: convertirVersPoint(genererDonneesAleatoires(18, 30, nombrePoints)),
      humidite: convertirVersPoint(genererDonneesAleatoires(30, 70, nombrePoints)),
      qualiteAir: convertirVersPoint(genererDonneesAleatoires(400, 1200, nombrePoints))
    });
    
  }, [salleSelectionnee, periode]);

  // Changement d'onglet
  const gererChangementOnglet = (_event: React.SyntheticEvent, nouvelIndex: number) => {
    setOngletActif(nouvelIndex);
  };
  
  // Changement de salle
  const gererChangementSalle = (event: SelectChangeEvent<string>) => {
    setSalleSelectionnee(event.target.value as string);
  };
  
  // Changement de période
  const gererChangementPeriode = (event: SelectChangeEvent) => {
    // Vérification que la valeur est bien un type valide de période
    const value = event.target.value;
    if (value === 'jour' || value === 'semaine' || value === 'mois') {
      setPeriode(value);
    }
  };
  
  // Préparation des données pour les graphiques
  const formaterDonnees = (donneesSource: DonneePoint[], unite: string) => {
    if (!donneesSource || donneesSource.length === 0) {
      return { labels: [], datasets: [] };
    }
    
    // Formatage des dates selon la période
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      switch(periode) {
        case 'jour':
          return `${date.getHours()}:00`;
        case 'semaine':
          return date.toLocaleDateString('fr-FR', { weekday: 'short' });
        case 'mois':
          return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
        default:
          return dateString;
      }
    };
    
    // Extraction des labels (dates) et valeurs
    const labels = donneesSource.map(item => formatDate(item.time));
    const values = donneesSource.map(item => item.value);
    
    // Configuration du dataset
    return {
      labels,
      datasets: [
        {
          label: unite,
          data: values,
          fill: false,
          borderColor: ongletActif === 0 ? '#FF5630' : ongletActif === 1 ? '#00B8D9' : '#36B37E',
          tension: 0.2,
        },
      ],
    };
  };
  
  // Déterminer le titre et l'unité selon l'onglet actif
  const getTitreEtUnite = () => {
    switch (ongletActif) {
      case 0:
        return { titre: 'Température', unite: '°C' };
      case 1:
        return { titre: 'Humidité', unite: '%' };
      case 2:
        return { titre: 'Qualité de l\'air', unite: 'ppm' };
      default:
        return { titre: '', unite: '' };
    }
  };
  
  // Récupérer les données correspondant à l'onglet actif
  const getDonneesActives = (): DonneePoint[] => {
    switch (ongletActif) {
      case 0:
        return donneesHistoriques.temperature;
      case 1:
        return donneesHistoriques.humidite;
      case 2:
        return donneesHistoriques.qualiteAir;
      default:
        return [];
    }
  };
  
  const { titre, unite } = getTitreEtUnite();
  const donneesActives = getDonneesActives();
  const donneesGraphique = formaterDonnees(donneesActives, unite);
  
  // Calculer les statistiques
  const calculerStatistiques = (donnees: DonneePoint[]) => {
    if (!donnees || donnees.length === 0) {
      return { min: 'N/A', max: 'N/A', avg: 'N/A' };
    }
    
    const valeurs = donnees.map((item) => item.value);
    const min = valeurs.length > 0 ? Math.min(...valeurs) : 0;
    const max = valeurs.length > 0 ? Math.max(...valeurs) : 0;
    const sum = valeurs.reduce((acc: number, val: number) => acc + val, 0);
    const avg = sum / valeurs.length;
    
    return {
      min: min.toFixed(1),
      max: max.toFixed(1),
      avg: avg.toFixed(1)
    };
  };
  
  const stats = calculerStatistiques(donneesActives);

  return (
    <>
      <title>{`Statistiques environnementales - ${CONFIG.appName}`}</title>
      
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Statistiques environnementales
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Sélection de la salle */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card>
              <CardHeader title="Sélectionner une salle" />
              <CardContent>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="salle-select-label">Salle</InputLabel>
                  <Select
                    labelId="salle-select-label"
                    id="salle-select"
                    value={salleSelectionnee}
                    label="Salle"
                    onChange={gererChangementSalle}
                    disabled={loading || salles.length === 0}
                  >
                    {salles.map((salle) => (
                      <MenuItem key={salle.id} value={salle.id}>
                        {salle.nom || `Salle ${salle.id}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl fullWidth>
                  <InputLabel id="periode-select-label">Période</InputLabel>
                  <Select
                    labelId="periode-select-label"
                    id="periode-select"
                    value={periode}
                    label="Période"
                    onChange={gererChangementPeriode as any}
                  >
                    <MenuItem value="jour">Dernières 24 heures</MenuItem>
                    <MenuItem value="semaine">Dernière semaine</MenuItem>
                    <MenuItem value="mois">Dernier mois</MenuItem>
                  </Select>
                </FormControl>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Résumé des valeurs actuelles */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardHeader title="Valeurs actuelles" />
              <CardContent>
                {loadingSensors ? (
                  <Typography variant="body2">Chargement des données...</Typography>
                ) : errorSensors ? (
                  <Alert severity="warning">{errorSensors}</Alert>
                ) : (
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 4 }}>
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        p: 1,
                        bgcolor: isTemperatureNormal ? 'success.lighter' : 'error.lighter',
                        borderRadius: 1
                      }}>
                        <ThermostatIcon color={isTemperatureNormal ? 'success' : 'error'} sx={{ mb: 1 }} />
                        <Typography variant="h5" color={isTemperatureNormal ? 'success.main' : 'error.main'}>
                          {temperature ? `${temperature.toFixed(1)}°C` : '--'}
                        </Typography>
                        <Typography variant="caption">Température</Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        p: 1,
                        bgcolor: isHumidityNormal ? 'info.lighter' : 'warning.lighter',
                        borderRadius: 1
                      }}>
                        <OpacityIcon color={isHumidityNormal ? 'info' : 'warning'} sx={{ mb: 1 }} />
                        <Typography variant="h5" color={isHumidityNormal ? 'info.main' : 'warning.main'}>
                          {humidity ? `${humidity.toFixed(1)}%` : '--'}
                        </Typography>
                        <Typography variant="caption">Humidité</Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        p: 1,
                        bgcolor: isAirQualityNormal ? 'success.lighter' : 'error.lighter',
                        borderRadius: 1
                      }}>
                        <AirIcon color={isAirQualityNormal ? 'success' : 'error'} sx={{ mb: 1 }} />
                        <Typography variant="h5" color={isAirQualityNormal ? 'success.main' : 'error.main'}>
                          {airQuality ? `${airQuality}` : '--'}
                        </Typography>
                        <Typography variant="caption">Air (ppm)</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* Graphiques */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={ongletActif} onChange={gererChangementOnglet} aria-label="onglets des capteurs">
                  <Tab 
                    icon={<ThermostatIcon />} 
                    label="Température" 
                    id="tab-0" 
                    aria-controls="tabpanel-0" 
                  />
                  <Tab 
                    icon={<OpacityIcon />} 
                    label="Humidité" 
                    id="tab-1" 
                    aria-controls="tabpanel-1" 
                  />
                  <Tab 
                    icon={<AirIcon />} 
                    label="Qualité de l'air" 
                    id="tab-2" 
                    aria-controls="tabpanel-2" 
                  />
                </Tabs>
              </Box>
              
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">{titre} - Évolution ({unite})</Typography>
                  <Box sx={{ display: 'flex', gap: 3 }}>
                    <Typography variant="body2">
                      Min: <strong>{stats.min} {unite}</strong>
                    </Typography>
                    <Typography variant="body2">
                      Max: <strong>{stats.max} {unite}</strong>
                    </Typography>
                    <Typography variant="body2">
                      Moyenne: <strong>{stats.avg} {unite}</strong>
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ height: 400 }}>
                  <Chart 
                    type="line"
                    series={donneesGraphique.datasets} 
                    options={{
                      chart: {
                        id: 'capteurs-chart',
                      },
                      xaxis: {
                        categories: donneesGraphique.labels,
                        title: {
                          text: periode === 'jour' ? 'Heure' : periode === 'semaine' ? 'Jour' : 'Date'
                        }
                      },
                      yaxis: {
                        title: {
                          text: unite
                        }
                      },
                      colors: [ongletActif === 0 ? '#FF5630' : ongletActif === 1 ? '#00B8D9' : '#36B37E'],
                      tooltip: {
                        y: {
                          formatter: (value: number) => `${value} ${unite}`
                        }
                      },
                      legend: {
                        show: false
                      }
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
