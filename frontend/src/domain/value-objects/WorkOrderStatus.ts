/**
 * Value Object: Estado de una orden de trabajo
 * Representa los estados posibles en el ciclo de vida de una orden
 */
export type WorkOrderStatus =
  | 'recibido'
  | 'asignado'
  | 'por_confirmar'
  | 'confirmado'
  | 'en_reparacion'
  | 'completado'
  | 'entregado';

/**
 * Transiciones permitidas entre estados
 */
export const ALLOWED_TRANSITIONS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  recibido: ['asignado'],
  asignado: ['por_confirmar'],
  por_confirmar: ['confirmado'],
  confirmado: ['en_reparacion'],
  en_reparacion: ['completado'],
  completado: ['entregado'],
  entregado: [],
};

/**
 * Valida si una transición de estado es permitida
 */
export function canTransitionTo(
  currentStatus: WorkOrderStatus,
  newStatus: WorkOrderStatus
): boolean {
  return ALLOWED_TRANSITIONS[currentStatus]?.includes(newStatus) ?? false;
}

/**
 * Obtiene el label en español para un estado
 */
export function getStatusLabel(status: WorkOrderStatus): string {
  const labels: Record<WorkOrderStatus, string> = {
    recibido: 'Recibido',
    asignado: 'Asignado',
    por_confirmar: 'Por Confirmar',
    confirmado: 'Confirmado',
    en_reparacion: 'En Reparación',
    completado: 'Completado',
    entregado: 'Entregado',
  };
  return labels[status] || status;
}


