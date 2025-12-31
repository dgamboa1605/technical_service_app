"""add_labor_cost_to_work_orders

Revision ID: 728af5c2b1ac
Revises: 20251223_add_recibido_asignado_states
Create Date: 2025-12-23 11:47:52.192478

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '728af5c2b1ac'
down_revision: Union[str, Sequence[str], None] = '20251223_add_recibido_asignado_states'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('work_orders', sa.Column('labor_cost', sa.Float(), nullable=True, server_default='0'))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('work_orders', 'labor_cost')
