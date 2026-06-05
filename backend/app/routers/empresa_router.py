from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db

from app.schemas.empresa import (
    EmpresaCreate,
    EmpresaUpdate,
    EmpresaResponse
)

from app.repositories.empresa_repository import EmpresaRepository
from app.services.empresa_service import EmpresaService

router = APIRouter(
    prefix="/empresa",
    tags=["Empresa"]
)


def get_service(
    db: AsyncSession = Depends(get_db)
):
    repository = EmpresaRepository(db)
    return EmpresaService(repository)


@router.get(
    "/",
    response_model=list[EmpresaResponse]
)
async def get_empresas(
    service: EmpresaService = Depends(get_service)
):
    return await service.get_all()


@router.get(
    "/{empresa_id}",
    response_model=EmpresaResponse
)
async def get_empresa(
    empresa_id: int,
    service: EmpresaService = Depends(get_service)
):
    return await service.get_by_id(empresa_id)


@router.post(
    "/",
    response_model=EmpresaResponse,
    status_code=status.HTTP_201_CREATED
)
async def crear_empresa(
    payload: EmpresaCreate,
    service: EmpresaService = Depends(get_service)
):
    return await service.create(payload)


@router.put(
    "/{empresa_id}",
    response_model=EmpresaResponse
)
async def actualizar_empresa(
    empresa_id: int,
    payload: EmpresaUpdate,
    service: EmpresaService = Depends(get_service)
):
    return await service.update(
        empresa_id,
        payload
    )


@router.delete(
    "/{empresa_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
async def eliminar_empresa(
    empresa_id: int,
    service: EmpresaService = Depends(get_service)
):
    await service.delete(empresa_id)