import type { Theme } from '@mui/material/styles';

// ----------------------------------------------------------------------
/**
 * Variables CSS pour le layout principal de l'application Smart Salle
 * Définit les dimensions, espacements et transitions utilisés dans le layout
 */
export function mainLayoutVars(theme: Theme) {
  return {
    '--layout-transition-easing': 'linear',
    '--layout-transition-duration': '120ms',
    '--layout-nav-vertical-width': '300px',
    '--layout-main-content-pt': theme.spacing(1),
    '--layout-main-content-pb': theme.spacing(8),
    '--layout-main-content-px': theme.spacing(5),
  };
}
