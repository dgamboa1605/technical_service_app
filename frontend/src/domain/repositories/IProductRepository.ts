import type { Product } from '../entities/Product';

/**
 * DTO para crear/actualizar un producto
 */
export interface CreateProductDTO {
  item_type: string;
  brand: string;
  guaranteeing_brand?: string | null;
  model: string;
  serial_number: string;
  purchase_date?: string | null;
  warranty: boolean;
  client_id: number;
}

export interface UpdateProductDTO extends CreateProductDTO {}

/**
 * Interface del repositorio de productos
 */
export interface IProductRepository {
  /**
   * Obtiene todos los productos
   */
  getAll(): Promise<Product[]>;

  /**
   * Obtiene un producto por ID
   */
  getById(id: number): Promise<Product | null>;

  /**
   * Crea un nuevo producto
   */
  create(data: CreateProductDTO): Promise<Product>;

  /**
   * Actualiza un producto
   */
  update(id: number, data: UpdateProductDTO): Promise<Product>;

  /**
   * Elimina un producto
   */
  delete(id: number): Promise<void>;
}


