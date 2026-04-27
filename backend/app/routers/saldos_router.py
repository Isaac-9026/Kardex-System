"""
Router: /api/v1/saldos
Agrega este archivo en backend/app/routers/saldos.py
y registralo en main.py con:
    from app.routers.saldos import router as saldos_router
    app.include_router(saldos_router, prefix="/api/v1", tags=["saldos"])
"""

from fastapi           import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic          import BaseModel, Field, condecimal
from datetime          import date
from decimal           import Decimal

from app.core.database import get_db
from app.repositories.producto_repository import ProductoRepository
from app.repositories.saldo_repository    import SaldoRepository

router = APIRouter()


# ── Schema de entrada ─────────────────────────────────────────────────────────
class SaldoManualIn(BaseModel):
    codigo:         str     = Field(..., min_length=1, max_length=20,
                                    description="Código del producto (se crea si no existe)")
    fecha:          date    = Field(..., description="Fecha del saldo inicial YYYY-MM-DD")
    cantidad:       Decimal = Field(..., gt=0, description="Cantidad en stock")
    costo_unitario: Decimal = Field(..., gt=0, description="Costo unitario CPP")


# ── Schema de salida ──────────────────────────────────────────────────────────
class SaldoManualOut(BaseModel):
    ok:             bool
    codigo:         str
    producto_id:    int
    fecha:          date
    cantidad:       float
    costo_unitario: float
    costo_total:    float
    mensaje:        str

    model_config = {"from_attributes": True}


# ── Endpoint ──────────────────────────────────────────────────────────────────
@router.post(
    "/saldos/manual",
    response_model = SaldoManualOut,
    summary        = "Agregar o actualizar saldo inicial manual",
    description    = (
        "Crea o actualiza el saldo inicial de un producto por código. "
        "Si el producto no existe en la BD se crea automáticamente. "
        "El costo_total se calcula internamente (cantidad × costo_unitario)."
    ),
)
async def agregar_saldo_manual(
    payload: SaldoManualIn,
    db:      AsyncSession = Depends(get_db),
) -> SaldoManualOut:

    codigo = payload.codigo.strip().upper()

    producto_repo = ProductoRepository(db)
    saldo_repo    = SaldoRepository(db)

    # 1. Obtener o crear el producto
    producto = await producto_repo.get_or_create(codigo)

    # 2. Calcular costo total
    costo_total = payload.cantidad * payload.costo_unitario

    # 3. Upsert saldo inicial
    saldo = await saldo_repo.upsert(
        producto_id    = producto.id,
        fecha          = payload.fecha,
        cantidad       = payload.cantidad,
        costo_unitario = payload.costo_unitario,
        costo_total    = costo_total,
    )

    # 4. Commit
    await db.commit()

    return SaldoManualOut(
        ok             = True,
        codigo         = codigo,
        producto_id    = producto.id,
        fecha          = saldo.fecha,
        cantidad       = float(saldo.cantidad),
        costo_unitario = float(saldo.costo_unitario),
        costo_total    = float(saldo.costo_total),
        mensaje        = f"Saldo inicial para '{codigo}' guardado correctamente.",
    )


# ── Listar todos los saldos (útil para debug / vista Saldos) ──────────────────
class SaldoResumen(BaseModel):
    producto_id:    int
    codigo:         str
    fecha:          date
    cantidad:       float
    costo_unitario: float
    costo_total:    float

    model_config = {"from_attributes": True}


@router.get(
    "/saldos",
    response_model = list[SaldoResumen],
    summary        = "Listar todos los saldos iniciales",
)
async def listar_saldos(db: AsyncSession = Depends(get_db)) -> list[SaldoResumen]:
    repo   = SaldoRepository(db)
    saldos = await repo.get_all_con_producto()
    return [
        SaldoResumen(
            producto_id    = s.producto_id,
            codigo         = s.producto.codigo if s.producto else "?",
            fecha          = s.fecha,
            cantidad       = float(s.cantidad),
            costo_unitario = float(s.costo_unitario),
            costo_total    = float(s.costo_total),
        )
        for s in saldos
    ]