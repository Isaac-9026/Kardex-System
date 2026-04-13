import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FileUploader from '../components/FileUploader'
import AlertaBanner from '../components/AlertaBanner'
import { useKardex } from '../hooks/useKardex'

export default function Home() {
  const navigate                          = useNavigate()
  const { subirArchivos, uploading, error } = useKardex()

  const [archivosMovimientos, setArchivosMovimientos] = useState<File[]>([])
  const [archivoSaldos,       setArchivoSaldos]       = useState<File[]>([])

  const handleProcesar = async () => {
    if (archivosMovimientos.length === 0) return

    const resultado = await subirArchivos(
      archivosMovimientos,
      archivoSaldos[0] ?? null,
    )

    if (resultado) {
      navigate(`/kardex/${resultado.procesamiento_id}`)
    }
  }

  const listo = archivosMovimientos.length > 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-800 to-indigo-600 text-white px-6 py-5 shadow">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">📊 Kardex System</h1>
            <p className="text-indigo-200 text-sm mt-0.5">
              Inventario Permanente Valorizado · Costo Promedio Ponderado
            </p>
          </div>
          <button
            onClick={() => navigate('/historial')}
            className="text-sm text-indigo-200 hover:text-white transition-colors"
          >
            📋 Ver historial
          </button>
        </div>
      </header>

      {/* Contenido */}
      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">

        {/* Título */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Procesar Kardex</h2>
          <p className="text-gray-500 text-sm mt-1">
            Sube los archivos Excel para calcular el saldo final automáticamente
          </p>
        </div>

        {/* Tarjetas de carga */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Saldos iniciales */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">📋</span>
              <div>
                <h3 className="font-semibold text-gray-800 text-sm">Saldos Iniciales</h3>
                <p className="text-xs text-gray-400">Opcional — stock inicial por producto</p>
              </div>
            </div>
            <FileUploader
              label=""
              multiple={false}
              files={archivoSaldos}
              onChange={(files) => setArchivoSaldos(files)}
              disabled={uploading}
              description="Un archivo .xlsx con los saldos base"
            />
          </div>

          {/* Movimientos */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">📂</span>
              <div>
                <h3 className="font-semibold text-gray-800 text-sm">Movimientos</h3>
                <p className="text-xs text-gray-400">Requerido — ventas, compras y devoluciones</p>
              </div>
            </div>
            <FileUploader
              label=""
              multiple={true}
              files={archivosMovimientos}
              onChange={(files) => setArchivosMovimientos(files)}
              disabled={uploading}
              description="Uno o más archivos .xlsx de movimientos"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-3 text-sm">
            ❌ {error}
          </div>
        )}

        {/* Botón procesar */}
        <div className="flex justify-center">
          <button
            onClick={handleProcesar}
            disabled={!listo || uploading}
            className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-xl
                       hover:bg-indigo-700 transition-colors shadow
                       disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center gap-2"
          >
            {uploading ? (
              <>
                <span className="animate-spin">⏳</span>
                Procesando...
              </>
            ) : (
              <>⚡ Procesar Kardex</>
            )}
          </button>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700">
          <p className="font-semibold mb-1">ℹ️ ¿Cómo funciona?</p>
          <ol className="list-decimal list-inside space-y-1 text-xs text-blue-600">
            <li>Sube el archivo de saldos iniciales (stock al inicio del período)</li>
            <li>Sube uno o más archivos de movimientos (ventas, compras, devoluciones)</li>
            <li>El sistema calcula el saldo final con Costo Promedio Ponderado</li>
            <li>Revisa los resultados y descarga el Excel procesado</li>
          </ol>
        </div>

      </main>
    </div>
  )
}