import type { IWorkOrderRepository } from '../../../domain/repositories/IWorkOrderRepository';
import type { WorkOrder } from '../../../domain/entities/WorkOrder';

/**
 * Caso de uso: Actualizar el reporte técnico de una orden
 */
export class UpdateTechnicalReportUseCase {
  private workOrderRepository: IWorkOrderRepository;

  constructor(workOrderRepository: IWorkOrderRepository) {
    this.workOrderRepository = workOrderRepository;
  }

  async execute(id: number, technicalReport: string): Promise<WorkOrder> {
    return this.workOrderRepository.updateTechnicalReport(id, technicalReport);
  }
}

