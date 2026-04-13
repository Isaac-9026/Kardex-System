import type { FiltroFecha, ModoFiltro } from '../types'

interface FiltroFechaProps {
  filtro:    FiltroFecha
  onChange:  (filtro: FiltroFecha) => void
  disabled?: boolean
}

const MESES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
]

const MODOS: { value: ModoFiltro; label: string }[] = [
  { value: 'anio_mes', label: 'Año / Mes'         },
  { value: 'exacta',   label: 'Fecha exacta'       },
  { value: 'rango',    label: 'Rango de fechas'    },
]

const añosDisponibles = () => {
  const actual = new Date().getFullYear()
  return Array.from({ length: 5 }, (_, i) => actual - i)
}

export default function FiltroFechaPanel({
  filtro,
  onChange,
  disabled = false,
}: FiltroFechaProps) {

  const set = (partial: Partial<FiltroFecha>) =>
    onChange({ ...filtro, ...partial })

  return (
    <div className="space-y-3">
      {/* Selector de modo */}
      <div className="flex gap-2 flex-wrap">
        {MODOS.map((m) => (
          <button
            key={m.value}
            onClick={() => set({ modo: m.value })}
            disabled={disabled}
            className={[
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              filtro.modo === m.value
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
              disabled ? 'opacity-50 cursor-not-allowed' : '',
            ].join(' ')}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Controles según modo */}
      {filtro.modo === 'anio_mes' && (
        <div className="flex gap-3 flex-wrap">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Año</label>
            <select
              value={filtro.anio ?? ''}
              onChange={(e) => set({ anio: e.target.value ? Number(e.target.value) : undefined })}
              disabled={disabled}
              className={selectClass}
            >
              <option value="">Todos</option>
              {añosDisponibles().map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Mes</label>
            <select
              value={filtro.mes ?? ''}
              onChange={(e) => set({ mes: e.target.value ? Number(e.target.value) : undefined })}
              disabled={disabled || !filtro.anio}
              className={selectClass}
            >
              <option value="">Todos</option>
              {MESES.map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {filtro.modo === 'exacta' && (
        <div>
          <label className="block text-xs text-gray-500 mb-1">Fecha</label>
          <input
            type="date"
            value={filtro.fecha_exacta ?? ''}
            onChange={(e) => set({ fecha_exacta: e.target.value || undefined })}
            disabled={disabled}
            className={inputClass}
          />
        </div>
      )}

      {filtro.modo === 'rango' && (
        <div className="flex gap-3 flex-wrap">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Desde</label>
            <input
              type="date"
              value={filtro.fecha_desde ?? ''}
              onChange={(e) => set({ fecha_desde: e.target.value || undefined })}
              disabled={disabled}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Hasta</label>
            <input
              type="date"
              value={filtro.fecha_hasta ?? ''}
              onChange={(e) => set({ fecha_hasta: e.target.value || undefined })}
              disabled={disabled}
              className={inputClass}
            />
          </div>
        </div>
      )}
    </div>
  )
}

const selectClass = `
  border border-gray-300 rounded-lg px-3 py-1.5 text-sm
  focus:outline-none focus:ring-2 focus:ring-indigo-400
  disabled:opacity-50 disabled:cursor-not-allowed bg-white
`.trim()

const inputClass = `
  border border-gray-300 rounded-lg px-3 py-1.5 text-sm
  focus:outline-none focus:ring-2 focus:ring-indigo-400
  disabled:opacity-50 disabled:cursor-not-allowed bg-white
`.trim()