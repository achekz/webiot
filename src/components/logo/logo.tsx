import type { LinkProps } from '@mui/material/Link';

import { useId } from 'react';

import Link from '@mui/material/Link';
import { styled, useTheme } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';

import { mergeClasses } from 'src/utils/shared-utils';

import { logoClasses } from './classes';

// ----------------------------------------------------------------------

export type LogoProps = LinkProps & {
  isSingle?: boolean;
  disabled?: boolean;
};

export function Logo({
  sx,
  disabled,
  className,
  href = '/',
  isSingle = true,
  ...other
}: LogoProps) {
  const theme = useTheme();

  const gradientId = useId();

  const TEXT_PRIMARY = theme.vars.palette.text.primary;
  const PRIMARY_LIGHT = theme.vars.palette.primary.light;
  const PRIMARY_MAIN = theme.vars.palette.primary.main;
  const PRIMARY_DARKER = theme.vars.palette.primary.dark;

  const singleLogo = (
    <img
      src="/assets/images/logo_smart_salle.svg"
      alt="Smart Salle Logo"
      width="100%"
      height="100%"
      style={{ filter: 'invert(23%) sepia(90%) saturate(1600%) hue-rotate(210deg) brightness(95%) contrast(95%)' }}
    />
  );

  const fullLogo = (
    <img
      src="/assets/images/logo_smart_salle.svg"
      alt="Smart Salle Logo"
      width="100%"
      height="100%"
      style={{ filter: 'invert(23%) sepia(90%) saturate(1600%) hue-rotate(210deg) brightness(95%) contrast(95%)' }}
    />
  );

  return (
    <LogoRoot
      component={RouterLink}
      href={href}
      aria-label="Logo"
      underline="none"
      className={mergeClasses([logoClasses.root, className])}
      sx={[
        {
          width: 80,
          height: 80,
          marginLeft: '50%',
          transform: 'translateX(-50%)',
          ...(!isSingle && { width: 200, height: 70 }),
          ...(disabled && { pointerEvents: 'none' }),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {isSingle ? singleLogo : fullLogo}
    </LogoRoot>
  );
}

// ----------------------------------------------------------------------

const LogoRoot = styled(Link)(() => ({
  flexShrink: 0,
  color: 'transparent',
  display: 'inline-flex',
  verticalAlign: 'middle',
}));
