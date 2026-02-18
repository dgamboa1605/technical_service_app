import React, { createContext, useContext, useState, useCallback } from 'react';
import type { User } from '../domain/entities/User';
import { useAuth as useAuthHook } from '../presentation/hooks/useAuth';
import { useRepositories } from './RepositoriesContext';

/**
 * Single supported auth flow: login with credentials via login(username, password).
 * Use refreshUser(user) only to update the current user in context (e.g. after profile edit).
 */
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  /** Login with username and password. Throws on failure. */
  login: (username: string, password: string) => Promise<void>;
  /** Updates the current user in context without changing the token (e.g. after profile update). */
  refreshUser: (user: User) => void;
  logout: () => void;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * AuthProvider: single entry point for auth.
 * Login is done via credentials only; refreshUser updates in-memory user (e.g. after profile edit).
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { authRepository } = useRepositories();
  const { user: authUser, isLoading: authLoading, logout: authLogout, login: authLogin } = useAuthHook();
  const [manualUser, setManualUser] = useState<User | null>(null);

  const user = manualUser || authUser;

  const login = useCallback(async (username: string, password: string) => {
    await authLogin(username, password);
  }, [authLogin]);

  const refreshUser = useCallback((userData: User) => {
    setManualUser(userData);
  }, []);

  /**
   * Logout que usa el caso de uso
   */
  const logout = useCallback(() => {
    authLogout();
    setManualUser(null);
  }, [authLogout]);

  // isLoading debe ser true si:
  // 1. El hook está cargando, O
  // 2. Hay un token pero aún no hay usuario (esperando que se cargue)
  const isLoading = authLoading || (authRepository.isAuthenticated() && !user);

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    refreshUser,
    logout,
    isLoggedIn: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};