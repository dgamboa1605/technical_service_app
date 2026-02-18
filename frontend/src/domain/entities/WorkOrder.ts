import type { WorkOrderStatus } from '../value-objects/WorkOrderStatus';
import type { ServiceType } from '../value-objects/ServiceType';
import { canTransitionTo } from '../value-objects/WorkOrderStatus';
import type { Client } from './Client';
import type { Product } from './Product';
import type { User } from './User';
import type { WorkOrderHistory } from './WorkOrderHistory';
import type { WorkOrderPart } from './WorkOrderPart';

/**
 * Entidad de Dominio: Orden de Trabajo
 */
export class WorkOrder {
  readonly id: number;
  readonly clientId: number;
  readonly productId: number;
  readonly technicianId: number | null;
  readonly receivedDate: string;
  readonly assignedDate: string | null;
  readonly status: WorkOrderStatus;
  readonly serviceType: ServiceType;
  readonly customerInstructions: string | null;
  readonly itemCondition: string | null;
  readonly deliveredAccessories: string | null;
  readonly observations: string | null;
  readonly technicalReport: string | null;
  readonly laborCost: number | null;
  // Relaciones (opcionales, cargadas cuando se necesita detalle)
  readonly client?: Client | null;
  readonly product?: Product | null;
  readonly technician?: User | null;
  // Relaciones adicionales para WorkOrderDetail
  readonly history?: WorkOrderHistory[];
  readonly parts?: WorkOrderPart[];

  constructor(
    id: number,
    clientId: number,
    productId: number,
    technicianId: number | null,
    receivedDate: string,
    assignedDate: string | null,
    status: WorkOrderStatus,
    serviceType: ServiceType,
    customerInstructions: string | null,
    itemCondition: string | null,
    deliveredAccessories: string | null,
    observations: string | null,
    technicalReport: string | null,
    laborCost: number | null,
    // Relaciones (opcionales, cargadas cuando se necesita detalle)
    client?: Client | null,
    product?: Product | null,
    technician?: User | null,
    // Relaciones adicionales para WorkOrderDetail
    history?: WorkOrderHistory[],
    parts?: WorkOrderPart[]
  ) {
    this.id = id;
    this.clientId = clientId;
    this.productId = productId;
    this.technicianId = technicianId;
    this.receivedDate = receivedDate;
    this.assignedDate = assignedDate;
    this.status = status;
    this.serviceType = serviceType;
    this.customerInstructions = customerInstructions;
    this.itemCondition = itemCondition;
    this.deliveredAccessories = deliveredAccessories;
    this.observations = observations;
    this.technicalReport = technicalReport;
    this.laborCost = laborCost;
    this.client = client;
    this.product = product;
    this.technician = technician;
    this.history = history;
    this.parts = parts;
  }

  /**
   * Verifica si la orden puede transicionar a un nuevo estado
   */
  canTransitionTo(newStatus: WorkOrderStatus): boolean {
    return canTransitionTo(this.status, newStatus);
  }

  /**
   * Verifica si la orden está en un estado final
   */
  isFinalState(): boolean {
    return this.status === 'entregado';
  }

  /**
   * Verifica si la orden está pendiente
   */
  isPending(): boolean {
    return ['recibido', 'asignado', 'por_confirmar'].includes(this.status);
  }

  /**
   * Verifica si la orden está en progreso
   */
  isInProgress(): boolean {
    return ['confirmado', 'en_reparacion'].includes(this.status);
  }

  /**
   * Verifica si la orden está completada
   */
  isCompleted(): boolean {
    return ['completado', 'entregado'].includes(this.status);
  }

  /**
   * Verifica si la orden tiene técnico asignado
   */
  hasTechnician(): boolean {
    return this.technicianId !== null && this.technicianId !== undefined;
  }
}


