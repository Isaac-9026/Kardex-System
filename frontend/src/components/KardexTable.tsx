import { useState, useMemo, useEffect, useRef } from "react";
import type { KardexRow } from "../types";

interface KardexTableProps {
  movimientos: KardexRow[];
  mostrarSemaforo?: boolean;
}

const fmtCant = (n: number) =>
  new Intl.NumberFormat("es-PE", { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(n);

const fmtUnit = (n: number) =>
  new Intl.NumberFormat("es-PE", { minimumFractionDigits: 5, maximumFractionDigits: 5 }).format(n);

const fmtTotal = (n: number) =>
  new Intl.NumberFormat("es-PE", { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(n);

const fmtFecha = (fecha: string) => {
  try {
    return new Date(fecha + "T00:00:00").toLocaleDateString("es-PE");
  } catch {
    return fecha;
  }
};

const FILAS_POR_PAGINA = 100;

// 🎯 mapa de color según TU lógica
const getSemaforo = (row: KardexRow) => {
  if (row.saldo_negativo) return "🔴";
  if (row.error_a || row.error_b) return "🟡";
  return "🟢";
};

export default function KardexTable({ movimientos, mostrarSemaforo = false }: KardexTableProps) {
  const [pagina, setPagina] = useState(1);
  const firstErrorRef = useRef<HTMLTableRowElement | null>(null);

  const primerErrorIndex = useMemo(() => {
    return movimientos.findIndex(
      (m) => m.error_a || m.error_b || m.saldo_negativo
    );
  }, [movimientos]);

  useEffect(() => {
    if (primerErrorIndex === -1) return;
    const paginaError = Math.floor(primerErrorIndex / FILAS_POR_PAGINA) + 1;
    setPagina(paginaError);
  }, [primerErrorIndex]);

  useEffect(() => {
    if (firstErrorRef.current) {
      firstErrorRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [pagina]);

  const totalPaginas = Math.ceil(movimientos.length / FILAS_POR_PAGINA);

  const filas = useMemo(() => {
    return movimientos.slice(
      (pagina - 1) * FILAS_POR_PAGINA,
      pagina * FILAS_POR_PAGINA
    );
  }, [movimientos, pagina]);

  if (movimientos.length === 0) {
    return <div style={{ padding: 40, textAlign: "center", color: "#2a5080" }}>Sin datos</div>;
  }

  return (
    <div style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{
          borderCollapse: "separate",
          borderSpacing: 0,
          fontSize: 11,
          tableLayout: "fixed",
          minWidth: 1200
        }}>

          {/* HEADER GRUPOS */}
          <thead>
            <tr>
              {mostrarSemaforo && <th style={thDark}></th>}
              <th style={thDark}></th>
              <th style={thDark}></th>

              <th colSpan={4} style={{ ...thGrupo, background: "#185FA5" }}>Comprobante</th>
              <th style={{ ...thGrupo, background: "#0F6E56" }}>Tipo operación</th>
              <th colSpan={3} style={{ ...thGrupo, background: "#0B5E3A" }}>Entradas</th>
              <th colSpan={3} style={{ ...thGrupo, background: "#7A2020" }}>Salidas</th>
              <th colSpan={3} style={{ ...thGrupo, background: "#1A3A5C" }}>Saldo final</th>
            </tr>

            <tr style={{ background: "#0a1929" }}>
              {mostrarSemaforo && <th style={thSub}>Est</th>}
              <th style={thSub}>#</th>
              <th style={thSub}>Cód.</th>

              <th style={thSub}>Fecha</th>
              <th style={thSub}>Tipo</th>
              <th style={thSub}>Serie</th>
              <th style={thSub}>Número</th>

              <th style={thSub}>Operación</th>

              <th style={thSub}>Cant</th>
              <th style={thSub}>C.Unit</th>
              <th style={thSub}>Total</th>

              <th style={thSub}>Cant</th>
              <th style={thSub}>C.Unit</th>
              <th style={thSub}>Total</th>

              <th style={thSub}>Cant</th>
              <th style={thSub}>C.Unit</th>
              <th style={thSub}>Total</th>
            </tr>
          </thead>

          <tbody>
            {filas.map((row, i) => {
              const globalIndex = (pagina - 1) * FILAS_POR_PAGINA + i;
              const esError = globalIndex === primerErrorIndex;
              const semaforo = getSemaforo(row);
              const tieneError = semaforo !== "🟢";

              return (
                <tr
                  key={row.id}
                  ref={esError ? firstErrorRef : null}
                  style={{
                    background: esError
                      ? "rgba(245,158,11,0.15)"
                      : tieneError
                      ? "rgba(226,75,74,0.06)"
                      : i % 2 === 0
                      ? "transparent"
                      : "rgba(55,138,221,0.03)",
                    borderBottom: "1px solid rgba(55,138,221,0.05)",
                  }}
                >
                  {mostrarSemaforo && <td style={td}>{semaforo}</td>}
                  <td style={td}>{row.fila}</td>
                  <td style={{ ...td, color: "#378ADD", fontWeight: 600 }}>{row.codigo}</td>

                  <td style={td}>{fmtFecha(row.fecha)}</td>
                  <td style={td}>{row.tipo_comprobante}</td>
                  <td style={td}>{row.serie}</td>
                  <td style={td}>{row.numero}</td>

                  <td style={td}>{row.tipo_operacion}</td>

                  <td style={td}>{fmtCant(row.ent_cantidad)}</td>
                  <td style={td}>{fmtUnit(row.ent_costo_unit)}</td>
                  <td style={td}>{fmtTotal(row.ent_costo_total)}</td>

                  <td style={td}>{fmtCant(row.sal_cantidad)}</td>
                  <td style={td}>{fmtUnit(row.sal_costo_unit)}</td>
                  <td style={td}>{fmtTotal(row.sal_costo_total)}</td>

                  <td style={{ ...td, fontWeight: 600, color: "#85b7eb" }}>
                    {fmtCant(row.saldo_cantidad)}
                  </td>
                  <td style={td}>{fmtUnit(row.saldo_costo_unit)}</td>
                  <td style={{ ...td, fontWeight: 600, color: "#85b7eb" }}>
                    {fmtTotal(row.saldo_costo_total)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* PAGINACIÓN */}
      {totalPaginas > 1 && (
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "10px 16px",
          borderTop: "1px solid rgba(55,138,221,0.08)"
        }}>
          <span style={{ fontSize: 10, color: "#2a5080" }}>
            Página {pagina} de {totalPaginas}
          </span>

          <div style={{ display: "flex", gap: 4 }}>
            <PagBtn onClick={() => setPagina(1)} disabled={pagina === 1}>«</PagBtn>
            <PagBtn onClick={() => setPagina(p => p - 1)} disabled={pagina === 1}>‹</PagBtn>
            <PagBtn onClick={() => setPagina(p => p + 1)} disabled={pagina === totalPaginas}>›</PagBtn>
            <PagBtn onClick={() => setPagina(totalPaginas)} disabled={pagina === totalPaginas}>»</PagBtn>
          </div>
        </div>
      )}
    </div>
  );
}

// estilos
const thDark = { background: "#0d1f33" };

const thGrupo = {
  padding: "6px",
  textTransform: "uppercase",
  fontSize: 9,
  color: "white",
};

const thSub = {
  padding: "5px",
  fontSize: 9,
  color: "#3a6080",
};

const td = {
  padding: "6px 8px",
  color: "#6a8ab0",
};

function PagBtn({ onClick, disabled, children }: any) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: "4px 8px",
      borderRadius: 6,
      background: disabled ? "#eee" : "#378ADD",
      color: disabled ? "#888" : "white",
      border: "none",
      cursor: disabled ? "not-allowed" : "pointer"
    }}>
      {children}
    </button>
  );
}