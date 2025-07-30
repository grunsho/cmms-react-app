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

// Nueva interfaz para los campos del formulario de usuario, incluyendo la contraseña
export interface UserFormFields extends Omit<User, 'id' | 'last_login' | 'date_joined' | 'is_staff'> {
  password?: string; // La contraseña es opcional porque no siempre se envía (ej. al editar y no cambiarla)
  // Omitimos is_staff porque es un campo de solo lectura del backend, no se edita directamente por rol
}

export interface Asset {
  id: string
  name: string
  description?: string
  location: string
  serial_number?: string
  purchase_date?: string // YYYY-MM-DD
  last_maintenance_date?: string // YYYY-MM-DD
  next_maintenance_date?: string // YYYY-MM-DD
  status: 'operational' | 'under_maintenance' | 'retired' | 'critical'
  asset_type:
    | 'vehicle'
    | 'machine'
    | 'building'
    | 'tool'
    | 'equipment'
    | 'other'
  manufacturer?: string
  model?: string
  warranty_end_date?: string // YYYY-MM-DD
  created_at?: string
  updated_at?: string
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
  description?: string
  asset: string // ID del activo
  asset_name?: string // Nombre del activo (solo lectura, para mostrar)
  assigned_to?: string // ID del usuario asignado (puede ser null)
  assigned_to_username?: string // Nombre de usuario asignado (solo lectura, para mostrar)
  status: 'open' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date?: string // YYYY-MM-DD
  completed_at?: string // ISO 8601 string
  created_at?: string
  updated_at?: string
}

export interface WorkOrderComment {
  id: string
  userId: string
  comment: string
  timestamp: string // ISO date string
}

export interface Part {
  id: string; // UUID
  name: string;
  sku?: string;
  description?: string;
  quantity: number;
  location?: string;
  unit_cost?: string; // Django DecimalField se traduce a string en JSON
  supplier?: string;
  reorder_point?: number;
  last_reordered_date?: string; // DateField como string 'YYYY-MM-DD'
  notes?: string;
  created_at?: string; // DateTimeField como string ISO
  updated_at?: string; // DateTimeField como string ISO
}

export interface WorkOrderPartUsed {
  partId: string
  quantity: number
  unitCostAtTimeOfUse?: number // Costo de la pieza al momento de usarla
}

// --- Interfaces para Datos de API (si es necesario un formato diferente) ---
// Puedes definir interfaces para los datos que recibes de la API si difieren de tus modelos internos.
// Por ahora, asumiremos que son los mismos.
