import type { IWorkOrderRepository } from '../../../domain/repositories/IWorkOrderRepository';
import type { WorkOrderHistory } from '../../../domain/entities/WorkOrderHistory';
import type { WorkOrderStatus } from '../../../domain/value-objects/WorkOrderStatus';

/**
 * DTO para agregar historial
 */
export interface AddHistoryDTO {
  status_from?: WorkOrderStatus | null;
  status_to?: WorkOrderStatus | null;
  note?: string | null;
}

/**
 * Caso de uso: Agregar una entrada al historial de una orden
 */
export class AddHistoryUseCase {
  private workOrderRepository: IWorkOrderRepository;

  constructor(workOrderRepository: IWorkOrderRepository) {
    this.workOrderRepository = workOrderRepository;
  }

  async execute(workOrderId: number, historyData: AddHistoryDTO): Promise<WorkOrderHistory> {
    return this.workOrderRepository.addHistory(workOrderId, historyData);
  }
}

