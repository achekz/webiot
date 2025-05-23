import { Iconify } from 'src/components/iconify';

import type { AccountPopoverProps } from './components/account-popover';

// ----------------------------------------------------------------------

export const _account: AccountPopoverProps['data'] = [
  {
    label: 'Home',
    href: '/',
    icon: <Iconify width={22} icon="solar:home-angle-bold-duotone" />,
  },
  {
    label: 'Mon Profil',
    href: '/profil',
    icon: <Iconify width={22} icon="eva:people-fill" />,
  },
  {
    label: 'Settings',
    href: '#',
    icon: <Iconify width={22} icon="solar:settings-bold-duotone" />,
  },
];
