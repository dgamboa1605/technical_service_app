import { useState, useMemo, useCallback } from 'react';
import type { User } from '../../domain/entities/User';
import { GetAllUsersUseCase } from '../../application/use-cases/users/GetAllUsersUseCase';
import { GetTechniciansUseCase } from '../../application/use-cases/users/GetTechniciansUseCase';
import { CreateUserUseCase } from '../../application/use-cases/users/CreateUserUseCase';
import { userRepository } from '../../infrastructure/repositories/UserRepository';

/**
 * Hook para gestión de usuarios
 */
export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Instanciar casos de uso
  const getAllUsersUseCase = useMemo(() => new GetAllUsersUseCase(userRepository), []);
  const getTechniciansUseCase = useMemo(() => new GetTechniciansUseCase(userRepository), []);
  const createUserUseCase = useMemo(() => new CreateUserUseCase(userRepository), []);

  /**
   * Carga todos los usuarios
   */
  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const allUsers = await getAllUsersUseCase.execute();
      setUsers(allUsers);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading users';
      setError(errorMessage);
      console.error('Error loading users:', err);
    } finally {
      setIsLoading(false);
    }
  }, [getAllUsersUseCase]);

  /**
   * Obtiene todos los técnicos
   */
  const loadTechnicians = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const technicians = await getTechniciansUseCase.execute();
      return technicians;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading technicians';
      setError(errorMessage);
      console.error('Error loading technicians:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [getTechniciansUseCase]);

  /**
   * Crea un nuevo usuario
   */
  const createUser = useCallback(async (data: {
    username: string;
    email: string;
    password: string;
    role: string;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const newUser = await createUserUseCase.execute(data);
      setUsers((prev) => [...prev, newUser]);
      return newUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creating user';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [createUserUseCase]);

  return {
    users,
    isLoading,
    error,
    loadUsers,
    loadTechnicians,
    createUser,
    refresh: loadUsers,
  };
}

