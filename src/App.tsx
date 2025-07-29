import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import AssetListPage from './pages/AssetListPage'
import MainLayout from './layouts/MainLayout' // Importa el MainLayout
import { useAppSelector, useAppDispatch } from './hooks/reduxHooks'
import { Box, CircularProgress, Typography } from '@mui/material'
import { useGetUserProfileQuery } from './services/authApi'
import { useEffect } from 'react'
import { logout, loginSuccess } from './stores/auth/authSlice'

// Componente para proteger rutas (sin cambios aquí, sigue siendo el protector)
const ProtectedRoute = () => {
  const dispatch = useAppDispatch()
  const { isAuthenticated, token } = useAppSelector((state) => state.auth)

  const {
    data: userProfile,
    isLoading: isVerifyingToken,
    isError,
    error,
  } = useGetUserProfileQuery(undefined, {
    skip: !token || isAuthenticated,
  })

  useEffect(() => {
    if (token && !isAuthenticated && !isVerifyingToken) {
      if (userProfile) {
        dispatch(loginSuccess({ user: userProfile, token: token }))
      } else if (isError) {
        console.error('Token verification failed:', error)
        dispatch(logout())
      }
    }
  }, [
    token,
    isAuthenticated,
    isVerifyingToken,
    userProfile,
    isError,
    error,
    dispatch,
  ])

  if (isVerifyingToken || (token && !isAuthenticated && !isError)) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  return isAuthenticated ? <Outlet /> : <Navigate to='/login' replace />
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/login' element={<LoginPage />} />

        {/* Todas las rutas protegidas se anidan dentro de ProtectedRoute y luego dentro de MainLayout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            {' '}
            {/* MainLayout envuelve las rutas internas */}
            <Route path='/dashboard' element={<DashboardPage />} />
            {/* Rutas Placeholder para futuras secciones */}
            <Route
              path='/assets'
              element={<AssetListPage />}
            />
            <Route
              path='/work-orders'
              element={<Typography variant='h4'>Órdenes de Trabajo</Typography>}
            />
            <Route
              path='/inventory'
              element={<Typography variant='h4'>Inventario</Typography>}
            />
            <Route
              path='/users'
              element={
                <Typography variant='h4'>Administración de Usuarios</Typography>
              }
            />
            <Route
              path='/settings'
              element={<Typography variant='h4'>Configuración</Typography>}
            />
            <Route path='/' element={<Navigate to='/dashboard' replace />} />
          </Route>
        </Route>
        {/* Cualquier otra ruta no definida, redirige al login */}
        <Route path='*' element={<Navigate to='/login' replace />} />
      </Routes>
    </Router>
  )
}

export default App
