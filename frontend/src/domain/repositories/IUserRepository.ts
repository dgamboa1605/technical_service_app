import type { User } from '../entities/User';

/**
 * DTO para crear/actualizar un usuario
 */
export interface CreateUserDTO {
  username: string;
  email: string;
  password: string;
  role: string;
}

export interface UpdateUserDTO {
  username?: string;
  email?: string;
  password?: string;
  role?: string;
}

/**
 * Interface del repositorio de usuarios
 */
export interface IUserRepository {
  /**
   * Obtiene todos los usuarios
   */
  getAll(): Promise<User[]>;

  /**
   * Obtiene un usuario por ID
   */
  getById(id: number): Promise<User | null>;

  /**
   * Obtiene todos los técnicos
   */
  getTechnicians(): Promise<User[]>;

  /**
   * Crea un nuevo usuario
   */
  create(data: CreateUserDTO): Promise<User>;

  /**
   * Actualiza un usuario
   */
  update(id: number, data: UpdateUserDTO): Promise<User>;

  /**
   * Elimina un usuario
   */
  delete(id: number): Promise<void>;
}


