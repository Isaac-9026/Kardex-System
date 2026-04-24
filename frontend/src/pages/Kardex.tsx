import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useKardex } from "../hooks/useKardex";
import KardexTable from "../components/KardexTable";
import MetricasPanel from "../components/Metricas";
import AlertaBanner from "../components/AlertaBanner";
import FiltroCodigo from "../components/FiltroCodigo";
import FiltroFecha from "../components/FiltroFecha";
import BadgeProducto from "../components/BadgeProducto";
import type { FiltroFecha as IFiltroFecha } from "../types";

export default function Kardex() {
  const { procesamiento_id } = useParams<{ procesamiento_id: string }>();
  const navigate = useNavigate();
  const {
    movimientos,
    metricas,
    alertas,
    loading,
    error,
    exporting,
    totalRegistros,
    erroresIntegridad,
    cargarKardex,
    descargarExcel,
  } = useKardex();

  const [codigo, setCodigo] = useState("");
  const [filtroFecha, setFiltroFecha] = useState<IFiltroFecha>({
    modo: "anio_mes",
  });
  const [mostrarSemaforo, setMostrarSemaforo] = useState(false);
  const [mostrarSoloErrores, setMostrarSoloErrores] = useState(false);

  const id = Number(procesamiento_id);

  // Carga inicial
  useEffect(() => {
    if (!id) return;
    cargarKardex(id);
  }, [id]);

  // Aplicar filtros
  const aplicarFiltros = (nuevoCodigo?: string) => {
    const cod = nuevoCodigo !== undefined ? nuevoCodigo : codigo;
    cargarKardex(id, { ...filtroFecha, codigo: cod || undefined });
  };

  const handleBuscarCodigo = (cod: string) => {
    setCodigo(cod);
    cargarKardex(id, { ...filtroFecha, codigo: cod || undefined });
  };

  const handleCambiarFecha = (nuevoFiltro: IFiltroFecha) => {
    setFiltroFecha(nuevoFiltro);
    cargarKardex(id, { ...nuevoFiltro, codigo: codigo || undefined });
  };

  const handleExportar = () => {
    descargarExcel(
      codigo || undefined,
      filtroFecha.fecha_desde,
      filtroFecha.fecha_hasta,
    );
  };

  // Códigos únicos visibles en la tabla
  const codigosVisibles = useMemo(() => {
    const set = new Set(movimientos.map((m) => m.codigo).filter(Boolean));
    return Array.from(set) as string[];
  }, [movimientos]);

  const movimientosFiltrados = useMemo(() => {
    if (!mostrarSoloErrores) return movimientos;

    return movimientos.filter(
      (m) => m.error_a || m.error_b || m.saldo_negativo,
    );
  }, [movimientos, mostrarSoloErrores]);

  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        ID de procesamiento inválido.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-800 to-indigo-600 text-white px-6 py-4 shadow">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="text-indigo-200 hover:text-white transition-colors text-sm"
            >
              ← Volver
            </button>
            <div>
              <h1 className="text-lg font-bold">
                📊 Kardex — Procesamiento #{id}
              </h1>
              <p className="text-indigo-200 text-xs">
                {totalRegistros.toLocaleString("es-PE")} registros
                {erroresIntegridad > 0 && (
                  <span className="ml-2 text-yellow-300">
                    · {erroresIntegridad} anomalía(s)
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle semáforo */}
            <button
              onClick={() => setMostrarSemaforo((v) => !v)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                mostrarSemaforo
                  ? "bg-white text-indigo-700"
                  : "bg-indigo-700 text-indigo-200 hover:bg-indigo-600"
              }`}
            >
              🔍 Verificación
            </button>

            <button
              onClick={() => setMostrarSoloErrores((v) => !v)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                mostrarSoloErrores
                  ? "bg-red-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              🚨 Solo errores
            </button>

            {/* Exportar */}
            <button
              onClick={handleExportar}
              disabled={exporting || movimientos.length === 0}
              className="px-3 py-1.5 bg-green-500 hover:bg-green-400 text-white
                         rounded-lg text-sm font-medium transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              {exporting ? <span className="animate-spin">⏳</span> : "⬇️"}
              Exportar Excel
            </button>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <main className="max-w-screen-xl mx-auto px-4 py-6 space-y-5">
        {/* Alertas */}
        {alertas && (
          <AlertaBanner
            alertas={alertas}
            erroresIntegridad={erroresIntegridad}
            movimientos={movimientos}
          />
        )}

        {/* Métricas */}
        {metricas && <MetricasPanel metricas={metricas} />}

        {/* Filtros */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">🔎 Filtros</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FiltroCodigo onBuscar={handleBuscarCodigo} disabled={loading} />
            <FiltroFecha
              filtro={filtroFecha}
              onChange={handleCambiarFecha}
              disabled={loading}
            />
          </div>
        </div>

        {/* Badges */}
        {codigosVisibles.length > 0 && (
          <BadgeProducto codigos={codigosVisibles} />
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-3 text-sm">
            ❌ {error}
          </div>
        )}

        {/* Tabla */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">
              📋 Movimientos
              <span className="ml-2 text-gray-400 font-normal">
                ({movimientosFiltrados.length.toLocaleString("es-PE")} registros)
              </span>
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
              <span className="animate-spin text-xl">⏳</span>
              <span className="text-sm">Cargando movimientos...</span>
            </div>
          ) : (
            <KardexTable
              movimientos={movimientosFiltrados}
              mostrarSemaforo={mostrarSemaforo}
            />
          )}
        </div>
      </main>
    </div>
  );
}
