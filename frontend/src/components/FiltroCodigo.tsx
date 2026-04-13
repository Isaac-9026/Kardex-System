import { useState } from 'react'

interface FiltroCodigoProps {
  onBuscar:  (codigo: string) => void
  disabled?: boolean
}

export default function FiltroCodigo({ onBuscar, disabled = false }: FiltroCodigoProps) {
  const [valor, setValor] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onBuscar(valor.trim())
  }

  const handleLimpiar = () => {
    setValor('')
    onBuscar('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end">
      <div className="flex-1">
        <label className="block text-xs text-gray-500 mb-1">
          Código del producto
        </label>
        <input
          type="text"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder="Ej: 011039"
          disabled={disabled}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-indigo-400
                     disabled:opacity-50 disabled:cursor-not-allowed font-mono"
        />
      </div>

      <button
        type="submit"
        disabled={disabled || !valor.trim()}
        className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg
                   hover:bg-indigo-700 transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        🔍 Buscar
      </button>

      {valor && (
        <button
          type="button"
          onClick={handleLimpiar}
          disabled={disabled}
          className="px-3 py-2 bg-gray-100 text-gray-600 text-sm rounded-lg
                     hover:bg-gray-200 transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ✕
        </button>
      )}
    </form>
  )
}