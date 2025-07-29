/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/assetsApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { type Asset } from '../types/models' // Asegúrate de importar la interfaz Asset

const DJANGO_API_BASE_URL = 'http://127.0.0.1:8000/api/v1/'

// Definimos un tag de caché para los activos, útil para invalidar y re-fetch
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type AssetsTag = { type: 'Assets'; id?: string }

export const assetsApi = createApi({
  reducerPath: 'assetsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: DJANGO_API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth.token
      if (token) {
        headers.set('Authorization', `Token ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['Assets'], // Define el tipo de tag para invalidación de caché
  endpoints: (builder) => ({
    // Obtener todos los activos
    getAssets: builder.query<Asset[], void>({
      query: () => 'assets/',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Assets' as const, id })),
              { type: 'Assets', id: 'LIST' }, // Tag para la lista completa
            ]
          : [{ type: 'Assets', id: 'LIST' }],
    }),

    // Obtener un activo por ID
    getAssetById: builder.query<Asset, string>({
      query: (id) => `assets/${id}/`,
      providesTags: (_result, _error, id) => [{ type: 'Assets', id }],
    }),

    // Crear un nuevo activo
    createAsset: builder.mutation<Asset, Omit<Asset, 'id'>>({
      query: (newAsset) => ({
        url: 'assets/',
        method: 'POST',
        body: newAsset,
      }),
      invalidatesTags: [{ type: 'Assets', id: 'LIST' }], // Invalida la lista de activos
    }),

    // Actualizar un activo existente
    updateAsset: builder.mutation<Asset, Partial<Asset> & { id: string }>({
      query: ({ id, ...patch }) => ({
        url: `assets/${id}/`,
        method: 'PATCH', // Usamos PATCH para actualizaciones parciales
        body: patch,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Assets', id }], // Invalida el activo específico
    }),

    // Eliminar un activo
    deleteAsset: builder.mutation<void, string>({
      query: (id) => ({
        url: `assets/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Assets', id },
        { type: 'Assets', id: 'LIST' },
      ], // Invalida el activo y la lista
    }),
  }),
})

export const {
  useGetAssetsQuery,
  useGetAssetByIdQuery,
  useCreateAssetMutation,
  useUpdateAssetMutation,
  useDeleteAssetMutation,
} = assetsApi
