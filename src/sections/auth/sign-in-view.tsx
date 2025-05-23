import type { FormEvent } from 'react';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';

import { useAuth } from 'src/context/AuthContext';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function SignInView() {
  const router = useRouter();
  const { connexion, error: authError } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState({
    email: '',
    password: ''
  });

  const validateForm = () => {
    let isValid = true;
    const errors = {
      email: '',
      password: ''
    };

    if (!email) {
      errors.email = 'Veuillez saisir votre adresse email';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Adresse email invalide';
      isValid = false;
    }

    if (!password) {
      errors.password = 'Veuillez saisir votre mot de passe';
      isValid = false;
    } else if (password.length < 6) {
      errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const result = await connexion(email, password);
      if (result.utilisateur) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderForm = (
    <Box
      component="form"
      onSubmit={handleSignIn}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
      }}
    >
      {authError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {authError}
        </Alert>
      )}

      <TextField
        fullWidth
        name="email"
        label="Adresse email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={!!formErrors.email}
        helperText={formErrors.email}
        sx={{ mb: 3 }}
        disabled={loading}
        inputProps={{
          autocomplete: 'username',
        }}
      />

      <TextField
        fullWidth
        name="password"
        label="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={!!formErrors.password}
        helperText={formErrors.password}
        type={showPassword ? 'text' : 'password'}
        disabled={loading}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton 
                onClick={() => setShowPassword(!showPassword)} 
                edge="end"
                disabled={loading}
              >
                <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
        inputProps={{
          autocomplete: 'current-password',
        }}
      />

      <Link href="/reset-password" variant="body2" color="inherit" sx={{ mb: 3, alignSelf: 'flex-end' }}>
        Mot de passe oublié ?
      </Link>

      <Button
        fullWidth
        size="large"
        type="submit"
        color="primary"
        variant="contained"
        disabled={loading}
        sx={{ 
          py: 1.2,
          fontSize: '1rem',
          boxShadow: 2,
          '&:hover': {
            boxShadow: 4,
          }
        }}
      >
        {loading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          'Se connecter'
        )}
      </Button>
    </Box>
  );

  return (
    <Card sx={{ maxWidth: 480, mx: 'auto', boxShadow: 10, borderRadius: 2 }}>
      <CardContent sx={{ p: 4 }}>
        <Box
          sx={{
            gap: 1.5,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <Iconify icon="mdi:desk-classroom" width={40} height={40} sx={{ color: 'primary.main', mr: 1 }} />
            <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
              Smart Salle
            </Typography>
          </Box>
          
          <Typography variant="h5" gutterBottom>Connexion</Typography>
          
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              textAlign: 'center',
            }}
          >
            Bienvenue sur l&apos;application de gestion intelligente des salles de cours.
          </Typography>
        </Box>
        
        {renderForm}
        
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Vous n&apos;avez pas de compte ?
            <Link href="/register" variant="subtitle2" sx={{ ml: 0.5 }}>
              Créer un compte
            </Link>
          </Typography>
        </Box>
        
        <Divider sx={{ my: 3, '&::before, &::after': { borderTopStyle: 'dashed' } }}>
          <Typography
            variant="overline"
            sx={{ color: 'text.secondary', fontWeight: 'fontWeightMedium' }}
          >
            INFORMATION
          </Typography>
        </Divider>
        
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Contrôlez les équipements et surveillez les conditions environnementales des salles en temps réel
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
            © 2025 Faculté des Sciences - Projet Académique
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
