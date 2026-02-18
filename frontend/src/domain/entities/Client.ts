/**
 * Entidad de Dominio: Cliente
 */
export class Client {
  readonly id: number;
  readonly documentNumber: string | null;
  readonly name: string;
  readonly phone: string;
  readonly address: string | null;
  readonly email: string | null;

  constructor(
    id: number,
    documentNumber: string | null,
    name: string,
    phone: string,
    address: string | null,
    email: string | null
  ) {
    this.id = id;
    this.documentNumber = documentNumber;
    this.name = name;
    this.phone = phone;
    this.address = address;
    this.email = email;
  }

  /**
   * Verifica si el cliente tiene información completa
   */
  hasCompleteInfo(): boolean {
    return !!(
      this.documentNumber &&
      this.name &&
      this.phone
    );
  }

  /**
   * Obtiene el nombre completo o un valor por defecto
   */
  getDisplayName(): string {
    return this.name || 'Sin nombre';
  }
}


