/**
 * Domain Layer - Punto de entrada principal
 * Exporta todas las entidades, value objects e interfaces del dominio
 */

// Constants
export { USER_ROLES } from './constants';
export type { UserRole } from './constants';

// Entities
export { User } from './entities/User';
export { Client } from './entities/Client';
export { Product } from './entities/Product';
export { WorkOrder } from './entities/WorkOrder';
export { WorkOrderHistory } from './entities/WorkOrderHistory';
export { WorkOrderPart } from './entities/WorkOrderPart';

// Value Objects
export type { WorkOrderStatus } from './value-objects/WorkOrderStatus';
export { ALLOWED_TRANSITIONS, canTransitionTo, getStatusLabel } from './value-objects/WorkOrderStatus';
export type { ServiceType } from './value-objects/ServiceType';
export { getServiceTypeLabel } from './value-objects/ServiceType';

// Repository Interfaces
export type {
  IWorkOrderRepository,
  CreateWorkOrderDTO,
  UpdateWorkOrderStatusDTO,
} from './repositories/IWorkOrderRepository';

export type {
  IClientRepository,
  CreateClientDTO,
  UpdateClientDTO,
} from './repositories/IClientRepository';

export type {
  IProductRepository,
  CreateProductDTO,
  UpdateProductDTO,
} from './repositories/IProductRepository';

export type {
  IAuthRepository,
  LoginCredentials,
  AuthResponse,
} from './repositories/IAuthRepository';

export type {
  IUserRepository,
  CreateUserDTO,
  UpdateUserDTO,
} from './repositories/IUserRepository';


