/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/usersApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { type User } from '../types/models'; // Importa la interfaz User

const DJANGO_API_BASE_URL = 'http://127.0.0.1:8000/api/v1/admin/';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type UserTag = { type: 'Users'; id?: string };

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: DJANGO_API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth.token;
      if (token) {
        headers.set('Authorization', `Token ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Users'], // Tag para invalidación de caché
  endpoints: (builder) => ({
    // Obtener todos los usuarios (solo Admin)
    getUsers: builder.query<User[], void>({
      query: () => 'users/',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Users' as const, id })),
              { type: 'Users', id: 'LIST' },
            ]
          : [{ type: 'Users', id: 'LIST' }],
    }),

    // Obtener un usuario por ID (solo Admin)
    getUserById: builder.query<User, string>({
      query: (id) => `users/${id}/`,
      providesTags: (_result, _error, id) => [{ type: 'Users', id }],
    }),

    // Crear un nuevo usuario (solo Admin)
    // Nota: Djoser permite registrar usuarios en /auth/users/ (sin token para roles como requester).
    // Esta es para que el admin cree usuarios con rol específico.
    createUser: builder.mutation<User, Omit<User, 'id' | 'last_login' | 'date_joined'>>({
      query: (newUser) => ({
        url: 'users/',
        method: 'POST',
        body: newUser,
      }),
      invalidatesTags: [{ type: 'Users', id: 'LIST' }],
    }),

    // Actualizar un usuario existente (solo Admin)
    updateUser: builder.mutation<User, Partial<User> & { id: string }>({
      query: ({ id, ...patch }) => ({
        url: `users/${id}/`,
        method: 'PATCH', // Usamos PATCH para actualizaciones parciales
        body: patch,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Users', id }],
    }),

    // Eliminar un usuario (solo Admin)
    deleteUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `users/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Users', id }, { type: 'Users', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = usersApi;