import type { IAuthRepository } from '../../../domain/repositories/IAuthRepository';

/**
 * Caso de uso: Realizar logout
 */
export class LogoutUseCase {
  private authRepository: IAuthRepository;

  constructor(authRepository: IAuthRepository) {
    this.authRepository = authRepository;
  }

  execute(): void {
    this.authRepository.logout();
  }
}


