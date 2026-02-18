import { User } from '../../domain/entities/User';

/**
 * DTO del backend (snake_case)
 */
interface UserDTO {
  id: number;
  username: string;
  email: string;
  role: string;
}

/**
 * Mapper para convertir DTOs del backend a entidades de dominio
 */
export class UserMapper {
  /**
   * Convierte un DTO a entidad
   */
  static fromDTO(dto: UserDTO): User {
    return new User(dto.id, dto.username, dto.email, dto.role);
  }

  /**
   * Convierte una entidad a DTO para crear/actualizar
   */
  static toDTO(user: {
    username: string;
    email: string;
    password?: string;
    role: string;
  }): any {
    return {
      username: user.username,
      email: user.email,
      ...(user.password && { password: user.password }),
      role: user.role,
    };
  }
}


