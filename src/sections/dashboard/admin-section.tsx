// Section spéciale Admin pour le tableau de bord
// Visible uniquement par les administrateurs

import { useState, useEffect } from 'react';
import { query, where, collection, getCountFromServer } from 'firebase/firestore';

import { 
  Box,
  Tab, 
  Card, 
  Chip,
  Grid, 
  Tabs,
  Alert,
  Paper,
  Divider, 
  Typography, 
  LinearProgress
} from '@mui/material';

// Imports internes
import { db } from 'src/services/firebaseClient';
import { useRole } from 'src/context/RoleContext';

// Imports des composants
import { Iconify } from 'src/components/iconify';

import UserManagementList from 'src/sections/admin/user-management-list';

// ----------------------------------------------------------------------

// Type pour les statistiques système
interface SystemStats {
  utilisateursTotal: number;
  professeursTotal: number;
  adminsTotal: number;
  sallesTotal: number;
  alertesTotal: number;
  versionApplication: string;
  derniereMAJ: string;
  statut: 'stable' | 'beta' | 'maintenance';
  vueEnsemble: string | null;
}

export default function AdminSection() {
  const { isAdmin } = useRole();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [statsSystem, setStatsSystem] = useState<SystemStats>({
    utilisateursTotal: 0,
    professeursTotal: 0,
    adminsTotal: 0,
    sallesTotal: 0,
    alertesTotal: 0,
    vueEnsemble: null,
    versionApplication: '1.0.0',
    derniereMAJ: new Date().toLocaleDateString('fr-FR'),
    statut: 'stable'
  });

  // Récupération des statistiques du système
  useEffect(() => {
    const fetchSystemStats = async () => {
      if (activeTab === 1) {
        setLoading(true);
        try {
          // Nombre total d'utilisateurs
          const usersCollection = collection(db, 'utilisateurs');
          const usersSnapshot = await getCountFromServer(usersCollection);
          const utilisateursTotal = usersSnapshot.data().count;
          
          // Nombre de professeurs
          const professeursQuery = query(usersCollection, where('role', '==', 'professeur'));
          const professeursSnapshot = await getCountFromServer(professeursQuery);
          const professeursTotal = professeursSnapshot.data().count;
          
          // Nombre d'admins
          const adminsQuery = query(usersCollection, where('role', '==', 'admin'));
          const adminsSnapshot = await getCountFromServer(adminsQuery);
          const adminsTotal = adminsSnapshot.data().count;
          
          // Nombre de salles
          const sallesCollection = collection(db, 'salles');
          const sallesSnapshot = await getCountFromServer(sallesCollection);
          const sallesTotal = sallesSnapshot.data().count;
          
          // Nombre d'alertes
          const alertesCollection = collection(db, 'alertes');
          const alertesSnapshot = await getCountFromServer(alertesCollection);
          const alertesTotal = alertesSnapshot.data().count;
          
          setStatsSystem({
            utilisateursTotal,
            professeursTotal,
            adminsTotal,
            sallesTotal,
            alertesTotal,
            vueEnsemble: 'Système de gestion de salles intelligent pour environnement éducatif',
            versionApplication: '1.0.0',
            derniereMAJ: new Date().toLocaleDateString('fr-FR'),
            statut: 'stable'
          });
        } catch (error) {
          console.error('Erreur lors de la récupération des statistiques:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchSystemStats();
  }, [activeTab]);

  // Si l'utilisateur n'est pas admin, ne pas afficher cette section
  if (!isAdmin) {
    return null;
  }

  const handleChangeTab = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Card sx={{ p: 3, mb: 5 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Administration
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Cette section est réservée aux administrateurs. Vous pouvez gérer les professeurs et leurs accès &agrave; l&apos;application mobile.
      </Alert>
      
      <Tabs 
        value={activeTab}
        onChange={handleChangeTab}
        sx={{ mb: 3 }}
      >
        <Tab 
          label="Gestion des utilisateurs" 
          icon={<Iconify icon="eva:people-fill" width={20} />} 
          iconPosition="start"
        />
        <Tab 
          label="Statistiques système" 
          icon={<Iconify icon="eva:trending-up-fill" width={20} />} 
          iconPosition="start"
        />
      </Tabs>
      
      <Divider sx={{ mb: 3 }} />
      
      {activeTab === 0 && (
        <UserManagementList />
      )}
      
      {activeTab === 1 && (
        <Box>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Informations système
          </Typography>
          
          {loading ? (
            <LinearProgress sx={{ my: 4 }} />
          ) : (
            <Grid container spacing={3} display="grid" gridTemplateColumns="repeat(12, 1fr)">
              {/* Statistiques principales */}
              <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                <Paper elevation={0} variant="outlined" sx={{ p: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Vue d&apos;ensemble
                  </Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    <Grid container spacing={2} display="grid" gridTemplateColumns="repeat(12, 1fr)">
                      <Grid sx={{ gridColumn: 'span 6' }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Système
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          Smart Salle
                        </Typography>
                      </Grid>
                      
                      <Grid sx={{ gridColumn: 'span 6' }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Statut
                        </Typography>
                        <Chip 
                          label={statsSystem.statut === 'stable' ? 'Stable' : statsSystem.statut === 'beta' ? 'Beta' : 'Maintenance'}
                          color={statsSystem.statut === 'stable' ? 'success' : statsSystem.statut === 'beta' ? 'warning' : 'error'}
                          size="small"
                          sx={{ mt: 0.5 }}
                        />
                      </Grid>
                      
                      <Grid sx={{ gridColumn: 'span 6' }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Version
                        </Typography>
                        <Typography variant="body1">
                          {statsSystem.versionApplication}
                        </Typography>
                      </Grid>
                      
                      <Grid sx={{ gridColumn: 'span 6' }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Dernière mise à jour
                        </Typography>
                        <Typography variant="body1">
                          {statsSystem.derniereMAJ}
                        </Typography>
                      </Grid>
                      
                      <Grid sx={{ gridColumn: 'span 6' }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Base de données
                        </Typography>
                        <Typography variant="body1">
                          Firebase
                        </Typography>
                      </Grid>
                      
                      <Grid sx={{ gridColumn: 'span 6' }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Temps de fonctionnement
                        </Typography>
                        <Typography variant="body1">
                          24/7
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </Paper>
              </Grid>
              
              {/* Statistiques utilisateurs */}
              <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                <Paper elevation={0} variant="outlined" sx={{ p: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Utilisateurs et ressources
                  </Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    <Grid container spacing={2} display="grid" gridTemplateColumns="repeat(12, 1fr)">
                      <Grid sx={{ gridColumn: 'span 6' }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Vue d&apos;ensemble
                        </Typography>
                        <Typography variant='body1'>
                          {statsSystem.vueEnsemble || 'Information non disponible'}
                        </Typography>
                      </Grid>
                      
                      <Grid sx={{ gridColumn: 'span 6' }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Utilisateurs totaux
                        </Typography>
                        <Typography variant="h6" color="primary.main">
                          {statsSystem.utilisateursTotal}
                        </Typography>
                      </Grid>
                      
                      <Grid sx={{ gridColumn: 'span 6' }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Salles gérées
                        </Typography>
                        <Typography variant="h6" color="primary.main">
                          {statsSystem.sallesTotal}
                        </Typography>
                      </Grid>
                      
                      <Grid sx={{ gridColumn: 'span 6' }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Professeurs
                        </Typography>
                        <Typography variant="body1">
                          {statsSystem.professeursTotal}
                        </Typography>
                      </Grid>
                      
                      <Grid sx={{ gridColumn: 'span 6' }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Administrateurs
                        </Typography>
                        <Typography variant="body1">
                          {statsSystem.adminsTotal}
                        </Typography>
                      </Grid>
                      
                      <Grid sx={{ gridColumn: 'span 6' }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Alertes actives
                        </Typography>
                        <Typography variant="body1" color={statsSystem.alertesTotal > 0 ? 'error.main' : 'text.primary'}>
                          {statsSystem.alertesTotal}
                        </Typography>
                      </Grid>
                      
                      <Grid sx={{ gridColumn: 'span 6' }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Taux d&apos;occupation
                        </Typography>
                        <Typography variant="body1">
                          {statsSystem.sallesTotal ? Math.round((statsSystem.professeursTotal / statsSystem.sallesTotal) * 100) : 0}%
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </Paper>
              </Grid>
              
              {/* Performances système */}
              <Grid sx={{ gridColumn: 'span 12' }}>
                <Paper elevation={0} variant="outlined" sx={{ p: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Performance et utilisation
                  </Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      Utilisation CPU
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={25} 
                      color="success"
                      sx={{ height: 8, borderRadius: 1, mb: 2 }}
                    />
                    
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      Utilisation mémoire
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={42} 
                      color="info"
                      sx={{ height: 8, borderRadius: 1, mb: 2 }}
                    />
                    
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      Utilisation stockage
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={18} 
                      color="secondary"
                      sx={{ height: 8, borderRadius: 1 }}
                    />
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}
        </Box>
      )}
    </Card>
  );
}
