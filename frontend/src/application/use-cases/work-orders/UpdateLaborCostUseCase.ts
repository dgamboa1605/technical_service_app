import type { IWorkOrderRepository } from '../../../domain/repositories/IWorkOrderRepository';
import type { WorkOrder } from '../../../domain/entities/WorkOrder';

/**
 * Caso de uso: Actualizar el costo de mano de obra
 */
export class UpdateLaborCostUseCase {
  private workOrderRepository: IWorkOrderRepository;

  constructor(workOrderRepository: IWorkOrderRepository) {
    this.workOrderRepository = workOrderRepository;
  }

  async execute(id: number, laborCost: number): Promise<WorkOrder> {
    return this.workOrderRepository.updateLaborCost(id, laborCost);
  }
}

