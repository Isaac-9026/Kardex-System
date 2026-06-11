from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories import ProductoRepository, SaldoRepository
from app.schemas.saldo_inicial import (
    SaldoInicialCreate,
    SaldoInicialUpdate,
    SaldoInicialResponse,
    SaldoInicialConAdvertencia,
)
from app.exceptions import KardexException
from decimal import Decimal


class SaldoService:

    def __init__(self, db: AsyncSession):
        self.db            = db
        self.saldo_repo    = SaldoRepository(db)
        self.producto_repo = ProductoRepository(db)

    # ── Listar ────────────────────────────────────────────────────────────────
    async def listar(
        self,
        limit:  int = 100,
        offset: int = 0,
    ) -> list[SaldoInicialResponse]:
        saldos = await self.saldo_repo.get_all(limit=limit, offset=offset)
        return [self._to_response(s) for s in saldos]

    # ── Obtener uno ───────────────────────────────────────────────────────────
    async def obtener(self, saldo_id: int) -> SaldoInicialResponse:
        saldo = await self.saldo_repo.get_by_id(saldo_id)
        if not saldo:
            raise KardexException(f"Saldo inicial #{saldo_id} no encontrado.", status_code=404)
        return self._to_response(saldo)

    # ── Crear ─────────────────────────────────────────────────────────────────
    async def crear(self, data: SaldoInicialCreate) -> SaldoInicialConAdvertencia:
        # 🧠 FIX MAESTRO: Buscamos primero si el código ya existe a nivel GLOBAL en todo el sistema.
        # Usamos 'get_by_codigo' o similar de tu repositorio que busque solo por el String 'codigo'.
        # Si no lo tienes, usamos get_or_create pero pasándole por defecto la empresa_id de control (1 para SIN ASIGNAR)
        # para que siempre busque en el mismo sitio, o idealmente su buscador global.
        
        # Intentemos recuperar el producto existente únicamente por su código único
        producto_existente = await self.producto_repo.get_by_codigo(data.codigo)
        
        if producto_existente:
            # 🟢 Si el producto ya existe en el catálogo, USAMOS ESE MISMO, no creamos nada.
            producto = producto_existente
        else:
            # 🟡 Si el producto es completamente nuevo en el universo del sistema, lo hacemos nacer
            # Priorizamos la empresa que manda el formulario, o si viene vacía, lo mandamos a 'SIN ASIGNAR' (ID: 1)
            empresa_destino = data.empresa_id if data.empresa_id else 1
            producto = await self.producto_repo.get_or_create(
                codigo      = data.codigo,
                empresa_id  = empresa_destino,
                descripcion = data.descripcion,
            )

        costo_total = data.costo_total or Decimal(str(
            float(data.cantidad) * float(data.costo_unitario)
        ))

        # El upsert creará el saldo inicial amarrado al ID único del producto original de forma correcta
        saldo, total_proc = await self.saldo_repo.upsert(
            producto_id    = producto.id,
            fecha          = data.fecha,
            cantidad       = data.cantidad,
            costo_unitario = data.costo_unitario,
            costo_total    = costo_total,
        )

        return SaldoInicialConAdvertencia(
            **self._to_response(saldo).model_dump(),
            advertencia = self._advertencia(total_proc),
        )

    # ── Actualizar ────────────────────────────────────────────────────────────
    async def actualizar(
        self,
        saldo_id: int,
        data:     SaldoInicialUpdate,
    ) -> SaldoInicialConAdvertencia:
        costo_total = data.costo_total or Decimal(str(
            float(data.cantidad) * float(data.costo_unitario)
        ))

        saldo, total_proc = await self.saldo_repo.update(
            saldo_id       = saldo_id,
            fecha          = data.fecha,
            cantidad       = data.cantidad,
            costo_unitario = data.costo_unitario,
            costo_total    = costo_total,
            descripcion    = data.descripcion,
        )

        if data.descripcion is not None and saldo and saldo.producto_id:
            await self.producto_repo.update(
                producto_id = saldo.producto_id,
                descripcion = data.descripcion,
            )
            saldo = await self.saldo_repo.get_by_id(saldo_id)

        return SaldoInicialConAdvertencia(
            **self._to_response(saldo).model_dump(),
            advertencia = self._advertencia(total_proc),
        )

    # ── Eliminar múltiple ─────────────────────────────────────────────────────
    async def eliminar_multiple(self, ids: list[int]) -> dict:
        eliminados         = 0
        con_procesamientos = 0

        for saldo_id in ids:
            try:
                total_proc = await self.saldo_repo.delete(saldo_id)
                eliminados += 1
                if total_proc > 0:
                    con_procesamientos += 1
            except Exception:
                continue

        advertencia = None
        if con_procesamientos > 0:
            advertencia = (
                f"{con_procesamientos} de los saldos eliminados ya habían sido "
                f"usados en procesamientos. Los procesamientos anteriores no se "
                f"recalcularán automáticamente."
            )

        return {
            "eliminados":  eliminados,
            "mensaje":     f"{eliminados} saldo(s) eliminado(s) correctamente.",
            "advertencia": advertencia,
        }

    # ── Eliminar Individual ───────────────────────────────────────────────────
    async def eliminar(self, saldo_id: int) -> dict:
        """Elimina un único saldo inicial por su ID verificando procesamientos."""
        saldo = await self.saldo_repo.get_by_id(saldo_id)
        if not saldo:
            raise KardexException(f"Saldo inicial #{saldo_id} no encontrado.", status_code=404)
        
        # Ejecuta la eliminación en el repositorio y recupera el impacto
        total_proc = await self.saldo_repo.delete(saldo_id)
        
        advertencia = None
        if total_proc > 0:
            advertencia = (
                f"El saldo inicial eliminado ya había sido usado en {total_proc} "
                f"procesamiento(s). Los estados anteriores no se recalcularán."
            )
            
        return {
            "id": saldo_id,
            "mensaje": f"Saldo inicial #{saldo_id} eliminado correctamente.",
            "advertencia": advertencia
        }
    
    # ── Helpers privados ──────────────────────────────────────────────────────
    def _to_response(self, saldo) -> SaldoInicialResponse:
        # Definimos el formato deseado: '0.00' para 2 decimales, o '0.0000' para 4.
        formato = Decimal('0.0000')
        
        return SaldoInicialResponse(
            id             = saldo.id,
            empresa_id     = saldo.producto.empresa_id,
            producto_id    = saldo.producto_id,
            codigo         = saldo.producto.codigo if saldo.producto else "",
            descripcion    = saldo.producto.descripcion if saldo.producto else None,
            fecha          = saldo.fecha,
            cantidad       = saldo.cantidad.quantize(formato),       
            costo_unitario = saldo.costo_unitario.quantize(formato), 
            costo_total    = saldo.costo_total.quantize(formato),
            creado_en      = saldo.creado_en,
        )

    def _advertencia(self, total_proc: int) -> str | None:
        if total_proc == 0:
            return None
        return (
            f"Este saldo ya fue usado en {total_proc} procesamiento(s). "
            f"Los procesamientos anteriores no se recalcularán automáticamente. "
            f"Si necesitas corregir resultados pasados, reprocesa el archivo correspondiente."
        )