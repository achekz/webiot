/**
 * Utils de base pour Smart Salle
 * Ce fichier contient des utilitaires partagés pour le projet
 */

// Hooks partagés
export const useBoolean = (defaultValue = false) => {
  const [value, setValue] = React.useState(defaultValue);
  
  const onTrue = React.useCallback(() => setValue(true), []);
  const onFalse = React.useCallback(() => setValue(false), []);
  const onToggle = React.useCallback(() => setValue(prev => !prev), []);
  
  return { value, onTrue, onFalse, onToggle, setValue };
};

export const usePopover = () => {
  const [open, setOpen] = React.useState(false);
  const [position, setPosition] = React.useState<{ top: number; left: number }>({ top: 0, left: 0 });
  
  const onOpen = React.useCallback((event: React.MouseEvent<HTMLElement>) => {
    setPosition({ top: event.clientY, left: event.clientX });
    setOpen(true);
  }, []);
  
  const onClose = React.useCallback(() => {
    setOpen(false);
  }, []);
  
  return { open, onOpen, onClose, position };
};

export const useScrollOffsetTop = (offset: number) => {
  const [scrolled, setScrolled] = React.useState(false);
  
  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > offset);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [offset]);
  
  return scrolled;
};

export const useIsClient = () => {
  const [isClient, setIsClient] = React.useState(false);
  
  React.useEffect(() => {
    setIsClient(true);
  }, []);
  
  return isClient;
};

// Utilitaires de style
export const varAlpha = (color: string, opacity: number) => {
  if (!color) return '';
  if (color.includes('rgba')) return color;
  if (color.includes('rgb')) {
    const start = color.indexOf('(');
    const end = color.indexOf(')');
    const rgb = color.substring(start + 1, end);
    return `rgba(${rgb}, ${opacity})`;
  }
  if (color.includes('#')) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
};

export const mergeClasses = (...classes: any[]): string => classes.filter(Boolean).join(' ');

export const pxToRem = (value: number): string => `${value / 16}rem`;

export const setFont = (fontFamily: string, weight: number = 400): string => `${weight} ${pxToRem(16)} "${fontFamily}"`;

/**
 * Crée une chaîne de canaux RVB à partir d'une couleur
 * Accepte soit une chaîne hexadécimale soit un objet palette
 */
export const createPaletteChannel = (color: any): string => {
  // Si c'est un objet avec une propriété main (palette MUI)
  if (typeof color === 'object' && color !== null && color.main) {
    return createPaletteChannel(color.main);
  }
  
  // Si c'est une chaîne hexadécimale
  if (typeof color === 'string' && color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `${r} ${g} ${b}`;
  }
  
  // Cas par défaut - renvoyer une chaîne vide ou une valeur par défaut
  console.warn('Format de couleur non pris en charge dans createPaletteChannel:', color);
  return '0 0 0';
};

import React from 'react';
