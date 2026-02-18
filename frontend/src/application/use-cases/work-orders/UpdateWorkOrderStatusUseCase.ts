import type { IWorkOrderRepository, UpdateWorkOrderStatusDTO } from '../../../domain/repositories/IWorkOrderRepository';
import type { WorkOrder } from '../../../domain/entities/WorkOrder';

/**
 * Caso de uso: Actualizar el estado de una orden de trabajo
 * Incluye validación de transiciones permitidas
 */
export class UpdateWorkOrderStatusUseCase {
  private workOrderRepository: IWorkOrderRepository;

  constructor(workOrderRepository: IWorkOrderRepository) {
    this.workOrderRepository = workOrderRepository;
  }

  async execute(id: number, payload: UpdateWorkOrderStatusDTO): Promise<WorkOrder> {
    // Obtener la orden actual para validar la transición
    const currentOrder = await this.workOrderRepository.getById(id);
    
    if (!currentOrder) {
      throw new Error('Work order not found');
    }

    // Validar que la transición es permitida
    if (!currentOrder.canTransitionTo(payload.status)) {
      throw new Error(
        `Transition from ${currentOrder.status} to ${payload.status} is not allowed`
      );
    }

    return this.workOrderRepository.updateStatus(id, payload);
  }
}


