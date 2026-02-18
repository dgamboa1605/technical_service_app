/**
 * Entidad de Dominio: Producto
 */
export class Product {
  readonly id: number;
  readonly itemType: string;
  readonly brand: string;
  readonly guaranteeingBrand: string | null;
  readonly model: string;
  readonly serialNumber: string;
  readonly purchaseDate: string | null;
  readonly warranty: boolean;
  readonly clientId: number;

  constructor(
    id: number,
    itemType: string,
    brand: string,
    guaranteeingBrand: string | null,
    model: string,
    serialNumber: string,
    purchaseDate: string | null,
    warranty: boolean,
    clientId: number
  ) {
    this.id = id;
    this.itemType = itemType;
    this.brand = brand;
    this.guaranteeingBrand = guaranteeingBrand;
    this.model = model;
    this.serialNumber = serialNumber;
    this.purchaseDate = purchaseDate;
    this.warranty = warranty;
    this.clientId = clientId;
  }

  /**
   * Obtiene el nombre completo del producto
   */
  getDisplayName(): string {
    return `${this.brand} ${this.model}`;
  }

  /**
   * Verifica si el producto tiene garantía válida
   */
  hasValidWarranty(): boolean {
    return this.warranty && !!this.guaranteeingBrand && !!this.purchaseDate;
  }
}


