import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true, // For Laravel Sanctum CSRF protection
});

// Request interceptor - Add auth token if available
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Get token from localStorage if available
        if (globalThis.window !== undefined) {
            const token = localStorage.getItem('auth_token');
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response) {
            // Server responded with error status
            const status = error.response.status;

            switch (status) {
                case 401: {
                    // Unauthorized - clear token and redirect to login
                    if (globalThis.window !== undefined) {
                        localStorage.removeItem('auth_token');
                        // You can add redirect logic here if needed
                        // globalThis.window.location.href = '/auth/sign-in';
                    }
                    break;
                }
                case 403: {
                    console.error('Forbidden: You do not have permission to access this resource');
                    break;
                }
                case 404: {
                    console.error('Resource not found');
                    break;
                }
                case 422: {
                    console.error('Validation error:', error.response.data);
                    break;
                }
                default: {
                    if (status >= 500) {
                        console.error('Server error:', error.response.data);
                    }
                }
            }
        } else if (error.request) {
            // Request was made but no response received
            console.error('Network error: No response from server');
        } else {
            // Something else happened
            console.error('Error:', error.message);
        }

        return Promise.reject(error);
    }
);

export default apiClient;

// Helper function to set auth token
export const setAuthToken = (token: string | null) => {
    if (token) {
        localStorage.setItem('auth_token', token);
    } else {
        localStorage.removeItem('auth_token');
    }
};

// Helper function to get auth token
export const getAuthToken = (): string | null => {
    if (globalThis.window !== undefined) {
        return localStorage.getItem('auth_token');
    }
    return null;
};
