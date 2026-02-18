import type { IClientRepository } from '../../../domain/repositories/IClientRepository';
import type { Client } from '../../../domain/entities/Client';

/**
 * Caso de uso: Obtener todos los clientes
 */
export class GetAllClientsUseCase {
  private clientRepository: IClientRepository;

  constructor(clientRepository: IClientRepository) {
    this.clientRepository = clientRepository;
  }

  async execute(): Promise<Client[]> {
    return this.clientRepository.getAll();
  }
}


