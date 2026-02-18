import type { IWorkOrderRepository } from '../../../domain/repositories/IWorkOrderRepository';
import type { WorkOrder } from '../../../domain/entities/WorkOrder';

/**
 * Caso de uso: Obtener una orden de trabajo con todos sus detalles
 */
export class GetWorkOrderDetailUseCase {
  private workOrderRepository: IWorkOrderRepository;

  constructor(workOrderRepository: IWorkOrderRepository) {
    this.workOrderRepository = workOrderRepository;
  }

  async execute(id: number): Promise<WorkOrder | null> {
    return this.workOrderRepository.getDetail(id);
  }
}


