import { Product } from '../../domain/entities/Product';

/**
 * DTO del backend (snake_case)
 */
interface ProductDTO {
  id: number;
  item_type: string;
  brand: string;
  guaranteeing_brand?: string | null;
  model: string;
  serial_number: string;
  purchase_date?: string | null;
  warranty: boolean;
  client_id: number;
}

/**
 * Mapper para convertir DTOs del backend a entidades de dominio
 */
export class ProductMapper {
  /**
   * Convierte un DTO a entidad
   */
  static fromDTO(dto: ProductDTO): Product {
    return new Product(
      dto.id,
      dto.item_type,
      dto.brand,
      dto.guaranteeing_brand || null,
      dto.model,
      dto.serial_number,
      dto.purchase_date || null,
      dto.warranty,
      dto.client_id
    );
  }

  /**
   * Convierte una entidad a DTO para crear/actualizar
   */
  static toDTO(product: {
    item_type: string;
    brand: string;
    guaranteeing_brand?: string | null;
    model: string;
    serial_number: string;
    purchase_date?: string | null;
    warranty: boolean;
    client_id: number;
  }): ProductDTO {
    return {
      id: 0, // Se asignará en el backend
      item_type: product.item_type,
      brand: product.brand,
      guaranteeing_brand: product.guaranteeing_brand || null,
      model: product.model,
      serial_number: product.serial_number,
      purchase_date: product.purchase_date || null,
      warranty: product.warranty,
      client_id: product.client_id,
    };
  }
}


