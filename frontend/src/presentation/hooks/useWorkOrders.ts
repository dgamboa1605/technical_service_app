import { useState, useMemo, useCallback } from 'react';
import type { WorkOrder } from '../../domain/entities/WorkOrder';
import { GetWorkOrdersWithDetailsUseCase } from '../../application/use-cases/work-orders/GetWorkOrdersWithDetailsUseCase';
import { GetWorkOrderDetailUseCase } from '../../application/use-cases/work-orders/GetWorkOrderDetailUseCase';
import { useRepositories } from '../../context/RepositoriesContext';
import { useAsyncAction } from './useAsyncAction';

/**
 * Hook para gestionar órdenes de trabajo
 * Encapsula la lógica de obtención y gestión de órdenes
 */
export function useWorkOrders() {
  const { workOrderRepository } = useRepositories();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const { run, isLoading, error, resetError } = useAsyncAction();

  const getWorkOrdersWithDetailsUseCase = useMemo(
    () => new GetWorkOrdersWithDetailsUseCase(workOrderRepository),
    [workOrderRepository]
  );

  const getWorkOrderDetailUseCase = useMemo(
    () => new GetWorkOrderDetailUseCase(workOrderRepository),
    [workOrderRepository]
  );

  /**
   * Carga todas las órdenes con detalles
   */
  const loadWorkOrders = useCallback(
    async (skip: number = 0, limit: number = 100) => {
      const orders = await run(() =>
        getWorkOrdersWithDetailsUseCase.execute(skip, limit)
      );
      if (orders !== null) setWorkOrders(orders);
    },
    [run, getWorkOrdersWithDetailsUseCase]
  );

  /**
   * Obtiene una orden específica por ID
   */
  const getWorkOrderById = useCallback(
    async (id: number): Promise<WorkOrder | null> => {
      return run(() => getWorkOrderDetailUseCase.execute(id));
    },
    [run, getWorkOrderDetailUseCase]
  );

  /**
   * Estadísticas calculadas de las órdenes
   */
  const stats = useMemo(() => {
    const byStatus = workOrders.reduce<Record<string, number>>((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    const pendientes = (byStatus.recibido || 0) + (byStatus.asignado || 0) + (byStatus.por_confirmar || 0);
    const enProgreso = (byStatus.confirmado || 0) + (byStatus.en_reparacion || 0);
    const completadas = byStatus.completado || 0;
    const entregadas = byStatus.entregado || 0;

    return {
      pendientes,
      enProgreso,
      completadas,
      entregadas,
      total: workOrders.length,
    };
  }, [workOrders]);

  return {
    workOrders,
    isLoading,
    error,
    resetError,
    stats,
    loadWorkOrders,
    getWorkOrderById,
    refresh: loadWorkOrders,
  };
}


