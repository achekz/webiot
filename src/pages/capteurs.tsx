// Page de gestion des capteurs pour Smart Salle

// external
import type { ChangeEvent } from 'react';
// types
import type { SelectChangeEvent } from '@mui/material/Select';

import { useState, useEffect } from 'react';
import { doc, getDocs, deleteDoc, updateDoc, collection } from 'firebase/firestore';

// mui
import { TabList, TabPanel, TabContext } from '@mui/lab';
import {
  Box,
  Tab,
  Card,
  Chip,
  Table,
  Stack,
  Paper,
  Alert,
  Select,
  Button,
  Tooltip,
  TableRow,
  MenuItem,
  TableBody,
  TableCell,
  TableHead,
  Container,
  TextField,
  Typography,
  InputLabel,
  IconButton,
  FormControl,
  TableContainer,
  LinearProgress,
} from '@mui/material';

// hooks
// services
import { db } from 'src/services/firebaseClient';
// context
import { useAuth } from 'src/context/AuthContext';

// components
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

// Types pour les capteurs
interface Capteur {
  id: string;
  type: 'temperature' | 'humidite' | 'qualiteAir' | 'presence';
  statut: 'actif' | 'inactif' | 'maintenance';
  derniereMiseAJour: string;
  salleId: string;
  seuils?: {
    min?: number;
    max?: number;
  };
  marque?: string;
  modele?: string;
  dateInstallation?: string;
  // Permettre d'autres propriétés pour la compatibilité avec les données Firebase
  [key: string]: any;
}

interface Salle {
  id: string;
  nom: string;
}

export default function CapteursPage() {
  // États
  const [ongletActif, setOngletActif] = useState('1');
  const [capteurs, setCapteurs] = useState<Capteur[]>([]);
  const [salles, setSalles] = useState<Salle[]>([]);
  const [salleSelectionnee, setSalleSelectionnee] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // État pour le formulaire d'ajout de capteur
  const [nouveauCapteur, setNouveauCapteur] = useState<Partial<Capteur>>({
    type: 'temperature',
    statut: 'actif',
    seuils: { min: 15, max: 30 }
  });

  // Auth context
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';

  // Chargement des données
  useEffect(() => {
    document.title = 'Gestion des Capteurs - Smart Salle';
    chargerDonnees();
  }, []);

  // Chargement des salles et capteurs
  const chargerDonnees = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Charger les salles
      const sallesSnapshot = await getDocs(collection(db, 'salles'));
      const sallesData = sallesSnapshot.docs.map(docSnapshot => ({
        id: docSnapshot.id,
        nom: docSnapshot.data().nom || `Salle ${docSnapshot.id}`
      }));
      
      setSalles(sallesData);
      
      if (sallesData.length > 0 && !salleSelectionnee) {
        setSalleSelectionnee(sallesData[0].id);
      }
      
      // Charger tous les capteurs
      const capteursSnapshot = await getDocs(collection(db, 'salles'));
      let tousLesCapteurs: Capteur[] = [];
      
      for (const salleDoc of capteursSnapshot.docs) {
        const salleId = salleDoc.id;
        
        // Récupérer les capteurs de cette salle
        const capteursSalleSnapshot = await getDocs(collection(db, `salles/${salleId}/capteurs`));
        
        const capteursSalle = capteursSalleSnapshot.docs.map(capteurDoc => {
          const data = capteurDoc.data();
          return {
            id: capteurDoc.id,
            salleId,
            type: data.type || 'temperature',
            statut: data.statut || 'actif',
            ...data,
            derniereMiseAJour: data.derniereMiseAJour?.toDate?.() || new Date().toISOString()
          } as Capteur;
        });
        
        tousLesCapteurs = [...tousLesCapteurs, ...capteursSalle];
      }
      
      setCapteurs(tousLesCapteurs);
    } catch (err: any) {
      console.error('Erreur lors du chargement des données:', err);
      setError(`Erreur lors du chargement des données: ${err?.message || 'Erreur inconnue'}. Veuillez réessayer.`);
    } finally {
      setLoading(false);
    }
  };

  // Changement d'onglet
  const handleChangeOnglet = (event: React.SyntheticEvent, newValue: string) => {
    setOngletActif(newValue);
  };

  // Changement de salle
  const handleChangeSalle = (event: SelectChangeEvent) => {
    setSalleSelectionnee(event.target.value);
  };

  // Changement de statut d'un capteur
  const handleChangeStatutCapteur = async (capteur: Capteur, nouveauStatut: 'actif' | 'inactif' | 'maintenance') => {
    try {
      setLoading(true);
      
      const capteurRef = doc(db, `salles/${capteur.salleId}/capteurs/${capteur.id}`);
      await updateDoc(capteurRef, {
        statut: nouveauStatut,
        derniereMiseAJour: new Date().toISOString()
      });
      
      setSuccess(`Le statut du capteur a été mis à jour avec succès.`);
      setTimeout(() => setSuccess(null), 3000);
      
      // Actualiser les données
      await chargerDonnees();
    } catch (err: any) {
      console.error('Erreur lors du changement de statut du capteur:', err);
      setError(`Erreur lors de la mise à jour du statut du capteur: ${err.message || 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  // Suppression d'un capteur
  const handleSupprimerCapteur = async (capteur: Capteur) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ce capteur de ${getTypeCapteurLabel(capteur.type)} ?`)) {
      return;
    }
    
    try {
      setLoading(true);
      
      const capteurRef = doc(db, `salles/${capteur.salleId}/capteurs/${capteur.id}`);
      await deleteDoc(capteurRef);
      
      setSuccess('Le capteur a été supprimé avec succès.');
      setTimeout(() => setSuccess(null), 3000);
      
      // Actualiser les données
      await chargerDonnees();
    } catch (err: any) {
      console.error('Erreur lors de la suppression du capteur:', err);
      setError(`Erreur lors de la suppression du capteur: ${err.message || 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  // Ajout d'un nouveau capteur
  const handleAjouterCapteur = async () => {
    if (!salleSelectionnee) {
      setError('Veuillez sélectionner une salle.');
      return;
    }
    
    try {
      setLoading(true);
      
      // Vérifier si un capteur du même type existe déjà dans cette salle
      const capteursExistants = capteurs.filter(
        capteur => capteur.salleId === salleSelectionnee && capteur.type === nouveauCapteur.type
      );
      
      if (capteursExistants.length > 0 && nouveauCapteur.type) {
        setError(`Un capteur de ${getTypeCapteurLabel(nouveauCapteur.type)} existe déjà dans cette salle.`);
        return;
      }
      
      // Générer un ID pour le capteur basé sur le type et la salle
      const capteurId = `capteur-${nouveauCapteur.type}-${salleSelectionnee.replace('salle', '')}`;
      
      // Créer le nouveau capteur
      const capteurData = {
        ...nouveauCapteur,
        derniereMiseAJour: new Date().toISOString(),
        dateInstallation: new Date().toISOString()
      };
      
      const capteurRef = doc(db, `salles/${salleSelectionnee}/capteurs`, capteurId);
      await updateDoc(capteurRef, capteurData);
      
      setSuccess('Le capteur a été ajouté avec succès.');
      setTimeout(() => setSuccess(null), 3000);
      
      // Réinitialiser le formulaire
      setNouveauCapteur({
        type: 'temperature',
        statut: 'actif',
        seuils: { min: 15, max: 30 }
      });
      
      // Actualiser les données
      await chargerDonnees();
    } catch (err: any) {
      console.error('Erreur lors de l\'ajout du capteur:', err);
      setError(`Erreur lors de l'ajout du capteur: ${err.message || 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  // Mise à jour du formulaire d'ajout de capteur
  const handleChangeNouveauCapteur = (e: ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    
    if (name && name.startsWith('seuils.')) {
      const seuilProp = name.split('.')[1]; // min ou max
      setNouveauCapteur({
        ...nouveauCapteur,
        seuils: {
          ...nouveauCapteur.seuils,
          [seuilProp]: parseFloat(value as string)
        }
      });
    } else if (name) {
      setNouveauCapteur({
        ...nouveauCapteur,
        [name]: value
      });
    }
  };

  // Fonction utilitaire pour obtenir le label d'un type de capteur
  const getTypeCapteurLabel = (type: string) => {
    switch (type) {
      case 'temperature':
        return 'Température';
      case 'humidite':
        return 'Humidité';
      case 'qualiteAir':
        return 'Qualité d\'air';
      case 'presence':
        return 'Présence';
      default:
        return type;
    }
  };

  // Fonction utilitaire pour obtenir le label de statut
  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case 'actif':
        return 'Actif';
      case 'inactif':
        return 'Inactif';
      case 'maintenance':
        return 'En maintenance';
      default:
        return statut;
    }
  };

  // Fonction utilitaire pour obtenir la couleur de statut
  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'actif':
        return 'success';
      case 'inactif':
        return 'error';
      case 'maintenance':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Fonction utilitaire pour obtenir l'icône d'un type de capteur
  const getTypeCapteurIcon = (type: string) => {
    switch (type) {
      case 'temperature':
        return 'eva:thermometer-outline';
      case 'humidite':
        return 'eva:droplet-outline';
      case 'qualiteAir':
        return 'eva:wind-outline';
      case 'presence':
        return 'eva:person-outline';
      default:
        return 'eva:activity-outline';
    }
  };

  // Filtrer les capteurs par salle sélectionnée (pour l'onglet Vue par salle)
  const capteursFiltres = capteurs.filter(capteur => capteur.salleId === salleSelectionnee);

  return (
    <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Gestion des Capteurs
        </Typography>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        <TabContext value={ongletActif}>
          <Card sx={{ mb: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <TabList onChange={handleChangeOnglet}>
                <Tab label="Vue par salle" value="1" />
                <Tab label="Tous les capteurs" value="2" />
                {isAdmin && <Tab label="Ajouter un capteur" value="3" />}
              </TabList>
            </Box>
          </Card>

          {/* Onglet Vue par salle */}
          <TabPanel value="1" sx={{ p: 0 }}>
            <Card sx={{ mb: 3 }}>
              <Box sx={{ p: 3 }}>
                <FormControl fullWidth>
                  <InputLabel id="salle-select-label">Sélectionner une salle</InputLabel>
                  <Select
                    labelId="salle-select-label"
                    id="salle-select"
                    value={salleSelectionnee}
                    label="Sélectionner une salle"
                    onChange={handleChangeSalle}
                    disabled={loading || salles.length === 0}
                  >
                    {salles.map((salle) => (
                      <MenuItem key={salle.id} value={salle.id}>
                        {salle.nom}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Card>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
              {capteursFiltres.length === 0 ? (
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body1">
                      Aucun capteur trouvé pour cette salle.
                    </Typography>
                    {isAdmin && (
                      <Button
                        variant="contained"
                        sx={{ mt: 2 }}
                        onClick={() => setOngletActif('3')}
                        startIcon={<Iconify icon="eva:plus-fill" />}
                      >
                        Ajouter un capteur
                      </Button>
                    )}
                  </Paper>
                </Box>
              ) : (
                capteursFiltres.map((capteur) => (
                  <Box key={`${capteur.salleId}-${capteur.id}`}>
                    <Card>
                      <Box sx={{ position: 'relative' }}>
                        <IconButton
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            zIndex: 9,
                          }}
                          size="small"
                        >
                          <Iconify icon="eva:trending-up-fill" width={24} />
                        </IconButton>
                      </Box>
                      
                      <Box sx={{ p: 3, pt: 5 }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)' }, gap: 2 }}>
                          <Box>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="subtitle1">
                                {getTypeCapteurLabel(capteur.type)}
                              </Typography>
                              <Chip
                                label={getStatutLabel(capteur.statut)}
                                color={getStatutColor(capteur.statut)}
                                size="small"
                              />
                            </Stack>

                            <Box>
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                ID: {capteur.id}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                Dernière mise à jour:{' '}
                                {new Date(capteur.derniereMiseAJour).toLocaleString()}
                              </Typography>
                              {capteur.seuils && (
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                  Seuils: {capteur.seuils.min || '-'} à {capteur.seuils.max || '-'}
                                </Typography>
                              )}
                            </Box>

                            {isAdmin && (
                              <Stack direction="row" spacing={1}>
                                <FormControl fullWidth size="small">
                                  <InputLabel id={`statut-select-${capteur.id}`}>Statut</InputLabel>
                                  <Select
                                    labelId={`statut-select-${capteur.id}`}
                                    value={capteur.statut}
                                    label="Statut"
                                    onChange={(e) => handleChangeStatutCapteur(capteur, e.target.value)}
                                    disabled={loading}
                                  >
                                    <MenuItem value="actif">Actif</MenuItem>
                                    <MenuItem value="inactif">Inactif</MenuItem>
                                    <MenuItem value="maintenance">Maintenance</MenuItem>
                                  </Select>
                                </FormControl>
                                <Tooltip title="Supprimer">
                                  <IconButton
                                    color="error"
                                    onClick={() => handleSupprimerCapteur(capteur)}
                                    disabled={loading}
                                  >
                                    <Iconify icon="eva:trash-2-outline" />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </Card>
                  </Box>
                ))
              )}
            </Box>
          </TabPanel>

          {/* Onglet Tous les capteurs */}
          <TabPanel value="2" sx={{ p: 0 }}>
            <Card>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell>Salle</TableCell>
                      <TableCell>ID</TableCell>
                      <TableCell>Statut</TableCell>
                      <TableCell>Dernière mise à jour</TableCell>
                      <TableCell>Seuils</TableCell>
                      {isAdmin && <TableCell align="right">Actions</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {capteurs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={isAdmin ? 7 : 6} align="center">
                          Aucun capteur trouvé.
                        </TableCell>
                      </TableRow>
                    ) : (
                      capteurs.map((capteur) => {
                        const salle = salles.find((s) => s.id === capteur.salleId);
                        return (
                          <TableRow key={`${capteur.salleId}-${capteur.id}`}>
                            <TableCell>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Iconify icon="eva:trending-up-fill" width={20} />
                                <Typography variant="body2">
                                  {getTypeCapteurLabel(capteur.type)}
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell>{salle?.nom || capteur.salleId}</TableCell>
                            <TableCell>{capteur.id}</TableCell>
                            <TableCell>
                              <Chip
                                label={getStatutLabel(capteur.statut)}
                                color={getStatutColor(capteur.statut)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {new Date(capteur.derniereMiseAJour).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              {capteur.seuils
                                ? `${capteur.seuils.min || '-'} à ${capteur.seuils.max || '-'}`
                                : '-'}
                            </TableCell>
                            {isAdmin && (
                              <TableCell align="right">
                                <Stack direction="row" justifyContent="flex-end" spacing={1}>
                                  <FormControl size="small" sx={{ minWidth: 120 }}>
                                    <InputLabel id={`statut-select-table-${capteur.id}`}>
                                      Statut
                                    </InputLabel>
                                    <Select
                                      labelId={`statut-select-table-${capteur.id}`}
                                      value={capteur.statut}
                                      label="Statut"
                                      onChange={(e) =>
                                        handleChangeStatutCapteur(capteur, e.target.value)
                                      }
                                      disabled={loading}
                                    >
                                      <MenuItem value="actif">Actif</MenuItem>
                                      <MenuItem value="inactif">Inactif</MenuItem>
                                      <MenuItem value="maintenance">Maintenance</MenuItem>
                                    </Select>
                                  </FormControl>
                                  <Tooltip title="Supprimer">
                                    <IconButton
                                      color="error"
                                      onClick={() => handleSupprimerCapteur(capteur)}
                                      disabled={loading}
                                    >
                                      <Iconify icon="eva:trash-2-outline" />
                                    </IconButton>
                                  </Tooltip>
                                </Stack>
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </TabPanel>

          {/* Onglet Ajouter un capteur (admin uniquement) */}
          {isAdmin && (
            <TabPanel value="3" sx={{ p: 0 }}>
              <Card>
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 3 }}>
                    Ajouter un nouveau capteur
                  </Typography>

                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
                    <Box>
                      <FormControl fullWidth sx={{ mb: 3 }}>
                        <InputLabel id="salle-nouveau-capteur-label">Salle</InputLabel>
                        <Select
                          labelId="salle-nouveau-capteur-label"
                          name="salleId"
                          value={salleSelectionnee}
                          label="Salle"
                          onChange={handleChangeSalle}
                          disabled={loading || salles.length === 0}
                        >
                          {salles.map((salle) => (
                            <MenuItem key={salle.id} value={salle.id}>
                              {salle.nom}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl fullWidth sx={{ mb: 3 }}>
                        <InputLabel id="type-nouveau-capteur-label">Type de capteur</InputLabel>
                        <Select
                          labelId="type-nouveau-capteur-label"
                          name="type"
                          value={nouveauCapteur.type}
                          label="Type de capteur"
                          onChange={(e) => {
                            // Conversion explicite de l'événement de Select vers le format attendu
                            const event = {
                              target: {
                                name: 'type',
                                value: e.target.value
                              }
                            } as ChangeEvent<{ name: string; value: unknown }>;
                            handleChangeNouveauCapteur(event);
                          }}
                          disabled={loading}
                        >
                          <MenuItem value="temperature">Température</MenuItem>
                          <MenuItem value="humidite">Humidité</MenuItem>
                          <MenuItem value="qualiteAir">Qualité d&apos;air</MenuItem>
                          <MenuItem value="presence">Présence</MenuItem>
                        </Select>
                      </FormControl>

                      <FormControl fullWidth sx={{ mb: 3 }}>
                        <InputLabel id="statut-nouveau-capteur-label">Statut initial</InputLabel>
                        <Select
                          labelId="statut-nouveau-capteur-label"
                          name="statut"
                          value={nouveauCapteur.statut}
                          label="Statut initial"
                          onChange={(e) => {
                            // Conversion explicite de l'événement de Select vers le format attendu
                            const event = {
                              target: {
                                name: 'statut',
                                value: e.target.value
                              }
                            } as ChangeEvent<{ name: string; value: unknown }>;
                            handleChangeNouveauCapteur(event);
                          }}
                          disabled={loading}
                        >
                          <MenuItem value="actif">Actif</MenuItem>
                          <MenuItem value="inactif">Inactif</MenuItem>
                          <MenuItem value="maintenance">Maintenance</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>

                    <Box>
                      <TextField
                        fullWidth
                        label="Marque"
                        name="marque"
                        value={nouveauCapteur.marque || ''}
                        onChange={handleChangeNouveauCapteur}
                        sx={{ mb: 3 }}
                      />

                      <TextField
                        fullWidth
                        label="Modèle"
                        name="modele"
                        value={nouveauCapteur.modele || ''}
                        onChange={handleChangeNouveauCapteur}
                        sx={{ mb: 3 }}
                      />

                      {(nouveauCapteur.type === 'temperature' ||
                        nouveauCapteur.type === 'humidite' ||
                        nouveauCapteur.type === 'qualiteAir') && (
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)' }, gap: 2 }}>
                          <Box>
                            <TextField
                              fullWidth
                              label="Seuil minimum"
                              name="seuils.min"
                              type="number"
                              value={nouveauCapteur.seuils?.min || ''}
                              onChange={handleChangeNouveauCapteur}
                            />
                          </Box>
                          <Box>
                            <TextField
                              fullWidth
                              label="Seuil maximum"
                              name="seuils.max"
                              type="number"
                              value={nouveauCapteur.seuils?.max || ''}
                              onChange={handleChangeNouveauCapteur}
                            />
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Box>

                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      onClick={handleAjouterCapteur}
                      disabled={loading || !salleSelectionnee}
                      startIcon={<Iconify icon="eva:plus-fill" />}
                    >
                      Ajouter le capteur
                    </Button>
                  </Box>
                </Box>
              </Card>
            </TabPanel>
          )}
        </TabContext>
      </Container>
  );
}
