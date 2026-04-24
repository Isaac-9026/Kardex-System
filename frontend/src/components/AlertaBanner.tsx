import type { AlertasProcesamiento, KardexRow } from "../types";

interface AlertaBannerProps {
  alertas: AlertasProcesamiento;
  erroresIntegridad: number;
  movimientos: KardexRow[];
}

export default function AlertaBanner({
  alertas,
  erroresIntegridad,
  movimientos,
}: AlertaBannerProps) {
  // ── Filas con errores (runtime) ───────────────────────────────
  const filasErrorA = movimientos.filter((m) => m.error_a).map((m) => m.fila);

  const filasErrorB = movimientos.filter((m) => m.error_b).map((m) => m.fila);

  const filasSaldoNegativo = movimientos
    .filter((m) => m.saldo_negativo)
    .map((m) => m.fila);

  // ── Evaluación global de alertas ──────────────────────────────
  const hayAlertas =
    alertas.sin_saldo_inicial.length > 0 ||
    alertas.saldo_negativo.length > 0 ||
    alertas.duplicados.length > 0 ||
    erroresIntegridad > 0 ||
    filasErrorA.length > 0 ||
    filasErrorB.length > 0 ||
    filasSaldoNegativo.length > 0;

  if (!hayAlertas) {
    return (
      <div
        className="flex items-center gap-2 bg-green-50 border border-green-200
                      text-green-800 rounded-xl px-4 py-3 text-sm"
      >
        <span className="text-base">✅</span>
        <span>
          Verificación de integridad correcta — todos los registros son
          consistentes.
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Duplicados — error crítico */}
      {alertas.duplicados.length > 0 && (
        <Banner
          tipo="error"
          icono="❌"
          titulo="Códigos duplicados en múltiples archivos"
          items={alertas.duplicados}
        />
      )}

      {/* Saldo negativo */}
      {alertas.saldo_negativo.length > 0 && (
        <Banner
          tipo="error"
          icono="❌"
          titulo={`Saldo negativo detectado en ${alertas.saldo_negativo.length} producto(s)`}
          items={alertas.saldo_negativo}
          descripcion="Hay más salidas que stock disponible. Filas afectadas en rojo."
        />
      )}

      {/* Sin saldo inicial */}
      {alertas.sin_saldo_inicial.length > 0 && (
        <Banner
          tipo="warning"
          icono="⚠️"
          titulo="Productos sin saldo inicial (calculados desde cero)"
          items={alertas.sin_saldo_inicial}
        />
      )}

      {/* Errores de integridad */}
      {erroresIntegridad > 0 && (
        <Banner
          tipo="warning"
          icono="⚠️"
          titulo={`${erroresIntegridad} fila(s) con anomalías de integridad`}
          descripcion='Activa "Mostrar verificación" en la tabla para ver el detalle.'
        />
      )}

      {/* Detalle por filas (runtime) */}
      {(filasErrorA.length > 0 || filasErrorB.length > 0) && (
        <Banner
          tipo="info"
          icono="🔍"
          titulo="Detalle de filas con inconsistencias"
          descripcion="Estas filas presentan diferencias detectadas en el cálculo."
          items={[
            ...(filasErrorA.length > 0
              ? [`🔴 Error cálculo: ${filasErrorA.join(", ")}`]
              : []),
            ...(filasErrorB.length > 0
              ? [`🟡 Inconsistencia: ${filasErrorB.join(", ")}`]
              : []),
          ]}
        />
      )}
    </div>
  );
}

// ── Sub-componente Banner ─────────────────────────────────────────────────────
interface BannerProps {
  tipo: "error" | "warning" | "info";
  icono: string;
  titulo: string;
  items?: string[];
  descripcion?: string;
}

function Banner({ tipo, icono, titulo, items, descripcion }: BannerProps) {
  const estilos = {
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  };

  return (
    <div
      className={`flex gap-3 border rounded-xl px-4 py-3 text-sm ${estilos[tipo]}`}
    >
      <span className="text-base shrink-0 mt-0.5">{icono}</span>
      <div className="min-w-0">
        <p className="font-semibold">{titulo}</p>
        {descripcion && (
          <p className="text-xs mt-0.5 opacity-80">{descripcion}</p>
        )}
        {items && items.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {items.map((item) => (
              <span
                key={item}
                className="inline-block bg-white bg-opacity-60 border
                           border-current rounded-full px-2 py-0.5 text-xs font-mono"
              >
                {item}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
