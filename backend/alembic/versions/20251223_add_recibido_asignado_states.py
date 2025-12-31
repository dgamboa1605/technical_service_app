"""Add recibido and asignado states to WorkOrderStatusEnum

Revision ID: 20251223_add_recibido_asignado_states
Revises: 4e015e3c5a90
Create Date: 2025-12-23 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "20251223_add_recibido_asignado_states"
down_revision: Union[str, Sequence[str], None] = "4e015e3c5a90"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Agrega los nuevos estados 'recibido' y 'asignado' al enum WorkOrderStatusEnum.
    El nuevo flujo es: recibido -> asignado -> por_confirmar -> confirmado -> en_reparacion -> completado -> entregado
    
    En SQLite, los enums son implementados como strings simples, así que esta migración
    es principalmente para mantener consistencia con el código Python.
    No necesitamos hacer cambios en la estructura de la base de datos.
    """
    # En SQLite no necesitamos hacer nada porque los enums son strings
    # El cambio ya está hecho en el código Python (enums.py)
    pass


def downgrade() -> None:
    """
    Revertir esta migración es complejo porque PostgreSQL no soporta eliminar valores de un enum.
    La forma correcta sería:
    1. Crear un nuevo enum sin los valores 'recibido' y 'asignado'
    2. Migrar los datos existentes
    3. Eliminar el enum antiguo
    4. Renombrar el nuevo enum
    
    Por ahora, dejamos este método vacío ya que es una operación destructiva.
    """
    pass
