// API Configuration and base service
const API_BASE_URL = 'http://localhost:8000/api/v1';

// Types for API responses
export type WorkOrderStatus =
  | 'recibido'
  | 'asignado'
  | 'por_confirmar'
  | 'confirmado'
  | 'en_reparacion'
  | 'completado'
  | 'entregado';

export type ServiceType = 'taller' | 'recojo' | 'domicilio' | 'instalacion';

export interface WorkOrder {
  id: number;
  client_id: number;
  product_id: number;
  technician_id: number | null;
  received_date: string;
  assigned_date: string | null;
  status: WorkOrderStatus;
  service_type: ServiceType;
  customer_instructions?: string | null;
  item_condition?: string | null;
  delivered_accessories?: string | null;
  observations?: string | null;
  technical_report?: string | null;
  labor_cost?: number;
}

export interface Client {
  id: number;
  document_number: string | null;
  name: string;
  phone: string;
  address?: string | null;
  email?: string | null;
}

export interface Product {
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

export interface WorkOrderHistory {
  id: number;
  work_order_id: number;
  user_id: number | null;
  user: User | null;
  status_from: WorkOrderStatus | null;
  status_to: WorkOrderStatus | null;
  note: string | null;
  created_at: string;
}

export interface WorkOrderPart {
  id: number;
  work_order_id: number;
  description: string;
  qty: number;
  unit_price: number;
  total: number;
  created_by: number | null;
  user: User | null;
  created_at: string;
}

export interface WorkOrderDetail extends WorkOrder {
  client: Client | null;
  product: Product | null;
  technician: User | null;
  history: WorkOrderHistory[];
  parts: WorkOrderPart[];
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('access_token');
};

// Helper function to make authenticated requests
const makeRequest = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Work Orders API
export const workOrdersApi = {
  // Get all work orders (admin only)
  getAll: async (skip = 0, limit = 100): Promise<WorkOrder[]> => {
    return makeRequest(`/work-orders?skip=${skip}&limit=${limit}`);
  },

  // Get all work orders with full details (admin only)
  getAllWithDetails: async (skip = 0, limit = 100): Promise<WorkOrderDetail[]> => {
    return makeRequest(`/work-orders/all/details?skip=${skip}&limit=${limit}`);
  },

  // Get single work order by ID (public)
  getById: async (id: number): Promise<WorkOrder> => {
    return makeRequest(`/work-orders/${id}`);
  },

  // Get full detail with relations
  getDetail: async (id: number): Promise<WorkOrderDetail> => {
    return makeRequest(`/work-orders/${id}/detail`);
  },

  // Create new work order (admin only)
  create: async (data: Partial<WorkOrder>): Promise<WorkOrder> => {
    return makeRequest('/work-orders/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update status with optional note
  updateStatus: async (id: number, payload: { status: WorkOrderStatus; note?: string | null }): Promise<WorkOrder> => {
    return makeRequest(`/work-orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  // Update technical report
  updateTechnicalReport: async (id: number, technical_report: string): Promise<WorkOrder> => {
    return makeRequest(`/work-orders/${id}/technical-report`, {
      method: 'PATCH',
      body: JSON.stringify({ technical_report }),
    });
  },

  // Assign technician
  assignTechnician: async (id: number, technician_id: number): Promise<WorkOrder> => {
    return makeRequest(`/work-orders/${id}/technician`, {
      method: 'PATCH',
      body: JSON.stringify({ technician_id }),
    });
  },

  // Update labor cost
  updateLaborCost: async (id: number, labor_cost: number): Promise<WorkOrder> => {
    return makeRequest(`/work-orders/${id}/labor-cost`, {
      method: 'PATCH',
      body: JSON.stringify({ labor_cost }),
    });
  },

  // Add history entry
  addHistory: async (id: number, payload: { status_from?: WorkOrderStatus | null; status_to?: WorkOrderStatus | null; note?: string | null }): Promise<WorkOrderHistory> => {
    return makeRequest(`/work-orders/${id}/history`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Add part
  addPart: async (id: number, payload: { description: string; qty?: number; unit_price?: number; total?: number }): Promise<WorkOrderPart> => {
    return makeRequest(`/work-orders/${id}/parts`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Confirm order (public endpoint for clients)
  confirmOrder: async (id: number): Promise<WorkOrder> => {
    return makeRequest(`/work-orders/${id}/confirm`, {
      method: 'POST',
    });
  },

  getNextNumber: async (): Promise<number> => {
    return makeRequest('/work-orders/next/number');
  },
};

// Clients API
export const clientsApi = {
  getAll: async (): Promise<Client[]> => {
    return makeRequest('/clients/');
  },

  getById: async (id: number): Promise<Client> => {
    return makeRequest(`/clients/${id}`);
  },

  searchByDocument: async (document_number: string): Promise<Client> => {
    return makeRequest(`/clients/search?document_number=${encodeURIComponent(document_number)}`);
  },

  update: async (id: number, data: { document_number: string; name: string; phone: string; address?: string; email?: string | null }): Promise<Client> => {
    return makeRequest(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  create: async (data: { document_number: string; name: string; phone: string; address?: string; email?: string | null }): Promise<Client> => {
    return makeRequest('/clients/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return makeRequest(`/clients/${id}`, {
      method: 'DELETE',
    });
  },
};

// Products API
export const productsApi = {
  getAll: async (): Promise<Product[]> => {
    return makeRequest('/products/');
  },

  getById: async (id: number): Promise<Product> => {
    return makeRequest(`/products/${id}`);
  },

  create: async (data: {
    item_type: string;
    brand: string;
    guaranteeing_brand?: string | null;
    model: string;
    serial_number: string;
    purchase_date?: string | null;
    warranty: boolean;
    client_id: number;
  }): Promise<Product> => {
    return makeRequest('/products/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: {
    item_type: string;
    brand: string;
    guaranteeing_brand?: string | null;
    model: string;
    serial_number: string;
    purchase_date?: string | null;
    warranty: boolean;
    client_id: number;
  }): Promise<Product> => {
    return makeRequest(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return makeRequest(`/products/${id}`, {
      method: 'DELETE',
    });
  },
};

// Users API  
export const usersApi = {
  getAll: async (): Promise<User[]> => {
    return makeRequest('/users/');
  },

  getById: async (id: number): Promise<User> => {
    return makeRequest(`/users/${id}`);
  },

  getTechnicians: async (): Promise<User[]> => {
    return makeRequest('/users/technicians');
  },

  create: async (userData: { username: string; email: string; password: string; role: string }): Promise<User> => {
    return makeRequest('/users/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  update: async (id: number, userData: { username?: string; email?: string; password?: string; role?: string }): Promise<User> => {
    return makeRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  delete: async (id: number): Promise<void> => {
    return makeRequest(`/users/${id}`, {
      method: 'DELETE',
    });
  },
};

// Auth API
export const authApi = {
  login: async (credentials: { username: string; password: string }) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(credentials),
    });

    if (!response.ok) {
      throw new Error('Invalid credentials');
    }

    return response.json();
  },

  getMe: async (): Promise<User> => {
    return makeRequest('/auth/me');
  },
};