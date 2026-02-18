import { USER_ROLES } from '../constants';

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
    return this.role === USER_ROLES.ADMIN;
  }

  /**
   * Verifica si el usuario es empleado
   */
  isEmployee(): boolean {
    return this.role === USER_ROLES.ADMIN || this.role === USER_ROLES.EMPLOYEE;
  }

  /**
   * Verifica si el usuario es técnico
   */
  isTechnician(): boolean {
    return this.role === USER_ROLES.TECHNICIAN || this.isEmployee();
  }
}


