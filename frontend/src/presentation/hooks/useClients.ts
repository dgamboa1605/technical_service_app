import { useState, useMemo, useCallback } from 'react';
import type { Client } from '../../domain/entities/Client';
import { GetAllClientsUseCase } from '../../application/use-cases/clients/GetAllClientsUseCase';
import { CreateClientUseCase } from '../../application/use-cases/clients/CreateClientUseCase';
import { useRepositories } from '../../context/RepositoriesContext';

/**
 * Hook para gestión de clientes
 */
export function useClients() {
  const { clientRepository } = useRepositories();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAllClientsUseCase = useMemo(() => new GetAllClientsUseCase(clientRepository), [clientRepository]);
  const createClientUseCase = useMemo(() => new CreateClientUseCase(clientRepository), [clientRepository]);

  /**
   * Carga todos los clientes
   */
  const loadClients = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const allClients = await getAllClientsUseCase.execute();
      setClients(allClients);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading clients';
      setError(errorMessage);
      console.error('Error loading clients:', err);
    } finally {
      setIsLoading(false);
    }
  }, [getAllClientsUseCase]);

  /**
   * Crea un nuevo cliente
   */
  const createClient = useCallback(async (data: {
    document_number: string;
    name: string;
    phone: string;
    address?: string;
    email?: string | null;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const newClient = await createClientUseCase.execute(data);
      setClients((prev) => [...prev, newClient]);
      return newClient;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creating client';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [createClientUseCase]);

  return {
    clients,
    isLoading,
    error,
    loadClients,
    createClient,
    refresh: loadClients,
  };
}


