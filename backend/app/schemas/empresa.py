from pydantic import BaseModel
from typing import Optional


class EmpresaBase(BaseModel):
    nombre:            str
    ruc:               str
    direccion:         Optional[str] = None


class EmpresaCreate(EmpresaBase):
    pass


class EmpresaUpdate(BaseModel):
    nombre:            Optional[str] = None
    ruc:               Optional[str] = None
    direccion:         Optional[str] = None


class EmpresaResponse(EmpresaBase):
    id: int

    class Config:
        from_attributes = True