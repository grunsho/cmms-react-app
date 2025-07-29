// src/hooks/reduxHooks.ts
import { type TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '../stores/store'

// Usa estos hooks a lo largo de tu aplicación en lugar de los predeterminados `useDispatch` y `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
