import { useState, useMemo, useEffect, useRef } from "react";
import type { KardexRow } from "../types";

interface KardexTableProps {
  movimientos: KardexRow[];
  mostrarSemaforo?: boolean;
}

const fmtCant = (n: number) =>
  new Intl.NumberFormat("es-PE", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(n);

const fmtUnit = (n: number) =>
  new Intl.NumberFormat("es-PE", {
    minimumFractionDigits: 5,
    maximumFractionDigits: 5,
  }).format(n);

const fmtTotal = (n: number) =>
  new Intl.NumberFormat("es-PE", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(n);

const fmtFecha = (fecha: string) => {
  try {
    return new Date(fecha + "T00:00:00").toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return fecha;
  }
};

const colorSemaforo: Record<string, string> = {
  "🔴": "bg-red-50",
  "🟡": "bg-yellow-50",
  "⚫": "bg-purple-50",
  "🟢": "",
};

const COLS_GRUPOS = [
  { label: "", span: 2 },
  { label: "COMPROBANTE", span: 4 },
  { label: "TIPO OPERACIÓN", span: 1 },
  { label: "ENTRADAS", span: 3 },
  { label: "SALIDAS", span: 3 },
  { label: "SALDO FINAL", span: 3 },
];

const COLS_GRUPOS_SEM = [{ label: "EST.", span: 1 }, ...COLS_GRUPOS];

export default function KardexTable({
  movimientos,
  mostrarSemaforo = false,
}: KardexTableProps) {
  const [pagina, setPagina] = useState(1);
  const FILAS_POR_PAGINA = 100;
  const firstErrorRef = useRef<HTMLTableRowElement | null>(null);

  const primerErrorIndex = useMemo(() => {
    return movimientos.findIndex(
      (m) => m.error_a || m.error_b || m.saldo_negativo,
    );
  }, [movimientos]);

  useEffect(() => {
    if (primerErrorIndex === -1) return;

    const paginaError = Math.floor(primerErrorIndex / FILAS_POR_PAGINA) + 1;

    setPagina(paginaError);
  }, [primerErrorIndex]);

  useEffect(() => {
    if (firstErrorRef.current) {
      firstErrorRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [pagina]);

  const totalPaginas = Math.ceil(movimientos.length / FILAS_POR_PAGINA);
  const filas = useMemo(
    () =>
      movimientos.slice(
        (pagina - 1) * FILAS_POR_PAGINA,
        pagina * FILAS_POR_PAGINA,
      ),
    [movimientos, pagina],
  );

  if (movimientos.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400 text-sm">
        No hay movimientos para mostrar.
      </div>
    );
  }

  const grupos = mostrarSemaforo ? COLS_GRUPOS_SEM : COLS_GRUPOS;

  return (
    <div className="space-y-2">
      {/* Leyenda semáforo */}
      {mostrarSemaforo && (
        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
          <span>🟢 Correcto</span>
          <span>🟡 Inconsistencia interna</span>
          <span>🔴 Difiere del calculado</span>
          <span>⚫ Múltiples problemas</span>
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="min-w-full text-xs">
          <thead>
            {/* Fila 1: grupos */}
            <tr>
              {grupos.map((g, i) => (
                <th
                  key={i}
                  colSpan={g.span}
                  className="bg-indigo-700 text-white font-semibold text-center
                             px-2 py-2 border-r border-indigo-600 last:border-r-0"
                >
                  {g.label}
                </th>
              ))}
            </tr>

            {/* Fila 2: columnas */}
            <tr className="bg-indigo-50 text-indigo-800 font-semibold">
              {mostrarSemaforo && <th className={thClass}>Est.</th>}
              <th className={thClass}>#</th>
              <th className={thClass}>Código</th>
              <th className={thClass}>Fecha</th>
              <th className={thClass}>Tipo</th>
              <th className={thClass}>Serie</th>
              <th className={thClass}>Número</th>
              <th className={thClass}>Operación</th>
              <th className={thClass + " text-right"}>Cant.</th>
              <th className={thClass + " text-right"}>C.Unit</th>
              <th className={thClass + " text-right"}>C.Total</th>
              <th className={thClass + " text-right"}>Cant.</th>
              <th className={thClass + " text-right"}>C.Unit</th>
              <th className={thClass + " text-right"}>C.Total</th>
              <th className={thClass + " text-right"}>Cant.</th>
              <th className={thClass + " text-right"}>C.Unit</th>
              <th className={thClass + " text-right"}>C.Total</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {filas.map((row, i) => {
              const globalIndex = (pagina - 1) * FILAS_POR_PAGINA + i;
              const esPrimerError = globalIndex === primerErrorIndex;

              const tieneError =
                row.error_a || row.error_b || row.saldo_negativo;

              const esPar = i % 2 === 0;

              const colorFila = mostrarSemaforo
                ? colorSemaforo[row.semaforo] || (esPar ? "" : "bg-gray-50")
                : row.saldo_negativo
                  ? "bg-red-50"
                  : esPar
                    ? ""
                    : "bg-gray-50";

              return (
                <tr
                  ref={esPrimerError ? firstErrorRef : null}
                  key={row.id}
                  className={`
                    ${colorFila}
                    ${tieneError ? "border-l-4 border-red-500" : ""}
                    ${esPrimerError ? "animate-pulse" : ""}
                   hover:bg-indigo-50/40 transition-colors
                  `}
                >
                  {mostrarSemaforo && (
                    <td className={tdClass + " text-center text-base"}>
                      {row.semaforo}
                    </td>
                  )}
                  <td className={tdClass + " text-center font-semibold"}>
                    {row.fila}
                  </td>
                  <td
                    className={
                      tdClass + " font-mono font-semibold text-indigo-700"
                    }
                  >
                    {row.codigo ?? "—"}
                  </td>
                  <td className={tdClass + " text-center whitespace-nowrap"}>
                    {fmtFecha(row.fecha)}
                  </td>
                  <td className={tdClass + " text-center"}>
                    {row.tipo_comprobante}
                  </td>
                  <td className={tdClass + " text-center"}>{row.serie}</td>
                  <td className={tdClass + " text-center font-mono"}>
                    {row.numero}
                  </td>
                  <td className={tdClass + " whitespace-nowrap"}>
                    {row.tipo_operacion}
                  </td>
                  {/* Entradas */}
                  <td className={tdNumClass}>{fmtCant(row.ent_cantidad)}</td>
                  <td className={tdNumClass}>{fmtUnit(row.ent_costo_unit)}</td>
                  <td className={tdNumClass}>
                    {fmtTotal(row.ent_costo_total)}
                  </td>
                  {/* Salidas */}
                  <td className={tdNumClass}>{fmtCant(row.sal_cantidad)}</td>
                  <td className={tdNumClass}>{fmtUnit(row.sal_costo_unit)}</td>
                  <td className={tdNumClass}>
                    {fmtTotal(row.sal_costo_total)}
                  </td>
                  {/* Saldo */}
                  <td className={tdNumClass + " font-semibold"}>
                    {fmtCant(row.saldo_cantidad)}
                  </td>
                  <td className={tdNumClass + " font-semibold"}>
                    {fmtUnit(row.saldo_costo_unit)}
                  </td>
                  <td className={tdNumClass + " font-semibold"}>
                    {fmtTotal(row.saldo_costo_total)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            Mostrando {(pagina - 1) * FILAS_POR_PAGINA + 1}–
            {Math.min(pagina * FILAS_POR_PAGINA, movimientos.length)} de{" "}
            {movimientos.length} registros
          </span>
          <div className="flex gap-1">
            <PagBtn onClick={() => setPagina(1)} disabled={pagina === 1}>
              ««
            </PagBtn>
            <PagBtn
              onClick={() => setPagina((p) => p - 1)}
              disabled={pagina === 1}
            >
              ‹
            </PagBtn>
            <span className="px-3 py-1 bg-indigo-600 text-white rounded-lg font-semibold">
              {pagina}
            </span>
            <PagBtn
              onClick={() => setPagina((p) => p + 1)}
              disabled={pagina === totalPaginas}
            >
              ›
            </PagBtn>
            <PagBtn
              onClick={() => setPagina(totalPaginas)}
              disabled={pagina === totalPaginas}
            >
              »»
            </PagBtn>
          </div>
        </div>
      )}
    </div>
  );
}

function PagBtn({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200
                 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
    >
      {children}
    </button>
  );
}

const thClass =
  "px-2 py-2 text-center border-r border-indigo-200 last:border-r-0 whitespace-nowrap";
const tdClass = "px-2 py-1.5 border-r border-gray-100 last:border-r-0";
const tdNumClass =
  "px-2 py-1.5 text-right border-r border-gray-100 last:border-r-0 tabular-nums";
