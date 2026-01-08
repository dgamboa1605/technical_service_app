/**
 * Cliente HTTP base para comunicación con la API
 * Encapsula la lógica de peticiones HTTP y manejo de autenticación
 */

const API_BASE_URL = 'http://localhost:8000/api/v1';

export interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Obtiene el token de autenticación del almacenamiento local
   */
  private getAuthToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Construye los headers para una petición
   */
  private buildHeaders(options: RequestOptions = {}): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Agregar token de autenticación si está disponible y no se omite
    if (!options.skipAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Realiza una petición GET
   */
  async get<T>(url: string, options: RequestOptions = {}): Promise<T> {
    const headers = this.buildHeaders(options);
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: 'GET',
      headers,
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`[ApiClient] GET ${url} failed:`, response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Realiza una petición POST
   */
  async post<T>(url: string, data?: unknown, options: RequestOptions = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: 'POST',
      headers: this.buildHeaders(options),
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Realiza una petición PUT
   */
  async put<T>(url: string, data?: unknown, options: RequestOptions = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: 'PUT',
      headers: this.buildHeaders(options),
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch {
        const errorText = await response.text().catch(() => 'Unknown error');
        if (errorText) {
          errorMessage = errorText;
        }
      }
      const error: any = new Error(errorMessage);
      error.status = response.status;
      error.response = { data: { detail: errorMessage } };
      throw error;
    }

    return response.json();
  }

  /**
   * Realiza una petición PATCH
   */
  async patch<T>(url: string, data?: unknown, options: RequestOptions = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: 'PATCH',
      headers: this.buildHeaders(options),
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Realiza una petición DELETE
   */
  async delete<T>(url: string, options: RequestOptions = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${url}`, {
      method: 'DELETE',
      headers: this.buildHeaders(options),
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // DELETE puede no retornar contenido
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return undefined as T;
    }

    return response.json();
  }

  /**
   * Realiza una petición POST con FormData (para login)
   */
  async postFormData<T>(url: string, formData: FormData, options: RequestOptions = {}): Promise<T> {
    const headers: Record<string, string> = {};
    
    // No agregar Content-Type para FormData, el navegador lo hace automáticamente
    if (!options.skipAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    const response = await fetch(`${this.baseUrl}${url}`, {
      method: 'POST',
      headers: {
        ...headers,
        ...(options.headers as Record<string, string>),
      },
      body: formData,
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

// Instancia singleton del cliente API
export const apiClient = new ApiClient();


