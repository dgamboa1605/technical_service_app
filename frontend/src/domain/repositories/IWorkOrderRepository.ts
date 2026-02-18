import type { WorkOrder } from '../entities/WorkOrder';
import type { WorkOrderStatus } from '../value-objects/WorkOrderStatus';
import type { WorkOrderHistory } from '../entities/WorkOrderHistory';
import type { WorkOrderPart } from '../entities/WorkOrderPart';

/**
 * DTO para crear una orden de trabajo
 */
export interface CreateWorkOrderDTO {
  client_id: number;
  product_id: number;
  technician_id?: number | null;
  assigned_date?: string | null;
  status?: WorkOrderStatus;
  service_type: string;
  customer_instructions?: string | null;
  item_condition?: string | null;
  delivered_accessories?: string | null;
  observations?: string | null;
}

/**
 * DTO para actualizar el estado de una orden
 */
export interface UpdateWorkOrderStatusDTO {
  status: WorkOrderStatus;
  note?: string | null;
}

/**
 * Interface del repositorio de órdenes de trabajo
 * Define el contrato para acceder a los datos de órdenes
 */
export interface IWorkOrderRepository {
  /**
   * Obtiene todas las órdenes de trabajo
   */
  getAll(skip?: number, limit?: number): Promise<WorkOrder[]>;

  /**
   * Obtiene todas las órdenes con detalles completos
   */
  getAllWithDetails(skip?: number, limit?: number): Promise<WorkOrder[]>;

  /**
   * Obtiene una orden por ID
   */
  getById(id: number): Promise<WorkOrder | null>;

  /**
   * Obtiene una orden con todos sus detalles
   */
  getDetail(id: number): Promise<WorkOrder | null>;

  /**
   * Crea una nueva orden de trabajo
   */
  create(data: CreateWorkOrderDTO): Promise<WorkOrder>;

  /**
   * Actualiza el estado de una orden
   */
  updateStatus(id: number, payload: UpdateWorkOrderStatusDTO): Promise<WorkOrder>;

  /**
   * Actualiza el reporte técnico
   */
  updateTechnicalReport(id: number, technicalReport: string): Promise<WorkOrder>;

  /**
   * Asigna un técnico a una orden
   */
  assignTechnician(id: number, technicianId: number): Promise<WorkOrder>;

  /**
   * Actualiza el costo de mano de obra
   */
  updateLaborCost(id: number, laborCost: number): Promise<WorkOrder>;

  /**
   * Obtiene el siguiente número de orden
   */
  getNextNumber(): Promise<number>;

  /**
   * Confirma una orden (endpoint público)
   */
  confirmOrder(id: number): Promise<WorkOrder>;

  /**
   * Agrega una entrada al historial
   */
  addHistory(id: number, payload: { status_from?: WorkOrderStatus | null; status_to?: WorkOrderStatus | null; note?: string | null }): Promise<WorkOrderHistory>;

  /**
   * Agrega una parte/repuesto a la orden
   */
  addPart(id: number, payload: { description: string; qty?: number; unit_price?: number; total?: number }): Promise<WorkOrderPart>;
}


