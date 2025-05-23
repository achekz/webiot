import type { PaletteColor, ColorSystemOptions, PaletteColorChannel } from '@mui/material/styles';

import { varAlpha, createPaletteChannel } from 'src/utils/shared-utils';

import { themeConfig } from '../theme-config';

import type { ThemeColorScheme } from '../types';

// ----------------------------------------------------------------------

/**
 * TypeScript (type definition and extension)
 * @to {@link file://./../extend-theme-types.d.ts}
 */

// Keys for the palette colors
export type PaletteColorKey = 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';

// Palette color without additional channels
export type PaletteColorNoChannels = Omit<PaletteColor, 'lighterChannel' | 'darkerChannel'>;

// Palette color with additional channels
export type PaletteColorWithChannels = PaletteColor & PaletteColorChannel;

// Extended common colors
export type CommonColorsExtend = {
  whiteChannel: string;
  blackChannel: string;
};

// Extended text colors
export type TypeTextExtend = {
  disabledChannel: string;
};

// Extended background colors
export type TypeBackgroundExtend = {
  neutral: string;
  neutralChannel: string;
};

// Extended palette colors
export type PaletteColorExtend = {
  lighter: string;
  darker: string;
  lighterChannel: string;
  darkerChannel: string;
};

// Extended grey channels
export type GreyExtend = {
  '50Channel': string;
  '100Channel': string;
  '200Channel': string;
  '300Channel': string;
  '400Channel': string;
  '500Channel': string;
  '600Channel': string;
  '700Channel': string;
  '800Channel': string;
  '900Channel': string;
};

// ----------------------------------------------------------------------

/**
 * Définition des couleurs principales pour le thème Smart Salle
 * Ces couleurs proviennent directement de la configuration du thème
 */

// Couleurs principales 
export const primary = themeConfig.palette.primary;

// Couleurs secondaires
export const secondary = themeConfig.palette.secondary;

// Couleurs d'information
export const info = themeConfig.palette.info;

// Couleurs de succès
export const success = themeConfig.palette.success;

// Couleurs d'avertissement
export const warning = themeConfig.palette.warning;

// Couleurs d'erreur
export const error = themeConfig.palette.error;

// Common color
// Utilisation directe de common plutôt que de passer par createPaletteChannel
export const common = { ...themeConfig.palette.common };

// Grey color
// Utilisation directe de grey plutôt que de passer par createPaletteChannel
export const grey = { ...themeConfig.palette.grey };

// Text color
export const text = {
  // Création directe des valeurs sans passer par createPaletteChannel
  primary: grey[800],
  secondary: grey[600],
  disabled: grey[500],
};

// Background color
export const background = {
  // Création directe des valeurs sans passer par createPaletteChannel
  paper: '#FFFFFF',
  default: grey[100],
  neutral: grey[200],
};

// Ajout de la propriété 500Channel pour le type grey
// Cette propriété est utilisée par le thème pour les effets de transparence
export const greyChannel = {
  ...grey,
  '500Channel': createPaletteChannel(grey[500]),
};

// Base action color
export const baseAction = {
  hover: varAlpha(greyChannel['500Channel'], 0.08),
  selected: varAlpha(greyChannel['500Channel'], 0.16),
  focus: varAlpha(greyChannel['500Channel'], 0.24),
  disabled: varAlpha(greyChannel['500Channel'], 0.8),
  disabledBackground: varAlpha(greyChannel['500Channel'], 0.24),
  hoverOpacity: 0.08,
  disabledOpacity: 0.48,
};

// Action color
export const action = {
  active: grey[600],
  ...baseAction,
};

// ----------------------------------------------------------------------

// Base palette
export const basePalette = {
  primary,
  secondary,
  info,
  success,
  warning,
  error,
  common,
  grey,
  divider: varAlpha(greyChannel['500Channel'], 0.2),
};

/**
 * Définition de la palette de couleurs pour le thème Smart Salle
 * Adaptée pour le projet académique avec des commentaires pédagogiques
 */
export const palette: Partial<Record<ThemeColorScheme, ColorSystemOptions['palette']>> = {
  // Configuration pour le thème clair
  light: {
    // Couleurs de base (primaire, secondaire, etc.)
    ...basePalette,
    // Couleurs de texte 
    text,
    // Couleurs d'arrière-plan
    background,
    // Couleurs pour les actions (hover, focus, etc.)
    action,
  },
};
