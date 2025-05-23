// react
import { useState } from 'react';
// firebase
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';

// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

// services
import { db } from 'src/services/firebaseClient';
// context
import { useAuth } from 'src/context/AuthContext';

// components
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function ProfilView() {
  const theme = useTheme();
  const { currentUser } = useAuth();
  
  // Log des informations utilisateur pour débogage
  console.log('Informations utilisateur dans le profil:', {
    uid: currentUser?.uid,
    email: currentUser?.email,
    displayName: currentUser?.displayName,
    role: currentUser?.role,
    prenom: currentUser?.prenom,
    nom: currentUser?.nom,
    salleAssignee: currentUser?.salleAssignee
  });
  
  // Vérification supplémentaire pour le rôle
  const isAdmin = currentUser?.role === 'admin';
  console.log('Est administrateur:', isAdmin);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Préremplir avec les valeurs de l'utilisateur ou valeurs par défaut
  // Si on n'a pas de prénom/nom, on utilise l'email ou le displayName s'ils sont disponibles
  const defaultName = currentUser?.email ? currentUser.email.split('@')[0] : '';
  const [nom, setNom] = useState(currentUser?.nom || defaultName);
  const [prenom, setPrenom] = useState(currentUser?.prenom || defaultName);
  
  // Fonction pour mettre à jour le profil
  const handleUpdateProfil = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      // Vérifier si l'utilisateur existe dans Firestore
      const userDocRef = doc(db, 'utilisateurs', currentUser.uid);
      
      try {
        // Mettre à jour dans Firestore
        await updateDoc(userDocRef, {
          nom,
          prenom,
          updatedAt: new Date().toISOString()
        });
        
        console.log('Mise à jour Firestore réussie');
      } catch (firebaseError) {
        const firestoreErr = firebaseError as { code?: string };
        console.error('Erreur Firestore:', firestoreErr);
        // Si l'erreur est de type 'document non trouvé', c'est peut-être que l'utilisateur
        // n'existe pas encore dans Firestore, affichons un message plus spécifique
        if (firestoreErr.code === 'not-found') {
          setError('Votre profil n\'existe pas dans la base de données. Contactez un administrateur.');
          setLoading(false);
          return;
        }
        throw firestoreErr; // Propager l'erreur pour être traitée dans le bloc catch externe
      }
      
      // Mettre à jour dans Firebase Auth si possible
      try {
        if (currentUser) {
          await updateProfile(currentUser, {
            displayName: `${prenom} ${nom}`
          });
          console.log('Mise à jour Auth réussie');
        }
      } catch (authErr) {
        console.error('Erreur Auth:', authErr);
        // Si la mise à jour Firestore a fonctionné mais pas Auth, on considère
        // quand même la mise à jour comme un succès puisque les données principales sont sauvegardées
        setSuccess(true);
        setError('Votre profil a été partiellement mis à jour. Certaines informations n\'ont pas pu être synchronisées.');
        setLoading(false);
        return;
      }
      
      // Si tout s'est bien passé
      setSuccess(true);
      
      // Réinitialiser le succès après 3 secondes
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
      
    } catch (updateError) {
      console.error("Erreur lors de la mise à jour du profil:", updateError);
      // Message d'erreur plus explicite si possible
      setError("Impossible de mettre à jour votre profil. Veuillez réessayer.");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };
  
  if (!currentUser) {
    return (
      <Container>
        <Alert severity="warning">
          Vous devez être connecté pour accéder à votre profil.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 3 }}>
      <Typography variant="h4" sx={{ mb: 5 }}>
        Mon Profil
      </Typography>
      
      <Box
        component="img"
        alt="background"
        src="/assets/background/overlay_4.jpg"
        sx={{
          top: 0,
          left: 0,
          right: 0,
          width: 1,
          height: 280,
          objectFit: 'cover',
          position: 'absolute',
          filter: 'blur(4px)',
          display: { xs: 'none', md: 'block' },
        }}
      />
      
      <Card
        sx={{
          mb: 3,
          position: 'relative',
        }}
      >
        <CardHeader 
          title="Informations personnelles" 
          sx={{ 
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            pb: 5 
          }} 
        />
        
        <Stack
          spacing={2}
          direction={{ xs: 'column', md: 'row' }}
          sx={{
            top: 32,
            p: 3,
            width: 1,
            zIndex: 9,
            position: 'absolute',
            alignItems: { md: 'center' },
            justifyContent: { md: 'space-between' },
          }}
        >
          <Stack spacing={1} direction="row" alignItems="center">
            <Avatar
              src=""
              alt={currentUser.displayName || ''}
              sx={{
                width: 120,
                height: 120,
                border: `solid 2px ${theme.palette.background.default}`,
              }}
            >
              {(currentUser.prenom?.charAt(0) || currentUser.email?.charAt(0) || '').toUpperCase()}
            </Avatar>
            
            <Stack spacing={0.5}>
              <Typography variant="subtitle1">
                {/* Affichage du nom complet si disponible, sinon de l'email */}
                {prenom || nom 
                  ? `${prenom || ''} ${nom || ''}`.trim() 
                  : currentUser?.email?.split('@')[0] || 'Utilisateur'}
              </Typography>
              
              <Typography variant="body2" sx={{ 
                fontWeight: 'bold',
                color: isAdmin ? 'error.main' : 'primary.main' 
              }}>
                {/* Affichage direct du rôle */}
                {isAdmin ? 'Administrateur' : 'Professeur'}
              </Typography>
              
              {currentUser.role === 'professeur' && currentUser.salleAssignee && (
                <Typography variant="body2" sx={{ color: 'success.main' }}>
                  Salle assignée: {currentUser.salleAssignee}
                </Typography>
              )}
            </Stack>
          </Stack>
        </Stack>
        
        <CardContent
          sx={{
            pt: 12,
            pb: 3,
          }}
        >
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Votre profil a été mis à jour avec succès.
            </Alert>
          )}
          
          <Box
            sx={{
              display: 'grid',
              rowGap: 3,
              columnGap: 2,
              gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
            }}
          >
            <TextField
              fullWidth
              label="Prénom"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              disabled={loading}
            />
            
            <TextField
              fullWidth
              label="Nom"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              disabled={loading}
            />
            
            <TextField
              fullWidth
              label="Email"
              value={currentUser.email || ''}
              disabled
              helperText="L'email ne peut pas être modifié"
              sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}
            />
          </Box>
          
          <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>
            <Button 
              type="submit" 
              variant="contained" 
              onClick={handleUpdateProfil}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <Iconify icon="eva:people-fill" />}
            >
              {loading ? 'Mise à jour...' : 'Mettre à jour mon profil'}
            </Button>
          </Stack>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader 
          title="Compte et sécurité" 
          sx={{ 
            bgcolor: alpha(theme.palette.primary.main, 0.08),
          }} 
        />
        
        <CardContent>
          <Box
            sx={{
              display: 'grid',
              rowGap: 3,
              columnGap: 2,
              gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(1, 1fr)' },
            }}
          >
            <TextField
              disabled
              fullWidth
              label="Identifiant"
              value={currentUser.uid || ''}
              helperText="L'identifiant de votre compte est géré automatiquement"
            />
            
            <Button 
              variant="outlined" 
              color="warning"
              startIcon={<Iconify icon="eva:refresh-fill" />}
              sx={{ justifyContent: 'flex-start' }}
            >
              Changer mon mot de passe
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
