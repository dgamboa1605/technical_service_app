import type { IAuthRepository, LoginCredentials } from '../../../domain/repositories/IAuthRepository';
import type { User } from '../../../domain/entities/User';

/**
 * Caso de uso: Realizar login
 */
export class LoginUseCase {
  private authRepository: IAuthRepository;

  constructor(authRepository: IAuthRepository) {
    this.authRepository = authRepository;
  }

  async execute(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    // Realizar login
    const authResponse = await this.authRepository.login(credentials);

    // Obtener información del usuario
    const user = await this.authRepository.getCurrentUser();

    return {
      user,
      token: authResponse.access_token,
    };
  }
}


