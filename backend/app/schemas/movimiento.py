from pydantic import BaseModel, computed_field
from datetime import date, datetime
from decimal import Decimal
from typing import Literal, Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.producto import Producto


class MovimientoBase(BaseModel):
    fecha:            date
    tipo_comprobante: int
    serie:            str
    numero:           str
    tipo_operacion:   str

    # Entradas
    ent_cantidad:    Decimal = Decimal("0")
    ent_costo_unit:  Decimal = Decimal("0")
    ent_costo_total: Decimal = Decimal("0")

    # Salidas
    sal_cantidad:    Decimal = Decimal("0")
    sal_costo_unit:  Decimal = Decimal("0")
    sal_costo_total: Decimal = Decimal("0")


class MovimientoResponse(MovimientoBase):
    id:               int
    producto_id:      int
    procesamiento_id: int

    # Código del producto — viene del join con la tabla productos
    codigo: Optional[str] = None

    # Saldo final calculado
    saldo_cantidad:    Decimal
    saldo_costo_unit:  Decimal
    saldo_costo_total: Decimal

    # Valores originales del Excel
    orig_ent_costo_unit:  Decimal
    orig_ent_costo_total: Decimal
    orig_sal_costo_unit:  Decimal
    orig_sal_costo_total: Decimal

    # Flags de validación
    saldo_negativo: bool
    error_a_ent:    bool
    error_a_sal:    bool
    error_b_ent:    bool
    error_b_sal:    bool
    semaforo:       Literal["🟢", "🟡", "🔴", "⚫"]

    creado_en: datetime

    model_config = {"from_attributes": True}