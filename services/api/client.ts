/**
 * Axios API Client with interceptors
 * 
 * Handles:
 * - Base URL configuration from environment
 * - Authorization header attachment (Requirement 16.4)
 * - 401 Unauthorized handling - clears tokens and triggers sign-out (Requirement 16.1)
 * - Network error handling with retry option (Requirement 16.2)
 * - Server error handling with user-friendly messages (Requirement 16.3)
 * - Token refresh on expiration (Requirement 1.7)
 */

import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import * as SecureStore from 'expo-secure-store';
import { config } from '../../config';

// Storage keys
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// API base URL from centralized config
const API_BASE_URL = config.api.baseUrl;

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

// Custom error types for better error handling
export interface ApiError {
  message: string;
  status?: number;
  isNetworkError: boolean;
  isAuthError: boolean;
  isServerError: boolean;
  originalError?: AxiosError;
}

// Event emitter for auth state changes (to be consumed by auth store)
type AuthEventListener = () => void;
const authEventListeners: AuthEventListener[] = [];

export const onAuthError = (listener: AuthEventListener): (() => void) => {
  authEventListeners.push(listener);
  return () => {
    const index = authEventListeners.indexOf(listener);
    if (index > -1) {
      authEventListeners.splice(index, 1);
    }
  };
};

const notifyAuthError = (): void => {
  authEventListeners.forEach(listener => listener());
};

// Token management functions
export const getStoredToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const storeToken = async (token: string): Promise<void> => {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
};

export const clearToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  } catch {
    // Ignore errors during cleanup
  }
};

export const getRefreshToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
};

export const storeRefreshToken = async (token: string): Promise<void> => {
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
};

/**
 * Refresh the access token using the refresh token
 */
const refreshAccessToken = async (): Promise<boolean> => {
  try {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
      return false;
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    
    if (data.accessToken) {
      await storeToken(data.accessToken);
    }
    if (data.refreshToken) {
      await storeRefreshToken(data.refreshToken);
    }

    return true;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
};

// Create Axios instance
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor - attach Authorization header
  client.interceptors.request.use(
    async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
      const token = await getStoredToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor - handle errors
  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError): Promise<never> => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
      
      // Handle 401 Unauthorized - try to refresh token first
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        // Use a single refresh promise to prevent multiple simultaneous refreshes
        if (!isRefreshing) {
          isRefreshing = true;
          refreshPromise = refreshAccessToken();
        }
        
        try {
          const refreshed = await refreshPromise;
          isRefreshing = false;
          refreshPromise = null;
          
          if (refreshed) {
            // Retry the original request with new token
            const newToken = await getStoredToken();
            if (newToken && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return client(originalRequest);
          }
        } catch {
          isRefreshing = false;
          refreshPromise = null;
        }
        
        // Refresh failed - clear tokens and notify listeners
        await clearToken();
        notifyAuthError();
      }

      const apiError = createApiError(error);
      return Promise.reject(apiError);
    }
  );

  return client;
};

// Create user-friendly error from Axios error
const createApiError = (error: AxiosError): ApiError => {
  // Network error (no response)
  if (!error.response) {
    return {
      message: 'Unable to connect to server. Please check your internet connection.',
      isNetworkError: true,
      isAuthError: false,
      isServerError: false,
      originalError: error,
    };
  }

  const status = error.response.status;

  // 401 Unauthorized
  if (status === 401) {
    return {
      message: 'Your session has expired. Please sign in again.',
      status,
      isNetworkError: false,
      isAuthError: true,
      isServerError: false,
      originalError: error,
    };
  }

  // 403 Forbidden
  if (status === 403) {
    return {
      message: 'You do not have permission to perform this action.',
      status,
      isNetworkError: false,
      isAuthError: false,
      isServerError: false,
      originalError: error,
    };
  }

  // 404 Not Found
  if (status === 404) {
    return {
      message: 'The requested resource was not found.',
      status,
      isNetworkError: false,
      isAuthError: false,
      isServerError: false,
      originalError: error,
    };
  }

  // 422 Validation Error
  if (status === 422) {
    const data = error.response.data as { message?: string };
    return {
      message: data?.message || 'Please check your input and try again.',
      status,
      isNetworkError: false,
      isAuthError: false,
      isServerError: false,
      originalError: error,
    };
  }

  // 5xx Server errors
  if (status >= 500) {
    return {
      message: 'Something went wrong on our end. Please try again later.',
      status,
      isNetworkError: false,
      isAuthError: false,
      isServerError: true,
      originalError: error,
    };
  }

  // Other errors
  const data = error.response.data as { message?: string };
  return {
    message: data?.message || 'An unexpected error occurred. Please try again.',
    status,
    isNetworkError: false,
    isAuthError: false,
    isServerError: false,
    originalError: error,
  };
};

// Export the API client instance
export const apiClient = createApiClient();

// Typed request methods for convenience
export const api = {
  get: <T>(url: string, config?: Parameters<typeof apiClient.get>[1]): Promise<T> =>
    apiClient.get<T>(url, config).then(res => res.data),

  post: <T>(url: string, data?: unknown, config?: Parameters<typeof apiClient.post>[2]): Promise<T> =>
    apiClient.post<T>(url, data, config).then(res => res.data),

  put: <T>(url: string, data?: unknown, config?: Parameters<typeof apiClient.put>[2]): Promise<T> =>
    apiClient.put<T>(url, data, config).then(res => res.data),

  patch: <T>(url: string, data?: unknown, config?: Parameters<typeof apiClient.patch>[2]): Promise<T> =>
    apiClient.patch<T>(url, data, config).then(res => res.data),

  delete: <T>(url: string, config?: Parameters<typeof apiClient.delete>[1]): Promise<T> =>
    apiClient.delete<T>(url, config).then(res => res.data),
};

// Helper to check if an error is an ApiError
export const isApiError = (error: unknown): error is ApiError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'isNetworkError' in error &&
    'isAuthError' in error &&
    'isServerError' in error
  );
};

export default api;
