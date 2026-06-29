import { Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createPortal } from "react-dom"

export default function ManualUsuario() {
  const handlePrint = () => {
    window.print()
  }

  const manualContent = (
    <>
      {/* --- INICIO DEL CONTENIDO IMPRIMIBLE --- */}
        <div className="flex flex-col gap-10 bg-card p-10 rounded-xl border border-border/50 print-box text-left">

          {/* Portada */}
          <div className="text-center py-20 border-b border-border/40 print-cover">
            <h1 className="text-5xl font-black mb-4">Manual de Usuario</h1>
            <h2 className="text-2xl text-muted-foreground">Sistema Kardex V1.0</h2>
          </div>


          <section className="space-y-4">
            <h2 className="text-2xl font-bold border-l-4 border-primary pl-4">
              1. Introducción
            </h2>

            <p className="text-foreground/80 leading-relaxed">
              El Sistema Kardex Valorizado permite procesar movimientos de inventario
              utilizando el método de Costo Promedio Ponderado (CPP), calculando de forma
              automática los costos de entradas, salidas y saldos finales.
            </p>

            <p className="text-foreground/80 leading-relaxed">
              El sistema está diseñado para trabajar con archivos Excel provenientes de
              diferentes fuentes, detectar inconsistencias, validar cálculos y generar
              reportes listos para revisión contable y administrativa.
            </p>

            <p className="text-foreground/80 leading-relaxed">
              Además, conserva un historial de procesamientos, permite administrar
              productos y empresas, registrar múltiples saldos iniciales y recalcular
              información histórica cuando sea necesario.
            </p>
          </section>


          <section className="space-y-4">
            <h2 className="text-2xl font-bold border-l-4 border-primary pl-4">
              2. Empresas y Productos
            </h2>

            <p className="text-foreground/80 leading-relaxed">
              Los productos pueden estar asociados a una empresa para facilitar su organización y gestión. Si durante el procesamiento no se selecciona una empresa, los productos podrán ser asignados posteriormente desde el módulo de Productos. Esta relación permite
              organizar la información y generar reportes correctamente.
            </p>

            <p className="text-foreground/80 leading-relaxed">
              Cuando se procesa un archivo y el sistema encuentra códigos de productos que
              aún no existen en la base de datos, estos se registran automáticamente para
              evitar interrumpir el proceso.
            </p>

            <p className="text-foreground/80 leading-relaxed">
              Posteriormente, se recomienda ingresar al módulo de Productos para completar
              la información faltante, asignar nombres descriptivos y relacionarlos con la
              empresa correspondiente.
            </p>
          </section>

          <div className="page-break" />


          <section className="space-y-4">
            <h2 className="text-2xl font-bold border-l-4 border-primary pl-4">
              3. Registro de Saldos Iniciales
            </h2>

            <p className="text-foreground/80 leading-relaxed">
              Los saldos iniciales representan el punto de partida para los cálculos del
              Kardex.
            </p>

            <p className="text-foreground/80 leading-relaxed">
              Un mismo producto puede tener varios saldos iniciales registrados en
              diferentes fechas. Esto permite recalcular información histórica sin perder
              registros anteriores.

            </p>

            <p className="text-foreground/80 leading-relaxed">
              Durante el procesamiento, el sistema buscará automáticamente el saldo inicial
              cuya fecha sea la más cercana y anterior al primer movimiento encontrado para
              dicho producto.
            </p>

            <p className="text-foreground/80 leading-relaxed">
              Si no existe un saldo inicial válido para la fecha procesada, el sistema
              continuará el cálculo utilizando saldo cero y generará una alerta para que el
              usuario pueda revisar la información.
            </p>

            <p className="text-foreground/80 leading-relaxed">
              Por este motivo, es importante registrar correctamente las fechas de los
              saldos iniciales. Una fecha incorrecta puede provocar que se utilice un
              saldo diferente al esperado.
            </p>

            <ul className="list-disc list-inside text-foreground/80 space-y-2 ml-4">
              <li>Registro manual mediante formulario.</li>
              <li>Carga masiva mediante archivo Excel.</li>
              <li>Múltiples saldos por producto.</li>
              <li>Selección automática según fecha.</li>
            </ul>
          </section>


          <section className="space-y-4">
            <h2 className="text-2xl font-bold border-l-4 border-primary pl-4">
              4. Procesamiento de Movimientos
            </h2>

            <p className="text-foreground/80 leading-relaxed">
              Los archivos de movimientos contienen las compras, ventas y devoluciones
              que serán utilizadas para calcular el Kardex valorizado.
            </p>

            <ol className="list-decimal list-inside text-foreground/80 space-y-2 ml-4">
              <li>Selecciona una empresa (opcional).</li>
              <li>Sube uno o varios archivos Excel.</li>
              <li>Verifica que los archivos cargados sean correctos.</li>
              <li>Haz clic en "Procesar Kardex".</li>
            </ol>

            <p className="text-foreground/80 leading-relaxed">
              Si no se selecciona una empresa, los productos podrán ser asignados
              posteriormente desde la sección Productos.
            </p>

            <p className="text-foreground/80 leading-relaxed">
              Si no existe un saldo inicial válido para la fecha procesada, el sistema
              continuará el cálculo utilizando saldo cero y generará una alerta para que el
              usuario pueda revisar la información.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold border-l-4 border-primary pl-4">
              5. Resultados y Validaciones
            </h2>

            <p className="text-foreground/80 leading-relaxed">
              Después del procesamiento, el sistema mostrará las validaciones detectadas
              durante el análisis.
            </p>

            <ul className="list-disc list-inside text-foreground/80 space-y-2 ml-4">
              <li>
                🟢 <strong>Correcto:</strong> No se detectaron inconsistencias.
              </li>

              <li>
                🟡 <strong>Advertencia (Error B):</strong> Se detectó una diferencia
                matemática entre los valores registrados en el archivo original.
              </li>

              <li>
                🔴 <strong>Error (Error A):</strong> Los costos calculados por el sistema
                difieren de los registrados en el archivo procesado.
              </li>

              <li>
                ⚫ <strong>Crítico:</strong> Se detectó saldo negativo o múltiples
                inconsistencias simultáneas que requieren revisión inmediata.
              </li>
            </ul>

            <p className="text-foreground/80 leading-relaxed">
              La tolerancia permite definir el margen aceptable para diferencias de
              redondeo entre los cálculos del sistema y los valores registrados en el
              archivo original.
            </p>

            <p className="text-foreground/80 leading-relaxed">
              Diferencias menores o iguales a la tolerancia configurada no serán marcadas
              como inconsistencias. Esta configuración puede ajustarse desde la pantalla de
              resultados para realizar nuevos análisis sin necesidad de reprocesar los
              archivos.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold border-l-4 border-primary pl-4">
              6. Historial de Procesamientos
            </h2>

            <p className="text-foreground/80 leading-relaxed">
              Todos los archivos procesados quedan almacenados en el historial.
            </p>

            <p className="text-foreground/80 leading-relaxed">
              El historial permite consultar procesamientos anteriores sin necesidad de
              volver a cargar los archivos originales.
            </p>

            <p className="text-foreground/80 leading-relaxed">
              Desde esta sección puedes revisar procesos anteriores, consultar resultados
              y realizar auditorías sobre información ya calculada.
            </p>

            <p className="text-foreground/80 leading-relaxed">
              Se recomienda eliminar archivos de prueba, duplicados o que ya no sean
              necesarios para mantener el historial organizado.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold border-l-4 border-primary pl-4">
              7. Reportes e Impresión
            </h2>

            <p className="text-foreground/80 leading-relaxed">
              Antes de generar un reporte PDF o imprimir información, se recomienda
              utilizar los filtros disponibles en la página de Movimientos.
            </p>

            <p className="text-foreground/80 leading-relaxed">
              Puedes filtrar por fechas, meses, productos u otros criterios según la
              información que necesites presentar.
            </p>

            <p className="text-foreground/80 leading-relaxed">
              Una vez aplicado el filtro, el sistema generará reportes únicamente con la
              información visible, facilitando la impresión de periodos específicos.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold border-l-4 border-primary pl-4">
              8. Recomendaciones
            </h2>

            <ul className="list-disc list-inside text-foreground/80 space-y-2 ml-4">
              <li>Verifica las fechas de los saldos iniciales antes de procesar.</li>
              <li>Asigna correctamente los productos a sus empresas.</li>
              <li>Revisa periódicamente el historial de procesos.</li>
              <li>Elimina archivos de prueba que ya no utilices.</li>
              <li>Analiza los semáforos antes de exportar reportes finales.</li>
              <li>Utiliza filtros para imprimir únicamente la información necesaria.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold border-l-4 border-primary pl-4">
              9. Flujo Recomendado de Trabajo
            </h2>

            <ol className="list-decimal list-inside text-foreground/80 space-y-2 ml-4">
              <li>Registrar empresas (opcional).</li>
              <li>Registrar o importar saldos iniciales.</li>
              <li>Subir los archivos de movimientos.</li>
              <li>Procesar el Kardex.</li>
              <li>Revisar alertas e inconsistencias.</li>
              <li>Ajustar la tolerancia si es necesario.</li>
              <li>Asignar nombres y empresas a productos nuevos.</li>
              <li>Generar reportes o exportar resultados.</li>
            </ol>
          </section>

        </div>
    </>
  );

  return (
    <>
      <style>{`
        @media screen { .kp-section { display:none !important; } }

        @media print {
          @page {
            size: A4 portrait;
            margin: 0 !important; /* 1. MATA TODOS LOS TEXTOS, URL Y FECHAS DEL NAVEGADOR */
          }

          [data-sidebar="sidebar"],
          [data-slot="sidebar"],
          [data-collapsible],
          aside,
          header,
          footer,
          nav,
          .site-header,
          .site-footer {
            display: none !important;
            width: 0 !important;
          }

          #root {
            display: none !important;
          }

          body, html {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .ks-section { display: none !important; }
          .kp-section { display: block !important; }

          .kp-manual-block {
            box-sizing: border-box;
          }

          .print-table {
            width: 100%;
            border-collapse: collapse;
          }
          .print-table thead {
            display: table-header-group;
          }
          .print-table tfoot {
            display: table-footer-group;
          }
          .print-table tbody, .print-table tr, .print-table td {
            page-break-inside: auto;
          }

          .print-box { 
            border: none !important; 
            background: white !important; 
            box-shadow: none !important; 
            padding: 0 !important;
            gap: 0 !important;
          }
          
          h1, h2, h3 { 
            color: #000 !important; 
            page-break-after: avoid; 
          }
          
          p, ul, ol, li { 
            color: #333 !important; 
            font-size: 11pt; 
            line-height: 1.6; 
            orphans: 3;
            widows: 3;
          }
          
          section { 
            page-break-inside: avoid; 
            margin-bottom: 2.5rem !important; 
          }
          
          .border-l-4 {
            border-left-width: 4px !important;
            border-color: #000 !important;
            padding-left: 12px !important;
            margin-bottom: 1rem !important;
          }

          .print-cover {
            height: 65vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            border-bottom: none !important;
            page-break-after: always;
            margin-bottom: 0 !important;
            padding: 0 !important;
          }
          
          .print-cover h1 {
            font-size: 42pt !important;
            margin-bottom: 1.5rem !important;
            text-align: center;
          }
          
          .print-cover h2 {
            font-size: 20pt !important;
            color: #555 !important;
            text-align: center;
          }
          
          /* Evitar cortes feos en listas */
          ul, ol {
            page-break-inside: avoid;
          }

          .page-break {
            page-break-before: always;
          }
        }
      `}</style>

      {/* Vista en pantalla */}
      <div className="flex flex-col gap-6 p-4 lg:p-8 w-full max-w-4xl mx-auto ks-section">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6 text-left">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Manual de Usuario PDF
            </h1>
            <p className="text-muted-foreground mt-1">
              Vista optimizada para impresión. Haz clic en "Imprimir PDF" para guardar este documento.
            </p>
          </div>
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Imprimir PDF
          </Button>
        </div>
        {manualContent}
      </div>

      {/* Vista en impresión (inyectada en el body) */}
      {createPortal(
        <div className="kp-section w-full relative">
          <table className="print-table">
            <thead>
              <tr><td style={{ height: '2.5cm', border: 'none', padding: 0 }}></td></tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '0 2cm', border: 'none' }}>
                  {manualContent}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr><td style={{ height: '2cm', border: 'none', padding: 0 }}></td></tr>
            </tfoot>
          </table>
        </div>,
        document.body
      )}
    </>
  )
}
