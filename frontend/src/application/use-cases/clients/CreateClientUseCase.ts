import type { IClientRepository, CreateClientDTO } from '../../../domain/repositories/IClientRepository';
import type { Client } from '../../../domain/entities/Client';

/**
 * Caso de uso: Crear un nuevo cliente
 */
export class CreateClientUseCase {
  private clientRepository: IClientRepository;

  constructor(clientRepository: IClientRepository) {
    this.clientRepository = clientRepository;
  }

  async execute(data: CreateClientDTO): Promise<Client> {
    // Validaciones de negocio
    if (!data.document_number || !data.name || !data.phone) {
      throw new Error('Document number, name, and phone are required');
    }

    return this.clientRepository.create(data);
  }
}


