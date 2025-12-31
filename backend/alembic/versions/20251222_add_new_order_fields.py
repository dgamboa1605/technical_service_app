"""Add fields for new order requirements

Revision ID: 20251222_add_new_order_fields
Revises: 856df63a9b7e
Create Date: 2025-12-22 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision: str = "20251222_add_new_order_fields"
down_revision: Union[str, Sequence[str], None] = "856df63a9b7e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


service_type_enum = sa.Enum(
    "taller", "recojo", "domicilio", "instalacion", name="servicetypeenum"
)


def upgrade() -> None:
    conn = op.get_bind()
    inspector = inspect(conn)

    # Clients
    client_cols = {col["name"] for col in inspector.get_columns("clients")}
    if "document_number" not in client_cols:
        op.add_column("clients", sa.Column("document_number", sa.String(), nullable=True))
    if "address" not in client_cols:
        op.add_column("clients", sa.Column("address", sa.String(), nullable=True))
    if "email" not in client_cols:
        op.add_column("clients", sa.Column("email", sa.String(), nullable=True))

    existing_indexes = {idx["name"] for idx in inspector.get_indexes("clients")}
    if "ix_clients_document_number_unique" not in existing_indexes:
        op.create_index(
            "ix_clients_document_number_unique",
            "clients",
            ["document_number"],
            unique=True,
        )

    # Products
    product_cols = {col["name"] for col in inspector.get_columns("products")}
    if "guaranteeing_brand" not in product_cols:
        op.add_column("products", sa.Column("guaranteeing_brand", sa.String(), nullable=True))
    if "purchase_date" not in product_cols:
        op.add_column("products", sa.Column("purchase_date", sa.Date(), nullable=True))

    # Work Orders
    service_type_enum.create(op.get_bind(), checkfirst=True)
    work_order_cols = {col["name"] for col in inspector.get_columns("work_orders")}
    if "service_type" not in work_order_cols:
        op.add_column(
            "work_orders",
            sa.Column(
                "service_type",
                service_type_enum,
                nullable=True,
                server_default="taller",
            ),
        )
    if "customer_instructions" not in work_order_cols:
        op.add_column(
            "work_orders", sa.Column("customer_instructions", sa.Text(), nullable=True)
        )
    if "item_condition" not in work_order_cols:
        op.add_column(
            "work_orders", sa.Column("item_condition", sa.Text(), nullable=True)
        )
    if "delivered_accessories" not in work_order_cols:
        op.add_column(
            "work_orders", sa.Column("delivered_accessories", sa.Text(), nullable=True)
        )
    if "observations" not in work_order_cols:
        op.add_column("work_orders", sa.Column("observations", sa.Text(), nullable=True))


def downgrade() -> None:
    # Work Orders
    op.drop_column("work_orders", "observations")
    op.drop_column("work_orders", "delivered_accessories")
    op.drop_column("work_orders", "item_condition")
    op.drop_column("work_orders", "customer_instructions")
    op.drop_column("work_orders", "service_type")
    service_type_enum.drop(op.get_bind(), checkfirst=True)

    # Products
    op.drop_column("products", "purchase_date")
    op.drop_column("products", "guaranteeing_brand")

    # Clients
    op.drop_constraint("uq_clients_document_number", "clients", type_="unique")
    op.drop_column("clients", "email")
    op.drop_column("clients", "address")
    op.drop_column("clients", "document_number")
