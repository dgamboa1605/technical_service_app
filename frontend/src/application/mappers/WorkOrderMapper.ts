import { WorkOrder } from '../../domain/entities/WorkOrder';
import type { WorkOrderHistory } from '../../domain/entities/WorkOrderHistory';
import type { WorkOrderPart } from '../../domain/entities/WorkOrderPart';
import { Client } from '../../domain/entities/Client';
import { Product } from '../../domain/entities/Product';
import { User } from '../../domain/entities/User';
import { WorkOrderHistory as WorkOrderHistoryEntity } from '../../domain/entities/WorkOrderHistory';
import { WorkOrderPart as WorkOrderPartEntity } from '../../domain/entities/WorkOrderPart';

/**
 * DTOs del backend (snake_case)
 */
interface WorkOrderDTO {
  id: number;
  client_id: number;
  product_id: number;
  technician_id: number | null;
  received_date: string;
  assigned_date: string | null;
  status: string;
  service_type: string;
  customer_instructions?: string | null;
  item_condition?: string | null;
  delivered_accessories?: string | null;
  observations?: string | null;
  technical_report?: string | null;
  labor_cost?: number | null;
}

interface ClientDTO {
  id: number;
  document_number: string | null;
  name: string;
  phone: string;
  address?: string | null;
  email?: string | null;
}

interface ProductDTO {
  id: number;
  item_type: string;
  brand: string;
  guaranteeing_brand?: string | null;
  model: string;
  serial_number: string;
  purchase_date?: string | null;
  warranty: boolean;
  client_id: number;
}

interface UserDTO {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface WorkOrderHistoryDTO {
  id: number;
  work_order_id: number;
  user_id: number | null;
  user: UserDTO | null;
  status_from: string | null;
  status_to: string | null;
  note: string | null;
  created_at: string;
}

interface WorkOrderPartDTO {
  id: number;
  work_order_id: number;
  description: string;
  qty: number;
  unit_price: number;
  total: number;
  created_by: number | null;
  user: UserDTO | null;
  created_at: string;
}

interface WorkOrderDetailDTO extends WorkOrderDTO {
  client: ClientDTO | null;
  product: ProductDTO | null;
  technician: UserDTO | null;
  history: WorkOrderHistoryDTO[];
  parts: WorkOrderPartDTO[];
}

/**
 * Mapper para convertir DTOs del backend a entidades de dominio
 */
export class WorkOrderMapper {
  /**
   * Convierte un DTO de cliente a entidad
   */
  static clientFromDTO(dto: ClientDTO | null): Client | null {
    if (!dto) return null;
    return new Client(
      dto.id,
      dto.document_number,
      dto.name,
      dto.phone,
      dto.address || null,
      dto.email || null
    );
  }

  /**
   * Convierte un DTO de producto a entidad
   */
  static productFromDTO(dto: ProductDTO | null): Product | null {
    if (!dto) return null;
    return new Product(
      dto.id,
      dto.item_type,
      dto.brand,
      dto.guaranteeing_brand || null,
      dto.model,
      dto.serial_number,
      dto.purchase_date || null,
      dto.warranty,
      dto.client_id
    );
  }

  /**
   * Convierte un DTO de usuario a entidad
   */
  static userFromDTO(dto: UserDTO | null): User | null {
    if (!dto) return null;
    return new User(dto.id, dto.username, dto.email, dto.role);
  }

  /**
   * Convierte un DTO de historial a entidad
   */
  static historyFromDTO(dto: WorkOrderHistoryDTO): WorkOrderHistory {
    return new WorkOrderHistoryEntity(
      dto.id,
      dto.work_order_id,
      dto.user_id,
      dto.status_from as any,
      dto.status_to as any,
      dto.note,
      dto.created_at,
      WorkOrderMapper.userFromDTO(dto.user)
    );
  }

  /**
   * Convierte un DTO de parte a entidad
   */
  static partFromDTO(dto: WorkOrderPartDTO): WorkOrderPart {
    return new WorkOrderPartEntity(
      dto.id,
      dto.work_order_id,
      dto.description,
      dto.qty,
      dto.unit_price,
      dto.total,
      dto.created_by,
      dto.created_at,
      WorkOrderMapper.userFromDTO(dto.user)
    );
  }

  /**
   * Convierte un DTO de orden de trabajo a entidad
   */
  static fromDTO(dto: WorkOrderDTO | WorkOrderDetailDTO): WorkOrder {
    return new WorkOrder(
      dto.id,
      dto.client_id,
      dto.product_id,
      dto.technician_id,
      dto.received_date,
      dto.assigned_date,
      dto.status as any,
      dto.service_type as any,
      dto.customer_instructions || null,
      dto.item_condition || null,
      dto.delivered_accessories || null,
      dto.observations || null,
      dto.technical_report || null,
      dto.labor_cost || null,
      // Si es WorkOrderDetailDTO, incluir relaciones
      'client' in dto ? WorkOrderMapper.clientFromDTO(dto.client) : undefined,
      'product' in dto ? WorkOrderMapper.productFromDTO(dto.product) : undefined,
      'technician' in dto ? WorkOrderMapper.userFromDTO(dto.technician) : undefined
    );
  }

  /**
   * Convierte un DTO de orden con detalles completos a entidad
   */
  static fromDetailDTO(dto: WorkOrderDetailDTO): WorkOrder {
    return new WorkOrder(
      dto.id,
      dto.client_id,
      dto.product_id,
      dto.technician_id,
      dto.received_date,
      dto.assigned_date,
      dto.status as any,
      dto.service_type as any,
      dto.customer_instructions || null,
      dto.item_condition || null,
      dto.delivered_accessories || null,
      dto.observations || null,
      dto.technical_report || null,
      dto.labor_cost || null,
      // Relaciones
      WorkOrderMapper.clientFromDTO(dto.client),
      WorkOrderMapper.productFromDTO(dto.product),
      WorkOrderMapper.userFromDTO(dto.technician),
      // Historial y partes
      dto.history?.map(h => WorkOrderMapper.historyFromDTO(h)),
      dto.parts?.map(p => WorkOrderMapper.partFromDTO(p))
    );
  }

  /**
   * Convierte una entidad a DTO para crear/actualizar (snake_case)
   */
  static toCreateDTO(workOrder: Partial<WorkOrder>): any {
    return {
      client_id: workOrder.clientId,
      product_id: workOrder.productId,
      technician_id: workOrder.technicianId || null,
      assigned_date: workOrder.assignedDate || null,
      status: workOrder.status,
      service_type: workOrder.serviceType,
      customer_instructions: workOrder.customerInstructions || null,
      item_condition: workOrder.itemCondition || null,
      delivered_accessories: workOrder.deliveredAccessories || null,
      observations: workOrder.observations || null,
    };
  }
}


