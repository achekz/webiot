import React from 'react';

// components
import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} />;

export type NavItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
  info?: React.ReactNode;
};

export const navData = [
  {
    title: 'Tableau de bord',
    path: '/dashboard',
    icon: icon('ic-analytics'),
  },
  {
    title: 'Contrôle des salles',
    path: '/controle-salle',
    icon: icon('ic-cart'), // À remplacer par une icône plus adaptée si disponible
  },
  {
    title: 'Statistiques',
    path: '/statistiques',
    icon: icon('ic-analytics'),
  },
  {
    title: 'Gestion des utilisateurs',
    path: '/admin-utilisateurs',
    icon: icon('ic-user'),
  },
];
