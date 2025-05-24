import { FormEvent, useEffect, useState } from 'react';

import { Visibility, VisibilityOff, School } from '@mui/icons-material';
import {
  Box,
  Card,
  Link,
  Alert,
  Button,
  Divider,
  TextField,
  IconButton,
  Typography,
  CardContent,
  InputAdornment,
  CircularProgress,
  FormControlLabel,
  Checkbox,
} from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import { useAuth } from 'src/context/AuthContext';

// Regular expression for email validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SignInView() {
  const router = useRouter();
  const { connexion, error: authError } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [formErrors, setFormErrors] = useState({
    email: '',
    password: '',
  });

  // Load saved email from localStorage on mount if "Remember me" was checked
  useEffect(() => {
    const savedEmail = localStorage.getItem('email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // Persist email if "Remember me" is checked
  useEffect(() => {
    if (rememberMe) {
      localStorage.setItem('email', email);
    } else {
      localStorage.removeItem('email');
    }
  }, [email, rememberMe]);

  const validateForm = () => {
    let isValid = true;
    const errors = { email: '', password: '' };

    if (!email) {
      errors.email = 'L&apos;adresse email est requise';
      isValid = false;
    } else if (!EMAIL_REGEX.test(email)) {
      errors.email = 'Veuillez saisir une adresse email valide';
      isValid = false;
    }

    if (!password) {
      errors.password = 'Le mot de passe est requis';
      isValid = false;
    } else if (password.length < 8) {
      errors.password = 'Le mot de passe doit contenir au moins 8 caractères';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSignIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await connexion(email, password);
      if (result.utilisateur) {
        if (!rememberMe) {
          localStorage.removeItem('email');
        }
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setFormErrors({
        email: '',
        password: 'Échec de la connexion. Vérifiez vos identifiants.',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderForm = (
    <Box
      component="form"
      onSubmit={handleSignIn}
      role="form"
      sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 3 }}
    >
      {authError && <Alert severity="error">{authError}</Alert>}

      <TextField
        fullWidth
        name="email"
        label="Adresse email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={!!formErrors.email}
        helperText={formErrors.email}
        disabled={loading}
        autoFocus
        inputProps={{ autoComplete: 'username', 'aria-label': 'Adresse email' }}
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
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        inputProps={{ autoComplete: 'current-password', 'aria-label': 'Mot de passe' }}
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            color="primary"
          />
        }
        label="Se souvenir de moi"
      />

      <Link
        href="/reset-password"
        variant="body2"
        color="inherit"
        sx={{ alignSelf: 'flex-end', transition: 'color 0.2s' }}
        underline="hover"
      >
        Mot de passe oublié ?
      </Link>

      <Button
        fullWidth
        size="large"
        type="submit"
        color="primary"
        variant="contained"
        disabled={loading || !!formErrors.email || !!formErrors.password}
        sx={{
          py: 1.5,
          fontSize: '1rem',
          fontWeight: 'bold',
          boxShadow: 3,
          transition: 'all 0.3s',
          '&:hover': { boxShadow: 6, transform: 'translateY(-2px)' },
        }}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Se connecter'}
      </Button>
    </Box>
  );

  return (
      <Card sx={{ maxWidth: 480, width: '100%', boxShadow: { xs: 8, md: 12 }, borderRadius: 3, overflow: 'hidden' }}>
        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
          <Box sx={{ gap: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 5 }}>
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <School sx={{ fontSize: 48, color: 'primary.main', mr: 1.5 }} />
              <Typography variant="h3" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                Smart Salle
              </Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 'medium' }}>
              Connexion
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', maxWidth: 360 }}>
              Bienvenue sur l&apos;application de gestion intelligente des salles de cours.
            </Typography>
          </Box>

          {renderForm}


          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
              © 2025 Faculté des Sciences - Projet Académique
            </Typography>
          </Box>
        </CardContent>
      </Card>
  )
}