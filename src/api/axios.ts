import { cookieUtils } from '@/utils/cookies';
import axios, { AxiosInstance } from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://poc-rest-api-h2c9bkayf6akacae.centralindia-01.azurewebsites.net';
export const UNAUTHORIZED_EVENT = 'app:unauthorized';
const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 30000;

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = cookieUtils.getCookie('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      cookieUtils.deleteCookie('access_token');
      localStorage.removeItem('user');
      window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
    }
    return Promise.reject(error);
  }
);

export default apiClient;
