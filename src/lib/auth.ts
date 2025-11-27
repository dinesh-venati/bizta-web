import apiClient from './api-client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  organization: {
    id: string;
    name: string;
    slug: string;
  };
}

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
  const { accessToken } = response.data;
  
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', accessToken);
  }
  
  return response.data;
};

export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
};

export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};
