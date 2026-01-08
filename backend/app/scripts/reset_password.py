#!/usr/bin/env python3
"""
Script para resetear la contraseña de un usuario
Uso: python3 -m app.scripts.reset_password <username> <new_password>
"""

import sys
from pathlib import Path

# Agregar el directorio raíz al path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from sqlalchemy.orm import Session
from app.infrastructure.db.session import SessionLocal
from app.services import user_service


def reset_password(username: str, new_password: str):
    """Resetea la contraseña de un usuario"""
    db: Session = SessionLocal()
    try:
        user = user_service.get_user_by_username(db, username)
        if not user:
            print(f"Usuario '{username}' no encontrado")
            return False
        
        # Actualizar contraseña
        updated_user = user_service.update_user(
            db, 
            user.id, 
            password=new_password
        )
        
        if updated_user:
            print(f"Contraseña reseteada exitosamente para usuario: {username}")
            print(f"Email: {updated_user.email}")
            print(f"Rol: {updated_user.role}")
            print(f"Nueva contraseña: {new_password}")
            return True
        else:
            print(f"Error al resetear la contraseña")
            return False
    except Exception as e:
        print(f"Error: {e}")
        return False
    finally:
        db.close()


def main():
    if len(sys.argv) < 3:
        print("Uso: python3 -m app.scripts.reset_password <username> <new_password>")
        print("\nEjemplo:")
        print("python3 -m app.scripts.reset_password derek653 nuevaPassword123")
        sys.exit(1)
    
    username = sys.argv[1]
    new_password = sys.argv[2]
    
    if len(new_password) < 6:
        print("Advertencia: La contraseña debe tener al menos 6 caracteres")
        response = input("¿Continuar de todos modos? (s/n): ")
        if response.lower() != 's':
            print("Operación cancelada")
            sys.exit(0)
    
    success = reset_password(username, new_password)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
