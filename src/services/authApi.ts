/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/authApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { loginFailure, loginStart, loginSuccess, logout } from '../stores/auth/authSlice';
import { type User } from '../types/models'; // Importa la interfaz User

// Define la URL base de tu backend Django
const DJANGO_API_BASE_URL = 'http://127.0.0.1:8000/api/v1/';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: DJANGO_API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth.token;
      if (token) {
        // Asegúrate de que el formato sea 'Token <token>' para Django TokenAuthentication
        headers.set('Authorization', `Token ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    login: builder.mutation<
      { auth_token: string }, // Djoser solo devuelve auth_token en el login
      { username: string; password: string }
    >({
      query: (credentials) => ({
        url: 'auth/token/login/',
        method: 'POST',
        body: credentials,
      }),
      // Usamos onQueryStarted para manejar el flujo asíncrono después de la mutación
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        dispatch(loginStart()); // Indica que el login ha comenzado
        try {
          const { data } = await queryFulfilled; // Espera a que la llamada de login termine
          const { auth_token } = data;

          // *** CAMBIO CLAVE AQUÍ ***
          // Despacha loginSuccess con el token inmediatamente.
          // Esto actualiza el estado de Redux y localStorage ANTES de la siguiente llamada.
          // Pasamos un usuario temporal, ya que el usuario real lo obtendremos en el siguiente paso.
          dispatch(loginSuccess({ user: { id: '', username: _args.username, email: '', role: 'requester' }, token: auth_token }));

          // Ahora, inicia la llamada para obtener el perfil del usuario.
          // El prepareHeaders de esta llamada ahora debería tener acceso al token recién guardado.
          const userProfile = await dispatch(
            authApi.endpoints.getUserProfile.initiate(undefined, {
              forceRefetch: true, // Asegura que se haga una nueva petición
            })
          ).unwrap();

          // Si todo va bien, actualiza el estado con el usuario completo y el token
          dispatch(loginSuccess({ user: userProfile, token: auth_token }));

        } catch (error: any) {
          console.error('Fallo en el login:', error);
          // Extrae el mensaje de error de la respuesta de Django
          const errorMessage = error?.data?.non_field_errors?.[0] || error?.data?.detail || 'Credenciales inválidas.';
          dispatch(loginFailure(errorMessage));
        }
      },
    }),

    // Endpoint para obtener el perfil del usuario autenticado
    getUserProfile: builder.query<User, void>({
      query: () => 'auth/users/me/',
    }),

    // Endpoint para el logout
    logout: builder.mutation<void, void>({
      query: () => ({
        url: 'auth/token/logout/',
        method: 'POST',
      }),
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(logout());
        } catch (error) {
          console.error('Fallo en el logout en el servidor, pero limpiando estado local:', error);
          dispatch(logout()); // Limpia el estado local incluso si el servidor falla
        }
      },
    }),

    // Opcional: Endpoint para el registro de usuario (si lo implementamos)
    register: builder.mutation<User, Omit<User, 'id' | 'is_active'>>({
      query: (userData) => ({
        url: 'auth/users/',
        method: 'POST',
        body: userData,
      }),
    }),
  }),
});

export const { useLoginMutation, useLogoutMutation, useGetUserProfileQuery, useRegisterMutation } = authApi;