import { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';

/**
 * Hook para gestión de autorización y permisos
 * Proporciona funciones para verificar roles y permisos del usuario actual
 */
export function useAuthorization() {
  const { user } = useAuth();

  /**
   * Verifica si el usuario actual es administrador
   */
  const isAdmin = useMemo(() => {
    return user?.isAdmin() ?? false;
  }, [user]);

  /**
   * Verifica si el usuario actual es empleado (incluye admin)
   */
  const isEmployee = useMemo(() => {
    return user?.isEmployee() ?? false;
  }, [user]);

  /**
   * Verifica si el usuario actual es técnico (incluye employee y admin)
   */
  const isTechnician = useMemo(() => {
    return user?.isTechnician() ?? false;
  }, [user]);

  /**
   * Verifica si el usuario puede acceder a un recurso específico
   */
  const canAccess = (resource: string): boolean => {
    if (!user) return false;

    // Admin tiene acceso a todo
    if (isAdmin) return true;

    // Recursos permitidos para employees
    const employeeResources = [
      'dashboard',
      'orders',
      'order-detail',
      'order-invoice',
    ];

    return employeeResources.includes(resource);
  };

  /**
   * Verifica si el usuario puede realizar una acción específica
   */
  const canPerform = (action: string): boolean => {
    if (!user) return false;

    // Admin puede realizar todas las acciones
    if (isAdmin) return true;

    // Acciones permitidas para employees
    const employeeActions = [
      'view-orders',
      'view-order-detail',
      'update-order-status',
      'update-technical-report',
      'add-parts',
      'update-labor-cost',
      'view-invoice',
    ];

    return employeeActions.includes(action);
  };

  /**
   * Verifica si el usuario puede editar una orden específica
   * (solo si es el técnico asignado)
   */
  const canEditOrder = (orderTechnicianId: number | null): boolean => {
    if (!user) return false;
    if (isAdmin) return true;
    
    // Employee solo puede editar si es el técnico asignado
    return orderTechnicianId === user.id;
  };

  return {
    isAdmin,
    isEmployee,
    isTechnician,
    canAccess,
    canPerform,
    canEditOrder,
    user,
  };
}

