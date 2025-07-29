/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { type WorkOrder, type User } from '../types/models'; // Importa WorkOrder y User

const DJANGO_API_BASE_URL = 'http://127.0.0.1:8000/api/v1/';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type WorkOrdersTag = { type: 'WorkOrders'; id?: string };

export const workOrdersApi = createApi({
  reducerPath: 'workOrdersApi',
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
  tagTypes: ['WorkOrders', 'Users'], // Añade 'Users' si necesitas invalidar la lista de usuarios
  endpoints: (builder) => ({
    // Obtener todas las órdenes de trabajo
    getWorkOrders: builder.query<WorkOrder[], void>({
      query: () => 'work-orders/',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'WorkOrders' as const, id })),
              { type: 'WorkOrders', id: 'LIST' },
            ]
          : [{ type: 'WorkOrders', id: 'LIST' }],
    }),

    // Obtener una orden de trabajo por ID
    getWorkOrderById: builder.query<WorkOrder, string>({
      query: (id) => `work-orders/${id}/`,
      providesTags: (_result, _error, id) => [{ type: 'WorkOrders', id }],
    }),

    // Crear una nueva orden de trabajo
    createWorkOrder: builder.mutation<WorkOrder, Omit<WorkOrder, 'id' | 'asset_name' | 'assigned_to_username'>>({
      query: (newWorkOrder) => ({
        url: 'work-orders/',
        method: 'POST',
        body: newWorkOrder,
      }),
      invalidatesTags: [{ type: 'WorkOrders', id: 'LIST' }],
    }),

    // Actualizar una orden de trabajo existente
    updateWorkOrder: builder.mutation<WorkOrder, Partial<WorkOrder> & { id: string }>({
      query: ({ id, ...patch }) => ({
        url: `work-orders/${id}/`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'WorkOrders', id }],
    }),

    // Eliminar una orden de trabajo
    deleteWorkOrder: builder.mutation<void, string>({
      query: (id) => ({
        url: `work-orders/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'WorkOrders', id }, { type: 'WorkOrders', id: 'LIST' }],
    }),

    // Opcional: Obtener usuarios (especialmente técnicos) para el selector "Asignado a"
    getTechnicians: builder.query<User[], void>({
      query: () => 'auth/users/', // Asume que djoser.urls.users te da todos los usuarios
      // Puedes añadir un transformResponse para filtrar por rol si la API lo permite,
      // o filtrar en el componente.
      transformResponse: (response: User[]) => {
        return response.filter(user => user.role === 'technician' || user.role === 'admin' || user.role === 'manager');
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Users' as const, id })),
              { type: 'Users', id: 'LIST' },
            ]
          : [{ type: 'Users', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetWorkOrdersQuery,
  useGetWorkOrderByIdQuery,
  useCreateWorkOrderMutation,
  useUpdateWorkOrderMutation,
  useDeleteWorkOrderMutation,
  useGetTechniciansQuery, // Exporta el hook para obtener técnicos
} = workOrdersApi;