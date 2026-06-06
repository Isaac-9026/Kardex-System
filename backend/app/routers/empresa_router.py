from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db

from app.schemas.empresa import EmpresaCreate, EmpresaUpdate, EmpresaResponse
from app.services.empresa_service import EmpresaService

router = APIRouter(prefix="/empresa", tags=["Empresa"])


# ---- INYECCIÓN DE DEPENDENCIAS ---------------------
def get_empresa_service(db: AsyncSession = Depends(get_db)) -> EmpresaService:
    return EmpresaService(db)
# --------------------------


@router.get(
    "/", 
    response_model=list[EmpresaResponse]
)
async def listar_empresas(
    service: EmpresaService = Depends(get_empresa_service)
):
    return await service.listar()


@router.get(
    "/{empresa_id}", 
    response_model=EmpresaResponse
)
async def obtener_empresa(
    empresa_id: int, 
    service: EmpresaService = Depends(get_empresa_service)
):
    return await service.obtener(empresa_id)


@router.post(
    "/", 
    response_model=EmpresaResponse, 
    status_code=status.HTTP_201_CREATED
)
async def crear_empresa(
    data: EmpresaCreate, 
    service: EmpresaService = Depends(get_empresa_service)
):
    return await service.crear(data)


@router.put(
    "/{empresa_id}", 
    response_model=EmpresaResponse
)
async def actualizar_empresa(
    empresa_id: int,
    data:       EmpresaUpdate,
    service:    EmpresaService = Depends(get_empresa_service),
):
    return await service.actualizar(empresa_id, data)


@router.delete(
    "/{empresa_id}", 
    status_code=status.HTTP_204_NO_CONTENT
)
async def eliminar_empresa(
    empresa_id: int, 
    service: EmpresaService = Depends(get_empresa_service)
):
    await service.eliminar(empresa_id)