import type { IWorkOrderRepository, CreateWorkOrderDTO } from '../../../domain/repositories/IWorkOrderRepository';
import type { WorkOrder } from '../../../domain/entities/WorkOrder';

/**
 * Caso de uso: Crear una nueva orden de trabajo
 */
export class CreateWorkOrderUseCase {
  private workOrderRepository: IWorkOrderRepository;

  constructor(workOrderRepository: IWorkOrderRepository) {
    this.workOrderRepository = workOrderRepository;
  }

  async execute(data: CreateWorkOrderDTO): Promise<WorkOrder> {
    // Validaciones de negocio pueden ir aquí
    if (!data.client_id || !data.product_id) {
      throw new Error('Client ID and Product ID are required');
    }

    return this.workOrderRepository.create(data);
  }
}


