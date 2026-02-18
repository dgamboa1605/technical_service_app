/**
 * useWorkOrders hook test with mock repositories (Phase 3: DI / testability).
 */
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { useWorkOrders } from '../../../presentation/hooks/useWorkOrders';
import { RepositoriesProvider } from '../../../context/RepositoriesContext';
import type { WorkOrder } from '../../../domain/entities/WorkOrder';
import type { IWorkOrderRepository } from '../../../domain/repositories/IWorkOrderRepository';

function createMockWorkOrder(overrides: Partial<WorkOrder> = {}): WorkOrder {
  return {
    id: 1,
    clientId: 1,
    productId: 1,
    technicianId: null,
    receivedDate: '2025-01-01',
    assignedDate: null,
    status: 'recibido',
    serviceType: 'taller',
    customerInstructions: null,
    itemCondition: null,
    deliveredAccessories: null,
    observations: null,
    technicalReport: null,
    laborCost: null,
    ...overrides,
  } as WorkOrder;
}

function createMockWorkOrderRepository(
  orders: WorkOrder[] = [
    createMockWorkOrder({ id: 1, status: 'recibido' }),
    createMockWorkOrder({ id: 2, status: 'entregado' }),
  ]
): IWorkOrderRepository {
  const getAllWithDetails = vi.fn().mockResolvedValue(orders);
  const getDetail = vi.fn().mockResolvedValue(orders[0] ?? null);
  return {
    getAll: vi.fn().mockResolvedValue([]),
    getAllWithDetails,
    getById: vi.fn().mockResolvedValue(null),
    getDetail,
    create: vi.fn(),
    updateStatus: vi.fn(),
    updateTechnicalReport: vi.fn(),
    assignTechnician: vi.fn(),
    updateLaborCost: vi.fn(),
    getNextNumber: vi.fn().mockResolvedValue(1),
    confirmOrder: vi.fn(),
    addHistory: vi.fn(),
    addPart: vi.fn(),
  } as unknown as IWorkOrderRepository;
}

describe('useWorkOrders', () => {
  it('loads work orders from injected repository', async () => {
    const mockOrders = [
      createMockWorkOrder({ id: 10, status: 'recibido' }),
      createMockWorkOrder({ id: 20, status: 'confirmado' }),
    ];
    const mockRepo = createMockWorkOrderRepository(mockOrders);
    const repositories = {
      workOrderRepository: mockRepo,
      clientRepository: {} as any,
      productRepository: {} as any,
      authRepository: {} as any,
      userRepository: {} as any,
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RepositoriesProvider repositories={repositories}>
        {children}
      </RepositoriesProvider>
    );

    const { result } = renderHook(() => useWorkOrders(), { wrapper });

    expect(result.current.workOrders).toEqual([]);

    await act(async () => {
      await result.current.loadWorkOrders(0, 100);
    });

    expect(result.current.workOrders).toHaveLength(2);
    expect(result.current.workOrders[0].id).toBe(10);
    expect(result.current.workOrders[1].id).toBe(20);
    expect(result.current.stats.total).toBe(2);
    expect(mockRepo.getAllWithDetails).toHaveBeenCalledWith(0, 100);
  });

  it('uses repository from context (not global singleton)', async () => {
    const customOrders = [createMockWorkOrder({ id: 99, status: 'completado' })];
    const mockRepo = createMockWorkOrderRepository(customOrders);
    const repositories = {
      workOrderRepository: mockRepo,
      clientRepository: {} as any,
      productRepository: {} as any,
      authRepository: {} as any,
      userRepository: {} as any,
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RepositoriesProvider repositories={repositories}>
        {children}
      </RepositoriesProvider>
    );

    const { result } = renderHook(() => useWorkOrders(), { wrapper });

    await act(async () => {
      await result.current.loadWorkOrders();
    });

    expect(result.current.workOrders).toHaveLength(1);
    expect(result.current.workOrders[0].id).toBe(99);
    expect(result.current.workOrders[0].status).toBe('completado');
  });
});
