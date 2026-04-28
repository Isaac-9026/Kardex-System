from pydantic import BaseModel
from datetime import date, datetime
from decimal import Decimal
from typing import Optional


class ProductoUpdate(BaseModel):
    descripcion: Optional[str] = None


class SaldoInicialResumen(BaseModel):
    id:             int
    fecha:          date
    cantidad:       Decimal
    costo_unitario: Decimal
    costo_total:    Decimal

    model_config = {"from_attributes": True}


class ProductoResponse(BaseModel):
    id:            int
    codigo:        str
    descripcion:   Optional[str]
    creado_en:     datetime
    saldo_inicial: Optional[SaldoInicialResumen] = None

    model_config = {"from_attributes": True}


class ProductoConEstadisticas(ProductoResponse):
    total_movimientos:   int   = 0
    total_procesamientos: int  = 0