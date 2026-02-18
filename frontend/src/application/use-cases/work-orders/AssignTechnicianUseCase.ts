import type { IWorkOrderRepository } from '../../../domain/repositories/IWorkOrderRepository';
import type { WorkOrder } from '../../../domain/entities/WorkOrder';

/**
 * Caso de uso: Asignar un técnico a una orden de trabajo
 */
export class AssignTechnicianUseCase {
  private workOrderRepository: IWorkOrderRepository;

  constructor(workOrderRepository: IWorkOrderRepository) {
    this.workOrderRepository = workOrderRepository;
  }

  async execute(id: number, technicianId: number): Promise<WorkOrder> {
    return this.workOrderRepository.assignTechnician(id, technicianId);
  }
}

