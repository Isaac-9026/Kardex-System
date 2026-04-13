// ── Formateo de números ───────────────────────────────────────────────────
export const formatCantidad = (valor: number): string => {
  return new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(valor)
}

export const formatCosto = (valor: number, decimales = 2): string => {
  return new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(valor)
}

export const formatMoneda = (valor: number): string => {
  return `S/ ${formatCosto(valor, 2)}`
}

export const formatCostoUnit = (valor: number): string => {
  return new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(valor)
}

// ── Formateo de fechas ────────────────────────────────────────────────────
export const formatFecha = (fecha: string): string => {
  if (!fecha) return ''
  const [year, month, day] = fecha.split('-')
  return `${day}/${month}/${year}`
}

export const fechaToInput = (fecha: string): string => {
  // Convierte dd/mm/yyyy → yyyy-mm-dd para inputs tipo date
  if (!fecha || !fecha.includes('/')) return fecha
  const [day, month, year] = fecha.split('/')
  return `${year}-${month}-${day}`
}

// ── Semáforo ──────────────────────────────────────────────────────────────
export type SemaforoTipo = '🟢' | '🟡' | '🔴' | '⚫'

export const getSemaforoColor = (semaforo: SemaforoTipo): string => {
  const colores: Record<SemaforoTipo, string> = {
    '🟢': 'bg-green-50 text-green-800',
    '🟡': 'bg-yellow-50 text-yellow-800',
    '🔴': 'bg-red-50 text-red-800',
    '⚫': 'bg-purple-50 text-purple-800',
  }
  return colores[semaforo] ?? ''
}

export const getSemaforoLabel = (semaforo: SemaforoTipo): string => {
  const labels: Record<SemaforoTipo, string> = {
    '🟢': 'Correcto',
    '🟡': 'Inconsistencia interna',
    '🔴': 'Posible alteracion',
    '⚫': 'Multiples problemas',
  }
  return labels[semaforo] ?? ''
}

// ── Calcular métricas desde los movimientos ───────────────────────────────
import type { KardexRow, Metricas } from '../types'

export const calcularMetricas = (movimientos: KardexRow[]): Metricas => {
  if (movimientos.length === 0) {
    return {
      total_ent_cantidad: 0,
      total_ent_costo: 0,
      total_sal_cantidad: 0,
      total_sal_costo: 0,
      saldo_final_cantidad: 0,
      saldo_final_costo: 0,
    }
  }

  const ultima = movimientos[movimientos.length - 1]

  return {
    total_ent_cantidad: movimientos.reduce((acc, r) => acc + r.ent_cantidad, 0),
    total_ent_costo:    movimientos.reduce((acc, r) => acc + r.ent_costo_total, 0),
    total_sal_cantidad: movimientos.reduce((acc, r) => acc + r.sal_cantidad, 0),
    total_sal_costo:    movimientos.reduce((acc, r) => acc + r.sal_costo_total, 0),
    saldo_final_cantidad: ultima.saldo_cantidad,
    saldo_final_costo:    ultima.saldo_costo_total,
  }
}

// ── Clases CSS condicionales ──────────────────────────────────────────────
export const cn = (...classes: (string | undefined | false | null)[]): string => {
  return classes.filter(Boolean).join(' ')
}

// ── Validaciones ──────────────────────────────────────────────────────────
export const esArchivoExcel = (file: File): boolean => {
  return file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
}

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}