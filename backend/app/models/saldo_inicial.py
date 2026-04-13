from sqlalchemy import ForeignKey, Date, Numeric, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from datetime import datetime, date
from decimal import Decimal


class SaldoInicial(Base):
    __tablename__ = "saldos_iniciales"

    id:             Mapped[int]      = mapped_column(primary_key=True, index=True)
    producto_id:    Mapped[int]      = mapped_column(ForeignKey("productos.id"), unique=True, nullable=False)
    fecha:          Mapped[date]     = mapped_column(Date, nullable=False)
    cantidad:       Mapped[Decimal]  = mapped_column(Numeric(18, 6), nullable=False)
    costo_unitario: Mapped[Decimal]  = mapped_column(Numeric(18, 6), nullable=False)
    costo_total:    Mapped[Decimal]  = mapped_column(Numeric(18, 6), nullable=False)
    creado_en:      Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # ── Relaciones ─────────────────────────────────────────────────────────────
    producto: Mapped["Producto"] = relationship("Producto", back_populates="saldo_inicial")