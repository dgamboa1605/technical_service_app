import type { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useAuthorization } from '../../presentation/hooks/useAuthorization';

interface RoleProtectedRouteProps {
  children: ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}

/**
 * Componente para proteger rutas basado en roles
 * Redirige a los usuarios que no tienen el rol necesario
 */
export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  children,
  allowedRoles,
  redirectTo = '/admin',
}) => {
  const { user, isAdmin, isEmployee } = useAuthorization();

  if (!user) {
    // Redirigir a la página principal cuando no hay sesión
    return <Navigate to="/" replace />;
  }

  // Verificar si el usuario tiene uno de los roles permitidos
  const hasAccess = allowedRoles.some((role) => {
    switch (role) {
      case 'admin':
        return isAdmin;
      case 'employee':
        return isEmployee; // isEmployee incluye admin
      default:
        return false;
    }
  });

  if (!hasAccess) {
    // Redirigir a dashboard si no tiene acceso
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

