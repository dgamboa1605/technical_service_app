import type { IProductRepository, CreateProductDTO } from '../../../domain/repositories/IProductRepository';
import type { Product } from '../../../domain/entities/Product';

/**
 * Caso de uso: Crear un nuevo producto
 */
export class CreateProductUseCase {
  private productRepository: IProductRepository;

  constructor(productRepository: IProductRepository) {
    this.productRepository = productRepository;
  }

  async execute(data: CreateProductDTO): Promise<Product> {
    // Validaciones de negocio
    if (!data.brand || !data.model || !data.serial_number) {
      throw new Error('Brand, model, and serial number are required');
    }

    return this.productRepository.create(data);
  }
}

