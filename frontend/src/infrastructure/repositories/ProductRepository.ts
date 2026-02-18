import type { IProductRepository, CreateProductDTO, UpdateProductDTO } from '../../domain/repositories/IProductRepository';
import type { Product } from '../../domain/entities/Product';
import { apiClient } from '../http/ApiClient';
import { ProductMapper } from '../../application/mappers/ProductMapper';

/**
 * Implementación del repositorio de productos
 */
export class ProductRepository implements IProductRepository {
  async getAll(): Promise<Product[]> {
    const data = await apiClient.get<any[]>('/products/');
    return data.map(ProductMapper.fromDTO);
  }

  async getById(id: number): Promise<Product | null> {
    try {
      const data = await apiClient.get<any>(`/products/${id}`);
      return ProductMapper.fromDTO(data);
    } catch (error) {
      console.error('Error getting product by id:', error);
      return null;
    }
  }

  async create(data: CreateProductDTO): Promise<Product> {
    const response = await apiClient.post<any>('/products/', data);
    return ProductMapper.fromDTO(response);
  }

  async update(id: number, data: UpdateProductDTO): Promise<Product> {
    const response = await apiClient.put<any>(`/products/${id}`, data);
    return ProductMapper.fromDTO(response);
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete<void>(`/products/${id}`);
  }
}

// Instancia singleton del repositorio
export const productRepository = new ProductRepository();


