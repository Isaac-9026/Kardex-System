from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.models.saldo_inicial import SaldoInicial
from datetime import date
from decimal import Decimal


class SaldoRepository:

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_producto(self, producto_id: int) -> SaldoInicial | None:
        result = await self.db.execute(
            select(SaldoInicial).where(SaldoInicial.producto_id == producto_id)
        )
        return result.scalar_one_or_none()

    async def upsert(
        self,
        producto_id:    int,
        fecha:          date,
        cantidad:       Decimal,
        costo_unitario: Decimal,
        costo_total:    Decimal,
    ) -> SaldoInicial:
        """Crea o actualiza el saldo inicial de un producto."""
        saldo = await self.get_by_producto(producto_id)
        if saldo:
            saldo.fecha          = fecha
            saldo.cantidad       = cantidad
            saldo.costo_unitario = costo_unitario
            saldo.costo_total    = costo_total
        else:
            saldo = SaldoInicial(
                producto_id    = producto_id,
                fecha          = fecha,
                cantidad       = cantidad,
                costo_unitario = costo_unitario,
                costo_total    = costo_total,
            )
            self.db.add(saldo)

        await self.db.flush()
        return saldo

    async def get_all(self) -> list[SaldoInicial]:
        result = await self.db.execute(select(SaldoInicial))
        return list(result.scalars().all())