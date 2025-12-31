from enum import Enum


class RoleEnum(str, Enum):
    admin = "admin"
    employee = "employee"
    customer = "customer"


class WorkOrderStatusEnum(str, Enum):
    RECIBIDO = "recibido"
    ASIGNADO = "asignado"
    POR_CONFIRMAR = "por_confirmar"
    CONFIRMADO = "confirmado"
    EN_REPARACION = "en_reparacion"
    COMPLETADO = "completado"
    ENTREGADO = "entregado"


class ServiceTypeEnum(str, Enum):
    TALLER = "taller"
    RECOJO = "recojo"
    DOMICILIO = "domicilio"
    INSTALACION = "instalacion"
