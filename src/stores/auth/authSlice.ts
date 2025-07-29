import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { type User } from '../../types/models'

// Define el tipo para el estado de autenticación
interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

// Estado inicial
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('authToken'),
  isAuthenticated: !!localStorage.getItem('authToken'),
  isLoading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Cuando se inicial el login
    loginStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    // Cuando el login es exitoso
    loginSuccess: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.isLoading = false
      state.isAuthenticated = true
      state.user = action.payload.user
      state.token = action.payload.token
      localStorage.setItem('authToken', action.payload.token)
    },
    // Cuando el login falla
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
      state.isAuthenticated = false
      state.user = null
      state.token = null
      localStorage.removeItem('authToken')
    },
    // Cuando el usuario cierra sesión
    logout: (state) => {
      state.isAuthenticated = false
      state.user = null
      state.token = null
      state.isLoading = false
      state.error = null
      localStorage.removeItem('authToken')
    },
    // Para actualizar el usuario si es necesario (Ej. cambio de perfil)
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
    },
  },
  // Extra reducers para manejar acciones de RTK Query si fuera necesario,
  // pero para la autenticación, los reducers directos suelen ser suficientes.
})

export const { loginStart, loginSuccess, loginFailure, logout, setUser } =
  authSlice.actions

export default authSlice.reducer
