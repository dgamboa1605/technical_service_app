import React, { createContext, useContext, useMemo } from 'react';
import type { IWorkOrderRepository } from '../domain/repositories/IWorkOrderRepository';
import type { IClientRepository } from '../domain/repositories/IClientRepository';
import type { IProductRepository } from '../domain/repositories/IProductRepository';
import type { IAuthRepository } from '../domain/repositories/IAuthRepository';
import type { IUserRepository } from '../domain/repositories/IUserRepository';
import { workOrderRepository } from '../infrastructure/repositories/WorkOrderRepository';
import { clientRepository } from '../infrastructure/repositories/ClientRepository';
import { productRepository } from '../infrastructure/repositories/ProductRepository';
import { authRepository } from '../infrastructure/repositories/AuthRepository';
import { userRepository } from '../infrastructure/repositories/UserRepository';

/**
 * Composition root: provides repository instances (ports) to the app.
 * Enables dependency injection and testability (tests can provide mock repositories).
 */
export interface Repositories {
  workOrderRepository: IWorkOrderRepository;
  clientRepository: IClientRepository;
  productRepository: IProductRepository;
  authRepository: IAuthRepository;
  userRepository: IUserRepository;
}

const defaultRepositories: Repositories = {
  workOrderRepository,
  clientRepository,
  productRepository,
  authRepository,
  userRepository,
};

const RepositoriesContext = createContext<Repositories | undefined>(undefined);

export function RepositoriesProvider({
  children,
  repositories = defaultRepositories,
}: {
  children: React.ReactNode;
  /** Optional: inject custom repositories (e.g. mocks in tests). */
  repositories?: Repositories;
}) {
  const value = useMemo(() => repositories, [repositories]);

  return (
    <RepositoriesContext.Provider value={value}>
      {children}
    </RepositoriesContext.Provider>
  );
}

export function useRepositories(): Repositories {
  const context = useContext(RepositoriesContext);
  if (context === undefined) {
    throw new Error('useRepositories must be used within a RepositoriesProvider');
  }
  return context;
}
