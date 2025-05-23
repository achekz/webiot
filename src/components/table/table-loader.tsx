// Composant d'indicateur de chargement pour les tableaux
// Utilisé dans Smart Salle pour montrer que les données sont en cours de chargement

import { Box, Skeleton, TableRow, TableCell } from '@mui/material';

// ----------------------------------------------------------------------

interface TableLoaderProps {
  count?: number;
  columns?: number;
}

export default function TableLoader({ count = 5, columns = 5 }: TableLoaderProps) {
  // Création d'un tableau d'éléments pour simuler les lignes en chargement
  const rows = [...Array(count)].map((_, index) => index);
  const cells = [...Array(columns)].map((_, index) => index);

  return (
    <>
      {rows.map((row) => (
        <TableRow key={`loader-row-${row}`}>
          {cells.map((cell) => (
            <TableCell key={`loader-cell-${row}-${cell}`}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {cell === 0 && (
                  <Skeleton
                    variant="circular"
                    width={40}
                    height={40}
                    sx={{ mr: 2, flexShrink: 0 }}
                  />
                )}
                <Skeleton 
                  variant="text" 
                  width={cell === 0 ? '50%' : cell === columns - 1 ? '20%' : '80%'} 
                  height={20} 
                />
              </Box>
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
