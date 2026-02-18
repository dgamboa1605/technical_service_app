import type { IUserRepository, CreateUserDTO } from '../../../domain/repositories/IUserRepository';
import type { User } from '../../../domain/entities/User';

/**
 * Caso de uso: Crear un nuevo usuario
 */
export class CreateUserUseCase {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async execute(data: CreateUserDTO): Promise<User> {
    // Validaciones de negocio
    if (!data.username || !data.email || !data.password) {
      throw new Error('Username, email, and password are required');
    }

    return this.userRepository.create(data);
  }
}

