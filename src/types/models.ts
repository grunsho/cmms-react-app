// --- Modelos básicos ---

export interface User {
  id: string
  username: string
  email: string
  first_name?: string
  last_name?: string
  role: 'admin' | 'manager' | 'technician' | 'requester'
  is_active?: boolean
  is_staff?: boolean
  fullName?: string
  profilePictureUrl?: string
}

export interface Asset {
  id: string
  name: string
  description?: string
  location: string
  serial_number?: string
  purchase_date?: string // ISO date string
  lastMaintenanceDate?: string // ISO date string
  nextMaintenanceDate?: string // ISO date string
  status: 'operational' | 'under_maintenance' | 'retired' | 'critical'
  asset_type: string // Ej. 'Vehículo', 'Máquina', 'Edificio'
  // Posibles propiedades adicionales
  manufacturer?: string
  model?: string
  warranty_end_date?: string // ISO date string
}

export type WorkOrderStatus =
  | 'pending'
  | 'assigned'
  | 'in_progress'
  | 'completed'
  | 'closed'
  | 'cancelled'
export type WorkOrderPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface WorkOrder {
  id: string
  title: string
  description: string
  assetId: string // ID del activo relacionado
  reportedByUserId: string // ID del usuario que reportó el problema
  assignedToUserId?: string // ID del técnico asignado (puede ser null)
  status: WorkOrderStatus
  priority: WorkOrderPriority
  createdAt: string // ISO date string
  dueDate: string // ISO date string
  completedAt?: string // ISO date string
  estimatedTimeHours?: number
  actualTimeHours?: number
  // Posibles propiedades adicionales
  comments?: WorkOrderComment[]
  partsUsed?: WorkOrderPartUsed[]
}

export interface WorkOrderComment {
  id: string
  userId: string
  comment: string
  timestamp: string // ISO date string
}

export interface Part {
  id: string
  name: string
  description?: string
  partNumber: string
  manufacturer?: string
  supplier?: string
  unitCost?: number
  currentStock: number
  minStockLevel?: number // Nivel mínimo para alerta de reorden
  location?: string // Ubicación en el almacén
}

export interface WorkOrderPartUsed {
  partId: string
  quantity: number
  unitCostAtTimeOfUse?: number // Costo de la pieza al momento de usarla
}

// --- Interfaces para Datos de API (si es necesario un formato diferente) ---
// Puedes definir interfaces para los datos que recibes de la API si difieren de tus modelos internos.
// Por ahora, asumiremos que son los mismos.
