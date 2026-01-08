/**
 * Infrastructure Layer - Punto de entrada principal
 * Exporta repositorios, cliente HTTP y adaptadores
 */

// HTTP Client
export { ApiClient, apiClient } from './http/ApiClient';

// Storage
export { LocalStorageAdapter, storageAdapter } from './storage/LocalStorageAdapter';

// Repositories
export { WorkOrderRepository, workOrderRepository } from './repositories/WorkOrderRepository';
export { ClientRepository, clientRepository } from './repositories/ClientRepository';
export { ProductRepository, productRepository } from './repositories/ProductRepository';
export { AuthRepository, authRepository } from './repositories/AuthRepository';
export { UserRepository, userRepository } from './repositories/UserRepository';


