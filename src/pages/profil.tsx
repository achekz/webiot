import { useEffect } from 'react';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

import { CONFIG } from 'src/config-global';

import { default as ProfilView } from 'src/sections/profil/profil-view';

// ----------------------------------------------------------------------
// Page de profil utilisateur pour Smart Salle
// Permet la consultation et modification des informations personnelles

export default function ProfilPage() {
  useEffect(() => {
    document.title = `Mon Profil - ${CONFIG.appName}`;
  }, []);

  return (
    <Container maxWidth="lg">
        <Box sx={{ py: 3 }}>
          <ProfilView />
        </Box>
      </Container>
  );
}
