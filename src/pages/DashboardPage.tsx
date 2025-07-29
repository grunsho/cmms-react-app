import {
  Box,
  Button,
  Typography,
  Container,
  AppBar,
  Toolbar,
} from '@mui/material'
import { useAppSelector } from '../hooks/reduxHooks'
import { useLogoutMutation } from '../services/authApi'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

function DashboardPage() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)
  const [logout] = useLogoutMutation()
  const navigate = useNavigate()

  // Redirige al login si no está autenticado (ej. si el token expira o es inválido)
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  const handleLogout = async () => {
    await logout() // Llama a la mutación de logout de RTK Query
    // La redirección ocurrirá en el useEffect de arriba
  }

  // Asegúrate de que el usuario esté autenticado antes de renderizar el contenido
  if (!isAuthenticated) {
    return null // O un spinner mientras redirige
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position='static'>
        <Toolbar>
          <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
            CMMS Dashboard
          </Typography>
          {user && (
            <Typography variant='body1' color='inherit' sx={{ mr: 2 }}>
              Bienvenido, {user.first_name || user.username} (Rol:
              {user.role})
            </Typography>
          )}
          <Button color='inherit' onClick={handleLogout}>
            Cerrar Sesión
          </Button>
        </Toolbar>
      </AppBar>

      <Container component='main' maxWidth='md' sx={{ mt: 4, mb: 4 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: 3,
            boxShadow: 3,
            borderRadius: 2,
            bgcolor: 'background.paper',
          }}
        >
          <Typography component='h1' variant='h4' gutterBottom>
            Vista General del CMMS
          </Typography>
          <Typography variant='body1' paragraph>
            Aquí es donde comenzarás a ver el resumen de tus activos y órdenes
            de trabajo.
          </Typography>
          {/* Aquí es donde añadiríamos los widgets del dashboard */}
        </Box>
      </Container>
    </Box>
  )
}

export default DashboardPage
