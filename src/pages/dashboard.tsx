import { CONFIG } from 'src/config-global';

import { OverviewAnalyticsView as DashboardView } from 'src/sections/overview/view';

// ----------------------------------------------------------------------
// Page d'accueil de l'application Smart Salle
// Affiche une vue d'ensemble des salles et des alertes

export default function Page() {
  return (
    <>
      <title>{`Tableau de bord - ${CONFIG.appName}`}</title>
      <meta
        name="description"
        content="Smart Salle - Application de gestion des salles pour la faculté. Contrôle des équipements et monitoring environnemental."
      />
      <meta name="keywords" content="smart salle,faculté,salles,capteurs,température,humidité,climatiseur,vidéoprojecteur" />

      <DashboardView />
    </>
  );
}
