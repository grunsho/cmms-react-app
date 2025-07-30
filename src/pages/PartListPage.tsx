/* eslint-disable @typescript-eslint/no-explicit-any */
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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  useGetPartsQuery,
  useCreatePartMutation,
  useUpdatePartMutation,
  useDeletePartMutation,
} from '../services/partsApi';
import { type Part } from '../types/models';
import { useAppSelector } from '../hooks/reduxHooks';

// Componente para el formulario de creación/edición de piezas
interface PartFormDialogProps {
  open: boolean;
  onClose: () => void;
  part?: Part; // Si se proporciona, es para editar
  onSave: (part: Omit<Part, 'id' | 'created_at' | 'updated_at'> | (Partial<Part> & { id: string })) => void;
  isLoading: boolean;
  error: any;
}

const PartFormDialog: React.FC<PartFormDialogProps> = ({
  open,
  onClose,
  part,
  onSave,
  isLoading,
  error,
}) => {
  const [formData, setFormData] = useState<Partial<Part>>(() => part || {
    name: '',
    sku: '',
    description: '',
    quantity: 0,
    location: '',
    unit_cost: '',
    supplier: '',
    reorder_point: 0,
    last_reordered_date: '',
    notes: '',
  });

  useEffect(() => {
    // Cuando el 'part' prop cambia (ej. al abrir para editar una pieza diferente),
    // actualiza el formulario. Convierte DecimalField/DateField a string para TextField.
    setFormData(part ? {
      ...part,
      unit_cost: part.unit_cost?.toString() || '',
      last_reordered_date: part.last_reordered_date ? new Date(part.last_reordered_date).toISOString().split('T')[0] : '',
    } : {
      name: '',
      sku: '',
      description: '',
      quantity: 0,
      location: '',
      unit_cost: '',
      supplier: '',
      reorder_point: 0,
      last_reordered_date: '',
      notes: '',
    });
  }, [part]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Manejo especial para números
    if (name === 'quantity' || name === 'reorder_point') {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value, 10) || 0 }));
    } else if (name === 'unit_cost') {
      setFormData((prev) => ({ ...prev, [name]: value })); // Se envía como string a Django
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDateChange = (name: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [name]: e.target.value || null }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as any);
  };

  const currentError = error ? (error as any)?.data?.detail || (error as any)?.error : null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{part ? 'Editar Pieza' : 'Crear Nueva Pieza'}</DialogTitle>
      <DialogContent>
        {currentError && <Alert severity="error">{currentError}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            margin="dense"
            name="name"
            label="Nombre de la Pieza"
            type="text"
            fullWidth
            required
            value={formData.name || ''}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="sku"
            label="SKU/Número de Parte"
            type="text"
            fullWidth
            value={formData.sku || ''}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="description"
            label="Descripción"
            type="text"
            fullWidth
            multiline
            rows={2}
            value={formData.description || ''}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="quantity"
            label="Cantidad en Stock"
            type="number"
            fullWidth
            required
            value={formData.quantity || 0}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="location"
            label="Ubicación de Almacén"
            type="text"
            fullWidth
            value={formData.location || ''}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="unit_cost"
            label="Costo Unitario"
            type="number"
            inputProps={{ step: "0.01" }} // Para permitir decimales
            fullWidth
            value={formData.unit_cost || ''}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="supplier"
            label="Proveedor Principal"
            type="text"
            fullWidth
            value={formData.supplier || ''}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="reorder_point"
            label="Punto de Reorden"
            type="number"
            fullWidth
            value={formData.reorder_point || 0}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="last_reordered_date"
            label="Última Reorden"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={formData.last_reordered_date || ''}
            onChange={handleDateChange('last_reordered_date')}
          />
          <TextField
            margin="dense"
            name="notes"
            label="Notas"
            type="text"
            fullWidth
            multiline
            rows={2}
            value={formData.notes || ''}
            onChange={handleChange}
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


function PartListPage() {
  const { data: parts, isLoading, isError, error } = useGetPartsQuery();
  const [createPart, { isLoading: isCreating, error: createError }] = useCreatePartMutation();
  const [updatePart, { isLoading: isUpdating, error: updateError }] = useUpdatePartMutation();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [deletePart, { isLoading: isDeleting, error: deleteError }] = useDeletePartMutation();

  const { user } = useAppSelector((state) => state.auth);
  const canManageParts = user?.role === 'admin' || user?.role === 'manager';

  const [openForm, setOpenForm] = useState(false);
  const [selectedPart, setSelectedPart] = useState<Part | undefined>(undefined);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [partToDeleteId, setPartToDeleteId] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setSelectedPart(undefined);
    setOpenForm(true);
  };

  const handleOpenEdit = (part: Part) => {
    setSelectedPart(part);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedPart(undefined);
  };

  const handleSavePart = async (partData: Omit<Part, 'id' | 'created_at' | 'updated_at'> | (Partial<Part> & { id: string })) => {
    try {
      if (selectedPart) {
        await updatePart({ id: selectedPart.id, ...partData }).unwrap();
      } else {
        await createPart(partData as Omit<Part, 'id' | 'created_at' | 'updated_at'>).unwrap();
      }
      handleCloseForm();
    } catch (err) {
      console.error('Error al guardar la pieza:', err);
    }
  };

  const handleOpenDeleteConfirm = (id: string) => {
    setPartToDeleteId(id);
    setOpenDeleteConfirm(true);
  };

  const handleCloseDeleteConfirm = () => {
    setOpenDeleteConfirm(false);
    setPartToDeleteId(null);
  };

  const handleDeletePart = async () => {
    if (partToDeleteId) {
      try {
        await deletePart(partToDeleteId).unwrap();
        handleCloseDeleteConfirm();
      } catch (err) {
        console.error('Error al eliminar la pieza:', err);
      }
    }
  };


  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Cargando inventario...</Typography>
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error al cargar el inventario: {(error as any)?.data?.detail || 'Error desconocido.'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Gestión de Inventario y Piezas
      </Typography>
      {canManageParts && (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ mb: 2 }}
          onClick={handleOpenCreate}
        >
          Crear Nueva Pieza
        </Button>
      )}

      {parts && parts.length > 0 ? (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 700 }} aria-label="inventory table">
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell align="right">Cantidad</TableCell>
                <TableCell>Ubicación</TableCell>
                <TableCell align="right">Costo Unitario</TableCell>
                <TableCell align="right">Punto de Reorden</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {parts.map((part) => (
                <TableRow key={part.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell component="th" scope="row">
                    {part.name}
                  </TableCell>
                  <TableCell>{part.sku || 'N/A'}</TableCell>
                  <TableCell align="right">{part.quantity}</TableCell>
                  <TableCell>{part.location || 'N/A'}</TableCell>
                  <TableCell align="right">{part.unit_cost ? `$${parseFloat(part.unit_cost).toFixed(2)}` : 'N/A'}</TableCell>
                  <TableCell align="right">{part.reorder_point}</TableCell>
                  <TableCell align="right">
                    {canManageParts && (
                      <>
                        <IconButton
                          aria-label="edit"
                          onClick={() => handleOpenEdit(part)}
                          size="small"
                        >
                          <EditIcon fontSize="inherit" />
                        </IconButton>
                        <IconButton
                          aria-label="delete"
                          onClick={() => handleOpenDeleteConfirm(part.id)}
                          size="small"
                        >
                          <DeleteIcon fontSize="inherit" />
                        </IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="body1">No hay piezas registradas. {canManageParts && '¡Crea una!'}</Typography>
      )}

      <PartFormDialog
        open={openForm}
        onClose={handleCloseForm}
        part={selectedPart}
        onSave={handleSavePart}
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
            ¿Estás seguro de que quieres eliminar esta pieza? Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm} disabled={isDeleting}>Cancelar</Button>
          <Button onClick={handleDeletePart} color="error" variant="contained" disabled={isDeleting} autoFocus>
            {isDeleting ? <CircularProgress size={24} /> : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PartListPage;