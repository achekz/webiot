// Composant de menu pour les actions dans les tableaux
// Utilisé dans Smart Salle pour permettre des actions supplémentaires sur les lignes

import type { MouseEvent } from 'react';

import { useState } from 'react';

import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

interface MenuAction {
  label: string;
  icon: React.ComponentProps<typeof Iconify>['icon']; 
  color?: 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  onClick: () => void;
}

interface TableMenuProps {
  actions: MenuAction[];
}

export default function TableMenu({ actions }: TableMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action: () => void) => {
    action();
    handleClose();
  };

  return (
    <>
      <IconButton
        aria-controls={open ? "table-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        size="small"
      >
        <Iconify icon="eva:more-vertical-fill" width={20} />
      </IconButton>

      <Menu
        id="table-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: { width: 200, maxWidth: '100%' },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {actions.map((action, index) => (
          <MenuItem 
            key={`menu-action-${index}`}
            onClick={() => handleAction(action.onClick)}
            sx={{ 
              color: action.color ? `${action.color}.main` : 'inherit',
            }}
          >
            <ListItemIcon>
              <Iconify 
                icon={action.icon} 
                width={20} 
                sx={{ 
                  color: action.color ? `${action.color}.main` : 'inherit',
                }} 
              />
            </ListItemIcon>
            <ListItemText>{action.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
