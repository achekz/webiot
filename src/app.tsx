import 'src/global.css';

import { useEffect } from 'react';

// Importations externes
import { usePathname } from 'src/routes/hooks';

import { ThemeProvider } from 'src/theme/theme-provider';

// Importations contextes pour authentification et rôles
import { AuthProvider } from './context/AuthContext';
import { RoleProvider } from './context/RoleContext';

// ----------------------------------------------------------------------

type AppProps = {
  children: React.ReactNode;
};

export default function App({ children }: AppProps) {
  useScrollToTop();

  return (
    <ThemeProvider>
      <AuthProvider>
        <RoleProvider>
          {children}
        </RoleProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

// ----------------------------------------------------------------------

function useScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
