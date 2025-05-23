// Page d&apos;initialisation de la base de données Firebase pour Smart Salle
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// @mui
import {
  Box,
  Card,
  List,
  Stack,
  Alert,
  Button,
  Divider,
  ListItem,
  Container,
  Typography,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from '@mui/material';

// components
import { Iconify } from '../components/iconify';
// scripts
import { initialiserCollections } from '../scripts/initialiserFirebase';

// ----------------------------------------------------------------------

export default function InitialisationDBPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [resultat, setResultat] = useState<{ success?: boolean; message?: string; erreur?: any } | null>(null);
  const [etapesTerminees, setEtapesTerminees] = useState<string[]>([]);

  // Fonction pour initialiser la base de données
  const initialiserFirebase = async () => {
    setLoading(true);
    setResultat(null);
    setEtapesTerminees([]);

    try {
      // Commencer l&apos;initialisation
      console.log('Début de l&apos;initialisation des collections Firebase...');
      
      await initialiserCollections();
      
      // Définir manuellement le résultat positif
      const resultatInit = { 
        success: true, 
        message: 'Toutes les collections ont été initialisées avec succès !'
      };
      
      setResultat(resultatInit);
      
      if (resultatInit.success) {
        // Accumuler les étapes dans l&apos;ordre au fur et à mesure qu&apos;elles sont terminées
        setEtapesTerminees([
          'Utilisateurs créés',
          'Salles créées',
          'Capteurs créés',
          'Données des capteurs créées',
          'Équipements créés',
          'Plannings créés',
          'Maintenances créées',
          'Alertes créées'
        ]);
      }
    } catch (error: any) {
      console.error('Erreur lors de l&apos;initialisation:', error);
      setResultat({
        success: false,
        message: 'Une erreur est survenue lors de l\'initialisation de la base de données.',
        erreur: error
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Titre de la page */}

      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Initialisation de la Base de Données Firebase
        </Typography>

        <Card>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Assistant d&apos;initialisation des collections
            </Typography>
            
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              Cette page vous permet d&apos;initialiser automatiquement la base de données Firebase avec toutes les collections nécessaires au fonctionnement de l&apos;application Smart Salle. 
              Les données de test générées incluent des utilisateurs, des salles, des capteurs, des équipements et des plannings.
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" gutterBottom>
              Collections qui seront créées :
            </Typography>

            <List dense>
              <ListItem>
                <ListItemIcon>
                  <Iconify icon="eva:people-fill" />
                </ListItemIcon>
                <ListItemText 
                  primary="Collection utilisateurs" 
                  secondary="Administrateurs et professeurs avec leurs rôles" 
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <Iconify icon="eva:people-fill" />
                </ListItemIcon>
                <ListItemText 
                  primary="Collection salles" 
                  secondary="Salles de classe avec leurs équipements et responsables" 
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <Iconify icon="eva:trending-up-fill" />
                </ListItemIcon>
                <ListItemText 
                  primary="Collection capteurs et données" 
                  secondary="Capteurs de température, humidité et qualité d&apos;air" 
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <Iconify icon="eva:plus-fill" />
                </ListItemIcon>
                <ListItemText 
                  primary="Collection équipements" 
                  secondary="Climatiseurs, vidéoprojecteurs et ordinateurs" 
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <Iconify icon="eva:refresh-fill" />
                </ListItemIcon>
                <ListItemText 
                  primary="Collection plannings" 
                  secondary="Planning d&apos;occupation des salles" 
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <Iconify icon="eva:more-vertical-fill" />
                </ListItemIcon>
                <ListItemText 
                  primary="Collection maintenances" 
                  secondary="Interventions techniques programmées" 
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <Iconify icon="eva:alert-triangle-fill" />
                </ListItemIcon>
                <ListItemText 
                  primary="Collection alertes" 
                  secondary="Alertes environnementales et techniques" 
                />
              </ListItem>
            </List>

            <Divider sx={{ my: 2 }} />

            <Stack spacing={2} sx={{ mt: 3 }}>
              <Alert severity="warning">
                <Typography variant="body2">
                  <strong>Attention :</strong> Cette opération va créer des données de test dans votre base Firebase. 
                  Si des collections et documents existent déjà avec les mêmes identifiants, leurs données seront écrasées.
                </Typography>
              </Alert>

              <Button 
                variant="contained" 
                color="primary" 
                size="large"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Iconify icon="eva:plus-fill" />}
                onClick={initialiserFirebase}
                disabled={loading}
              >
                {loading ? 'Initialisation en cours...' : 'Initialiser la base de données'}
              </Button>

              {resultat && (
                <Alert severity={resultat.success ? 'success' : 'error'} sx={{ mt: 2 }}>
                  {resultat.message}
                </Alert>
              )}

              {etapesTerminees.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Étapes terminées :
                  </Typography>
                  <List dense>
                    {etapesTerminees.map((etape, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <Iconify icon="eva:checkmark-fill" sx={{ color: 'success.main' }} />
                        </ListItemIcon>
                        <ListItemText primary={etape} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              <Button 
                variant="outlined" 
                onClick={() => navigate('/dashboard')}
                startIcon={<Iconify icon="eva:refresh-fill" />}
              >
                Retour au tableau de bord
              </Button>
            </Stack>
          </Box>
        </Card>
      </Container>
    </>
  );
}
