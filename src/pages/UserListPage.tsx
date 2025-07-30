/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/UserListPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from '../services/usersApi';
import type { User, UserFormFields } from '../types/models';
import { useAppSelector } from '../hooks/reduxHooks';

// Componente para el formulario de creación/edición de usuario
interface UserFormDialogProps {
  open: boolean;
  onClose: () => void;
  user?: User; // Si se proporciona, es para editar (viene del backend como User)
  // onSave ahora acepta UserFormFields
  onSave: (userData: UserFormFields) => void;
  isLoading: boolean;
  error: any;
}

const UserFormDialog: React.FC<UserFormDialogProps> = ({
  open,
  onClose,
  user,
  onSave,
  isLoading,
  error,
}) => {
  // El estado del formulario ahora usa Partial<UserFormFields>
  const [formData, setFormData] = useState<Partial<UserFormFields>>(() => user ? { ...user, password: '' } : {
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    role: 'requester', // Rol por defecto
    is_active: true, // Por defecto activo
    password: '', // Solo para creación
  });

  // Resetea el formulario cuando el user cambia (para modo edición)
  useEffect(() => {
    setFormData(user ? { ...user, password: '' } : {
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      role: 'requester',
      is_active: true,
      password: '',
    });
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Elimina password si está vacío y es una edición para no intentar actualizarlo.
    // Djoser necesita password si estás creando o si lo estás cambiando explícitamente.
    const dataToSave = { ...formData };
    if (user && !dataToSave.password) {
      delete dataToSave.password;
    }
    // Casting a UserFormFields para onSave
    onSave(dataToSave as UserFormFields);
  };

  const currentError = error ? (error as any)?.data?.detail || (error as any)?.error || JSON.stringify((error as any)?.data) : null;

  const roleOptions = [
    { value: 'admin', label: 'Administrador' },
    { value: 'manager', label: 'Gerente' },
    { value: 'technician', label: 'Técnico' },
    { value: 'requester', label: 'Solicitante' },
  ];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{user ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</DialogTitle>
      <DialogContent>
        {currentError && <Alert severity="error" sx={{ mb: 2 }}>{currentError}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            margin="dense"
            name="username"
            label="Nombre de Usuario"
            type="text"
            fullWidth
            required
            value={formData.username || ''}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            required
            value={formData.email || ''}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="password"
            label={user ? "Nueva Contraseña (dejar vacío para no cambiar)" : "Contraseña"}
            type="password"
            fullWidth
            required={!user} // Requerido solo para creación
            value={formData.password || ''}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="first_name"
            label="Nombre"
            type="text"
            fullWidth
            value={formData.first_name || ''}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="last_name"
            label="Apellido"
            type="text"
            fullWidth
            value={formData.last_name || ''}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="role"
            label="Rol"
            select
            fullWidth
            required
            value={formData.role || 'requester'}
            onChange={handleChange}
          >
            {roleOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.is_active ?? true} // Usa ?? para null/undefined
                onChange={handleChange}
                name="is_active"
              />
            }
            label="Usuario Activo"
            sx={{ mt: 1 }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>Cancelar</Button>
        <Button onClick={handleSubmit} disabled={isLoading} variant="contained">
          {isLoading ? <CircularProgress size={24} /> : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ... Resto del UserListPage sin cambios, ya que onSave manejará el tipo correctamente
function UserListPage() {
  const { data: users, isLoading, isError, error } = useGetUsersQuery();
  // Los mutaciones de createUser y updateUser en usersApi.ts ya esperan UserFormFields
  const [createUser, { isLoading: isCreating, error: createError }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating, error: updateError }] = useUpdateUserMutation();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [deleteUser, { isLoading: isDeleting, error: deleteError }] = useDeleteUserMutation();

  const currentUser = useAppSelector((state) => state.auth.user);
  const canManageUsers = currentUser?.role === 'admin'; // Solo administradores pueden gestionar usuarios

  const [openForm, setOpenForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [userToDeleteId, setUserToDeleteId] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setSelectedUser(undefined);
    setOpenForm(true);
  };

  const handleOpenEdit = (user: User) => {
    setSelectedUser(user);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedUser(undefined);
  };

  // handleSaveUser ahora espera UserFormFields para enviar a la API
  const handleSaveUser = async (userData: UserFormFields) => {
    try {
      if (selectedUser) {
        // Es una edición
        // Asegúrate de enviar solo los campos que Djoser espera para PATCH
        const patchData: Partial<UserFormFields> & { id: string } = {
          id: selectedUser.id,
          username: userData.username,
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          role: userData.role,
          is_active: userData.is_active,
        };
        if (userData.password) { // Solo envía la contraseña si se proporcionó
          patchData.password = userData.password;
        }
        await updateUser(patchData).unwrap();
      } else {
        // Es una creación
        await createUser(userData).unwrap();
      }
      handleCloseForm(); // Cierra el formulario al guardar exitosamente
    } catch (err) {
      console.error('Error al guardar el usuario:', err);
      // El error se manejará en el propio formulario UserFormDialog
    }
  };


  const handleOpenDeleteConfirm = (id: string) => {
    setUserToDeleteId(id);
    setOpenDeleteConfirm(true);
  };

  const handleCloseDeleteConfirm = () => {
    setOpenDeleteConfirm(false);
    setUserToDeleteId(null);
  };

  const handleDeleteUser = async () => {
    if (userToDeleteId) {
      try {
        await deleteUser(userToDeleteId).unwrap();
        handleCloseDeleteConfirm();
      } catch (err) {
        console.error('Error al eliminar el usuario:', err);
      }
    }
  };

  // Manejo de errores de carga de la lista de usuarios
  if (isError) {
    let errorMessage = 'Error al cargar usuarios.';
    if ((error as any)?.status === 401) {
      errorMessage = 'No autorizado. Debes ser un administrador para ver esta página.';
    } else if ((error as any)?.data?.detail) {
      errorMessage = (error as any).data.detail;
    }
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {errorMessage}
        </Alert>
        {isLoading && <CircularProgress sx={{ mt: 2 }} />}
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Cargando usuarios...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Administración de Usuarios
      </Typography>
      {canManageUsers && (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ mb: 2 }}
          onClick={handleOpenCreate}
        >
          Crear Nuevo Usuario
        </Button>
      )}

      {users && users.length > 0 ? (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="users table">
            <TableHead>
              <TableRow>
                <TableCell>Nombre de Usuario</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>Activo</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell component="th" scope="row">
                    {user.username}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.first_name} {user.last_name}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.is_active ? 'Sí' : 'No'}</TableCell>
                  <TableCell align="right">
                    {canManageUsers && (
                      <>
                        <IconButton
                          aria-label="edit"
                          onClick={() => handleOpenEdit(user)}
                          size="small"
                        >
                          <EditIcon fontSize="inherit" />
                        </IconButton>
                        {/* No permitir eliminar al propio usuario logueado */}
                        {user.id !== currentUser?.id && (
                          <IconButton
                            aria-label="delete"
                            onClick={() => handleOpenDeleteConfirm(user.id)}
                            size="small"
                          >
                            <DeleteIcon fontSize="inherit" />
                          </IconButton>
                        )}
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="body1">No hay usuarios registrados. {canManageUsers && '¡Crea uno!'}</Typography>
      )}

      <UserFormDialog
        open={openForm}
        onClose={handleCloseForm}
        user={selectedUser}
        onSave={handleSaveUser}
        isLoading={isCreating || isUpdating}
        error={createError || updateError}
      />

      <Dialog
        open={openDeleteConfirm}
        onClose={handleCloseDeleteConfirm}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirmar Eliminación"}</DialogTitle>
        <DialogContent>
          <Typography id="alert-dialog-description">
            ¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm} disabled={isDeleting}>Cancelar</Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained" disabled={isDeleting} autoFocus>
            {isDeleting ? <CircularProgress size={24} /> : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default UserListPage;