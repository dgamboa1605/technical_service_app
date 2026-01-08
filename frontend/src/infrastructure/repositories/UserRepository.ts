import type { IUserRepository, CreateUserDTO, UpdateUserDTO } from '../../domain/repositories/IUserRepository';
import type { User } from '../../domain/entities/User';
import { apiClient } from '../http/ApiClient';
import { UserMapper } from '../../application/mappers/UserMapper';

/**
 * Implementación del repositorio de usuarios
 */
export class UserRepository implements IUserRepository {
  async getAll(): Promise<User[]> {
    const data = await apiClient.get<any[]>('/users/');
    return data.map(UserMapper.fromDTO);
  }

  async getById(id: number): Promise<User | null> {
    try {
      const data = await apiClient.get<any>(`/users/${id}`);
      return UserMapper.fromDTO(data);
    } catch (error) {
      console.error('Error getting user by id:', error);
      return null;
    }
  }

  async getTechnicians(): Promise<User[]> {
    const data = await apiClient.get<any[]>('/users/technicians');
    return data.map(UserMapper.fromDTO);
  }

  async create(data: CreateUserDTO): Promise<User> {
    const response = await apiClient.post<any>('/users/', UserMapper.toDTO(data));
    return UserMapper.fromDTO(response);
  }

  async update(id: number, data: UpdateUserDTO): Promise<User> {
    const response = await apiClient.put<any>(`/users/${id}`, UserMapper.toDTO(data as any));
    return UserMapper.fromDTO(response);
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete<void>(`/users/${id}`);
  }
}

// Instancia singleton del repositorio
export const userRepository = new UserRepository();


