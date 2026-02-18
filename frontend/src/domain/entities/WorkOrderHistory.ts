import type { WorkOrderStatus } from '../value-objects/WorkOrderStatus';
import type { User } from './User';

/**
 * Entidad de Dominio: Historial de Orden de Trabajo
 */
export class WorkOrderHistory {
  readonly id: number;
  readonly workOrderId: number;
  readonly userId: number | null;
  readonly statusFrom: WorkOrderStatus | null;
  readonly statusTo: WorkOrderStatus | null;
  readonly note: string | null;
  readonly createdAt: string;
  readonly user?: User | null;

  constructor(
    id: number,
    workOrderId: number,
    userId: number | null,
    statusFrom: WorkOrderStatus | null,
    statusTo: WorkOrderStatus | null,
    note: string | null,
    createdAt: string,
    user?: User | null
  ) {
    this.id = id;
    this.workOrderId = workOrderId;
    this.userId = userId;
    this.statusFrom = statusFrom;
    this.statusTo = statusTo;
    this.note = note;
    this.createdAt = createdAt;
    this.user = user;
  }

  /**
   * Verifica si el historial representa un cambio de estado
   */
  isStatusChange(): boolean {
    return this.statusFrom !== null && this.statusTo !== null;
  }

  /**
   * Obtiene el nombre del usuario que realizó la acción
   */
  getUserDisplayName(): string {
    return this.user?.username || 'Sistema';
  }
}


