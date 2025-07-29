// src/stores/store.ts
import { configureStore } from '@reduxjs/toolkit'
import authReducer from './auth/authSlice'
import { authApi } from '../services/authApi'
import { assetsApi } from '../services/assetsApi'
import { workOrdersApi } from '../services/workOrdersApi'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [assetsApi.reducerPath]: assetsApi.reducer,
    [workOrdersApi.reducerPath]: workOrdersApi.reducer,
  },
  // Añade el middleware de la API para habilitar caching, invalidación, etc.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
  .concat(authApi.middleware)
  .concat(assetsApi.middleware)
  .concat(workOrdersApi.middleware),
  devTools: process.env.NODE_ENV !== 'production',
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
