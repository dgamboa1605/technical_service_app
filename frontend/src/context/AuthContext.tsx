import React, { createContext, useContext, useState, useCallback } from 'react';
import type { User } from '../domain/entities/User';
import { useAuth as useAuthHook } from '../presentation/hooks/useAuth';
import { storageAdapter } from '../infrastructure/storage/LocalStorageAdapter';
import { authRepository } from '../infrastructure/repositories/AuthRepository';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (user: User, token: string) => void;
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
 * AuthProvider refactorizado para usar la nueva arquitectura
 * Mantiene compatibilidad con el código existente mientras usa los casos de uso
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Usar el hook de presentación que encapsula la lógica de autenticación
  const { user: authUser, isLoading: authLoading, logout: authLogout } = useAuthHook();
  
  // Usar directamente el usuario del hook para evitar condiciones de carrera
  // Solo mantener estado local para el login manual que actualiza el token
  const [manualUser, setManualUser] = useState<User | null>(null);

  // El usuario final: manualUser tiene prioridad si existe (para actualizaciones recientes),
  // de lo contrario usar authUser (cargado al inicio)
  const user = manualUser || authUser;

  /**
   * Login manual (para compatibilidad con código existente)
   * Guarda el token y actualiza el usuario
   * Nota: Esto es para compatibilidad, idealmente debería usar authLogin
   */
  const login = useCallback((userData: User, token: string) => {
    storageAdapter.setItem('access_token', token);
    setManualUser(userData);
    // También intentar hacer login con el hook para mantener consistencia
    // Pero no esperamos el resultado para mantener compatibilidad
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
    logout,
    isLoggedIn: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};