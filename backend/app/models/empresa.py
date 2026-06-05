from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Empresa(Base):
    __tablename__ = "empresa"

    id                = Column(Integer, primary_key=True, index=True)
    nombre            = Column(String(200), nullable=False)
    ruc               = Column(String(20),  nullable=False)
    direccion         = Column(String(300), nullable=True)
    creado_en         = Column(DateTime(timezone=True), server_default=func.now())
    productos = relationship(
        "Producto",
        back_populates="empresa"
    )