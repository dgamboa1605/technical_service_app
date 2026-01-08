import type { IUserRepository } from '../../../domain/repositories/IUserRepository';
import type { User } from '../../../domain/entities/User';

/**
 * Caso de uso: Obtener todos los usuarios
 */
export class GetAllUsersUseCase {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async execute(): Promise<User[]> {
    return this.userRepository.getAll();
  }
}

