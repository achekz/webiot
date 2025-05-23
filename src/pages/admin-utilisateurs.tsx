import { useState, useEffect } from 'react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
// Firebase
import { doc, addDoc, getDocs, updateDoc, deleteDoc, collection } from 'firebase/firestore';

import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
// Icônes Material UI
import AddIcon from '@mui/icons-material/Add';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import EditIcon from '@mui/icons-material/Edit';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DeleteIcon from '@mui/icons-material/Delete';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import DialogContentText from '@mui/material/DialogContentText';

import { CONFIG } from 'src/config-global';
import { db } from 'src/services/firebaseClient';

// ----------------------------------------------------------------------
// Interfaces pour le typage
interface Utilisateur {
  id: string;
  nom: string;
  email: string;
  role: string;
  uid?: string;
  dateCreation?: string;
}

interface FormData {
  nom: string;
  email: string;
  role: string;
  motDePasse: string;
  confirmMotDePasse: string;
}

interface FormErrors {
  nom?: string;
  email?: string;
  role?: string;
  motDePasse?: string;
  confirmMotDePasse?: string;
}

// ----------------------------------------------------------------------
// Page d'administration des utilisateurs
// Permet de gérer les utilisateurs (professeurs & admins)

export default function AdminUtilisateursPage() {
  // État pour les utilisateurs
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // État pour la boîte de dialogue d'ajout/modification
  const [dialogOuvert, setDialogOuvert] = useState<boolean>(false);
  const [modeEdition, setModeEdition] = useState<boolean>(false);
  const [utilisateurEnEdition, setUtilisateurEnEdition] = useState<Utilisateur | null>(null);
  
  // État du formulaire
  const [formData, setFormData] = useState<FormData>({
    nom: '',
    email: '',
    role: 'professeur', // Par défaut: professeur
    motDePasse: '',
    confirmMotDePasse: '',
  });
  
  // État pour la confirmation de suppression
  const [confirmeSuppression, setConfirmeSuppression] = useState<boolean>(false);
  const [utilisateurASupprimer, setUtilisateurASupprimer] = useState<Utilisateur | null>(null);
  
  // Erreurs de formulaire
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Chargement initial des utilisateurs
  useEffect(() => {
    fetchUtilisateurs();
  }, []);

  // Récupérer les utilisateurs depuis Firestore
  const fetchUtilisateurs = async (): Promise<void> => {
    try {
      setLoading(true);
      const utilisateursCollection = collection(db, 'utilisateurs');
      const snapshot = await getDocs(utilisateursCollection);
      
      const listeUtilisateurs = snapshot.docs.map(docSnapshot => ({
        id: docSnapshot.id,
        ...docSnapshot.data()
      })) as Utilisateur[];
      
      setUtilisateurs(listeUtilisateurs);
    } catch (err: unknown) {
      console.error("Erreur lors du chargement des utilisateurs:", err);
      setError("Impossible de charger la liste des utilisateurs.");
    } finally {
      setLoading(false);
    }
  };
  
  // Gestion du changement dans les champs du formulaire
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Effacer l'erreur lorsque l'utilisateur modifie le champ
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors({
        ...formErrors,
        [name]: undefined
      });
    }
  };
  
  // Gestion du changement pour le Select
  const handleSelectChange = (event: any, child: React.ReactNode) => {
    const name = 'role';
    const value = event.target.value;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors({
        ...formErrors,
        [name]: undefined
      });
    }
  };
  
  // Ouvrir la boîte de dialogue d'ajout d'utilisateur
  const handleAjouterUtilisateur = () => {
    setDialogOuvert(true);
    setModeEdition(false);
    setUtilisateurEnEdition(null);
    setFormData({
      nom: '',
      email: '',
      role: 'professeur',
      motDePasse: '',
      confirmMotDePasse: '',
    });
    setFormErrors({});
  };
  
  // Ouvrir la boîte de dialogue d'édition
  const handleModifierUtilisateur = (utilisateur: Utilisateur): void => {
    setDialogOuvert(true);
    setModeEdition(true);
    setUtilisateurEnEdition(utilisateur);
    
    setFormData({
      nom: utilisateur.nom || '',
      email: utilisateur.email || '',
      role: utilisateur.role || 'professeur',
      motDePasse: '', // On ne récupère pas le mot de passe
      confirmMotDePasse: '',
    });
    
    setFormErrors({});
  };
  
  // Valider le formulaire avant soumission
  const validerFormulaire = (): boolean => {
    const erreurs: FormErrors = {};
    
    if (!formData.nom.trim()) erreurs.nom = "Le nom est requis";
    
    if (!formData.email.trim()) {
      erreurs.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      erreurs.email = "Format d'email invalide";
    }
    
    // Valider le mot de passe seulement pour un nouvel utilisateur
    if (!modeEdition) {
      if (!formData.motDePasse) {
        erreurs.motDePasse = "Le mot de passe est requis";
      } else if (formData.motDePasse.length < 6) {
        erreurs.motDePasse = "Le mot de passe doit contenir au moins 6 caractères";
      }
      
      if (formData.motDePasse !== formData.confirmMotDePasse) {
        erreurs.confirmMotDePasse = "Les mots de passe ne correspondent pas";
      }
    } else if (formData.motDePasse && formData.motDePasse.length < 6) {
      erreurs.motDePasse = "Le mot de passe doit contenir au moins 6 caractères";
    } else if (formData.motDePasse !== formData.confirmMotDePasse) {
      erreurs.confirmMotDePasse = "Les mots de passe ne correspondent pas";
    }
    
    setFormErrors(erreurs);
    return Object.keys(erreurs).length === 0;
  };
  
  // Soumettre le formulaire
  const handleSoumettreFormulaire = async () => {
    if (!validerFormulaire()) return;
    
    try {
      if (modeEdition && utilisateurEnEdition) {
        // Mise à jour d'un utilisateur existant
        const docRef = doc(db, 'utilisateurs', utilisateurEnEdition.id);
        await updateDoc(docRef, {
          nom: formData.nom,
          role: formData.role,
        });
      } else {
        // Création d'un nouvel utilisateur
        try {
          // D'abord créer l'utilisateur dans Firebase Auth
          const userCredential = await createUserWithEmailAndPassword(
            getAuth(), 
            formData.email, 
            formData.motDePasse
          );
          
          // Puis stocker les informations complémentaires dans Firestore
          await addDoc(collection(db, 'utilisateurs'), {
            uid: userCredential.user.uid,
            nom: formData.nom,
            email: formData.email,
            role: formData.role,
            dateCreation: new Date().toISOString()
          });
          
        } catch (authError: unknown) {
          console.error("Erreur d'authentification:", authError);
          
          if (typeof authError === 'object' && authError !== null && 'code' in authError && 
              (authError as { code: string }).code === 'auth/email-already-in-use') {
            setFormErrors({
              ...formErrors,
              email: "Cette adresse email est déjà utilisée"
            });
            return;
          } else {
            throw authError; // Relancer pour le catch général
          }
        }
      }
      
      // Fermer la boîte de dialogue et rafraîchir les données
      setDialogOuvert(false);
      fetchUtilisateurs();
      
    } catch (err: unknown) {
      console.error("Erreur lors de l'enregistrement:", err);
      if (err instanceof Error) {
        setError(`Erreur lors de l'enregistrement: ${err.message}`);
      } else {
        setError("Erreur lors de l'enregistrement");
      }
    }
  };
  
  // Demander confirmation avant suppression
  const handleDemandeSupprimer = (utilisateur: Utilisateur): void => {
    setUtilisateurASupprimer(utilisateur);
    setConfirmeSuppression(true);
  };
  
  // Supprimer un utilisateur après confirmation
  const handleConfirmerSuppression = async (): Promise<void> => {
    if (!utilisateurASupprimer) return;
    
    try {
      // Supprimer l'utilisateur de Firestore
      await deleteDoc(doc(db, 'utilisateurs', utilisateurASupprimer.id));
      
      // Note: Dans une implémentation complète, il faudrait également supprimer
      // l'utilisateur de Firebase Auth avec deleteUser() en utilisant l'Admin SDK
      
      // Rafraîchir la liste
      setUtilisateurs(utilisateurs.filter(u => u.id !== utilisateurASupprimer.id));
      setConfirmeSuppression(false);
      setUtilisateurASupprimer(null);
      
    } catch (err: unknown) {
      console.error("Erreur lors de la suppression:", err);
      setError("Impossible de supprimer l'utilisateur.");
    }
  };
  
  // Afficher la couleur du rôle
  const getRoleCouleur = (role: string): 'error' | 'info' | 'default' => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'professeur':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <>
      <title>{`Administration des utilisateurs - ${CONFIG.appName}`}</title>
      
      <Container maxWidth="xl">
        <Stack 
          direction="row" 
          alignItems="center" 
          justifyContent="space-between" 
          mb={5}
        >
          <Typography variant="h4">Liste des utilisateurs</Typography>
          
          <Button 
            variant="contained" 
            color="inherit" 
            startIcon={<AddIcon />}
            onClick={handleAjouterUtilisateur}
          >
            Nouvel utilisateur
          </Button>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Card>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Nom</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Rôle</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      Chargement...
                    </TableCell>
                  </TableRow>
                ) : utilisateurs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      Aucun utilisateur trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  utilisateurs.map((utilisateur) => (
                    <TableRow key={utilisateur.id}>
                      <TableCell>{utilisateur.nom}</TableCell>
                      <TableCell>{utilisateur.email}</TableCell>
                      <TableCell>
                        <Chip 
                          label={utilisateur.role || 'professeur'} 
                          color={getRoleCouleur(utilisateur.role)} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="Modifier">
                            <IconButton 
                              size="small"
                              color="info" 
                              onClick={() => handleModifierUtilisateur(utilisateur)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Supprimer">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDemandeSupprimer(utilisateur)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
        
        {/* Boîte de dialogue d'ajout/modification */}
        <Dialog open={dialogOuvert} onClose={() => setDialogOuvert(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {modeEdition ? "Modifier l'utilisateur" : "Ajouter un utilisateur"}
          </DialogTitle>
          
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Nom"
                name="nom"
                value={formData.nom}
                onChange={handleInputChange}
                error={!!formErrors.nom}
                helperText={formErrors.nom}
              />
              
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
                disabled={modeEdition} // L'email ne peut pas être modifié
              />
              
              <FormControl fullWidth>
                <InputLabel id="role-label">Rôle</InputLabel>
                <Select
                  labelId="role-label"
                  name="role"
                  value={formData.role}
                  label="Rôle"
                  onChange={handleSelectChange}
                >
                  <MenuItem value="professeur">Professeur</MenuItem>
                  <MenuItem value="admin">Administrateur</MenuItem>
                </Select>
              </FormControl>
              
              {!modeEdition && (
                <>
                  <TextField
                    fullWidth
                    label="Mot de passe"
                    name="motDePasse"
                    type="password"
                    value={formData.motDePasse}
                    onChange={handleInputChange}
                    error={!!formErrors.motDePasse}
                    helperText={formErrors.motDePasse}
                  />
                  
                  <TextField
                    fullWidth
                    label="Confirmer le mot de passe"
                    name="confirmMotDePasse"
                    type="password"
                    value={formData.confirmMotDePasse}
                    onChange={handleInputChange}
                    error={!!formErrors.confirmMotDePasse}
                    helperText={formErrors.confirmMotDePasse}
                  />
                </>
              )}
              
              {modeEdition && (
                <Alert severity="info">
                  Pour changer le mot de passe, veuillez utiliser la fonction &quot;Mot de passe oublié&quot; sur la page de connexion.
                </Alert>
              )}
            </Stack>
          </DialogContent>
          
          <DialogActions>
            <Button onClick={() => setDialogOuvert(false)}>Annuler</Button>
            <Button onClick={handleSoumettreFormulaire} variant="contained">
              {modeEdition ? "Enregistrer" : "Ajouter"}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Boîte de dialogue de confirmation de suppression */}
        <Dialog open={confirmeSuppression} onClose={() => setConfirmeSuppression(false)}>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          
          <DialogContent>
            <DialogContentText>
              Êtes-vous sûr de vouloir supprimer l&apos;utilisateur &quot;{utilisateurASupprimer?.nom}&quot; ?
              Cette action est irréversible.
            </DialogContentText>
          </DialogContent>
          
          <DialogActions>
            <Button onClick={() => setConfirmeSuppression(false)}>Annuler</Button>
            <Button onClick={handleConfirmerSuppression} color="error" variant="contained">
              Supprimer
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}
