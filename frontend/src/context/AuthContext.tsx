import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '../services/authService';
import { getCurrentUser, logout as logoutService } from '../services/authService';

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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      console.log("🔍 Inicializando autenticación...");
      try {
        const token = localStorage.getItem('access_token');
        if (token) {
          console.log("🎫 Token encontrado:", token.substring(0, 20) + "...");
          const userData = await getCurrentUser();
          console.log("✅ Usuario cargado:", userData);
          setUser(userData);
        } else {
          console.log("🚫 No hay token de autenticación");
        }
      } catch (error) {
        console.error('❌ Error al obtener datos del usuario:', error);
        logoutService();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (userData: User, token: string) => {
    console.log("🔑 Login function called with:", { userData, tokenLength: token.length });
    localStorage.setItem('access_token', token);
    setUser(userData);
    console.log("✅ User set in context, isLoggedIn will be:", !!userData);
  };

  const logout = () => {
    console.log("🚪 Logout called");
    logoutService();
    setUser(null);
    console.log("✅ User cleared from context");
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    isLoggedIn: !!user,
  };

  console.log("🔄 AuthProvider render:", { user: !!user, isLoading, isLoggedIn: !!user });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};