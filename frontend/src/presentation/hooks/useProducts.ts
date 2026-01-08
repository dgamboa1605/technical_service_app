import { useState, useMemo, useCallback } from 'react';
import type { Product } from '../../domain/entities/Product';
import { GetAllProductsUseCase } from '../../application/use-cases/products/GetAllProductsUseCase';
import { CreateProductUseCase } from '../../application/use-cases/products/CreateProductUseCase';
import { productRepository } from '../../infrastructure/repositories/ProductRepository';

/**
 * Hook para gestión de productos
 */
export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Instanciar casos de uso
  const getAllProductsUseCase = useMemo(() => new GetAllProductsUseCase(productRepository), []);
  const createProductUseCase = useMemo(() => new CreateProductUseCase(productRepository), []);

  /**
   * Carga todos los productos
   */
  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const allProducts = await getAllProductsUseCase.execute();
      setProducts(allProducts);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading products';
      setError(errorMessage);
      console.error('Error loading products:', err);
    } finally {
      setIsLoading(false);
    }
  }, [getAllProductsUseCase]);

  /**
   * Crea un nuevo producto
   */
  const createProduct = useCallback(async (data: {
    item_type: string;
    brand: string;
    guaranteeing_brand?: string | null;
    model: string;
    serial_number: string;
    purchase_date?: string | null;
    warranty: boolean;
    client_id: number;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const newProduct = await createProductUseCase.execute(data);
      setProducts((prev) => [...prev, newProduct]);
      return newProduct;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creating product';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [createProductUseCase]);

  return {
    products,
    isLoading,
    error,
    loadProducts,
    createProduct,
    refresh: loadProducts,
  };
}

