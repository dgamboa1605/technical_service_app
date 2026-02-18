import { useState, useEffect, useMemo, useCallback } from 'react';
import type { User } from '../../domain/entities/User';
import { LoginUseCase } from '../../application/use-cases/auth/LoginUseCase';
import { GetCurrentUserUseCase } from '../../application/use-cases/auth/GetCurrentUserUseCase';
import { LogoutUseCase } from '../../application/use-cases/auth/LogoutUseCase';
import { useRepositories } from '../../context/RepositoriesContext';
import { useAsyncAction } from './useAsyncAction';

/**
 * Hook para gestión de autenticación
 * Encapsula la lógica de login, logout y obtención del usuario actual
 */
export function useAuth() {
  const { authRepository } = useRepositories();
  const [user, setUser] = useState<User | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const { run, isLoading: loginLoading, error, resetError } = useAsyncAction();

  const loginUseCase = useMemo(() => new LoginUseCase(authRepository), [authRepository]);
  const getCurrentUserUseCase = useMemo(() => new GetCurrentUserUseCase(authRepository), [authRepository]);
  const logoutUseCase = useMemo(() => new LogoutUseCase(authRepository), [authRepository]);

  /**
   * Inicializa la autenticación al montar el componente
   */
  useEffect(() => {
    const initializeAuth = async () => {
      if (!authRepository.isAuthenticated()) {
        setInitialLoading(false);
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
        setInitialLoading(false);
      }
    };

    initializeAuth();
  }, [authRepository, getCurrentUserUseCase, logoutUseCase]);

  /**
   * Realiza el login
   */
  const login = useCallback(
    async (username: string, password: string) => {
      const result = await run(async () => {
        const { user: loggedInUser } = await loginUseCase.execute({ username, password });
        setUser(loggedInUser);
        return loggedInUser;
      });
      if (result !== null) return result;
      throw new Error('Invalid credentials');
    },
    [run, loginUseCase]
  );

  /**
   * Realiza el logout
   */
  const logout = useCallback(() => {
    logoutUseCase.execute();
    setUser(null);
    resetError();
  }, [logoutUseCase, resetError]);

  const isLoggedIn = !!user;
  const isLoading = initialLoading || loginLoading;

  return {
    user,
    isLoading,
    error,
    resetError,
    isLoggedIn,
    login,
    logout,
  };
}


