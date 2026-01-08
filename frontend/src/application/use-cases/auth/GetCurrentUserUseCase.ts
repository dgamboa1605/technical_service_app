import type { IAuthRepository } from '../../../domain/repositories/IAuthRepository';
import type { User } from '../../../domain/entities/User';

/**
 * Caso de uso: Obtener el usuario actual autenticado
 */
export class GetCurrentUserUseCase {
  private authRepository: IAuthRepository;

  constructor(authRepository: IAuthRepository) {
    this.authRepository = authRepository;
  }

  async execute(): Promise<User> {
    if (!this.authRepository.isAuthenticated()) {
      throw new Error('User is not authenticated');
    }

    return this.authRepository.getCurrentUser();
  }
}


