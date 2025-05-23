import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';

// Import Iconify component
import { Iconify } from 'src/components/iconify';

import AdminSection from 'src/sections/dashboard/admin-section';

import { AnalyticsTasks } from '../analytics-tasks';
import { AnalyticsCurrentVisits } from '../analytics-current-visits';
import { AnalyticsOrderTimeline } from '../analytics-order-timeline';
import { AnalyticsWebsiteVisits } from '../analytics-website-visits';
import { AnalyticsWidgetSummary } from '../analytics-widget-summary';
import { AnalyticsTrafficBySite } from '../analytics-traffic-by-site';
import { AnalyticsCurrentSubject } from '../analytics-current-subject';
import { AnalyticsConversionRates } from '../analytics-conversion-rates';

// ----------------------------------------------------------------------

export function OverviewAnalyticsView() {
  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 3 } }}>
        Bienvenue sur Smart Salle 🏫
      </Typography>

      {/* Section d'administration - visible uniquement par les administrateurs */}
      <AdminSection />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Nombre de salles"
            percent={5.2}
            total={12}
            icon={<Iconify icon="custom:menu-duotone" width={32} />}
            chart={{
              categories: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Fev', 'Mar', 'Avr'],
              series: [8, 9, 9, 10, 10, 11, 12, 12],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Utilisateurs actifs"
            percent={8.2}
            total={24}
            color="secondary"
            icon={<Iconify icon="eva:people-fill" width={32} />}
            chart={{
              categories: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Fev', 'Mar', 'Avr'],
              series: [15, 18, 18, 19, 20, 22, 22, 24],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Capteurs en ligne"
            percent={1.8}
            total={36}
            color="warning"
            icon={<Iconify icon="solar:settings-bold-duotone" width={32} />}
            chart={{
              categories: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Fev', 'Mar', 'Avr'],
              series: [30, 30, 32, 32, 34, 35, 35, 36],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Alertes"
            percent={-65.2}
            total={3}
            color="error"
            icon={<Iconify icon="eva:alert-triangle-fill" width={32} />}
            chart={{
              categories: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Fev', 'Mar', 'Avr'],
              series: [8, 9, 7, 5, 4, 3, 3, 3],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <AnalyticsCurrentVisits
            title="Types de salles équipées"
            chart={{
              series: [
                { label: 'Amphithéâtres', value: 4 },
                { label: 'Salles TP', value: 5 },
                { label: 'Salles TD', value: 2 },
                { label: 'Labos', value: 1 },
              ],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 8 }}>
          <AnalyticsWebsiteVisits
            title="Statistiques environnementales"
            subheader="(Moyennes mensuelles)"
            chart={{
              categories: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Fev', 'Mar', 'Avr', 'Mai'],
              series: [
                { name: 'Température (°C)', data: [23, 21, 19, 17, 16, 17, 19, 21, 22] },
                { name: 'Humidité (%)', data: [51, 55, 60, 62, 60, 58, 55, 52, 50] },
              ],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 8 }}>
          <AnalyticsConversionRates
            title="Qualité de l'air par bâtiment (ppm)"
            subheader="(Moyenne sur 30 jours)"
            chart={{
              categories: ['Bâtiment A', 'Bâtiment B', 'Bâtiment C', 'Bâtiment D', 'Bâtiment E'],
              series: [
                { name: 'Matin', data: [441, 389, 401, 472, 392] },
                { name: 'Après-midi', data: [531, 421, 435, 521, 431] },
              ],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <AnalyticsCurrentSubject
            title="Équipements des salles"
            chart={{
              categories: ['Climatiseur', 'Projecteur', 'WiFi', 'Ordinateurs', 'Capteurs', 'Audio'],
              series: [
                { name: 'Installés', data: [80, 90, 100, 75, 100, 60] },
                { name: 'Fonctionnels', data: [75, 85, 95, 70, 95, 55] },
                { name: 'Utilisés', data: [60, 80, 90, 65, 90, 50] },
              ],
            }}
          />
        </Grid>



        <Grid size={{ xs: 12, md: 6, lg: 6 }}>
          <AnalyticsOrderTimeline 
            title="Historique des événements récents" 
            list={[
              {
                id: 'timeline_1',
                title: 'Maintenance des capteurs Bâtiment C',
                type: 'order1',
                time: new Date('2025-05-20T09:30:00').getTime(),
              },
              {
                id: 'timeline_2',
                title: 'Alerte température Salle 102',
                type: 'order2',
                time: new Date('2025-05-19T14:15:00').getTime(),
              },
              {
                id: 'timeline_3',
                title: 'Mise à jour du firmware des capteurs',
                type: 'order3',
                time: new Date('2025-05-18T11:00:00').getTime(),
              },
              {
                id: 'timeline_4',
                title: 'Calibration des capteurs de CO2',
                type: 'order4',
                time: new Date('2025-05-17T10:30:00').getTime(),
              },
              {
                id: 'timeline_5',
                title: 'Installation de nouveaux équipements Salle 204',
                type: 'order5',
                time: new Date('2025-05-16T15:45:00').getTime(),
              },
            ]}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 6 }}>
          <AnalyticsTrafficBySite 
            title="Salles les plus utilisées" 
            list={[
              {
                label: 'Amphi A',
                value: 'amphi',
                total: 324,
              },
              {
                label: 'Salle TP 101',
                value: 'tp',
                total: 276,
              },
              {
                label: 'Salle 203',
                value: 'td',
                total: 212,
              },
              {
                label: 'Amphi B',
                value: 'labo',
                total: 175,
              },
            ]}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <AnalyticsTasks 
            title="Tâches de maintenance" 
            list={[
              { id: '1', name: 'Vérification des capteurs du bâtiment A' },
              { id: '2', name: 'Maintenance des climatiseurs Amphi B' },
              { id: '3', name: 'Installation des nouveaux capteurs CO2' },
              { id: '4', name: 'Mise à jour logicielle des contrôleurs' },
              { id: '5', name: 'Formation des utilisateurs - Salle 204' },
              { id: '6', name: 'Calibration des capteurs d\'humidité' },
              { id: '7', name: 'Réparation du vidéoprojecteur Salle 305' },
            ]}
          />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
