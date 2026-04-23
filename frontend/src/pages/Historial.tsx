import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getHistorial } from '../services/kardex'
import type { ProcesamientoResumen, ApiError } from '../types'

const estadoConfig = {
  procesado:     { label: 'Exitoso',      color: 'bg-green-100 text-green-700',  icono: '✅' },
  con_alertas: { label: 'Con alertas',  color: 'bg-yellow-100 text-yellow-700', icono: '⚠️' },
  error:       { label: 'Error',        color: 'bg-red-100 text-red-700',      icono: '❌' },
}

const fmtFecha = (iso: string) =>
  new Date(iso).toLocaleString('es-PE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

export default function Historial() {
  const navigate = useNavigate()

  const [procesamientos, setProcesamientos] = useState<ProcesamientoResumen[]>([])
  const [loading,        setLoading]        = useState(true)
  const [error,          setError]          = useState<string | null>(null)
  const [pagina,         setPagina]         = useState(1)
  const LIMIT = 20

  useEffect(() => {
    const cargar = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getHistorial(LIMIT, (pagina - 1) * LIMIT)
        setProcesamientos(data)
      } catch (err) {
        const e = err as ApiError
        setError(e.message || 'Error al cargar el historial')
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [pagina])

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-800 to-indigo-600 text-white px-6 py-4 shadow">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="text-indigo-200 hover:text-white transition-colors text-sm"
            >
              ← Volver
            </button>
            <div>
              <h1 className="text-lg font-bold">📋 Historial de Procesamientos</h1>
              <p className="text-indigo-200 text-xs">
                Consulta procesamientos anteriores sin reprocesar
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/')}
            className="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-600 text-white
                       text-sm rounded-lg transition-colors"
          >
            ⚡ Nuevo proceso
          </button>
        </div>
      </header>

      {/* Contenido */}
      <main className="max-w-4xl mx-auto px-6 py-8">

        {loading && (
          <div className="flex items-center justify-center py-20 text-gray-400 gap-2">
            <span className="animate-spin text-xl">⏳</span>
            <span className="text-sm">Cargando historial...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-3 text-sm">
            ❌ {error}
          </div>
        )}

        {!loading && !error && procesamientos.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-sm">No hay procesamientos registrados aún.</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 text-indigo-600 hover:underline text-sm"
            >
              Procesar mi primer archivo →
            </button>
          </div>
        )}

        {!loading && procesamientos.length > 0 && (
          <div className="space-y-3">
            {procesamientos.map((p) => {
              const cfg = estadoConfig[p.estado]
              return (
                <div
                  key={p.id}
                  onClick={() => navigate(`/kardex/${p.id}`)}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm
                             px-5 py-4 cursor-pointer hover:border-indigo-300
                             hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold
                                          px-2 py-0.5 rounded-full ${cfg.color}`}>
                          {cfg.icono} {cfg.label}
                        </span>
                        <span className="text-xs text-gray-400 font-mono">#{p.id}</span>
                      </div>
                      <p className="font-semibold text-gray-800 text-sm truncate">
                        {p.nombre_archivo}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {fmtFecha(p.creado_en)}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold text-indigo-700">
                        {p.total_registros.toLocaleString('es-PE')}
                      </p>
                      <p className="text-xs text-gray-400">registros</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {p.productos_procesados} producto(s)
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Paginación */}
            <div className="flex justify-center gap-2 pt-4">
              <button
                onClick={() => setPagina(p => Math.max(1, p - 1))}
                disabled={pagina === 1}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm
                           hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Anterior
              </button>
              <span className="px-4 py-2 text-sm text-gray-500">Página {pagina}</span>
              <button
                onClick={() => setPagina(p => p + 1)}
                disabled={procesamientos.length < LIMIT}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm
                           hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}