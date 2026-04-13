from pydantic import BaseModel
from datetime import date, datetime
from decimal import Decimal


class SaldoInicialBase(BaseModel):
    fecha:          date
    cantidad:       Decimal
    costo_unitario: Decimal
    costo_total:    Decimal


class SaldoInicialCreate(SaldoInicialBase):
    producto_id: int


class SaldoInicialResponse(SaldoInicialBase):
    id:          int
    producto_id: int
    creado_en:   datetime

    model_config = {"from_attributes": True}