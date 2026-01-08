import type { IAuthRepository, LoginCredentials, AuthResponse } from '../../domain/repositories/IAuthRepository';
import type { User } from '../../domain/entities/User';
import { apiClient } from '../http/ApiClient';
import { storageAdapter } from '../storage/LocalStorageAdapter';
import { UserMapper } from '../../application/mappers/UserMapper';

const TOKEN_KEY = 'access_token';

/**
 * Implementación del repositorio de autenticación
 */
export class AuthRepository implements IAuthRepository {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await apiClient.postFormData<AuthResponse>(
      '/auth/login',
      formData,
      { skipAuth: true }
    );

    // Guardar token en almacenamiento local
    if (response.access_token) {
      storageAdapter.setItem(TOKEN_KEY, response.access_token);
    }

    return response;
  }

  async getCurrentUser(): Promise<User> {
    const data = await apiClient.get<any>('/auth/me');
    return UserMapper.fromDTO(data);
  }

  logout(): void {
    storageAdapter.removeItem(TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return storageAdapter.hasItem(TOKEN_KEY);
  }

  async updateProfile(updates: { username?: string; email?: string; password?: string }): Promise<User> {
    // Filtrar solo los campos que tienen valores válidos (no undefined, no vacíos)
    const payload: any = {};
    if (updates.username !== undefined && updates.username !== null && updates.username.trim() !== '') {
      payload.username = updates.username.trim();
    }
    if (updates.email !== undefined && updates.email !== null && updates.email.trim() !== '') {
      payload.email = updates.email.trim();
    }
    if (updates.password !== undefined && updates.password !== null && updates.password.trim() !== '') {
      payload.password = updates.password.trim();
    }
    
    // Si no hay campos para actualizar, lanzar error
    if (Object.keys(payload).length === 0) {
      throw new Error('No hay campos para actualizar');
    }
    
    const data = await apiClient.put<any>('/users/me', payload);
    return UserMapper.fromDTO(data);
  }
}

// Instancia singleton del repositorio
export const authRepository = new AuthRepository();


