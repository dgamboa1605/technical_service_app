/**
 * Application Layer - Punto de entrada principal
 * Exporta casos de uso y mappers
 */

// Use Cases - Work Orders
export { GetWorkOrdersUseCase } from './use-cases/work-orders/GetWorkOrdersUseCase';
export { GetWorkOrdersWithDetailsUseCase } from './use-cases/work-orders/GetWorkOrdersWithDetailsUseCase';
export { GetWorkOrderDetailUseCase } from './use-cases/work-orders/GetWorkOrderDetailUseCase';
export { CreateWorkOrderUseCase } from './use-cases/work-orders/CreateWorkOrderUseCase';
export { UpdateWorkOrderStatusUseCase } from './use-cases/work-orders/UpdateWorkOrderStatusUseCase';

// Use Cases - Auth
export { LoginUseCase } from './use-cases/auth/LoginUseCase';
export { GetCurrentUserUseCase } from './use-cases/auth/GetCurrentUserUseCase';
export { LogoutUseCase } from './use-cases/auth/LogoutUseCase';
export { UpdateProfileUseCase } from './use-cases/auth/UpdateProfileUseCase';

// Use Cases - Clients
export { GetAllClientsUseCase } from './use-cases/clients/GetAllClientsUseCase';
export { CreateClientUseCase } from './use-cases/clients/CreateClientUseCase';

// Use Cases - Products
export { GetAllProductsUseCase } from './use-cases/products/GetAllProductsUseCase';
export { CreateProductUseCase } from './use-cases/products/CreateProductUseCase';

// Use Cases - Users
export { GetAllUsersUseCase } from './use-cases/users/GetAllUsersUseCase';
export { GetTechniciansUseCase } from './use-cases/users/GetTechniciansUseCase';
export { CreateUserUseCase } from './use-cases/users/CreateUserUseCase';

// Use Cases - Work Orders (adicionales)
export { UpdateTechnicalReportUseCase } from './use-cases/work-orders/UpdateTechnicalReportUseCase';
export { AssignTechnicianUseCase } from './use-cases/work-orders/AssignTechnicianUseCase';
export { UpdateLaborCostUseCase } from './use-cases/work-orders/UpdateLaborCostUseCase';
export { AddWorkOrderPartUseCase } from './use-cases/work-orders/AddWorkOrderPartUseCase';
export { AddHistoryUseCase } from './use-cases/work-orders/AddHistoryUseCase';
export { ConfirmWorkOrderUseCase } from './use-cases/work-orders/ConfirmWorkOrderUseCase';

// Mappers
export { WorkOrderMapper } from './mappers/WorkOrderMapper';
export { ClientMapper } from './mappers/ClientMapper';
export { ProductMapper } from './mappers/ProductMapper';
export { UserMapper } from './mappers/UserMapper';


