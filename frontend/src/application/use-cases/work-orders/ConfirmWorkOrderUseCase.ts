import type { IWorkOrderRepository } from '../../../domain/repositories/IWorkOrderRepository';
import type { WorkOrder } from '../../../domain/entities/WorkOrder';

/**
 * Caso de uso: Confirmar una orden de trabajo (endpoint público)
 * Permite que el cliente confirme una orden en estado 'por_confirmar'
 */
export class ConfirmWorkOrderUseCase {
  private workOrderRepository: IWorkOrderRepository;

  constructor(workOrderRepository: IWorkOrderRepository) {
    this.workOrderRepository = workOrderRepository;
  }

  async execute(id: number): Promise<WorkOrder> {
    return this.workOrderRepository.confirmOrder(id);
  }
}
