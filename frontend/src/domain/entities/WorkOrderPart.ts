import type { User } from './User';

/**
 * Entidad de Dominio: Parte/Repuesto de Orden de Trabajo
 */
export class WorkOrderPart {
  readonly id: number;
  readonly workOrderId: number;
  readonly description: string;
  readonly qty: number;
  readonly unitPrice: number;
  readonly total: number;
  readonly createdBy: number | null;
  readonly createdAt: string;
  readonly user?: User | null;

  constructor(
    id: number,
    workOrderId: number,
    description: string,
    qty: number,
    unitPrice: number,
    total: number,
    createdBy: number | null,
    createdAt: string,
    user?: User | null
  ) {
    this.id = id;
    this.workOrderId = workOrderId;
    this.description = description;
    this.qty = qty;
    this.unitPrice = unitPrice;
    this.total = total;
    this.createdBy = createdBy;
    this.createdAt = createdAt;
    this.user = user;
  }

  /**
   * Calcula el total si no está definido
   */
  calculateTotal(): number {
    return this.qty * this.unitPrice;
  }

  /**
   * Verifica si el total es correcto
   */
  isTotalCorrect(): boolean {
    return this.total === this.calculateTotal();
  }
}


