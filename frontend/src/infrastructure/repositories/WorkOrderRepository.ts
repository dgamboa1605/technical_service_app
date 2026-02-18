import type { IWorkOrderRepository, CreateWorkOrderDTO, UpdateWorkOrderStatusDTO } from '../../domain/repositories/IWorkOrderRepository';
import type { WorkOrder } from '../../domain/entities/WorkOrder';
import type { WorkOrderHistory } from '../../domain/entities/WorkOrderHistory';
import type { WorkOrderPart } from '../../domain/entities/WorkOrderPart';
import { apiClient } from '../http/ApiClient';
import { WorkOrderMapper } from '../../application/mappers/WorkOrderMapper';

/**
 * Implementación del repositorio de órdenes de trabajo
 * Utiliza el cliente HTTP para comunicarse con la API
 */
export class WorkOrderRepository implements IWorkOrderRepository {
  async getAll(skip: number = 0, limit: number = 100): Promise<WorkOrder[]> {
    const data = await apiClient.get<any[]>(`/work-orders?skip=${skip}&limit=${limit}`);
    return data.map(WorkOrderMapper.fromDTO);
  }

  async getAllWithDetails(skip: number = 0, limit: number = 100): Promise<WorkOrder[]> {
    const data = await apiClient.get<any[]>(`/work-orders/all/details?skip=${skip}&limit=${limit}`);
    return data.map(WorkOrderMapper.fromDetailDTO);
  }

  async getById(id: number): Promise<WorkOrder | null> {
    try {
      const data = await apiClient.get<any>(`/work-orders/${id}`);
      return WorkOrderMapper.fromDTO(data);
    } catch (error) {
      console.error('Error getting work order by id:', error);
      return null;
    }
  }

  async getDetail(id: number): Promise<WorkOrder | null> {
    try {
      const data = await apiClient.get<any>(`/work-orders/${id}/detail`);
      return WorkOrderMapper.fromDetailDTO(data);
    } catch (error) {
      console.error('Error getting work order detail:', error);
      return null;
    }
  }

  async create(data: CreateWorkOrderDTO): Promise<WorkOrder> {
    const response = await apiClient.post<any>('/work-orders/', data);
    return WorkOrderMapper.fromDTO(response);
  }

  async updateStatus(id: number, payload: UpdateWorkOrderStatusDTO): Promise<WorkOrder> {
    const response = await apiClient.patch<any>(`/work-orders/${id}/status`, payload);
    return WorkOrderMapper.fromDTO(response);
  }

  async updateTechnicalReport(id: number, technicalReport: string): Promise<WorkOrder> {
    const response = await apiClient.patch<any>(`/work-orders/${id}/technical-report`, {
      technical_report: technicalReport,
    });
    return WorkOrderMapper.fromDTO(response);
  }

  async assignTechnician(id: number, technicianId: number): Promise<WorkOrder> {
    const response = await apiClient.patch<any>(`/work-orders/${id}/technician`, {
      technician_id: technicianId,
    });
    return WorkOrderMapper.fromDTO(response);
  }

  async updateLaborCost(id: number, laborCost: number): Promise<WorkOrder> {
    const response = await apiClient.patch<any>(`/work-orders/${id}/labor-cost`, {
      labor_cost: laborCost,
    });
    return WorkOrderMapper.fromDTO(response);
  }

  async getNextNumber(): Promise<number> {
    return apiClient.get<number>('/work-orders/next/number');
  }

  async confirmOrder(id: number): Promise<WorkOrder> {
    // Endpoint público, no requiere autenticación
    const response = await apiClient.post<any>(`/work-orders/${id}/confirm`, undefined, { skipAuth: true });
    return WorkOrderMapper.fromDTO(response);
  }

  async addHistory(id: number, payload: { status_from?: any; status_to?: any; note?: string | null }): Promise<WorkOrderHistory> {
    const response = await apiClient.post<any>(`/work-orders/${id}/history`, payload);
    return WorkOrderMapper.historyFromDTO(response);
  }

  async addPart(id: number, payload: { description: string; qty?: number; unit_price?: number; total?: number }): Promise<WorkOrderPart> {
    const response = await apiClient.post<any>(`/work-orders/${id}/parts`, payload);
    return WorkOrderMapper.partFromDTO(response);
  }
}

// Instancia singleton del repositorio
export const workOrderRepository = new WorkOrderRepository();


