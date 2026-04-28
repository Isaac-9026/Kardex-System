from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete
from app.core.database import get_db
from app.repositories import ProcesamientoRepository, MovimientoRepository
from app.schemas.procesamiento import ProcesamientoResponse, ProcesamientoResumen
from app.exceptions import NotFoundException, KardexException

router = APIRouter(prefix="/historial", tags=["Historial"])


@router.get("/", response_model=list[ProcesamientoResumen])
async def listar_historial(
    limit:  int = Query(20, ge=1, le=100),
    offset: int = Query(0,  ge=0),
    db:     AsyncSession = Depends(get_db),
):
    """Lista el historial de procesamientos del más reciente al más antiguo."""
    repo = ProcesamientoRepository(db)
    return await repo.get_historial(limit=limit, offset=offset)


@router.get("/{procesamiento_id}", response_model=ProcesamientoResponse)
async def obtener_procesamiento(
    procesamiento_id: int,
    db: AsyncSession = Depends(get_db),
):
    """ Retorna el detalle de un procesamiento con sus alertas."""
    repo          = ProcesamientoRepository(db)
    procesamiento = await repo.get_by_id(procesamiento_id)
    if not procesamiento:
        raise NotFoundException(f"Procesamiento #{procesamiento_id} no encontrado.")
    return procesamiento


@router.delete("/{procesamiento_id}")
async def eliminar_procesamiento(
    procesamiento_id: int,
    db: AsyncSession = Depends(get_db),
):
    """
    Elimina un procesamiento y todos sus movimientos asociados (CASCADE).
    Util para limpiar procesamientos incorrectos o de prueba.
    """
    proc_repo = ProcesamientoRepository(db)
    mov_repo  = MovimientoRepository(db)

    procesamiento = await proc_repo.get_by_id(procesamiento_id)
    if not procesamiento:
        raise NotFoundException(f"Procesamiento #{procesamiento_id} no encontrado.")

    # Borrar movimientos primero (esto evita FK violation)
    await mov_repo.delete_by_procesamiento(procesamiento_id)

    #Borrar procesamiento
    await db.delete(procesamiento)

    return {
        "mensaje": f"Procesamiento #{procesamiento_id} y sus movimientos eliminados correctamente.",
        "archivo": procesamiento.nombre_archivo,
    }