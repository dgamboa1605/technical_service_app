import type { IAuthRepository } from '../../../domain/repositories/IAuthRepository';
import type { User } from '../../../domain/entities/User';

/**
 * Caso de uso: Actualizar perfil del usuario
 */
export class UpdateProfileUseCase {
  private authRepository: IAuthRepository;

  constructor(authRepository: IAuthRepository) {
    this.authRepository = authRepository;
  }

  async execute(updates: { username?: string; email?: string; password?: string }): Promise<User> {
    return await this.authRepository.updateProfile(updates);
  }
}
