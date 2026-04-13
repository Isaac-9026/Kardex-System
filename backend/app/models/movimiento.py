from sqlalchemy import ForeignKey, Date, Numeric, SmallInteger, String, Boolean, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from datetime import datetime, date
from decimal import Decimal


class Movimiento(Base):
    __tablename__ = "movimientos"

    id:             Mapped[int]     = mapped_column(primary_key=True, index=True)
    producto_id:    Mapped[int]     = mapped_column(ForeignKey("productos.id"), nullable=False, index=True)
    procesamiento_id: Mapped[int]   = mapped_column(ForeignKey("procesamientos.id"), nullable=False, index=True)

    # ── Comprobante ────────────────────────────────────────────────────────────
    fecha:            Mapped[date]  = mapped_column(Date, nullable=False, index=True)
    tipo_comprobante: Mapped[int]   = mapped_column(SmallInteger, nullable=False)
    serie:            Mapped[str]   = mapped_column(String(10), nullable=False)
    numero:           Mapped[str]   = mapped_column(String(20), nullable=False)
    tipo_operacion:   Mapped[str]   = mapped_column(String(50), nullable=False, index=True)

    # ── Entradas ───────────────────────────────────────────────────────────────
    ent_cantidad:       Mapped[Decimal] = mapped_column(Numeric(18, 6), default=0)
    ent_costo_unit:     Mapped[Decimal] = mapped_column(Numeric(18, 6), default=0)
    ent_costo_total:    Mapped[Decimal] = mapped_column(Numeric(18, 6), default=0)

    # ── Salidas ────────────────────────────────────────────────────────────────
    sal_cantidad:       Mapped[Decimal] = mapped_column(Numeric(18, 6), default=0)
    sal_costo_unit:     Mapped[Decimal] = mapped_column(Numeric(18, 6), default=0)
    sal_costo_total:    Mapped[Decimal] = mapped_column(Numeric(18, 6), default=0)

    # ── Saldo final calculado ──────────────────────────────────────────────────
    saldo_cantidad:     Mapped[Decimal] = mapped_column(Numeric(18, 6), default=0)
    saldo_costo_unit:   Mapped[Decimal] = mapped_column(Numeric(18, 6), default=0)
    saldo_costo_total:  Mapped[Decimal] = mapped_column(Numeric(18, 6), default=0)

    # ── Valores originales del Excel (para verificación de integridad) ─────────
    orig_ent_costo_unit:  Mapped[Decimal] = mapped_column(Numeric(18, 6), default=0)
    orig_ent_costo_total: Mapped[Decimal] = mapped_column(Numeric(18, 6), default=0)
    orig_sal_costo_unit:  Mapped[Decimal] = mapped_column(Numeric(18, 6), default=0)
    orig_sal_costo_total: Mapped[Decimal] = mapped_column(Numeric(18, 6), default=0)

    # ── Flags de validación ────────────────────────────────────────────────────
    saldo_negativo: Mapped[bool] = mapped_column(Boolean, default=False)
    error_a_ent:    Mapped[bool] = mapped_column(Boolean, default=False)                        
    error_a_sal:    Mapped[bool] = mapped_column(Boolean, default=False)
    error_b_ent:    Mapped[bool] = mapped_column(Boolean, default=False)
    error_b_sal:    Mapped[bool] = mapped_column(Boolean, default=False)
    semaforo:       Mapped[str]  = mapped_column(String(20), default="🟢")

    creado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # ── Relaciones ─────────────────────────────────────────────────────────────
    producto:       Mapped["Producto"]       = relationship("Producto", back_populates="movimientos")
    procesamiento:  Mapped["Procesamiento"]  = relationship("Procesamiento", back_populates="movimientos")