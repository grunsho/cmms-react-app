/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/partsApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { type Part } from '../types/models';

const DJANGO_API_BASE_URL = 'http://127.0.0.1:8000/api/v1/';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type PartsTag = { type: 'Parts'; id?: string };

export const partsApi = createApi({
  reducerPath: 'partsApi',
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
  tagTypes: ['Parts'],
  endpoints: (builder) => ({
    getParts: builder.query<Part[], void>({
      query: () => 'parts/',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Parts' as const, id })),
              { type: 'Parts', id: 'LIST' },
            ]
          : [{ type: 'Parts', id: 'LIST' }],
    }),
    getPartById: builder.query<Part, string>({
      query: (id) => `parts/${id}/`,
      providesTags: (_result, _error, id) => [{ type: 'Parts', id }],
    }),
    createPart: builder.mutation<Part, Omit<Part, 'id' | 'created_at' | 'updated_at'>>({
      query: (newPart) => ({
        url: 'parts/',
        method: 'POST',
        body: newPart,
      }),
      invalidatesTags: [{ type: 'Parts', id: 'LIST' }],
    }),
    updatePart: builder.mutation<Part, Partial<Part> & { id: string }>({
      query: ({ id, ...patch }) => ({
        url: `parts/${id}/`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Parts', id }],
    }),
    deletePart: builder.mutation<void, string>({
      query: (id) => ({
        url: `parts/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Parts', id }, { type: 'Parts', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetPartsQuery,
  useGetPartByIdQuery,
  useCreatePartMutation,
  useUpdatePartMutation,
  useDeletePartMutation,
} = partsApi;