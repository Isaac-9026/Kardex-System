from sqlalchemy import (
    ForeignKey,
    Date,
    Numeric,
    DateTime,
    func,
    CheckConstraint,
    Index,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

from datetime import datetime, date
from decimal import Decimal


class SaldoInicial(Base):
    __tablename__ = "saldos_iniciales"

    __table_args__ = (
        CheckConstraint(
            "cantidad >= 0",
            name="ck_saldo_cantidad"
        ),
        CheckConstraint(
            "costo_unitario >= 0",
            name="ck_saldo_costo_unitario"
        ),
        CheckConstraint(
            "costo_total >= 0",
            name="ck_saldo_costo_total"
        ),
        Index(
            "idx_saldo_producto_fecha",
            "producto_id",
            "fecha"
        ),
    )

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    producto_id: Mapped[int] = mapped_column(
        ForeignKey("productos.id"),
        nullable=False,
    )

    fecha: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    cantidad: Mapped[Decimal] = mapped_column(
        Numeric(22, 10),
        nullable=False,
    )

    costo_unitario: Mapped[Decimal] = mapped_column(
        Numeric(22, 10),
        nullable=False,
    )

    costo_total: Mapped[Decimal] = mapped_column(
        Numeric(22, 10),
        nullable=False,
    )

    creado_en: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    # Relación N -> 1
    producto: Mapped["Producto"] = relationship(
        "Producto",
        back_populates="saldos_iniciales",
    )
