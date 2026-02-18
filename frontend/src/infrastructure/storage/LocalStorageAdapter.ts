/**
 * Adaptador para almacenamiento local
 * Abstrae el acceso a localStorage
 */
export class LocalStorageAdapter {
  /**
   * Obtiene un valor del almacenamiento local
   */
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Error getting item from localStorage: ${key}`, error);
      return null;
    }
  }

  /**
   * Guarda un valor en el almacenamiento local
   */
  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error setting item in localStorage: ${key}`, error);
    }
  }

  /**
   * Elimina un valor del almacenamiento local
   */
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item from localStorage: ${key}`, error);
    }
  }

  /**
   * Verifica si existe una clave en el almacenamiento local
   */
  hasItem(key: string): boolean {
    return this.getItem(key) !== null;
  }
}

// Instancia singleton del adaptador
export const storageAdapter = new LocalStorageAdapter();


