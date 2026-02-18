#!/usr/bin/env python3
"""
Single script to seed the database with demo data for the technical service app.

Run from the backend directory:
  cd backend && python scripts/create_demo_data.py

Or with module (from repo root):
  python -m scripts.create_demo_data

Requires: pip install faker

Creates:
  - 1 admin (admin / admin123), 2 employees (employee1/employee2 / demo123)
  - 8 clients, 12 products
  - Work orders in various states (a few per status for demo)
"""
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path

# Ensure backend root is on path when run as script or -m
_backend = Path(__file__).resolve().parent.parent
if str(_backend) not in sys.path:
    sys.path.insert(0, str(_backend))
os.chdir(_backend)

from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.domain.enums import RoleEnum, ServiceTypeEnum, WorkOrderStatusEnum
from app.infrastructure.db.models import Client, Product, User, WorkOrder
from app.infrastructure.db.models.work_order import WorkOrderHistory, WorkOrderPart
from app.infrastructure.db.session import SessionLocal

# Demo credentials (document in docstring)
DEMO_ADMIN = ("admin", "admin@technical.com", "admin123")
DEMO_EMPLOYEES = [
    ("employee1", "emp1@technical.com", "demo123"),
    ("employee2", "emp2@technical.com", "demo123"),
]


def _clear_tables(db: Session) -> None:
    """Delete in FK-safe order."""
    db.query(WorkOrderPart).delete()
    db.query(WorkOrderHistory).delete()
    db.query(WorkOrder).delete()
    db.query(Product).delete()
    db.query(Client).delete()
    db.query(User).delete()
    db.commit()


def create_demo_data() -> None:
    db = SessionLocal()
    try:
        _clear_tables(db)

        # Users: 1 admin + 2 employees
        users = []
        for username, email, password in [DEMO_ADMIN] + DEMO_EMPLOYEES:
            role = RoleEnum.admin if username == "admin" else RoleEnum.employee
            u = User(
                username=username,
                email=email,
                hashed_password=hash_password(password),
                role=role,
            )
            db.add(u)
            users.append(u)
        db.commit()
        users = db.query(User).order_by(User.id).all()
        _admin, emp1, emp2 = users[0], users[1], users[2]

        # Clients (8)
        clients_data = [
            ("Juan Pérez", "+34 600 111 222", "Calle Mayor 1", "juan@example.com", "12345678A"),
            ("María García", "+34 600 222 333", "Av. Sol 5", "maria@example.com", "87654321B"),
            ("Carlos López", "+34 600 333 444", "Plaza Central 3", "carlos@example.com", "11223344C"),
            ("Ana Martínez", "+34 600 444 555", "Calle Norte 7", "ana@example.com", "55667788D"),
            ("Pedro Sánchez", "+34 600 555 666", "Av. Sur 2", "pedro@example.com", "99887766E"),
            ("Laura Fernández", "+34 600 666 777", "Calle Este 9", "laura@example.com", "44332211F"),
            ("Miguel Torres", "+34 600 777 888", "Calle Oeste 4", "miguel@example.com", "77889900G"),
            ("Sofia Ruiz", "+34 600 888 999", "Av. Centro 6", "sofia@example.com", "00112233H"),
        ]
        clients = []
        for name, phone, address, email, doc in clients_data:
            c = Client(name=name, phone=phone, address=address, email=email, document_number=doc)
            db.add(c)
            clients.append(c)
        db.commit()
        clients = db.query(Client).order_by(Client.id).all()

        # Products (12) – assign to clients
        products_data = [
            ("Laptop", "Dell", "Dell", "XPS-15", "SN001", clients[0].id),
            ("Smartphone", "Samsung", "Samsung", "Galaxy S21", "SN002", clients[0].id),
            ("Tablet", "Apple", "Apple", "iPad Air", "SN003", clients[1].id),
            ("Laptop", "HP", "HP", "Pavilion", "SN004", clients[1].id),
            ("Smartphone", "Apple", "Apple", "iPhone 13", "SN005", clients[2].id),
            ("Impresora", "Epson", "Epson", "EcoTank", "SN006", clients[2].id),
            ("Consola", "Sony", "Sony", "PS5", "SN007", clients[3].id),
            ("PC", "Lenovo", "Lenovo", "ThinkCentre", "SN008", clients[4].id),
            ("Laptop", "Lenovo", "Lenovo", "IdeaPad", "SN009", clients[5].id),
            ("Smartphone", "Xiaomi", "Xiaomi", "Redmi Note", "SN010", clients[6].id),
            ("Tablet", "Samsung", "Samsung", "Tab S7", "SN011", clients[7].id),
            ("Laptop", "Apple", "Apple", "MacBook Air", "SN012", clients[7].id),
        ]
        products = []
        for item_type, brand, guar, model, serial, cid in products_data:
            p = Product(
                item_type=item_type,
                brand=brand,
                guaranteeing_brand=guar,
                model=model,
                serial_number=serial,
                warranty=True,
                client_id=cid,
            )
            db.add(p)
            products.append(p)
        db.commit()
        products = db.query(Product).order_by(Product.id).all()

        # Work orders: a few per status for demo
        now = datetime.utcnow()
        status_samples = [
            (WorkOrderStatusEnum.RECIBIDO, 2, None),
            (WorkOrderStatusEnum.ASIGNADO, 2, emp1),
            (WorkOrderStatusEnum.POR_CONFIRMAR, 2, emp1),
            (WorkOrderStatusEnum.CONFIRMADO, 1, emp2),
            (WorkOrderStatusEnum.EN_REPARACION, 2, emp2),
            (WorkOrderStatusEnum.COMPLETADO, 1, emp1),
            (WorkOrderStatusEnum.ENTREGADO, 1, emp1),
        ]
        for status, count, technician in status_samples:
            for i in range(count):
                c = clients[i % len(clients)]
                p = products[i % len(products)]
                received = now - timedelta(days=10 - i)
                assigned = (received + timedelta(days=1)) if technician else None
                wo = WorkOrder(
                    client_id=c.id,
                    product_id=p.id,
                    status=status,
                    service_type=ServiceTypeEnum.TALLER,
                    received_date=received,
                    assigned_date=assigned,
                    technician_id=technician.id if technician else None,
                    customer_instructions="Revisión general",
                    item_condition="Buen estado",
                    technical_report="En proceso" if status in (WorkOrderStatusEnum.EN_REPARACION,) else None,
                    labor_cost=50.0 if technician else None,
                )
                db.add(wo)
        db.commit()

        # Print summary
        print("Demo data created successfully.")
        print("  Users:", db.query(User).count(), "(admin + 2 employees)")
        print("  Clients:", db.query(Client).count())
        print("  Products:", db.query(Product).count())
        print("  Work orders:", db.query(WorkOrder).count())
        print("\nLogin for demo:")
        print("  Admin:    username=admin     password=admin123")
        print("  Employee: username=employee1 password=demo123")
    except Exception as e:
        print("Error creating demo data:", e)
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    create_demo_data()
