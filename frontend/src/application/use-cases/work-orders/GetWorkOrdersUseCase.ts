import type { IWorkOrderRepository } from '../../../domain/repositories/IWorkOrderRepository';
import type { WorkOrder } from '../../../domain/entities/WorkOrder';

/**
 * Caso de uso: Obtener todas las órdenes de trabajo
 */
export class GetWorkOrdersUseCase {
  private workOrderRepository: IWorkOrderRepository;

  constructor(workOrderRepository: IWorkOrderRepository) {
    this.workOrderRepository = workOrderRepository;
  }

  async execute(skip: number = 0, limit: number = 100): Promise<WorkOrder[]> {
    return this.workOrderRepository.getAll(skip, limit);
  }
}


