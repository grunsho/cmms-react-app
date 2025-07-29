/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react'
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
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import {
  useGetWorkOrdersQuery,
  useCreateWorkOrderMutation,
  useUpdateWorkOrderMutation,
  useDeleteWorkOrderMutation,
  useGetTechniciansQuery,
} from '../services/workOrdersApi'
import { useGetAssetsQuery } from '../services/assetsApi' // Para obtener la lista de activos
import { type WorkOrder, type Asset, type User } from '../types/models'
import { useAppSelector } from '../hooks/reduxHooks'

// Componente para el formulario de creación/edición de Órdenes de Trabajo
interface WorkOrderFormDialogProps {
  open: boolean
  onClose: () => void
  workOrder?: WorkOrder // Si se proporciona, es para editar
  onSave: (
    workOrder:
      | Omit<WorkOrder, 'id' | 'asset_name' | 'assigned_to_username'>
      | (Partial<WorkOrder> & { id: string })
  ) => void
  isLoading: boolean
  error: any
  assets: Asset[] // Lista de activos para el selector
  technicians: User[] // Lista de técnicos para el selector
}

const WorkOrderFormDialog: React.FC<WorkOrderFormDialogProps> = ({
  open,
  onClose,
  workOrder,
  onSave,
  isLoading,
  error,
  assets,
  technicians,
}) => {
  const [formData, setFormData] = useState<Partial<WorkOrder>>(
    () =>
      workOrder || {
        title: '',
        description: '',
        asset: '', // Debe ser el ID del activo
        assigned_to: '', // Debe ser el ID del usuario
        status: 'open',
        priority: 'medium',
        due_date: '',
        completed_at: '',
      }
  )

  useEffect(() => {
    setFormData(
      workOrder || {
        title: '',
        description: '',
        asset: '',
        assigned_to: '',
        status: 'open',
        priority: 'medium',
        due_date: '',
        completed_at: '',
      }
    )
  }, [workOrder])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDateChange =
    (name: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [name]: e.target.value || null }))
    }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData as any)
  }

  const statusOptions = [
    { value: 'open', label: 'Abierta' },
    { value: 'in_progress', label: 'En Progreso' },
    { value: 'on_hold', label: 'En Espera' },
    { value: 'completed', label: 'Completada' },
    { value: 'cancelled', label: 'Cancelada' },
  ]

  const priorityOptions = [
    { value: 'low', label: 'Baja' },
    { value: 'medium', label: 'Media' },
    { value: 'high', label: 'Alta' },
    { value: 'urgent', label: 'Urgente' },
  ]

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
      <DialogTitle>
        {workOrder ? 'Editar Orden de Trabajo' : 'Crear Nueva Orden de Trabajo'}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity='error'>
            {(error as any).data?.detail ||
              'Error al guardar la orden de trabajo.'}
          </Alert>
        )}
        <Box component='form' onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            margin='dense'
            name='title'
            label='Título'
            type='text'
            fullWidth
            required
            value={formData.title || ''}
            onChange={handleChange}
          />
          <TextField
            margin='dense'
            name='description'
            label='Descripción'
            type='text'
            fullWidth
            multiline
            rows={3}
            value={formData.description || ''}
            onChange={handleChange}
          />
          <TextField
            margin='dense'
            name='asset'
            label='Activo Asociado'
            select
            fullWidth
            required
            value={formData.asset || ''}
            onChange={handleChange}
          >
            {assets.map((asset) => (
              <MenuItem key={asset.id} value={asset.id}>
                {asset.name} ({asset.location})
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin='dense'
            name='assigned_to'
            label='Asignado a'
            select
            fullWidth
            value={formData.assigned_to || ''}
            onChange={handleChange}
            // Permite deseleccionar (asignar a null)
            SelectProps={{
              displayEmpty: true,
              renderValue: (selected) => {
                if (selected === '') {
                  return <em>Sin asignar</em>
                }
                const selectedUser = technicians.find(
                  (tech) => tech.id === selected
                )
                return selectedUser ? selectedUser.username : ''
              },
            }}
          >
            <MenuItem value=''>
              <em>Sin asignar</em>
            </MenuItem>
            {technicians.map((tech) => (
              <MenuItem key={tech.id} value={tech.id}>
                {tech.username} ({tech.role})
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin='dense'
            name='status'
            label='Estado'
            select
            fullWidth
            required
            value={formData.status || 'open'}
            onChange={handleChange}
          >
            {statusOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin='dense'
            name='priority'
            label='Prioridad'
            select
            fullWidth
            required
            value={formData.priority || 'medium'}
            onChange={handleChange}
          >
            {priorityOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin='dense'
            name='due_date'
            label='Fecha de Vencimiento'
            type='date'
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={formData.due_date || ''}
            onChange={handleDateChange('due_date')}
          />
          {formData.status === 'completed' && (
            <TextField
              margin='dense'
              name='completed_at'
              label='Fecha de Completado'
              type='datetime-local'
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={
                formData.completed_at
                  ? new Date(formData.completed_at).toISOString().slice(0, 16)
                  : ''
              }
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  completed_at: e.target.value
                    ? new Date(e.target.value).toISOString()
                    : undefined,
                }))
              }
            />
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading} variant='contained'>
          {isLoading ? <CircularProgress size={24} /> : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

function WorkOrderListPage() {
  const {
    data: workOrders,
    isLoading,
    isError,
    error,
  } = useGetWorkOrdersQuery()
  const {
    data: assets,
    isLoading: assetsLoading,
    isError: assetsError,
  } = useGetAssetsQuery()
  const {
    data: technicians,
    isLoading: techniciansLoading,
    isError: techniciansError,
  } = useGetTechniciansQuery()

  const [createWorkOrder, { isLoading: isCreating, error: createError }] =
    useCreateWorkOrderMutation()
  const [updateWorkOrder, { isLoading: isUpdating, error: updateError }] =
    useUpdateWorkOrderMutation()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [deleteWorkOrder, { isLoading: isDeleting, error: deleteError }] =
    useDeleteWorkOrderMutation()

  const { user } = useAppSelector((state) => state.auth)
  const canManageWorkOrders = user?.role === 'admin' || user?.role === 'manager'
  const canEditWorkOrder = (order: WorkOrder) =>
    canManageWorkOrders ||
    (user?.role === 'technician' && order.assigned_to === user?.id)

  const [openForm, setOpenForm] = useState(false)
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<
    WorkOrder | undefined
  >(undefined)
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false)
  const [workOrderToDeleteId, setWorkOrderToDeleteId] = useState<string | null>(
    null
  )

  const handleOpenCreate = () => {
    setSelectedWorkOrder(undefined)
    setOpenForm(true)
  }

  const handleOpenEdit = (order: WorkOrder) => {
    setSelectedWorkOrder(order)
    setOpenForm(true)
  }

  const handleCloseForm = () => {
    setOpenForm(false)
    setSelectedWorkOrder(undefined)
  }

  const handleSaveWorkOrder = async (
    workOrderData:
      | Omit<WorkOrder, 'id' | 'asset_name' | 'assigned_to_username'>
      | (Partial<WorkOrder> & { id: string })
  ) => {
    try {
      if (selectedWorkOrder) {
        await updateWorkOrder({
          id: selectedWorkOrder.id,
          ...workOrderData,
        }).unwrap()
      } else {
        await createWorkOrder(
          workOrderData as Omit<
            WorkOrder,
            'id' | 'asset_name' | 'assigned_to_username'
          >
        ).unwrap()
      }
      handleCloseForm()
    } catch (err) {
      console.error('Error al guardar la orden de trabajo:', err)
    }
  }

  const handleOpenDeleteConfirm = (id: string) => {
    setWorkOrderToDeleteId(id)
    setOpenDeleteConfirm(true)
  }

  const handleCloseDeleteConfirm = () => {
    setOpenDeleteConfirm(false)
    setWorkOrderToDeleteId(null)
  }

  const handleDeleteWorkOrder = async () => {
    if (workOrderToDeleteId) {
      try {
        await deleteWorkOrder(workOrderToDeleteId).unwrap()
        handleCloseDeleteConfirm()
      } catch (err) {
        console.error('Error al eliminar la orden de trabajo:', err)
      }
    }
  }

  if (isLoading || assetsLoading || techniciansLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '80vh',
        }}
      >
        <CircularProgress />
        <Typography variant='h6' sx={{ ml: 2 }}>
          Cargando órdenes de trabajo...
        </Typography>
      </Box>
    )
  }

  if (isError || assetsError || techniciansError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity='error'>
          Error al cargar datos:{' '}
          {(error as any)?.data?.detail ||
            (assetsError as any)?.data?.detail ||
            (techniciansError as any)?.data?.detail ||
            'Error desconocido.'}
        </Alert>
      </Box>
    )
  }

  // Asegúrate de que assets y technicians no sean undefined antes de pasarlos al formulario
  const availableAssets = assets || []
  const availableTechnicians = technicians || []

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant='h4' component='h1' gutterBottom>
        Gestión de Órdenes de Trabajo
      </Typography>
      {canManageWorkOrders && (
        <Button
          variant='contained'
          startIcon={<AddIcon />}
          sx={{ mb: 2 }}
          onClick={handleOpenCreate}
        >
          Crear Nueva Orden
        </Button>
      )}

      {workOrders && workOrders.length > 0 ? (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label='work orders table'>
            <TableHead>
              <TableRow>
                <TableCell>Título</TableCell>
                <TableCell>Activo</TableCell>
                <TableCell>Asignado a</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Prioridad</TableCell>
                <TableCell>Fecha Vencimiento</TableCell>
                <TableCell align='right'>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {workOrders.map((order) => (
                <TableRow
                  key={order.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component='th' scope='row'>
                    {order.title}
                  </TableCell>
                  <TableCell>{order.asset_name}</TableCell>
                  <TableCell>
                    {order.assigned_to_username || 'Sin asignar'}
                  </TableCell>
                  <TableCell>{order.status}</TableCell>
                  <TableCell>{order.priority}</TableCell>
                  <TableCell>{order.due_date || 'N/A'}</TableCell>
                  <TableCell align='right'>
                    {canEditWorkOrder(order) && (
                      <IconButton
                        aria-label='edit'
                        onClick={() => handleOpenEdit(order)}
                        size='small'
                      >
                        <EditIcon fontSize='inherit' />
                      </IconButton>
                    )}
                    {canManageWorkOrders && ( // Solo admin/manager puede eliminar
                      <IconButton
                        aria-label='delete'
                        onClick={() => handleOpenDeleteConfirm(order.id)}
                        size='small'
                      >
                        <DeleteIcon fontSize='inherit' />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant='body1'>
          No hay órdenes de trabajo registradas.{' '}
          {canManageWorkOrders && '¡Crea una!'}
        </Typography>
      )}

      <WorkOrderFormDialog
        open={openForm}
        onClose={handleCloseForm}
        workOrder={selectedWorkOrder}
        onSave={handleSaveWorkOrder}
        isLoading={isCreating || isUpdating}
        error={createError || updateError}
        assets={availableAssets}
        technicians={availableTechnicians}
      />

      <Dialog
        open={openDeleteConfirm}
        onClose={handleCloseDeleteConfirm}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogTitle id='alert-dialog-title'>
          {'Confirmar Eliminación'}
        </DialogTitle>
        <DialogContent>
          <Typography id='alert-dialog-description'>
            ¿Estás seguro de que quieres eliminar esta orden de trabajo? Esta
            acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteWorkOrder}
            color='error'
            variant='contained'
            disabled={isDeleting}
            autoFocus
          >
            {isDeleting ? <CircularProgress size={24} /> : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default WorkOrderListPage
