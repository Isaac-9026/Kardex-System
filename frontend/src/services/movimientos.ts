import api from './api'
import type { Movimiento } from '../types'

export const uploadMovimientos = async (file: File): Promise<{ mensaje: string; total: number }> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post('/movimientos/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export const getMovimientos = async (codigo?: string): Promise<Movimiento[]> => {
  const params = codigo ? { codigo } : {}
  const response = await api.get('/movimientos', { params })
  return response.data
}