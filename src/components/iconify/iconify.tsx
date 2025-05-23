import type { IconProps } from '@iconify/react';

import { useId } from 'react';
import { Icon } from '@iconify/react';

import { styled } from '@mui/material/styles';

import { mergeClasses } from 'src/utils/shared-utils';

import { iconifyClasses } from './classes';
import { allIconNames, registerIcons } from './register-icons';

import type { IconifyName } from './register-icons';

// ----------------------------------------------------------------------

export type IconifyProps = React.ComponentProps<typeof IconRoot> &
  Omit<IconProps, 'icon'> & {
    icon: IconifyName;
  };

export function Iconify({ className, icon, width = 20, height, sx, ...other }: IconifyProps) {
  const id = useId();

  if (!allIconNames.includes(icon)) {
    console.warn(
      [
        `Icon "${icon}" is currently loaded online, which may cause flickering effects.`,
        `Pour garantir une expérience utilisateur optimale, il est recommandé d'enregistrer cette icône en local.`,
        `Voir documentation React Iconify pour plus d'informations.`,
      ].join('\n')
    );
  }

  registerIcons();

  return (
    <IconRoot
      ssr
      id={id}
      icon={icon}
      className={mergeClasses([iconifyClasses.root, className])}
      sx={[
        {
          width,
          flexShrink: 0,
          height: height ?? width,
          display: 'inline-flex',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    />
  );
}

// ----------------------------------------------------------------------

const IconRoot = styled(Icon)``;
