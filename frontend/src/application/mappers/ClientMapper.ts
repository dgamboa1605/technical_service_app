import { Client } from '../../domain/entities/Client';

/**
 * DTO del backend (snake_case)
 */
interface ClientDTO {
  id: number;
  document_number: string | null;
  name: string;
  phone: string;
  address?: string | null;
  email?: string | null;
}

/**
 * Mapper para convertir DTOs del backend a entidades de dominio
 */
export class ClientMapper {
  /**
   * Convierte un DTO a entidad
   */
  static fromDTO(dto: ClientDTO): Client {
    return new Client(
      dto.id,
      dto.document_number,
      dto.name,
      dto.phone,
      dto.address || null,
      dto.email || null
    );
  }

  /**
   * Convierte una entidad a DTO para crear/actualizar
   */
  static toDTO(client: {
    document_number: string;
    name: string;
    phone: string;
    address?: string;
    email?: string | null;
  }): ClientDTO {
    return {
      id: 0, // Se asignará en el backend
      document_number: client.document_number,
      name: client.name,
      phone: client.phone,
      address: client.address || null,
      email: client.email || null,
    };
  }
}


