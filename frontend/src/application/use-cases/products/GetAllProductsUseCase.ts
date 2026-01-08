import type { IProductRepository } from '../../../domain/repositories/IProductRepository';
import type { Product } from '../../../domain/entities/Product';

/**
 * Caso de uso: Obtener todos los productos
 */
export class GetAllProductsUseCase {
  private productRepository: IProductRepository;

  constructor(productRepository: IProductRepository) {
    this.productRepository = productRepository;
  }

  async execute(): Promise<Product[]> {
    return this.productRepository.getAll();
  }
}


