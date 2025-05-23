import { useEffect } from 'react';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

import { CONFIG } from 'src/config-global';

import { SignInView } from 'src/sections/auth';

// ----------------------------------------------------------------------

export default function SignInPage() {
  useEffect(() => {
    document.title = `Connexion - ${CONFIG.appName}`;
  }, []);

  return (
    <Box
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        }}
      >
        <Container maxWidth="sm">
          <SignInView />
        </Container>
      </Box>
  );
}
