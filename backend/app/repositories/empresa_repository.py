from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.empresa import Empresa


class EmpresaRepository:

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self):
        result = await self.db.execute(
            select(Empresa).order_by(Empresa.nombre)
        )
        return result.scalars().all()

    async def get_by_id(self, empresa_id: int):
        result = await self.db.execute(
            select(Empresa).where(Empresa.id == empresa_id)
        )
        return result.scalar_one_or_none()

    async def get_by_ruc(self, ruc: str):
        result = await self.db.execute(
            select(Empresa).where(Empresa.ruc == ruc)
        )
        return result.scalar_one_or_none()

    async def create(self, empresa: Empresa):
        self.db.add(empresa)
        await self.db.commit()
        await self.db.refresh(empresa)
        return empresa

    async def update(self, empresa: Empresa):
        await self.db.commit()
        await self.db.refresh(empresa)
        return empresa

    async def delete(self, empresa: Empresa):
        await self.db.delete(empresa)
        await self.db.commit()