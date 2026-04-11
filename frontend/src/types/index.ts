// ── Producto ──────────────────────────────────────────────────────────────
export interface Producto {
  id: number
  codigo: string
  descripcion: string
}

// ── Saldo Inicial ─────────────────────────────────────────────────────────
export interface SaldoInicial {
  id: number
  producto_id: number
  fecha: string
  cantidad: number
  costo_unitario: number
  costo_total: number
}

// ── Movimiento ────────────────────────────────────────────────────────────
export interface Movimiento {
  id: number
  codigo: string
  fecha: string
  tipo: number
  serie: string
  numero: string
  tipo_operacion: string
  ent_cantidad: number
  ent_costo_unit: number
  ent_costo_total: number
  sal_cantidad: number
  sal_costo_unit: number
  sal_costo_total: number
}

// ── Kardex procesado (fila con saldo calculado) ───────────────────────────
export interface KardexRow extends Movimiento {
  saldo_cantidad: number
  saldo_costo_unit: number
  saldo_costo_total: number
  saldo_negativo: boolean
  error_a_ent: boolean
  error_a_sal: boolean
  error_b_ent: boolean
  error_b_sal: boolean
  semaforo: '🟢' | '🟡' | '🔴' | '⚫'
}

// ── Respuesta del kardex ──────────────────────────────────────────────────
export interface KardexResponse {
  codigo: string
  total_registros: number
  errores_integridad: number
  saldo_negativo: boolean
  movimientos: KardexRow[]
}

// ── Métricas resumen ──────────────────────────────────────────────────────
export interface Metricas {
  total_ent_cantidad: number
  total_ent_costo: number
  total_sal_cantidad: number
  total_sal_costo: number
  saldo_final_cantidad: number
  saldo_final_costo: number
}

// ── Archivo cargado ───────────────────────────────────────────────────────
export interface Archivo {
  id: number
  nombre: string
  tipo: 'movimiento' | 'exportado'
  estado: 'procesado' | 'error' | 'pendiente'
  total_registros: number
  errores_integridad: number
  fecha_carga: string
}

// ── Filtros de fecha ──────────────────────────────────────────────────────
export type ModoFiltro = 'anio_mes' | 'exacta' | 'rango'

export interface FiltroFecha {
  modo: ModoFiltro
  anio?: number
  mes?: number
  fecha_exacta?: string
  fecha_desde?: string
  fecha_hasta?: string
}

// ── Estado de carga ───────────────────────────────────────────────────────
export interface ApiError {
  message: string
  status?: number
}