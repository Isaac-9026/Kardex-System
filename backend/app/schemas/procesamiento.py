from pydantic import BaseModel
from datetime import datetime
from typing import Literal


class AlertasProcesamiento(BaseModel):
    sin_saldo_inicial: list[str] = []
    saldo_negativo:    list[str] = []
    duplicados:        list[str] = []


class ProcesamientoResponse(BaseModel):
    id:                   int
    nombre_archivo:       str
    total_registros:      int
    productos_procesados: int
    estado:               Literal["pendiente", "procesado", "con_alertas", "error"]
    alertas:              AlertasProcesamiento
    creado_en:            datetime

    model_config = {"from_attributes": True}


class ProcesamientoResumen(BaseModel):
    id:                   int
    nombre_archivo:       str
    total_registros:      int
    productos_procesados: int
    estado:               Literal["pendiente", "procesado", "con_alertas", "error"]
    creado_en:            datetime

    model_config = {"from_attributes": True}