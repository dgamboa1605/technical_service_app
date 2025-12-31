"""Add work order lifecycle history and parts

Revision ID: 4e015e3c5a90
Revises: 20251222_add_new_order_fields
Create Date: 2025-12-22 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision: str = "4e015e3c5a90"
down_revision: Union[str, Sequence[str], None] = "20251222_add_new_order_fields"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


NEW_STATUS_ENUM = sa.Enum(
    "por_confirmar",
    "confirmado",
    "en_reparacion",
    "completado",
    "entregado",
    name="workorderstatusenum_new",
)

OLD_STATUS_ENUM = sa.Enum(
    "RECEIVED",
    "ASSIGNED",
    "IN_PROGRESS",
    "COMPLETED",
    "DELIVERED",
    name="workorderstatusenum",
)

service_type_enum = sa.Enum(
    "taller",
    "recojo",
    "domicilio",
    "instalacion",
    name="servicetypeenum",
)


def upgrade() -> None:
    bind = op.get_bind()
    inspector = inspect(bind)
    dialect = bind.dialect.name

    if dialect == "sqlite":
        # SQLite lacks ALTER TYPE, so widen the column to text and remap values
        with op.batch_alter_table("work_orders", recreate="auto") as batch:
            batch.alter_column("status", type_=sa.String(), existing_nullable=True)

        op.execute("UPDATE work_orders SET status='por_confirmar' WHERE status='RECEIVED'")
        op.execute("UPDATE work_orders SET status='confirmado' WHERE status='ASSIGNED'")
        op.execute("UPDATE work_orders SET status='en_reparacion' WHERE status='IN_PROGRESS'")
        op.execute("UPDATE work_orders SET status='completado' WHERE status='COMPLETED'")
        op.execute("UPDATE work_orders SET status='entregado' WHERE status='DELIVERED'")
    else:
        # rename old enum type to allow creation of the new set
        op.execute("ALTER TYPE workorderstatusenum RENAME TO workorderstatusenum_old")

        # create new enum and migrate
        NEW_STATUS_ENUM.create(bind, checkfirst=True)
        service_type_enum.create(bind, checkfirst=True)

        op.alter_column(
            "work_orders",
            "status",
            existing_type=sa.Enum(name="workorderstatusenum_old"),
            type_=sa.Enum(name="workorderstatusenum_new"),
            existing_nullable=True,
            postgresql_using="""
                CASE status
                    WHEN 'RECEIVED' THEN 'por_confirmar'
                    WHEN 'ASSIGNED' THEN 'confirmado'
                    WHEN 'IN_PROGRESS' THEN 'en_reparacion'
                    WHEN 'COMPLETED' THEN 'completado'
                    WHEN 'DELIVERED' THEN 'entregado'
                    ELSE 'por_confirmar'
                END::workorderstatusenum_new
            """,
        )

        # drop old enum and rename new enum to expected name
        op.execute("DROP TYPE workorderstatusenum_old")
        op.execute("ALTER TYPE workorderstatusenum_new RENAME TO workorderstatusenum")

    status_type = NEW_STATUS_ENUM if dialect != "sqlite" else sa.String()
    service_type_type = service_type_enum if dialect != "sqlite" else sa.String()

    # new columns on work_orders (guarded to coexist with previous migration)
    columns = {col["name"] for col in inspector.get_columns("work_orders")}
    if "service_type" not in columns:
        op.add_column(
            "work_orders",
            sa.Column(
                "service_type",
                service_type_type,
                server_default="taller",
                nullable=True,
            ),
        )
    if "customer_instructions" not in columns:
        op.add_column(
            "work_orders",
            sa.Column("customer_instructions", sa.Text(), nullable=True),
        )
    if "item_condition" not in columns:
        op.add_column(
            "work_orders",
            sa.Column("item_condition", sa.Text(), nullable=True),
        )
    if "delivered_accessories" not in columns:
        op.add_column(
            "work_orders",
            sa.Column("delivered_accessories", sa.Text(), nullable=True),
        )
    if "observations" not in columns:
        op.add_column(
            "work_orders",
            sa.Column("observations", sa.Text(), nullable=True),
        )
    if "technical_report" not in columns:
        op.add_column(
            "work_orders",
            sa.Column("technical_report", sa.Text(), nullable=True),
        )

    op.create_table(
        "work_order_history",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("work_order_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("status_from", status_type, nullable=True),
        sa.Column("status_to", status_type, nullable=True),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["work_order_id"], ["work_orders.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="SET NULL"),
    )

    op.create_table(
        "work_order_parts",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("work_order_id", sa.Integer(), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("qty", sa.Float(), nullable=False, server_default="1"),
        sa.Column("unit_price", sa.Float(), nullable=False, server_default="0"),
        sa.Column("total", sa.Float(), nullable=False, server_default="0"),
        sa.Column("created_by", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["work_order_id"], ["work_orders.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["created_by"], ["users.id"], ondelete="SET NULL"),
    )

    # clean server defaults to align with application-level defaults
    if dialect != "sqlite":
        op.alter_column("work_orders", "service_type", server_default=None)


def downgrade() -> None:
    bind = op.get_bind()
    dialect = bind.dialect.name

    op.drop_table("work_order_parts")
    op.drop_table("work_order_history")

    op.drop_column("work_orders", "technical_report")
    op.drop_column("work_orders", "observations")
    op.drop_column("work_orders", "delivered_accessories")
    op.drop_column("work_orders", "item_condition")
    op.drop_column("work_orders", "customer_instructions")
    op.drop_column("work_orders", "service_type")

    if dialect == "sqlite":
        op.execute("UPDATE work_orders SET status='RECEIVED' WHERE status='por_confirmar'")
        op.execute("UPDATE work_orders SET status='ASSIGNED' WHERE status='confirmado'")
        op.execute("UPDATE work_orders SET status='IN_PROGRESS' WHERE status='en_reparacion'")
        op.execute("UPDATE work_orders SET status='COMPLETED' WHERE status='completado'")
        op.execute("UPDATE work_orders SET status='DELIVERED' WHERE status='entregado'")
    else:
        # rename current enum so we can recreate the old one
        op.execute("ALTER TYPE workorderstatusenum RENAME TO workorderstatusenum_new")

        # move status back to text temporarily
        op.alter_column(
            "work_orders",
            "status",
            existing_type=sa.Enum(name="workorderstatusenum_new"),
            type_=sa.String(),
            existing_nullable=True,
            postgresql_using="status::text",
        )

        # drop new enums
        service_type_enum.drop(bind, checkfirst=True)
        op.execute("DROP TYPE workorderstatusenum_new")

        # recreate old enum and reapply
        OLD_STATUS_ENUM.create(bind, checkfirst=True)
        op.alter_column(
            "work_orders",
            "status",
            existing_type=sa.String(),
            type_=OLD_STATUS_ENUM,
            existing_nullable=True,
            postgresql_using="status::workorderstatusenum",
        )
