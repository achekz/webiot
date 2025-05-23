// Section de gestion des utilisateurs pour l'application Flutter
// Intégrée au tableau de bord admin, permet d'ajouter/modifier des professeurs et d'assigner des salles

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDocs, updateDoc, deleteDoc, collection } from 'firebase/firestore';

import {
  Box, 
  Card,
  Modal,
  Table,
  Button,
  Select,
  MenuItem,
  TableRow,
  Container, 
  TableBody,
  TableCell,
  TextField,
  InputLabel,
  Typography,
  FormControl, 
  TableContainer,
  TablePagination
} from '@mui/material';

// Imports des services et hooks internes
import { useRole } from 'src/context/RoleContext';
import { db, auth } from 'src/services/firebaseClient';
import { roomService } from 'src/services/roomService';

// Imports des composants UI
import { Iconify } from 'src/components/iconify/iconify';
import { Scrollbar } from 'src/components/scrollbar/scrollbar';
import { 
  TableMenu,
  TableEmpty, 
  TableError, 
  TableLoader, 
  CustomTableHead 
} from 'src/components/table';

// ----------------------------------------------------------------------

// Types pour les utilisateurs
interface Utilisateur {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: 'admin' | 'professeur';
  salleAssignee: string | null;
  dateCreation: any;
}

// Type pour les salles
interface Salle {
  id: string;
  nom: string;
}

export default function UserManagementList() {
  // Ce composant est exclusivement pour la gestion des professeurs de l'application Flutter
  const { isAdmin } = useRole();
  const navigate = useNavigate();

  // États pour la liste des utilisateurs
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [salles, setSalles] = useState<Salle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // États pour la pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  // États pour le modal de création/édition
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentUser, setCurrentUser] = useState<Utilisateur | null>(null);
  const [formValues, setFormValues] = useState({
    email: '',
    password: '',
    nom: '',
    prenom: '',
    role: 'professeur',
    salleAssignee: '',
  });
  
  // Chargement des utilisateurs depuis Firestore
  const fetchUtilisateurs = async () => {
    try {
      setLoading(true);
      const usersCollection = collection(db, 'utilisateurs');
      const snapshot = await getDocs(usersCollection);
      
      if (snapshot.empty) {
        setUtilisateurs([]);
      } else {
        const usersList = snapshot.docs.map(docSnapshot => ({
          id: docSnapshot.id,
          ...docSnapshot.data()
        })) as Utilisateur[];
        
        setUtilisateurs(usersList);
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Erreur lors du chargement des utilisateurs:", err);
      setError("Impossible de charger la liste des utilisateurs. Veuillez réessayer.");
      setLoading(false);
    }
  };
  
  // Chargement des salles depuis le service
  const fetchSalles = async () => {
    try {
      const response = await roomService.getSalles();
      
      if (response.salles && response.salles.length > 0) {
        setSalles(response.salles as Salle[]);
      } else {
        setSalles([]);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des salles:", err);
    }
  };
  
  // Effet pour charger les données au montage
  useEffect(() => {
    // Redirection si non admin - cette section est réservée aux administrateurs
    if (!isAdmin) {
      // Dans le contexte du tableau de bord, nous n'affichons pas cette section aux non-admins
      return;
    }
    
    // Chargement des données
    fetchUtilisateurs();
    fetchSalles();
  }, [isAdmin, navigate]);
  
  // Gestionnaires d'événements pour le modal
  const handleOpenModal = (user?: Utilisateur) => {
    if (user) {
      // Mode édition
      setEditMode(true);
      setCurrentUser(user);
      setFormValues({
        email: user.email,
        password: '', // On ne récupère jamais le mot de passe
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
        salleAssignee: user.salleAssignee || '',
      });
    } else {
      // Mode création
      setEditMode(false);
      setCurrentUser(null);
      setFormValues({
        email: '',
        password: '',
        nom: '',
        prenom: '',
        role: 'professeur',
        salleAssignee: '',
      });
    }
    setOpen(true);
  };
  
  const handleCloseModal = () => {
    setOpen(false);
  };
  
  // Mise à jour des valeurs du formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: string } }) => {
    const { name, value } = 'target' in e ? e.target : e;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      if (editMode && currentUser) {
        // Mise à jour d'un utilisateur existant
        const userRef = doc(db, 'utilisateurs', currentUser.id);
        await updateDoc(userRef, {
          nom: formValues.nom,
          prenom: formValues.prenom,
          role: formValues.role,
          salleAssignee: formValues.salleAssignee || null,
        });
        
        // Mise à jour de la liste
        setUtilisateurs(prev => 
          prev.map(user => 
            user.id === currentUser.id ? {
              ...user,
              nom: formValues.nom,
              prenom: formValues.prenom,
              role: formValues.role as 'admin' | 'professeur',
              salleAssignee: formValues.salleAssignee || null,
            } : user
          )
        );
        
      } else {
        // Création d'un nouvel utilisateur
        if (!formValues.password) {
          throw new Error("Le mot de passe est requis pour créer un nouvel utilisateur");
        }
        
        // Création dans Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          formValues.email, 
          formValues.password
        );
        
        // Création dans Firestore
        const newUser = {
          email: formValues.email,
          nom: formValues.nom,
          prenom: formValues.prenom,
          role: formValues.role,
          salleAssignee: formValues.salleAssignee || null,
          dateCreation: new Date().toISOString(),
        };
        
        await setDoc(doc(db, 'utilisateurs', userCredential.user.uid), newUser);
        
        // Mise à jour de la liste
        setUtilisateurs(prev => [
          ...prev, 
          { id: userCredential.user.uid, ...newUser } as Utilisateur
        ]);
      }
      
      // Fermeture du modal
      handleCloseModal();
      
    } catch (err: unknown) {
      console.error("Erreur lors de la sauvegarde de l'utilisateur:", err);
      
      // Affichage plus convivial des erreurs Firebase
      let message = "Une erreur est survenue. Veuillez réessayer.";
      
      if (err && typeof err === 'object' && 'code' in err) {
        const firebaseError = err as { code: string; message?: string };
        
        if (firebaseError.code === 'auth/email-already-in-use') {
          message = "Cet email est déjà utilisé.";
        } else if (firebaseError.code === 'auth/weak-password') {
          message = "Le mot de passe est trop faible (minimum 6 caractères).";
        } else if (firebaseError.code === 'auth/invalid-email') {
          message = "L'adresse email n'est pas valide.";
        } else if (firebaseError.message) {
          message = firebaseError.message;
        }
      }
      
      setError(message);
    }
  };
  
  // Suppression d'un utilisateur
  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      try {
        // Suppression dans Firestore
        await deleteDoc(doc(db, 'utilisateurs', userId));
        
        // Mise à jour de la liste
        setUtilisateurs(prev => prev.filter(user => user.id !== userId));
        
      } catch (err) {
        console.error("Erreur lors de la suppression de l'utilisateur:", err);
        setError("Impossible de supprimer l'utilisateur. Veuillez réessayer.");
      }
    }
  };
  
  // Gestion de la pagination
  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Nombre d'utilisateurs sélectionnés pour la pagination
  const start = page * rowsPerPage;
  const end = start + rowsPerPage;
  
  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Gestion des professeurs (Application Mobile)</Typography>
        <Button 
          variant="contained" 
          startIcon={<Iconify icon="eva:plus-fill" />}
          onClick={() => handleOpenModal()}
        >
          Nouveau professeur
        </Button>
      </Box>
      
      <Card>
        {error && <TableError message={error} onRetry={fetchUtilisateurs} />}
        
        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <CustomTableHead
                headLabel={[
                  { id: 'nom', label: 'Nom & Prénom' },
                  { id: 'email', label: 'Email' },
                  { id: 'role', label: 'Rôle' },
                  { id: 'salle', label: 'Salle assignée' },
                  { id: '', label: '' },
                ]}
              />
              
              <TableBody>
                {loading ? (
                  <TableLoader count={5} columns={5} />
                ) : utilisateurs.length === 0 ? (
                  <TableEmpty message="Aucun utilisateur trouvé" />
                ) : (
                  utilisateurs.slice(start, end).map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2">{user.nom}</Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {user.prenom}
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell>{user.email}</TableCell>
                      
                      <TableCell>
                        <Box
                          sx={{
                            py: 0.5,
                            px: 1.5,
                            borderRadius: 1,
                            display: 'inline-block',
                            bgcolor: user.role === 'admin' ? 'primary.lighter' : 'success.lighter',
                          }}
                        >
                          <Typography variant="caption" sx={{ color: user.role === 'admin' ? 'primary.main' : 'success.main' }}>
                            {user.role === 'admin' ? 'Administrateur' : 'Professeur'}
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        {user.salleAssignee ? (
                          salles.find(s => s.id === user.salleAssignee)?.nom || user.salleAssignee
                        ) : (
                          <Typography variant="body2" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
                            Non assignée
                          </Typography>
                        )}
                      </TableCell>
                      
                      <TableCell align="right">
                        <TableMenu
                          actions={[
                            {
                              label: 'Modifier',
                              icon: 'eva:edit-fill',
                              onClick: () => handleOpenModal(user)
                            },
                            {
                              label: 'Supprimer',
                              icon: 'eva:trash-2-outline',
                              color: 'error',
                              onClick: () => handleDeleteUser(user.id)
                            }
                          ]}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>
        
        <TablePagination
          page={page}
          component="div"
          count={utilisateurs.length}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Lignes par page:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
        />
      </Card>
      
      {/* Modal de création/édition */}
      <Modal
        open={open}
        onClose={handleCloseModal}
        aria-labelledby="modal-utilisateur-titre"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          bgcolor: 'background.paper',
          borderRadius: 1,
          boxShadow: 24,
          p: 4,
        }}>
          <Typography id="modal-utilisateur-titre" variant="h6" component="h2" sx={{ mb: 3 }}>
            {editMode ? 'Modifier le professeur' : 'Nouveau professeur'}
          </Typography>
          
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                required
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formValues.email}
                onChange={handleChange}
                disabled={editMode} // Email ne peut pas être modifié après création
              />
              
              {!editMode && (
                <TextField
                  required
                  fullWidth
                  label="Mot de passe"
                  name="password"
                  type="password"
                  value={formValues.password}
                  onChange={handleChange}
                  helperText="Minimum 6 caractères"
                />
              )}
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  required
                  fullWidth
                  label="Nom"
                  name="nom"
                  value={formValues.nom}
                  onChange={handleChange}
                />
                
                <TextField
                  required
                  fullWidth
                  label="Prénom"
                  name="prenom"
                  value={formValues.prenom}
                  onChange={handleChange}
                />
              </Box>
              
              <FormControl fullWidth>
                <InputLabel id="role-label">Rôle</InputLabel>
                <Select
                  labelId="role-label"
                  name="role"
                  value={formValues.role}
                  onChange={handleChange}
                  label="Rôle"
                >
                  <MenuItem value="admin">Administrateur</MenuItem>
                  <MenuItem value="professeur">Professeur</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth>
                <InputLabel id="salle-label">Salle assignée</InputLabel>
                <Select
                  labelId="salle-label"
                  name="salleAssignee"
                  value={formValues.salleAssignee}
                  onChange={handleChange}
                  label="Salle assignée"
                >
                  <MenuItem value="">Aucune</MenuItem>
                  {salles.map((salle) => (
                    <MenuItem key={salle.id} value={salle.id}>
                      {salle.nom}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                <Button onClick={handleCloseModal}>Annuler</Button>
                <Button variant="contained" type="submit">
                  {editMode ? 'Mettre à jour' : 'Créer'}
                </Button>
              </Box>
            </Box>
          </form>
        </Box>
      </Modal>
    </Container>
  );
}
