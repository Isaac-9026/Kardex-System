from pydantic import BaseModel
from datetime import datetime
from typing import Literal


# ── Alertas generadas durante el procesamiento ────────────────────────────────
class AlertasProcesamiento(BaseModel):
    sin_saldo_inicial: list[str] = []   # códigos sin saldo inicial
    saldo_negativo:    list[str] = []   # códigos con saldo negativo
    duplicados:        list[str] = []   # códigos duplicados entre archivos


# ── Respuesta al subir y procesar un archivo ──────────────────────────────────
class ProcesamientoResponse(BaseModel):
    id:                   int
    nombre_archivo:       str
    total_registros:      int
    productos_procesados: int
    estado:               Literal["exitoso", "con_alertas", "error"]
    alertas:              AlertasProcesamiento
    creado_en:            datetime

    model_config = {"from_attributes": True}


# ── Resumen para el historial (sin movimientos) ───────────────────────────────
class ProcesamientoResumen(BaseModel):
    id:                   int
    nombre_archivo:       str
    total_registros:      int
    productos_procesados: int
    estado:               Literal["exitoso", "con_alertas", "error"]
    creado_en:            datetime

    model_config = {"from_attributes": True}