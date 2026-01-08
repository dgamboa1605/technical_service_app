import type { Client } from '../entities/Client';

/**
 * DTO para crear/actualizar un cliente
 */
export interface CreateClientDTO {
  document_number: string;
  name: string;
  phone: string;
  address?: string;
  email?: string | null;
}

export interface UpdateClientDTO extends CreateClientDTO {}

/**
 * Interface del repositorio de clientes
 */
export interface IClientRepository {
  /**
   * Obtiene todos los clientes
   */
  getAll(): Promise<Client[]>;

  /**
   * Obtiene un cliente por ID
   */
  getById(id: number): Promise<Client | null>;

  /**
   * Busca un cliente por número de documento
   */
  searchByDocument(documentNumber: string): Promise<Client | null>;

  /**
   * Crea un nuevo cliente
   */
  create(data: CreateClientDTO): Promise<Client>;

  /**
   * Actualiza un cliente
   */
  update(id: number, data: UpdateClientDTO): Promise<Client>;

  /**
   * Elimina un cliente
   */
  delete(id: number): Promise<void>;
}


