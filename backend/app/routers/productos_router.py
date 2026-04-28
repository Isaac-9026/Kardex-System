from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.producto_service import ProductoService
from app.schemas.producto import ProductoResponse, ProductoConEstadisticas, ProductoUpdate

router = APIRouter(prefix="/productos", tags=["Productos"])


# ── Listar ────────────────────────────────────────────────────────────────────
@router.get("/")
async def listar_productos(
    limit:  int            = Query(100, ge=1, le=500),
    offset: int            = Query(0,   ge=0),
    search: str | None     = Query(None, description="Buscar por código"),
    db:     AsyncSession   = Depends(get_db),
):
    """Lista todos los productos con paginación y búsqueda opcional por código."""
    service = ProductoService(db)
    return await service.listar(limit=limit, offset=offset, search=search)


# ── Obtener uno ───────────────────────────────────────────────────────────────
@router.get("/{producto_id}", response_model=ProductoConEstadisticas)
async def obtener_producto(
    producto_id: int,
    db:          AsyncSession = Depends(get_db),
):
    """Obtiene un producto con su saldo inicial y estadísticas de movimientos."""
    service = ProductoService(db)
    return await service.obtener(producto_id)


# ── Actualizar descripción ────────────────────────────────────────────────────
@router.patch("/{producto_id}", response_model=ProductoResponse)
async def actualizar_producto(
    producto_id: int,
    data:        ProductoUpdate,
    db:          AsyncSession = Depends(get_db),
):
    """Actualiza la descripción de un producto."""
    service = ProductoService(db)
    return await service.actualizar(producto_id, data)


# ── Eliminar ──────────────────────────────────────────────────────────────────
@router.delete("/{producto_id}")
async def eliminar_producto(
    producto_id: int,
    db:          AsyncSession = Depends(get_db),
):
    """
    Elimina un producto solo si no tiene movimientos registrados.
    Si tiene movimientos retorna error 409.
    """
    service = ProductoService(db)
    return await service.eliminar(producto_id)