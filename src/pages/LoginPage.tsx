/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import { useLoginMutation } from '../services/authApi'
import { useAppSelector } from '../hooks/reduxHooks'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  TextField,
  Typography,
} from '@mui/material'

function LoginPage() {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('password')

  // useLoginMutation nos devuelve la función para activar la mutación,
  // y un objeto con el estado de la mutación (isLoading, error, isSuccess)
  const [login, { isLoading, error, isSuccess }] = useLoginMutation()

  const { isAuthenticated } = useAppSelector((state) => state.auth)
  const navigate = useNavigate()

  // useEffect para manejar la redirección después del login exitoso
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (username && password) {
      try {
        // Llama a la mutación de login. .unwrap() para manejar errores si la promesa falla.
        await login({ username, password }).unwrap()
        // El loginSuccess action se despachará dentro de onQueryStarted en authApi.ts
        // y eso actualizará isAuthenticated, lo que disparará el useEffect de arriba.
      } catch (err) {
        console.error('Failed to login: ', err)
        // El error ya está en el estado 'error' de la mutación.
      }
    }
  }

  // Extrae el mensaje de error de la respuesta de Django
  const errorMessage = error
    ? (error as any).data?.detail || (error as any).error
    : null

  return (
    <Container component='main' maxWidth='xs'>
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 3,
          boxShadow: 3,
          borderRadius: 2,
          bgcolor: 'background.paper',
        }}
      >
        <Typography component='h1' variant='h5'>
          Iniciar Sesión
        </Typography>
        <Box component='form' onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin='normal'
            required
            fullWidth
            id='username'
            label='Nombre de Usuario'
            name='username'
            autoComplete='username'
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            margin='normal'
            required
            fullWidth
            id='password'
            label='Contraseña'
            name='password'
            autoComplete='current-password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type='submit'
            fullWidth
            variant='contained'
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Entrar'}
          </Button>
          {errorMessage && <Alert severity='error'>{errorMessage}</Alert>}
          {isSuccess && (
            <Alert severity='success'>¡Sesión iniciada correctamente!</Alert>
          )}
        </Box>
        <Typography variant='body2' color='text.secondary' sx={{ mt: 2 }}>
          Prueba con usuario: `admin` / `password` o `technician` / `password`.
        </Typography>
      </Box>
    </Container>
  )
}

export default LoginPage
