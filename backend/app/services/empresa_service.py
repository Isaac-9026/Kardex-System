from fastapi import HTTPException

from app.models.empresa import Empresa
from app.repositories.empresa_repository import EmpresaRepository
from app.schemas.empresa import EmpresaCreate, EmpresaUpdate


class EmpresaService:

    def __init__(self, repository: EmpresaRepository):
        self.repository = repository

    async def get_all(self):
        return await self.repository.get_all()

    async def get_by_id(self, empresa_id: int):
        empresa = await self.repository.get_by_id(empresa_id)

        if not empresa:
            raise HTTPException(
                status_code=404,
                detail="Empresa no encontrada"
            )

        return empresa

    async def create(self, payload: EmpresaCreate):
        existe = await self.repository.get_by_ruc(
            payload.ruc
        )

        if existe:
            raise HTTPException(
                status_code=400,
                detail=f"Ya existe una empresa con RUC {payload.ruc}"
            )

        empresa = Empresa(**payload.model_dump())

        return await self.repository.create(empresa)

    async def update(
        self,
        empresa_id: int,
        payload: EmpresaUpdate
    ):
        empresa = await self.get_by_id(empresa_id)

        for campo, valor in payload.model_dump(
            exclude_none=True
        ).items():
            setattr(empresa, campo, valor)

        return await self.repository.update(empresa)

    async def delete(self, empresa_id: int):
        empresa = await self.get_by_id(empresa_id)

        await self.repository.delete(empresa)