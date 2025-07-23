from enum import Enum


class RoleEnum(str, Enum):
    admin = "admin"
    employee = "employee"
    customer = "customer"


class ProductStatusEnum(str, Enum):
    RECEIVED = "received"
    ASSIGNED = "assigned"
    IN_REPAIR = "in_repair"
    REPAIRED = "repaired"
    DELIVERED = "delivered"


class WorkOrderStatusEnum(str, Enum):
    RECEIVED = "received"
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    DELIVERED = "delivered"
