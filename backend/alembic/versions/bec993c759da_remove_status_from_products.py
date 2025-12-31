"""remove_status_from_products

Revision ID: bec993c759da
Revises: 728af5c2b1ac
Create Date: 2025-12-23 15:52:18.415625

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'bec993c759da'
down_revision: Union[str, Sequence[str], None] = '728af5c2b1ac'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Remove status column from products table
    op.drop_column('products', 'status')


def downgrade() -> None:
    """Downgrade schema."""
    # Re-add status column to products table
    from app.domain.enums import ProductStatusEnum
    op.add_column('products', sa.Column('status', sa.Enum('RECEIVED', 'ASSIGNED', 'IN_REPAIR', 'REPAIRED', 'DELIVERED', name='productstatusenum'), server_default='RECEIVED', nullable=False))
