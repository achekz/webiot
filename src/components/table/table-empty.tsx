// Composant pour afficher un message lorsqu'une table est vide
// Utilisé dans Smart Salle pour indiquer l'absence de données

import { styled } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';

// ----------------------------------------------------------------------

const StyledBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(5),
  width: '100%',
  color: theme.palette.text.secondary,
}));

// ----------------------------------------------------------------------

interface TableEmptyProps {
  message?: string;
}

export default function TableEmpty({ message = "Aucune donnée disponible" }: TableEmptyProps) {
  return (
    <tr>
      <td colSpan={12}>
        <StyledBox>
          <Typography variant="subtitle1" gutterBottom>
            {message}
          </Typography>
          <Typography variant="body2">
            Aucun élément trouvé pour le moment.
          </Typography>
        </StyledBox>
      </td>
    </tr>
  );
}
