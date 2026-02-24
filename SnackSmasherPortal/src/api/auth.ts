import axiosInstance from './axiosConfig';

export interface LoginDto {
  username: string;
  password: string;
}

export interface RegisterDto {
  username: string;
  password: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  id: number;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role: number;
  token: string;
}

export const authAPI = {
  login: async (data: LoginDto): Promise<AuthResponse> => {
    const response = await axiosInstance.post('/Auth/login', data);
    return response.data;
  },

  register: async (data: RegisterDto): Promise<AuthResponse> => {
    const response = await axiosInstance.post('/Auth/register', data);
    return response.data;
  },
};