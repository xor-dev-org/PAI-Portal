import { cookieUtils } from '@/utils/cookies';
import apiClient from '../axios';
import { AuthResponse, LoginRequest, SignupRequest } from '@/models';

export const authService = {
  // MSAL Login for Procurement Specialist and Admin
  msalLogin: async (email: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/msal/login', { email });
    if (response.data.access_token) {
      cookieUtils.setCookie('access_token', response.data.access_token, 7);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Supplier Login
  supplierLogin: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/supplier/login', credentials);
    if (response.data.access_token) {
      cookieUtils.setCookie('access_token', response.data.access_token, 7);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Supplier Signup
  supplierSignup: async (data: SignupRequest): Promise<AuthResponse> => {
    // Backend signup creates the supplier user; login still returns the token payload.
    await apiClient.post('/auth/supplier/signup', data);

    const loginResponse = await apiClient.post<AuthResponse>('/auth/supplier/login', {
      email: data.email,
      password: data.password,
    });

    if (loginResponse.data.access_token) {
      cookieUtils.setCookie('access_token', loginResponse.data.access_token, 7);
      localStorage.setItem('user', JSON.stringify(loginResponse.data.user));
    }

    return loginResponse.data;
  },

  // Logout
  logout: () => {
    cookieUtils.deleteCookie('access_token');
    localStorage.removeItem('user');
  },

  // Get current user from storage
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Get token
  getToken: () => {
    return cookieUtils.getCookie('access_token');
  },
};
