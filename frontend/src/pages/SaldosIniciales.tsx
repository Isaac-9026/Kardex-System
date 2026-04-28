import { useEffect, useState } from 'react'
import ModalSaldoInicial  from '../components/ModalSaldoInicial'

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

/* ── Tipos ───────────────────────────────────────────── */
interface Saldo {
  id: number
  codigo: string
  descripcion?: string
  fecha: string
  cantidad: number
  costo_unitario: number
  costo_total: number
}

/* ── Página ─────────────────────────────────────────── */
export default function SaldosIniciales() {
  const [saldos, setSaldos] = useState<Saldo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [saldoEditando, setSaldoEditando] = useState<Saldo | null>(null)

  const [mensaje, setMensaje] = useState<string | null>(null)

  /* ── Fetch ─────────────────────────────────────────── */
  const fetchSaldos = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/v1/saldos/`)
      if (!res.ok) throw new Error('Error al cargar saldos')

      const data = await res.json()
      setSaldos(data)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSaldos()
  }, [])

  /* ── Eliminar ──────────────────────────────────────── */
  const handleEliminar = async (id: number) => {
    const confirmar = confirm('¿Seguro que deseas eliminar este saldo?')
    if (!confirmar) return

    try {
      const res = await fetch(`${API}/api/v1/saldos/${id}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data?.detail || 'Error al eliminar')

      if (data?.advertencia) {
        alert(data.advertencia)
      }

      setMensaje(data?.mensaje || 'Eliminado correctamente')
      fetchSaldos()
    } catch (e) {
      alert((e as Error).message)
    }
  }

  /* ── Guardado ─────────────────────────────────────── */
  const handleGuardado = () => {
    setModalOpen(false)
    setSaldoEditando(null)
    fetchSaldos()
  }

  /* ── UI ───────────────────────────────────────────── */
  return (
    <div style={{ padding: 20 }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h2>Saldos Iniciales</h2>
        <p>Gestión de stock base para cálculo CPP</p>

        <button onClick={() => {
          setSaldoEditando(null)
          setModalOpen(true)
        }}>
          + Nuevo saldo
        </button>
      </div>

      {/* Mensaje */}
      {mensaje && (
        <div style={{ marginBottom: 10 }}>
          {mensaje}
        </div>
      )}

      {/* Loading */}
      {loading && <p>Cargando saldos...</p>}

      {/* Error */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Tabla */}
      {!loading && saldos.length === 0 && (
        <p>No hay saldos iniciales registrados.</p>
      )}

      {!loading && saldos.length > 0 && (
        <table width="100%" border={1} cellPadding={8}>
          <thead>
            <tr>
              <th>Código</th>
              <th>Descripción</th>
              <th>Fecha</th>
              <th>Cantidad</th>
              <th>Costo Unit.</th>
              <th>Costo Total</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {saldos.map(s => (
              <tr key={s.id}>
                <td>{s.codigo}</td>
                <td>{s.descripcion || '-'}</td>
                <td>{s.fecha}</td>
                <td>{s.cantidad}</td>
                <td>{s.costo_unitario}</td>
                <td>{s.costo_total}</td>
                <td>
                  <button onClick={() => {
                    setSaldoEditando(s)
                    setModalOpen(true)
                  }}>
                    Editar
                  </button>

                  <button onClick={() => handleEliminar(s.id)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal */}
      <ModalSaldoInicial
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setSaldoEditando(null)
        }}
        onGuardado={handleGuardado}
        codigoInicial={saldoEditando?.codigo}
      />

    </div>
  )
}