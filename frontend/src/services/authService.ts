const API_BASE_URL = 'http://localhost:8000/api/v1';

// Types para la autenticación
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

// Función para hacer login
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const formData = new FormData();
  formData.append('username', credentials.username);
  formData.append('password', credentials.password);

  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Invalid credentials');
  }

  return response.json();
};

// Función para obtener información del usuario actual
export const getCurrentUser = async (): Promise<User> => {
  const token = localStorage.getItem('access_token');
  
  console.log("🔍 getCurrentUser - Token found:", token ? "✅" : "❌");
  
  if (!token) {
    throw new Error('No token found');
  }

  console.log("🌐 Making request to /auth/me with token:", token.substring(0, 20) + "...");
  
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  console.log("📡 Response status:", response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("❌ Error response:", errorText);
    throw new Error(`Failed to fetch user data: ${response.status} - ${errorText}`);
  }

  const userData = await response.json();
  console.log("✅ User data received:", userData);
  return userData;
};

// Función para logout
export const logout = () => {
  localStorage.removeItem('access_token');
};

// Función para verificar si el usuario está autenticado
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('access_token');
};