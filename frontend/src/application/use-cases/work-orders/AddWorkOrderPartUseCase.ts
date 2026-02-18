import type { IWorkOrderRepository } from '../../../domain/repositories/IWorkOrderRepository';
import type { WorkOrderPart } from '../../../domain/entities/WorkOrderPart';

/**
 * DTO para agregar una parte
 */
export interface AddPartDTO {
  description: string;
  qty?: number;
  unit_price?: number;
  total?: number;
}

/**
 * Caso de uso: Agregar una parte/repuesto a una orden
 */
export class AddWorkOrderPartUseCase {
  private workOrderRepository: IWorkOrderRepository;

  constructor(workOrderRepository: IWorkOrderRepository) {
    this.workOrderRepository = workOrderRepository;
  }

  async execute(workOrderId: number, partData: AddPartDTO): Promise<WorkOrderPart> {
    // Validaciones
    if (!partData.description.trim()) {
      throw new Error('Description is required');
    }

    const qty = partData.qty || 1;
    const unitPrice = partData.unit_price || 0;
    const total = partData.total ?? (qty * unitPrice);

    return this.workOrderRepository.addPart(workOrderId, {
      description: partData.description.trim(),
      qty,
      unit_price: unitPrice,
      total,
    });
  }
}


