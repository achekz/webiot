import type { StackProps } from '@mui/material/Stack';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

/**
 * Composant d'aide pour le projet Smart Salle
 * Affiche des informations et ressources utiles pour le projet
 */
export function NavHelp({ sx, ...other }: StackProps) {
  return (
    <Box
      sx={[
        {
          mb: 4,
          display: 'flex',
          textAlign: 'center',
          alignItems: 'center',
          flexDirection: 'column',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Typography
        variant="h6"
        sx={[
          (theme) => ({
            background: `linear-gradient(to right, ${theme.vars.palette.primary.main}, ${theme.vars.palette.info.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textFillColor: 'transparent',
            color: 'transparent',
          }),
        ]}
      >
        Ressources
      </Typography>

      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
        Documentation technique
      </Typography>

      <Box
        component="img"
        alt="Smart Salle illustration"
        src="/assets/illustrations/illustration-dashboard.webp"
        sx={{ width: 200, my: 2 }}
      />

      <Button
        onClick={() => window.open('/docs/manuel-utilisateur.pdf', '_blank')}
        variant="contained"
        color="primary"
      >
        Manuel utilisateur
      </Button>
    </Box>
  );
}
