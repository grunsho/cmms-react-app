/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
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
  MenuItem,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  useGetAssetsQuery,
  useCreateAssetMutation,
  useUpdateAssetMutation,
  useDeleteAssetMutation,
} from '../services/assetsApi';
import { type Asset } from '../types/models';
import { useAppSelector } from '../hooks/reduxHooks';

// Componente para el formulario de creación/edición
interface AssetFormDialogProps {
  open: boolean;
  onClose: () => void;
  asset?: Asset; // Si se proporciona, es para editar
  onSave: (asset: Omit<Asset, 'id'> | (Partial<Asset> & { id: string })) => void;
  isLoading: boolean;
  error: any;
}

const AssetFormDialog: React.FC<AssetFormDialogProps> = ({
  open,
  onClose,
  asset,
  onSave,
  isLoading,
  error,
}) => {
  const [formData, setFormData] = useState<Partial<Asset>>(() => asset || {
    name: '',
    description: '',
    location: '',
    serial_number: '',
    status: 'operational',
    asset_type: 'equipment',
  });

  // Resetea el formulario cuando el asset cambia (para modo edición)
  useEffect(() => {
    setFormData(asset || {
      name: '',
      description: '',
      location: '',
      serial_number: '',
      status: 'operational',
      asset_type: 'equipment',
    });
  }, [asset]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [name]: e.target.value || null }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as any); // Type assertion for simplicity, handle actual types in parent
  };

  const statusOptions = [
    { value: 'operational', label: 'Operacional' },
    { value: 'under_maintenance', label: 'En Mantenimiento' },
    { value: 'retired', label: 'Retirado' },
    { value: 'critical', label: 'Crítico' },
  ];

  const assetTypeOptions = [
    { value: 'vehicle', label: 'Vehículo' },
    { value: 'machine', label: 'Máquina' },
    { value: 'building', label: 'Edificio' },
    { value: 'tool', label: 'Herramienta' },
    { value: 'equipment', label: 'Equipo General' },
    { value: 'other', label: 'Otro' },
  ];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{asset ? 'Editar Activo' : 'Crear Nuevo Activo'}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error">{(error as any).data?.detail || 'Error al guardar el activo.'}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            margin="dense"
            name="name"
            label="Nombre del Activo"
            type="text"
            fullWidth
            required
            value={formData.name || ''}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="description"
            label="Descripción"
            type="text"
            fullWidth
            multiline
            rows={3}
            value={formData.description || ''}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="location"
            label="Ubicación"
            type="text"
            fullWidth
            required
            value={formData.location || ''}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="serial_number"
            label="Número de Serie"
            type="text"
            fullWidth
            value={formData.serial_number || ''}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="purchase_date"
            label="Fecha de Compra"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={formData.purchase_date || ''}
            onChange={handleDateChange('purchase_date')}
          />
          <TextField
            margin="dense"
            name="status"
            label="Estado"
            select
            fullWidth
            required
            value={formData.status || 'operational'}
            onChange={handleChange}
          >
            {statusOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin="dense"
            name="asset_type"
            label="Tipo de Activo"
            select
            fullWidth
            required
            value={formData.asset_type || 'equipment'}
            onChange={handleChange}
          >
            {assetTypeOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin="dense"
            name="manufacturer"
            label="Fabricante"
            type="text"
            fullWidth
            value={formData.manufacturer || ''}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="model"
            label="Modelo"
            type="text"
            fullWidth
            value={formData.model || ''}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="warranty_end_date"
            label="Fin de Garantía"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={formData.warranty_end_date || ''}
            onChange={handleDateChange('warranty_end_date')}
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

function AssetListPage() {
  const { data: assets, isLoading, isError, error } = useGetAssetsQuery();
  const [createAsset, { isLoading: isCreating, error: createError }] = useCreateAssetMutation();
  const [updateAsset, { isLoading: isUpdating, error: updateError }] = useUpdateAssetMutation();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [deleteAsset, { isLoading: isDeleting, error: deleteError }] = useDeleteAssetMutation();

  const { user } = useAppSelector((state) => state.auth);
  const canManageAssets = user?.role === 'admin' || user?.role === 'manager'; // Permisos según rol

  const [openForm, setOpenForm] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | undefined>(undefined);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [assetToDeleteId, setAssetToDeleteId] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setSelectedAsset(undefined);
    setOpenForm(true);
  };

  const handleOpenEdit = (asset: Asset) => {
    setSelectedAsset(asset);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedAsset(undefined);
  };

  const handleSaveAsset = async (assetData: Omit<Asset, 'id'> | (Partial<Asset> & { id: string })) => {
    try {
      if (selectedAsset) {
        // Es una edición
        await updateAsset({ id: selectedAsset.id, ...assetData }).unwrap();
      } else {
        // Es una creación
        await createAsset(assetData as Omit<Asset, 'id'>).unwrap();
      }
      handleCloseForm(); // Cierra el formulario al guardar exitosamente
    } catch (err) {
      console.error('Error al guardar el activo:', err);
      // Los errores se manejarán en el propio formulario AssetFormDialog
    }
  };

  const handleOpenDeleteConfirm = (id: string) => {
    setAssetToDeleteId(id);
    setOpenDeleteConfirm(true);
  };

  const handleCloseDeleteConfirm = () => {
    setOpenDeleteConfirm(false);
    setAssetToDeleteId(null);
  };

  const handleDeleteAsset = async () => {
    if (assetToDeleteId) {
      try {
        await deleteAsset(assetToDeleteId).unwrap();
        handleCloseDeleteConfirm();
      } catch (err) {
        console.error('Error al eliminar el activo:', err);
      }
    }
  };


  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Cargando activos...</Typography>
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error al cargar los activos: {(error as any)?.data?.detail || 'Error desconocido.'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Gestión de Activos
      </Typography>
      {canManageAssets && (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ mb: 2 }}
          onClick={handleOpenCreate}
        >
          Crear Nuevo Activo
        </Button>
      )}

      {assets && assets.length > 0 ? (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Ubicación</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Número de Serie</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assets.map((asset) => (
                <TableRow key={asset.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell component="th" scope="row">
                    {asset.name}
                  </TableCell>
                  <TableCell>{asset.location}</TableCell>
                  <TableCell>{asset.status}</TableCell>
                  <TableCell>{asset.asset_type}</TableCell>
                  <TableCell>{asset.serial_number || 'N/A'}</TableCell>
                  <TableCell align="right">
                    {canManageAssets && (
                      <>
                        <IconButton
                          aria-label="edit"
                          onClick={() => handleOpenEdit(asset)}
                          size="small"
                        >
                          <EditIcon fontSize="inherit" />
                        </IconButton>
                        <IconButton
                          aria-label="delete"
                          onClick={() => handleOpenDeleteConfirm(asset.id)}
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
        <Typography variant="body1">No hay activos registrados. {canManageAssets && '¡Crea uno!'}</Typography>
      )}

      <AssetFormDialog
        open={openForm}
        onClose={handleCloseForm}
        asset={selectedAsset}
        onSave={handleSaveAsset}
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
            ¿Estás seguro de que quieres eliminar este activo? Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm} disabled={isDeleting}>Cancelar</Button>
          <Button onClick={handleDeleteAsset} color="error" variant="contained" disabled={isDeleting} autoFocus>
            {isDeleting ? <CircularProgress size={24} /> : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AssetListPage;