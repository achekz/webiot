// Composant pour afficher un message d'erreur dans un tableau
// Utilisé dans Smart Salle pour notifier les problèmes de chargement des données

import { styled } from '@mui/material/styles';
import { Box, Button, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const StyledBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(5),
  width: '100%',
  color: theme.palette.error.main,
}));

// ----------------------------------------------------------------------

interface TableErrorProps {
  message?: string;
  onRetry?: () => void;
}

export default function TableError({ 
  message = "Une erreur est survenue lors du chargement des données", 
  onRetry 
}: TableErrorProps) {
  return (
    <tr>
      <td colSpan={12}>
        <StyledBox>
          <Iconify 
            icon="eva:alert-triangle-fill" 
            width={48} 
            height={48} 
            sx={{ mb: 2, color: 'error.main' }} 
          />
          
          <Typography variant="subtitle1" gutterBottom>
            {message}
          </Typography>
          
          {onRetry && (
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={onRetry}
              startIcon={<Iconify icon="eva:refresh-fill" />}
              sx={{ mt: 2 }}
            >
              Réessayer
            </Button>
          )}
        </StyledBox>
      </td>
    </tr>
  );
}
