// Page de contrôle des salles de classe pour Smart Salle

// types
import type { SelectChangeEvent } from '@mui/material/Select';

// external
import { useState, useEffect } from 'react';

// @mui
import Grid from '@mui/material/Grid';
// @mui icons (ordre alphabétique)
import AirIcon from '@mui/icons-material/Air';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import WaterIcon from '@mui/icons-material/Water';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import VideocamIcon from '@mui/icons-material/Videocam';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import { Box, Card, Paper, Stack, Alert, Switch, Divider, Tooltip, CardHeader, CardContent, LinearProgress } from '@mui/material';

// hooks
import { useSensorData } from 'src/hooks/useSensorData';

// services
import { CONFIG } from 'src/config-global';
import { roomService } from 'src/services/roomService';

// Interface pour Salle
interface Salle {
  id: string;
  nom: string;
  equipements?: {
    climatiseur?: { actif: boolean };
    projecteur?: { actif: boolean };
  };
}

// Interface pour les données de capteurs
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

// Interface pour la réponse du toggle des équipements
interface ToggleResponse {
  success: boolean;
  erreur?: string;
}

// Fonctions utilitaires pour les couleurs en fonction des valeurs
function getTemperatureColor(temp: number | null): string {
  if (temp === null) return 'text.secondary';
  if (temp < 17) return 'info.main'; // Trop froid
  if (temp > 25) return 'warning.main'; // Trop chaud
  return 'success.main'; // Normal
}

function getHumidityColor(humidity: number | null): string {
  if (humidity === null) return 'text.secondary';
  if (humidity < 30) return 'warning.main'; // Trop sec
  if (humidity > 60) return 'warning.main'; // Trop humide
  return 'success.main'; // Normal
}

function getAirQualityColor(airQuality: number | null): string {
  if (airQuality === null) return 'text.secondary';
  if (airQuality > 1000) return 'error.main'; // Mauvaise qualité
  if (airQuality > 800) return 'warning.main'; // Qualité moyenne
  return 'success.main'; // Bonne qualité
}

export default function ControleSallePage() {
  const [salleSelectionnee, setSalleSelectionnee] = useState<string>('');
  const [salles, setSalles] = useState<Salle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [climatiseurActif, setClimatiseurActif] = useState<boolean>(false);
  const [projecteurActif, setProjecteurActif] = useState<boolean>(false);

  // Only call useSensorData when we have a valid room ID
  const {
    temperature,
    humidity,
    airQuality,
    loading: loadingSensors,
    error: errorSensors,
    isTemperatureNormal,
    isHumidityNormal,
    isAirQualityNormal,
  } = useSensorData(salleSelectionnee || null) as SensorDataType;

  useEffect(() => {
    const fetchSalles = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
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
          setSalleSelectionnee(sallesTypees[0].id);
        } else {
          setError("Aucune salle disponible");
        }
      } catch (err: any) {
        setError("Erreur lors du chargement des salles");
        console.error('Erreur:', err?.message || err);
      } finally {
        setLoading(false);
      }
    };

    fetchSalles();
  }, []);

  useEffect(() => {
    if (!salleSelectionnee) return;

    // Définition de l'interface pour les données de salle mise à jour
    interface SalleData {
      equipements?: {
        climatiseur?: { actif: boolean };
        projecteur?: { actif: boolean };
        videoprojecteur?: { actif: boolean };
      };
    }
    
    const unsubscribe: (() => void) = roomService.onSalleChange(salleSelectionnee, (data: SalleData) => {
      if (data && data.equipements) {
        setClimatiseurActif(data.equipements.climatiseur?.actif || false);
        setProjecteurActif(data.equipements.projecteur?.actif || false);
      }
    });

    // eslint-disable-next-line consistent-return
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [salleSelectionnee]);

  // Mise à jour du titre de la page
  useEffect(() => {
    document.title = `Contrôle des salles - ${CONFIG.appName}`;
  }, []);

  const handleChangeSalle = (event: SelectChangeEvent<string>) => {
    setSalleSelectionnee(event.target.value);
  };

  const handleToggleClimatiseur = async (): Promise<void> => {
    try {
      const nouveauStatut = !climatiseurActif;
      await roomService.toggleClimatiseur(salleSelectionnee, nouveauStatut);
      setClimatiseurActif(nouveauStatut);
    } catch (err) {
      console.error('Erreur lors du toggle du climatiseur:', err);
    }
  };

  const handleToggleProjecteur = async (): Promise<void> => {
    try {
      const nouveauStatut = !projecteurActif;
      await roomService.toggleProjecteur(salleSelectionnee, nouveauStatut);
      setProjecteurActif(nouveauStatut);
    } catch (err) {
      console.error('Erreur lors du toggle du projecteur:', err);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={4}>
        <Grid size={{ xs: 12 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            Sélectionner une salle
          </Typography>
          <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
            <Typography variant="body1" gutterBottom sx={{ mb: 3, color: 'text.secondary' }}>
              Cliquez sur une salle pour afficher ses détails et contrôler ses équipements
            </Typography>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <LinearProgress sx={{ width: '50%' }} />
              </Box>
            ) : salles.length === 0 ? (
              <Alert severity="info">Aucune salle disponible</Alert>
            ) : (
              <Grid container spacing={3}>
                {salles.map((salle) => (
                  <Grid key={salle.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <Card 
                      onClick={() => handleChangeSalle({ target: { value: salle.id } } as SelectChangeEvent)}
                      sx={{
                        cursor: 'pointer',
                        minWidth: 180,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: (theme) => theme.shadows[1],
                        border: (theme) => salle.id === salleSelectionnee
                          ? `2px solid ${theme.palette.primary.main}`
                          : '1px solid transparent',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: (theme) => theme.shadows[4],
                        },
                      }}
                    >
                      <CardContent>
                        <Typography variant="h6" align="center" noWrap>
                          {salle.nom || `Salle ${salle.id}`}
                        </Typography>
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
                          <Tooltip title={salle?.equipements?.climatiseur?.actif ? "Climatiseur actif" : "Climatiseur inactif"}>
                            <AcUnitIcon 
                              color={salle?.equipements?.climatiseur?.actif ? "primary" : "disabled"} 
                              fontSize="small" 
                            />
                          </Tooltip>
                          <Tooltip title={salle?.equipements?.projecteur?.actif ? "Vidéoprojecteur actif" : "Vidéoprojecteur inactif"}>
                            <VideocamIcon 
                              color={salle?.equipements?.projecteur?.actif ? "primary" : "disabled"} 
                              fontSize="small" 
                            />
                          </Tooltip>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {salleSelectionnee && (
        <Grid container spacing={4} sx={{ mt: 4 }}>
          {/* Informations sur la salle sélectionnée */}
          <Grid size={{ xs: 12, md: 5, lg: 4 }}>
            <Card sx={{ height: '100%', borderRadius: 2, boxShadow: (theme) => theme.shadows[1] }}>
              <CardHeader 
                title="Contrôle des équipements" 
                titleTypographyProps={{ variant: 'h5', fontWeight: 600 }}
                subheader={salles.find(s => s.id === salleSelectionnee)?.nom || ''}
                sx={{ pb: 0 }}
              />
              <CardContent sx={{ pt: 3 }}>
                <Stack spacing={3}>
                  {/* Climatiseur control */}
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 3, 
                      borderRadius: 2,
                      borderColor: 'divider'
                    }}
                  >
                    <Stack spacing={1}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Box 
                            sx={{ 
                              bgcolor: climatiseurActif ? 'primary.lighter' : 'background.neutral', 
                              borderRadius: '50%', 
                              p: 1,
                              display: 'flex',
                            }}
                          >
                            <AcUnitIcon color={climatiseurActif ? "primary" : "disabled"} />
                          </Box>
                          <Typography variant="h6">Climatiseur</Typography>
                        </Stack>
                        <Switch 
                          checked={climatiseurActif}
                          onChange={handleToggleClimatiseur}
                          color="primary"
                        />
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {climatiseurActif 
                          ? 'Le climatiseur est actuellement en fonctionnement.' 
                          : 'Le climatiseur est actuellement éteint. Activez-le pour réguler la température.'}
                      </Typography>
                    </Stack>
                  </Paper>

                  {/* Contrôle du vidéoprojecteur */}
                  <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                    <Stack spacing={1}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Box 
                            sx={{ 
                              bgcolor: projecteurActif ? 'primary.lighter' : 'background.neutral', 
                              borderRadius: '50%', 
                              p: 1,
                              display: 'flex',
                            }}
                          >
                            <VideocamIcon color={projecteurActif ? "primary" : "disabled"} />
                          </Box>
                          <Typography variant="h6">Vidéoprojecteur</Typography>
                        </Stack>
                        <Switch 
                          checked={projecteurActif}
                          onChange={handleToggleProjecteur}
                          color="primary"
                        />
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {projecteurActif 
                          ? 'Le vidéoprojecteur est actuellement allumé. Prêt pour les présentations.' 
                          : 'Le vidéoprojecteur est actuellement éteint. Activez-le pour commencer une présentation.'}
                      </Typography>
                    </Stack>
                  </Paper>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Conditions environnementales */}
          <Grid size={{ xs: 12, md: 7, lg: 8 }}>
            <Card sx={{ height: '100%', borderRadius: 2, boxShadow: (theme) => theme.shadows[1] }}>
              <CardHeader 
                title="Conditions environnementales" 
                titleTypographyProps={{ variant: 'h5', fontWeight: 600 }}
                subheader="Température, humidité et qualité de l'air"
                sx={{ pb: 0 }}
              />
              <CardContent sx={{ pt: 3 }}>
                {!salleSelectionnee ? (
                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    Veuillez sélectionner une salle pour afficher les données environnementales
                  </Alert>
                ) : loadingSensors ? (
                  <Box sx={{ width: '100%', py: 4 }}>
                    <LinearProgress sx={{ height: 6, borderRadius: 3 }} />
                    <Typography variant="body2" sx={{ mt: 3, textAlign: 'center', color: 'text.secondary' }}>
                      Chargement des données des capteurs...
                    </Typography>
                  </Box>
                ) : errorSensors && errorSensors !== "Identifiant de salle requis" ? (
                  <Alert severity="error" sx={{ borderRadius: 2 }}>{errorSensors}</Alert>
                ) : (
                  <Stack spacing={3}>
                    {/* Température */}
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 3, 
                        borderRadius: 2,
                        borderColor: isTemperatureNormal ? 'success.main' : 'error.main',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)'
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Box 
                          sx={{ 
                            bgcolor: isTemperatureNormal ? 'success.lighter' : 'warning.lighter', 
                            borderRadius: '50%', 
                            p: 1,
                            display: 'flex',
                          }}
                        >
                          <ThermostatIcon color={isTemperatureNormal ? 'success' : 'warning'} fontSize="large" />
                        </Box>
                        <Stack sx={{ flexGrow: 1 }}>
                          <Typography variant="h6">Température</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {temperature ? `${(temperature ?? 0).toFixed(1)}°C` : 'Non disponible'}
                          </Typography>
                        </Stack>
                        <Typography 
                          variant="h4" 
                          color={isTemperatureNormal ? 'success.main' : 'warning.main'}
                        >
                          {temperature ? `${Math.round(temperature ?? 0)}°C` : '--'}
                        </Typography>
                      </Stack>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="caption" color="text.secondary">
                        {isTemperatureNormal 
                          ? 'La température est dans la plage normale pour une salle de classe.' 
                          : 'La température est anormale. Cela peut affecter le confort et la concentration.'}
                      </Typography>
                    </Paper>

                    {/* Humidité */}
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 3, 
                        borderRadius: 2,
                        borderColor: isHumidityNormal ? 'success.main' : 'warning.main',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)'
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Box 
                          sx={{ 
                            bgcolor: isHumidityNormal ? 'success.lighter' : 'warning.lighter', 
                            borderRadius: '50%', 
                            p: 1,
                            display: 'flex',
                          }}
                        >
                          <WaterIcon color={isHumidityNormal ? 'success' : 'warning'} fontSize="large" />
                        </Box>
                        <Stack sx={{ flexGrow: 1 }}>
                          <Typography variant="h6">Humidité</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {humidity ? `${(humidity ?? 0).toFixed(1)}%` : 'Non disponible'}
                          </Typography>
                        </Stack>
                        <Typography 
                          variant="h4" 
                          color={isHumidityNormal ? 'success.main' : 'warning.main'}
                        >
                          {humidity ? `${Math.round(humidity ?? 0)}%` : '--'}
                        </Typography>
                      </Stack>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="caption" color="text.secondary">
                        {isHumidityNormal 
                          ? 'Le niveau d\'humidité est dans la plage normale pour une salle de classe.' 
                          : 'Le niveau d\'humidité est anormal. Cela peut affecter le confort des occupants.'}
                      </Typography>
                    </Paper>

                    {/* Qualité de l'air */}
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 3, 
                        borderRadius: 2,
                        borderColor: isAirQualityNormal ? 'success.main' : 'error.main',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)'
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Box 
                          sx={{ 
                            bgcolor: isAirQualityNormal ? 'success.lighter' : 'error.lighter', 
                            borderRadius: '50%', 
                            p: 1,
                            display: 'flex',
                          }}
                        >
                          <AirIcon color={isAirQualityNormal ? 'success' : 'error'} fontSize="large" />
                        </Box>
                        <Stack sx={{ flexGrow: 1 }}>
                          <Typography variant="h6">Qualité de l&apos;air</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {airQuality ? `${airQuality} ppm de CO2` : 'Non disponible'}
                          </Typography>
                        </Stack>
                        <Typography 
                          variant="h4" 
                          color={isAirQualityNormal ? 'success.main' : 'error.main'}
                        >
                          {airQuality ? `${Math.round(airQuality ?? 0)}` : '--'}
                        </Typography>
                      </Stack>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="caption" color="text.secondary">
                        {isAirQualityNormal 
                          ? 'La qualité de l&apos;air est bonne. La ventilation est adéquate.' 
                          : 'La qualité de l&apos;air est mauvaise. Il est recommandé d&apos;aérer la salle.'}
                      </Typography>
                    </Paper>
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}
