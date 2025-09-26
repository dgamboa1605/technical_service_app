import { useAuth } from '../context/AuthContext';

export const useAuthState = () => {
  const { user, isLoggedIn, isLoading, login, logout } = useAuth();

  const getDisplayName = () => {
    if (!user) return '';
    return user.username || user.email || 'Usuario';
  };

  const getInitials = () => {
    if (!user) return '';
    const name = user.username || user.email || '';
    return name.substring(0, 2).toUpperCase();
  };

  const getUserRole = () => {
    if (!user) return '';
    return user.role || '';
  };

  return {
    user,
    isLoggedIn,
    isLoading,
    login,
    logout,
    getDisplayName,
    getInitials,
    getUserRole,
  };
};