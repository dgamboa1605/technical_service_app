import { useState, useMemo, useCallback } from 'react';
import type { WorkOrder } from '../../domain/entities/WorkOrder';
import { GetWorkOrdersWithDetailsUseCase } from '../../application/use-cases/work-orders/GetWorkOrdersWithDetailsUseCase';
import { GetWorkOrderDetailUseCase } from '../../application/use-cases/work-orders/GetWorkOrderDetailUseCase';
import { workOrderRepository } from '../../infrastructure/repositories/WorkOrderRepository';

/**
 * Hook para gestionar órdenes de trabajo
 * Encapsula la lógica de obtención y gestión de órdenes
 */
export function useWorkOrders() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Instanciar casos de uso
  const getWorkOrdersWithDetailsUseCase = useMemo(
    () => new GetWorkOrdersWithDetailsUseCase(workOrderRepository),
    []
  );

  const getWorkOrderDetailUseCase = useMemo(
    () => new GetWorkOrderDetailUseCase(workOrderRepository),
    []
  );

  /**
   * Carga todas las órdenes con detalles
   */
  const loadWorkOrders = useCallback(async (skip: number = 0, limit: number = 100) => {
    setIsLoading(true);
    setError(null);
    try {
      const orders = await getWorkOrdersWithDetailsUseCase.execute(skip, limit);
      setWorkOrders(orders);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading work orders';
      setError(errorMessage);
      console.error('Error loading work orders:', err);
    } finally {
      setIsLoading(false);
    }
  }, [getWorkOrdersWithDetailsUseCase]);

  /**
   * Obtiene una orden específica por ID
   */
  const getWorkOrderById = useCallback(async (id: number): Promise<WorkOrder | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const order = await getWorkOrderDetailUseCase.execute(id);
      return order;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading work order';
      setError(errorMessage);
      console.error('Error loading work order:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getWorkOrderDetailUseCase]);

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
    stats,
    loadWorkOrders,
    getWorkOrderById,
    refresh: loadWorkOrders,
  };
}


