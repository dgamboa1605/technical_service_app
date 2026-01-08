/**
 * Entidad de Dominio: Usuario
 */
export class User {
  readonly id: number;
  readonly username: string;
  readonly email: string;
  readonly role: string;

  constructor(
    id: number,
    username: string,
    email: string,
    role: string
  ) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.role = role;
  }

  /**
   * Verifica si el usuario es administrador
   */
  isAdmin(): boolean {
    return this.role === 'admin';
  }

  /**
   * Verifica si el usuario es empleado
   */
  isEmployee(): boolean {
    return this.role === 'admin' || this.role === 'employee';
  }

  /**
   * Verifica si el usuario es técnico
   */
  isTechnician(): boolean {
    return this.role === 'technician' || this.isEmployee();
  }
}


