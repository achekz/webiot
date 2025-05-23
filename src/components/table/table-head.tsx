// Composant d'en-tête de table réutilisable pour Smart Salle
// Utilisé dans les différentes listes et tableaux de l'application

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

interface LabelItem {
  id: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  width?: number;
  minWidth?: number;
}

interface CustomTableHeadProps {
  headLabel: LabelItem[];
  rowCount?: number;
  numSelected?: number;
  onSelectAllRows?: (checked: boolean) => void;
  sx?: object;
}

export default function CustomTableHead({
  headLabel,
  rowCount = 0,
  numSelected = 0,
  onSelectAllRows,
  sx,
}: CustomTableHeadProps) {
  return (
    <TableHead sx={sx}>
      <TableRow>
        {headLabel.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align || 'left'}
            sx={{
              width: headCell.width,
              minWidth: headCell.minWidth,
              fontWeight: 'bold',
            }}
          >
            <Typography variant="subtitle2">{headCell.label}</Typography>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}
