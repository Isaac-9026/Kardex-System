import api from './api'
import type { KardexResponse, FiltroFecha } from '../types'

export const getKardex = async (
  codigo: string,
  filtro?: FiltroFecha
): Promise<KardexResponse> => {
  const params: Record<string, string | number> = {}

  if (filtro) {
    if (filtro.modo === 'anio_mes') {
      if (filtro.anio) params.anio = filtro.anio
      if (filtro.mes)  params.mes  = filtro.mes
    } else if (filtro.modo === 'exacta' && filtro.fecha_exacta) {
      params.fecha_exacta = filtro.fecha_exacta
    } else if (filtro.modo === 'rango') {
      if (filtro.fecha_desde) params.fecha_desde = filtro.fecha_desde
      if (filtro.fecha_hasta) params.fecha_hasta = filtro.fecha_hasta
    }
  }

  const response = await api.get(`/kardex/${codigo}`, { params })
  return response.data
}

export const exportKardex = async (
  codigo: string,
  filtro?: FiltroFecha
): Promise<void> => {
  const params: Record<string, string | number> = {}

  if (filtro) {
    if (filtro.modo === 'anio_mes') {
      if (filtro.anio) params.anio = filtro.anio
      if (filtro.mes)  params.mes  = filtro.mes
    } else if (filtro.modo === 'exacta' && filtro.fecha_exacta) {
      params.fecha_exacta = filtro.fecha_exacta
    } else if (filtro.modo === 'rango') {
      if (filtro.fecha_desde) params.fecha_desde = filtro.fecha_desde
      if (filtro.fecha_hasta) params.fecha_hasta = filtro.fecha_hasta
    }
  }

  const response = await api.get(`/kardex/${codigo}/export`, {
    params,
    responseType: 'blob',
  })

  // Descargar el archivo automáticamente
  const url    = window.URL.createObjectURL(new Blob([response.data]))
  const link   = document.createElement('a')
  link.href    = url
  link.setAttribute('download', `kardex_${codigo}.xlsx`)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

export const getArchivos = async () => {
  const response = await api.get('/archivos')
  return response.data
}