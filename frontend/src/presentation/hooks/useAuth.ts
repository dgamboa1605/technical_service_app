import { useState, useEffect, useMemo, useCallback } from 'react';
import type { User } from '../../domain/entities/User';
import { LoginUseCase } from '../../application/use-cases/auth/LoginUseCase';
import { GetCurrentUserUseCase } from '../../application/use-cases/auth/GetCurrentUserUseCase';
import { LogoutUseCase } from '../../application/use-cases/auth/LogoutUseCase';
import { authRepository } from '../../infrastructure/repositories/AuthRepository';

/**
 * Hook para gestión de autenticación
 * Encapsula la lógica de login, logout y obtención del usuario actual
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Instanciar casos de uso
  const loginUseCase = useMemo(() => new LoginUseCase(authRepository), []);
  const getCurrentUserUseCase = useMemo(() => new GetCurrentUserUseCase(authRepository), []);
  const logoutUseCase = useMemo(() => new LogoutUseCase(authRepository), []);

  /**
   * Inicializa la autenticación al montar el componente
   */
  useEffect(() => {
    const initializeAuth = async () => {
      if (!authRepository.isAuthenticated()) {
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUserUseCase.execute();
        setUser(currentUser);
      } catch (err) {
        console.error('Error getting current user:', err);
        logoutUseCase.execute();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Realiza el login
   */
  const login = useCallback(async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { user: loggedInUser } = await loginUseCase.execute({ username, password });
      setUser(loggedInUser);
      return loggedInUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid credentials';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loginUseCase]);

  /**
   * Realiza el logout
   */
  const logout = useCallback(() => {
    logoutUseCase.execute();
    setUser(null);
    setError(null);
  }, [logoutUseCase]);

  const isLoggedIn = !!user;

  return {
    user,
    isLoading,
    error,
    isLoggedIn,
    login,
    logout,
  };
}


