import { useState, useEffect, useRef } from 'react'

/* ══════════════════════════════════════════════════
   Tipos
══════════════════════════════════════════════════ */
interface SaldoManualPayload {
  codigo:         string
  fecha:          string   
  cantidad:       number
  costo_unitario: number
}

interface Props {
  open:    boolean
  onClose: () => void
  /** Callback que recibe el saldo guardado — opcional, para refrescar la UI padre */
  onGuardado?: (codigo: string) => void
  /** Código pre-llenado (cuando se abre desde la alerta) */
  codigoInicial?: string
}

/* ══════════════════════════════════════════════════
   API helper — ajusta la URL base si es distinta
══════════════════════════════════════════════════ */
const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

async function guardarSaldoManual(payload: SaldoManualPayload): Promise<void> {
  const res = await fetch(`${API}/api/v1/saldos/manual`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.detail ?? `Error ${res.status}`)
  }
}

/* ══════════════════════════════════════════════════
   Iconos
══════════════════════════════════════════════════ */
const IconX = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const IconSpinner = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ animation: 'mspin 1s linear infinite' }}>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2"/>
    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    <style>{`@keyframes mspin{to{transform:rotate(360deg)}}`}</style>
  </svg>
)
const IconSaldo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
)

/* ══════════════════════════════════════════════════
   Componente principal
══════════════════════════════════════════════════ */
export default function ModalSaldoInicial({ open, onClose, onGuardado, codigoInicial }: Props) {
  const hoy = new Date().toISOString().split('T')[0]

  const [codigo,        setCodigo]        = useState(codigoInicial ?? '')
  const [fecha,         setFecha]         = useState(hoy)
  const [cantidad,      setCantidad]      = useState('')
  const [costoUnit,     setCostoUnit]     = useState('')
  const [saving,        setSaving]        = useState(false)
  const [error,         setError]         = useState<string | null>(null)
  const [exitoso,       setExitoso]       = useState(false)

  const codigoRef = useRef<HTMLInputElement>(null)

  /* Pre-llenar código cuando viene de la alerta */
  useEffect(() => {
    if (open) {
      setCodigo(codigoInicial ?? '')
      setFecha(hoy)
      setCantidad('')
      setCostoUnit('')
      setError(null)
      setExitoso(false)
      setTimeout(() => codigoRef.current?.focus(), 80)
    }
  }, [open, codigoInicial])

  /* Cerrar con Escape */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const costoTotal = (() => {
    const c = parseFloat(cantidad  || '0')
    const u = parseFloat(costoUnit || '0')
    if (isNaN(c) || isNaN(u)) return 0
    return c * u
  })()

  const valido = codigo.trim().length > 0
    && fecha.length === 10
    && parseFloat(cantidad  || '0') > 0
    && parseFloat(costoUnit || '0') > 0

  const handleGuardar = async () => {
    if (!valido || saving) return
    setSaving(true)
    setError(null)
    try {
      await guardarSaldoManual({
        codigo:         codigo.trim().toUpperCase(),
        fecha,
        cantidad:       parseFloat(cantidad),
        costo_unitario: parseFloat(costoUnit),
      })
      setExitoso(true)
      onGuardado?.(codigo.trim().toUpperCase())
      setTimeout(() => onClose(), 1200)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    /* Overlay */
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(4,10,24,0.82)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(3px)',
        animation: 'mfade .15s ease',
      }}
    >
      <style>{`
        @keyframes mfade  { from { opacity:0 } to { opacity:1 } }
        @keyframes mslide { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:none } }
        .msaldo-input {
          width: 100%;
          background: rgba(13,21,37,0.9);
          border: 1px solid rgba(56,139,221,0.18);
          border-radius: 7px;
          padding: 8px 11px;
          font-size: 12px;
          font-family: 'IBM Plex Mono', monospace;
          color: #c8ddef;
          outline: none;
          box-sizing: border-box;
          transition: border-color .15s;
        }
        .msaldo-input:focus { border-color: rgba(59,130,246,0.55); }
        .msaldo-input::placeholder { color: #1e3a5a; }
      `}</style>

      {/* Panel */}
      <div style={{
        width: 420,
        background: '#0d1525',
        border: '1px solid rgba(56,139,221,0.18)',
        borderTop: '2px solid #3b82f6',
        borderRadius: 12,
        padding: '20px 22px',
        display: 'flex', flexDirection: 'column', gap: 16,
        animation: 'mslide .18s ease',
        fontFamily: "'Inter', sans-serif",
        color: '#c8ddef',
      }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'rgba(59,130,246,0.12)',
              border: '1px solid rgba(59,130,246,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#60a5fa',
            }}>
              <IconSaldo />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>Agregar saldo inicial</div>
              <div style={{ fontSize: 11, color: '#1e3a5a', marginTop: 1 }}>Stock base para cálculo CPP</div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(56,139,221,0.12)',
              borderRadius: 6, width: 28, height: 28, display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: '#2a5a8a', cursor: 'pointer',
            }}
          >
            <IconX />
          </button>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(56,139,221,0.1)' }} />

        {/* Formulario */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Código */}
          <div>
            <Label>Código del producto</Label>
            <input
              ref={codigoRef}
              className="msaldo-input"
              placeholder="Ej: 032266"
              value={codigo}
              onChange={e => setCodigo(e.target.value.toUpperCase())}
              spellCheck={false}
            />
          </div>

          {/* Fecha */}
          <div>
            <Label>Fecha de inicio</Label>
            <input
              type="date"
              className="msaldo-input"
              value={fecha}
              onChange={e => setFecha(e.target.value)}
              style={{ colorScheme: 'dark' }}
            />
          </div>

          {/* Cantidad + Costo unit en grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <Label>Cantidad inicial</Label>
              <input
                className="msaldo-input"
                type="number"
                min="0"
                step="0.001"
                placeholder="0.000"
                value={cantidad}
                onChange={e => setCantidad(e.target.value)}
              />
            </div>
            <div>
              <Label>Costo unitario (S/)</Label>
              <input
                className="msaldo-input"
                type="number"
                min="0"
                step="0.00001"
                placeholder="0.00000"
                value={costoUnit}
                onChange={e => setCostoUnit(e.target.value)}
              />
            </div>
          </div>

          {/* Costo total calculado */}
          <div style={{
            background: 'rgba(56,139,221,0.05)',
            border: '1px solid rgba(56,139,221,0.12)',
            borderRadius: 8, padding: '9px 12px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 11, color: '#1e3a5a' }}>Costo total calculado</span>
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 14, fontWeight: 700,
              color: costoTotal > 0 ? '#60a5fa' : '#1e3a5a',
            }}>
              S/ {costoTotal.toLocaleString('es-PE', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
            </span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 7, padding: '8px 12px',
            fontSize: 12, color: '#fca5a5',
            fontFamily: "'IBM Plex Mono', monospace",
          }}>
            ✕ {error}
          </div>
        )}

        {/* Éxito */}
        {exitoso && (
          <div style={{
            background: 'rgba(34,197,94,0.08)',
            border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: 7, padding: '8px 12px',
            fontSize: 12, color: '#4ade80',
            display: 'flex', alignItems: 'center', gap: 7,
            fontFamily: "'IBM Plex Mono', monospace",
          }}>
            <IconCheck /> Saldo inicial guardado correctamente
          </div>
        )}

        {/* Acciones */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '7px 16px', borderRadius: 7, fontSize: 12, fontWeight: 500,
              background: 'rgba(56,139,221,0.06)',
              border: '1px solid rgba(56,139,221,0.14)',
              color: '#2a5a8a', cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={!valido || saving || exitoso}
            style={{
              padding: '7px 18px', borderRadius: 7, fontSize: 12, fontWeight: 600,
              background: valido && !saving && !exitoso
                ? 'linear-gradient(135deg,#1d4ed8,#1e3a8a)'
                : 'rgba(56,139,221,0.08)',
              border: 'none',
              color: valido && !saving && !exitoso ? '#e2e8f0' : '#2a4a6a',
              cursor: valido && !saving && !exitoso ? 'pointer' : 'not-allowed',
              boxShadow: valido && !saving && !exitoso ? '0 2px 10px rgba(29,78,216,0.35)' : 'none',
              display: 'flex', alignItems: 'center', gap: 6,
              fontFamily: 'inherit',
            }}
          >
            {saving   ? <><IconSpinner /> Guardando...</> :
             exitoso  ? <><IconCheck />   Guardado</>      :
                        'Guardar saldo'}
          </button>
        </div>

      </div>
    </div>
  )
}

/* ── Label helper ── */
function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, letterSpacing: '.1em',
      textTransform: 'uppercase' as const,
      color: '#1e3a5a', marginBottom: 5,
      fontFamily: "'IBM Plex Mono', monospace",
    }}>
      {children}
    </div>
  )
}