import type { IconButtonProps } from '@mui/material/IconButton';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';

import { fToNow } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

type NotificationItemProps = {
  id: string;
  type: string;
  title: string;
  isUnRead: boolean;
  description: string;
  avatarUrl: string | null;
  postedAt: string | number | null;
};

export type NotificationsPopoverProps = IconButtonProps & {
  data?: NotificationItemProps[];
};

export function NotificationsPopover({ data = [], sx, ...other }: NotificationsPopoverProps) {
  const [notifications, setNotifications] = useState(data.length > 0 ? data : [
    {
      id: '1',
      type: 'maintenance',
      title: 'Demande d\'intervention',
      description: 'Teresa Luettgen a signalé un problème de température dans l\'Amphi B',
      isUnRead: true,
      avatarUrl: null,
      postedAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    },
    {
      id: '2',
      type: 'alerte-temperature',
      title: 'Température critique',
      description: 'Amphi A dépasse 30°C - Climatisation mise en marche automatiquement',
      isUnRead: true,
      avatarUrl: null,
      postedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
    {
      id: '3',
      type: 'maintenance',
      title: 'Maintenance programmée',
      description: 'Intervention sur le système de climatisation en Salle TP6 demain à 8h',
      isUnRead: true,
      avatarUrl: null,
      postedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: '4',
      type: 'occupation',
      title: 'Réservation annulée',
      description: 'La salle TD4 est libre entre 14h et 16h aujourd\'hui',
      isUnRead: false,
      avatarUrl: null,
      postedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    },
    {
      id: '5',
      type: 'equipement',
      title: 'Vidéoprojecteur réparé',
      description: 'L\'intervention sur le vidéoprojecteur de l\'Amphi B est terminée',
      isUnRead: false,
      avatarUrl: null,
      postedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    },
    {
      id: '6',
      type: 'consommation',
      title: 'Qualité de l\'air',
      description: 'Le niveau de CO2 a dépassé 1000 ppm dans le Labo 3 - Ventilation intensifiée',
      isUnRead: false,
      avatarUrl: null,
      postedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    },
    {
      id: '7',
      type: 'consommation',
      title: 'Optimisation énergétique',
      description: 'L\'éclairage et la climatisation éteints automatiquement dans les salles inoccupées',
      isUnRead: false,
      avatarUrl: null,
      postedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    },
  ]);

  const totalUnRead = notifications.filter((item) => item.isUnRead === true).length;

  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const handleMarkAllAsRead = useCallback(() => {
    const updatedNotifications = notifications.map((notification) => ({
      ...notification,
      isUnRead: false,
    }));

    setNotifications(updatedNotifications);
  }, [notifications]);

  return (
    <>
      <IconButton
        color={openPopover || totalUnRead > 0 ? 'primary' : 'default'}
        onClick={handleOpenPopover}
        sx={{
          animation: totalUnRead > 0 && !openPopover ? 'pulse 1.5s infinite' : 'none',
          '@keyframes pulse': {
            '0%': { transform: 'scale(1)' },
            '50%': { transform: 'scale(1.1)' },
            '100%': { transform: 'scale(1)' }
          },
          ...sx
        }}
        {...other}
      >
        <Badge badgeContent={totalUnRead} color="error">
          <Iconify 
            width={24} 
            icon={totalUnRead > 0 ? "mdi:bell-ring" : "solar:bell-bing-bold-duotone"} 
            sx={{ color: totalUnRead > 0 ? 'primary.main' : 'inherit' }}
          />
        </Badge>
      </IconButton>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              width: 360,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            },
          },
        }}
      >
        <Box
          sx={{
            py: 2,
            pl: 2.5,
            pr: 1.5,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1">Notifications</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Vous avez {totalUnRead} message{totalUnRead > 1 ? 's' : ''} non lu{totalUnRead > 1 ? 's' : ''}
            </Typography>
          </Box>

          {totalUnRead > 0 && (
            <Tooltip title="Tout marquer comme lu">
              <IconButton color="primary" onClick={handleMarkAllAsRead}>
                <Iconify icon="eva:done-all-fill" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Scrollbar fillContent sx={{ minHeight: 240, maxHeight: { xs: 360, sm: 'none' } }}>
          <List
            disablePadding
            subheader={
              <ListSubheader disableSticky sx={{ py: 1, px: 2.5, typography: 'overline' }}>
                Nouveau
              </ListSubheader>
            }
          >
            {notifications.slice(0, 2).map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </List>

          <List
            disablePadding
            subheader={
              <ListSubheader disableSticky sx={{ py: 1, px: 2.5, typography: 'overline' }}>
                Précédent
              </ListSubheader>
            }
          >
            {notifications.slice(2, 5).map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </List>
        </Scrollbar>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Box sx={{ p: 1 }}>
          <Button fullWidth disableRipple color="inherit">
            Voir tout
          </Button>
        </Box>
      </Popover>
    </>
  );
}

// ----------------------------------------------------------------------

function NotificationItem({ notification }: { notification: NotificationItemProps }) {
  const { avatarUrl, title } = renderContent(notification);

  return (
    <ListItemButton
      sx={{
        py: 1.5,
        px: 2.5,
        mt: '1px',
        ...(notification.isUnRead && {
          bgcolor: 'action.selected',
        }),
      }}
    >
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: 'background.neutral' }}>{avatarUrl}</Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={title}
        secondary={
          <Typography
            variant="caption"
            sx={{
              mt: 0.5,
              gap: 0.5,
              display: 'flex',
              alignItems: 'center',
              color: 'text.disabled',
            }}
          >
            <Iconify width={14} icon="solar:clock-circle-outline" />
            {fToNow(notification.postedAt)}
          </Typography>
        }
      />
    </ListItemButton>
  );
}

// ----------------------------------------------------------------------

function renderContent(notification: NotificationItemProps) {
  const title = (
    <Typography variant="subtitle2">
      {notification.title}
      <Typography component="span" variant="body2" sx={{ color: 'text.secondary' }}>
        &nbsp; {notification.description}
      </Typography>
    </Typography>
  );

  if (notification.type === 'alerte-temperature') {
    return {
      avatarUrl: (
        <Iconify icon="mdi:thermometer-alert" width={24} sx={{ color: 'error.main' }} />
      ),
      title,
    };
  }
  if (notification.type === 'maintenance') {
    return {
      avatarUrl: (
        <Iconify icon="mdi:tools" width={24} sx={{ color: 'info.main' }} />
      ),
      title,
    };
  }
  if (notification.type === 'occupation') {
    return {
      avatarUrl: (
        <Iconify icon="mdi:door-open" width={24} sx={{ color: 'success.main' }} />
      ),
      title,
    };
  }
  if (notification.type === 'equipement') {
    return {
      avatarUrl: (
        <Iconify icon="mdi:projector" width={24} sx={{ color: 'warning.main' }} />
      ),
      title,
    };
  }
  if (notification.type === 'consommation') {
    return {
      avatarUrl: (
        <Iconify icon="mdi:lightbulb-on" width={24} sx={{ color: 'success.main' }} />
      ),
      title,
    };
  }
  return {
    avatarUrl: notification.avatarUrl ? (
      <img alt={notification.title} src={notification.avatarUrl} />
    ) : null,
    title,
  };
}
