import type { IClientRepository, CreateClientDTO, UpdateClientDTO } from '../../domain/repositories/IClientRepository';
import type { Client } from '../../domain/entities/Client';
import { apiClient } from '../http/ApiClient';
import { ClientMapper } from '../../application/mappers/ClientMapper';

/**
 * Implementación del repositorio de clientes
 */
export class ClientRepository implements IClientRepository {
  async getAll(): Promise<Client[]> {
    const data = await apiClient.get<any[]>('/clients/');
    return data.map(ClientMapper.fromDTO);
  }

  async getById(id: number): Promise<Client | null> {
    try {
      const data = await apiClient.get<any>(`/clients/${id}`);
      return ClientMapper.fromDTO(data);
    } catch (error) {
      console.error('Error getting client by id:', error);
      return null;
    }
  }

  async searchByDocument(documentNumber: string): Promise<Client | null> {
    try {
      const data = await apiClient.get<any>(`/clients/search?document_number=${encodeURIComponent(documentNumber)}`);
      return ClientMapper.fromDTO(data);
    } catch (error) {
      console.error('Error searching client by document:', error);
      return null;
    }
  }

  async create(data: CreateClientDTO): Promise<Client> {
    const response = await apiClient.post<any>('/clients/', data);
    return ClientMapper.fromDTO(response);
  }

  async update(id: number, data: UpdateClientDTO): Promise<Client> {
    const response = await apiClient.put<any>(`/clients/${id}`, data);
    return ClientMapper.fromDTO(response);
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete<void>(`/clients/${id}`);
  }
}

// Instancia singleton del repositorio
export const clientRepository = new ClientRepository();


