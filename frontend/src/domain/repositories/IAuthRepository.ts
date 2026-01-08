import type { User } from '../entities/User';

/**
 * Credenciales de login
 */
export interface LoginCredentials {
  username: string;
  password: string;
}

/**
 * Respuesta de autenticación
 */
export interface AuthResponse {
  access_token: string;
  token_type: string;
}

/**
 * Interface del repositorio de autenticación
 */
export interface IAuthRepository {
  /**
   * Realiza el login
   */
  login(credentials: LoginCredentials): Promise<AuthResponse>;

  /**
   * Obtiene el usuario actual autenticado
   */
  getCurrentUser(): Promise<User>;

  /**
   * Realiza el logout
   */
  logout(): void;

  /**
   * Verifica si hay un token de autenticación
   */
  isAuthenticated(): boolean;

  /**
   * Actualiza el perfil del usuario actual
   */
  updateProfile(updates: { username?: string; email?: string; password?: string }): Promise<User>;
}


