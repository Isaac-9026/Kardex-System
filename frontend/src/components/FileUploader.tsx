import { useRef, useState, useCallback } from 'react'

interface FileUploaderProps {
  label:        string
  accept?:      string
  multiple?:    boolean
  onChange:     (files: File[]) => void
  files?:       File[]
  disabled?:    boolean
  description?: string
}

export default function FileUploader({
  label,
  accept    = '.xlsx',
  multiple  = false,
  onChange,
  files     = [],
  disabled  = false,
  description,
}: FileUploaderProps) {
  const inputRef  = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const handleFiles = useCallback((incoming: FileList | null) => {
    if (!incoming) return
    const validos = Array.from(incoming).filter(f => f.name.endsWith('.xlsx'))
    if (validos.length > 0) onChange(validos)
  }, [onChange])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    if (disabled) return
    handleFiles(e.dataTransfer.files)
  }, [disabled, handleFiles])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) setDragging(true)
  }

  const handleDragLeave = () => setDragging(false)

  const handleClick = () => {
    if (!disabled) inputRef.current?.click()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
    // Reset para permitir subir el mismo archivo nuevamente
    e.target.value = ''
  }

  const eliminarArchivo = (index: number) => {
    const nuevos = files.filter((_, i) => i !== index)
    onChange(nuevos)
  }

  return (
    <div className="w-full">
      {/* Label */}
      <p className="text-sm font-semibold text-gray-700 mb-2">{label}</p>

      {/* Zona de drop */}
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={[
          'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all',
          dragging
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50',
          disabled ? 'opacity-50 cursor-not-allowed' : '',
        ].join(' ')}
      >
        {/* Ícono */}
        <div className="flex justify-center mb-3">
          <svg
            className={`w-10 h-10 ${dragging ? 'text-indigo-500' : 'text-gray-400'}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path
              strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0
                 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
        </div>

        <p className="text-sm text-gray-600">
          <span className="font-semibold text-indigo-600">Haz clic para subir</span>
          {' '}o arrastra aquí
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {description || 'Solo archivos .xlsx'}
        </p>
      </div>

      {/* Input oculto */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />

      {/* Lista de archivos seleccionados */}
      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((file, i) => (
            <li
              key={i}
              className="flex items-center justify-between bg-indigo-50 border
                         border-indigo-200 rounded-lg px-3 py-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <svg
                  className="w-4 h-4 text-indigo-500 shrink-0"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path
                    strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0
                       012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0
                       01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="text-sm text-indigo-700 font-medium truncate">
                  {file.name}
                </span>
                <span className="text-xs text-gray-400 shrink-0">
                  ({(file.size / 1024).toFixed(0)} KB)
                </span>
              </div>

              {!disabled && (
                <button
                  onClick={(e) => { e.stopPropagation(); eliminarArchivo(i) }}
                  className="ml-2 text-gray-400 hover:text-red-500 transition-colors shrink-0"
                  title="Eliminar"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}