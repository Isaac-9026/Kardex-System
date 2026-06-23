import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FileSpreadsheet, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/Badge";

// ─── INTERFACES PARA TIPADO DE LA API ────────────────────────────────────────
interface EvolucionDia {
  fecha: string;
  procesados: number;
}

interface TopIncidencia {
  codigo: string;
  incidencias: number;
}

interface ArchivoReciente {
  id: number;
  nombre: string;
  fecha: string;
  estado: string;
  registros: number;
}

interface DashboardMetricas {
  evolucion: EvolucionDia[];
  top_incidencias: TopIncidencia[];
  ultimos_archivos: ArchivoReciente[];
}
// ─────────────────────────────────────────────────────────────────────────────

export default function KardexDashboard() {
  const [metricas, setMetricas] = useState<DashboardMetricas | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Llamada real a la API del backend
  useEffect(() => {
    const fetchMetricas = async () => {
      try {
        setCargando(true);
        
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
        
        const res = await fetch(`${apiUrl}/api/v1/dashboard/metricas`);
        if (!res.ok) {
          throw new Error("No se pudieron cargar las métricas del dashboard.");
        }
        
        const data: DashboardMetricas = await res.json();
        setMetricas(data);
        setError(null);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    fetchMetricas();
  }, []);

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "procesado":
        return <Badge className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border-emerald-500/20"><CheckCircle2 className="w-3 h-3 mr-1"/> Limpio</Badge>;
      case "con_alertas":
        return <Badge className="bg-amber-500/15 text-amber-600 hover:bg-amber-500/25 border-amber-500/20"><AlertTriangle className="w-3 h-3 mr-1"/> Alertas</Badge>;
      case "error":
        return <Badge className="bg-rose-500/15 text-rose-600 hover:bg-rose-500/25 border-rose-500/20"><AlertTriangle className="w-3 h-3 mr-1"/> Errores</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  // ════ PANTALLA DE CARGA ════
  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="font-mono text-sm">Cargando métricas de auditoría...</p>
      </div>
    );
  }

  // ════ PANTALLA DE ERROR ════
  if (error || !metricas) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 text-rose-500">
        <AlertTriangle className="w-10 h-10" />
        <p className="font-medium">Ocurrió un problema: {error}</p>
      </div>
    );
  }

  // ════ RENDERIZADO DEL DASHBOARD REAL ════
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Panel de Auditoría</h2>
        <p className="text-muted-foreground">Monitoreo de calidad y procesamiento de Kardex.</p>
      </div>

      {/* ════ GRÁFICO PRINCIPAL: EVOLUCIÓN DE PROCESAMIENTOS ════ */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-500" />
            Volumen de Archivos Procesados
          </CardTitle>
          <CardDescription>Cantidad de Excels de Kardex auditados en los últimos 7 días.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] w-full mt-4">
            {metricas.evolucion.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground border border-dashed rounded-lg">
                No hay datos de procesamiento en los últimos 7 días.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metricas.evolucion} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888833" />
                  <XAxis 
                    dataKey="fecha" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#888' }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#888' }}
                    allowDecimals={false}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    labelStyle={{ fontWeight: 'bold', color: '#333' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="procesados" 
                    name="Archivos"
                    stroke="#3b82f6" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} 
                    activeDot={{ r: 6 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ════ DOS COLUMNAS: TOP INCIDENCIAS Y ÚLTIMOS ARCHIVOS ════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* GRÁFICO BARRAS: TOP PRODUCTOS CON INCIDENCIAS */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Top Productos con Incidencias
            </CardTitle>
            <CardDescription>Códigos que requirieron más recálculos o tienen errores matemáticos.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-2">
              {metricas.top_incidencias.length === 0 ? (
                 <div className="flex h-full items-center justify-center text-sm text-muted-foreground border border-dashed rounded-lg">
                   ¡Excelente! No se registran incidencias actualmente.
                 </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={metricas.top_incidencias} 
                    layout="vertical" 
                    margin={{ top: 5, right: 30, bottom: 5, left: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#88888833" />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="codigo" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: '#555', fontWeight: 600 }}
                    />
                    <Tooltip 
                      cursor={{ fill: '#f1f5f9' }}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    />
                    <Bar 
                      dataKey="incidencias" 
                      name="Alertas/Errores"
                      fill="#f59e0b" 
                      radius={[0, 4, 4, 0]} 
                      barSize={24}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* TABLA: ÚLTIMOS ARCHIVOS */}
        <Card className="shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">Actividad Reciente</CardTitle>
            <CardDescription>Los últimos reportes subidos al sistema.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            {metricas.ultimos_archivos.length === 0 ? (
               <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground border border-dashed rounded-lg mt-2">
                 No hay actividad reciente.
               </div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead>Archivo</TableHead>
                    <TableHead>Registros</TableHead>
                    <TableHead className="text-right">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metricas.ultimos_archivos.map((archivo) => (
                    <TableRow key={archivo.id} className="hover:bg-muted/20">
                      <TableCell className="font-medium">
                        <div className="truncate w-[180px] sm:w-[220px]" title={archivo.nombre}>
                          {archivo.nombre}
                        </div>
                        <div className="text-xs text-muted-foreground font-normal mt-1">
                          {archivo.fecha}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs font-mono">
                        {archivo.registros.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {getEstadoBadge(archivo.estado)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}