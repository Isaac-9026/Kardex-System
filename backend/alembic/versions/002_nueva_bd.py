"""rediseño de base de datos

Revision ID: 002_nueva_bd
Revises: 001_initial
Create Date: 2025-01-02 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision:      str                             = "002_nueva_bd"
down_revision: Union[str, None]                = "001_initial"
branch_labels: Union[str, Sequence[str], None] = None
depends_on:    Union[str, Sequence[str], None] = None


def upgrade() -> None:

    # ⚠️ IMPORTANTE: eliminamos primero las tablas antiguas
    op.drop_table("movimientos")
    op.drop_table("saldos_iniciales")
    op.drop_table("procesamientos")
    op.drop_table("productos")

    # ── 1. PRODUCTOS ──────────────────────────────────────────────────────────
    op.create_table(
        "productos",
        sa.Column("id",          sa.Integer(),    nullable=False),
        sa.Column("codigo",      sa.String(20),   nullable=False),
        sa.Column("descripcion", sa.String(255),  nullable=True),
        sa.Column("creado_en",   sa.DateTime(timezone=True),
                  server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_productos_id",     "productos", ["id"])
    op.create_index("ix_productos_codigo", "productos", ["codigo"], unique=True)

    # ── 2. SALDOS INICIALES ───────────────────────────────────────────────────
    op.create_table(
        "saldos_iniciales",
        sa.Column("id",             sa.Integer(),      nullable=False),
        sa.Column("producto_id",    sa.Integer(),      nullable=False),
        sa.Column("fecha",          sa.Date(),         nullable=False),
        sa.Column("cantidad",       sa.Numeric(18, 6), nullable=False),
        sa.Column("costo_unitario", sa.Numeric(18, 6), nullable=False),
        sa.Column("costo_total",    sa.Numeric(18, 6), nullable=False),
        sa.Column("creado_en",      sa.DateTime(timezone=True),
                  server_default=sa.text("now()"), nullable=False),

        sa.CheckConstraint("cantidad >= 0"),
        sa.CheckConstraint("costo_unitario >= 0"),
        sa.CheckConstraint("costo_total >= 0"),

        sa.ForeignKeyConstraint(["producto_id"], ["productos.id"]),
        sa.PrimaryKeyConstraint("id"),

        # ✔ un saldo por producto (puedes cambiar luego si quieres histórico)
        sa.UniqueConstraint("producto_id", name="unique_saldo_producto"),
    )

    # ── 3. PROCESAMIENTOS ─────────────────────────────────────────────────────
    op.create_table(
        "procesamientos",
        sa.Column("id",                   sa.Integer(),   nullable=False),
        sa.Column("nombre_archivo",       sa.String(255), nullable=False),
        sa.Column("total_registros",      sa.Integer()),
        sa.Column("productos_procesados", sa.Integer()),

        # ✅ ENUM manejado automáticamente por SQLAlchemy
        sa.Column("estado", sa.Enum(
            "pendiente", "procesado", "con_alertas", "error",
            name="estado_proceso"
        ), nullable=False),

        sa.Column("alertas", postgresql.JSONB()),
        sa.Column("creado_en", sa.DateTime(timezone=True),
                  server_default=sa.text("now()"), nullable=False),

        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_procesamientos_estado", "procesamientos", ["estado"])

    # ── 4. MOVIMIENTOS ────────────────────────────────────────────────────────
    op.create_table(
        "movimientos",
        sa.Column("id",               sa.Integer(),      nullable=False),
        sa.Column("producto_id",      sa.Integer(),      nullable=False),
        sa.Column("procesamiento_id", sa.Integer(),      nullable=False),

        sa.Column("fecha",            sa.Date(),         nullable=False),
        sa.Column("tipo_comprobante", sa.SmallInteger(), nullable=False),
        sa.Column("serie",            sa.String(10),     nullable=False),
        sa.Column("numero",           sa.String(20),     nullable=False),

        # ✅ ENUM limpio
        sa.Column("tipo_operacion", sa.Enum(
            "01 Venta", "02 Compra", "05 Devolucion Recibida",
            name="tipo_operacion_enum"
        ), nullable=False),

        # Entradas
        sa.Column("ent_cantidad",     sa.Numeric(18, 6)),
        sa.Column("ent_costo_unit",   sa.Numeric(18, 6)),
        sa.Column("ent_costo_total",  sa.Numeric(18, 6)),

        # Salidas
        sa.Column("sal_cantidad",     sa.Numeric(18, 6)),
        sa.Column("sal_costo_unit",   sa.Numeric(18, 6)),
        sa.Column("sal_costo_total",  sa.Numeric(18, 6)),

        # Saldo
        sa.Column("saldo_cantidad",   sa.Numeric(18, 6)),
        sa.Column("saldo_costo_unit", sa.Numeric(18, 6)),
        sa.Column("saldo_costo_total",sa.Numeric(18, 6)),

        # Auditoría
        sa.Column("orig_ent_costo_unit",  sa.Numeric(18, 6)),
        sa.Column("orig_ent_costo_total", sa.Numeric(18, 6)),
        sa.Column("orig_sal_costo_unit",  sa.Numeric(18, 6)),
        sa.Column("orig_sal_costo_total", sa.Numeric(18, 6)),

        # Validaciones (BASE del semáforo)
        sa.Column("saldo_negativo", sa.Boolean()),
        sa.Column("error_a",        sa.Boolean()),
        sa.Column("error_b",        sa.Boolean()),

        sa.Column("creado_en", sa.DateTime(timezone=True),
                  server_default=sa.text("now()"), nullable=False),

        sa.CheckConstraint("ent_cantidad >= 0"),
        sa.CheckConstraint("sal_cantidad >= 0"),

        sa.ForeignKeyConstraint(["producto_id"], ["productos.id"]),
        sa.ForeignKeyConstraint(["procesamiento_id"], ["procesamientos.id"]),
        sa.PrimaryKeyConstraint("id"),

        # 🔥 CORREGIDO (permite reprocesar archivos)
        sa.UniqueConstraint(
            "procesamiento_id", "producto_id", "serie", "numero",
            name="unique_movimiento_procesamiento"
        ),
    )

    # Índices importantes
    op.create_index("idx_mov_producto_fecha", "movimientos", ["producto_id", "fecha"])
    op.create_index("ix_movimientos_fecha", "movimientos", ["fecha"])
    op.create_index("ix_movimientos_procesamiento_id", "movimientos", ["procesamiento_id"])


def downgrade() -> None:
    op.drop_table("movimientos")
    op.drop_table("procesamientos")
    op.drop_table("saldos_iniciales")
    op.drop_table("productos")

    op.execute("DROP TYPE IF EXISTS tipo_operacion_enum")
    op.execute("DROP TYPE IF EXISTS estado_proceso")