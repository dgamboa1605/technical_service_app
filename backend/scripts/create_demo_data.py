import random
from faker import Faker
"""
Script para poblar la base de datos con datos de demo
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.infrastructure.db.session import SessionLocal
from app.infrastructure.db.models.client import Client
from app.infrastructure.db.models.product import Product
from app.infrastructure.db.models.work_order import WorkOrder
from app.infrastructure.db.models.user import User
from app.domain.enums import WorkOrderStatusEnum, RoleEnum, ServiceTypeEnum
from passlib.context import CryptContext

# Configuration for password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_demo_data():
    db = SessionLocal()
    fake = Faker()
    try:
        # Limpiar tablas respetando relaciones
        db.query(WorkOrder).delete()
        db.query(Product).delete()
        db.query(Client).delete()
        db.query(User).delete()
        db.commit()
        # Crear usuarios demo (admin, técnicos, empleados)
        users = []
        admin_user = User(
            username="admin",
            email="admin@technical.com",
            hashed_password=pwd_context.hash("admin123"),
            role=RoleEnum.admin
        )
        db.add(admin_user)
        users.append(admin_user)
        for i in range(5):
            tech = User(
                username=fake.user_name()+str(i),
                email=fake.email(),
                hashed_password=pwd_context.hash("test1234"),
                role=RoleEnum.employee
            )
            db.add(tech)
            users.append(tech)
        db.commit()
        users = db.query(User).all()

        # Crear clientes aleatorios
        clients = []
        for i in range(25):
            client = Client(
                name=fake.name(),
                phone=fake.phone_number(),
                address=fake.address(),
                email=fake.email(),
                document_number=fake.unique.ssn()
            )
            db.add(client)
            clients.append(client)
        db.commit()
        clients = db.query(Client).all()

        # Crear productos aleatorios
        products = []
        for i in range(30):
            product = Product(
                item_type=random.choice(["Laptop", "Smartphone", "Tablet", "Consola", "PC", "Impresora"]),
                brand=random.choice(["Apple", "Samsung", "HP", "Lenovo", "Sony", "Xiaomi", "Dell"]),
                guaranteeing_brand=random.choice(["Apple", "Samsung", "HP", "Lenovo", "Sony", "Xiaomi", "Dell"]),
                model=fake.bothify(text="Model-####"),
                serial_number=fake.unique.bothify(text="SN########"),
                purchase_date=fake.date_between(start_date='-2y', end_date='today'),
                warranty=random.choice([True, False]),
                client_id=random.choice(clients).id
            )
            db.add(product)
            products.append(product)
        db.commit()
        products = db.query(Product).all()

        # Crear órdenes de trabajo aleatorias para cada estado
        work_orders = []
        estados = list(WorkOrderStatusEnum)
        for estado in estados:
            for i in range(20):
                client = random.choice(clients)
                product = random.choice(products)
                technician = random.choice(users)
                received_date = fake.date_time_between(start_date='-1y', end_date='now')
                assigned_date = received_date + timedelta(days=random.randint(0, 5)) if estado != WorkOrderStatusEnum.RECIBIDO else None
                work_order = WorkOrder(
                    client_id=client.id,
                    product_id=product.id,
                    status=estado,
                    received_date=received_date,
                    assigned_date=assigned_date,
                    technician_id=technician.id if estado != WorkOrderStatusEnum.RECIBIDO else None,
                    service_type=random.choice(list(ServiceTypeEnum)),
                    customer_instructions=fake.sentence(),
                    item_condition=fake.sentence(),
                    delivered_accessories=fake.word(),
                    observations=fake.sentence(),
                    technical_report=fake.sentence(),
                    labor_cost=round(random.uniform(10, 500), 2)
                )
                db.add(work_order)
                work_orders.append(work_order)
        db.commit()
        
        print("Demo data created successfully!")
        print(f"Statistics:")
        print(f"   - Clients: {db.query(Client).count()}")
        print(f"   - Products: {db.query(Product).count()}")
        print(f"   - Work Orders: {db.query(WorkOrder).count()}")
        print(f"   - Users: {db.query(User).count()}")
        
    except Exception as e:
        print(f"Error creating data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_demo_data()