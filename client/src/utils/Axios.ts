import axios, { type InternalAxiosRequestConfig, AxiosError, type AxiosResponse } from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', // Default to local backend
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add JWT token to headers
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');  
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle global errors (like 401 Unauthorized)
api.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
        if (error.response && error.response.status === 401) {
            // Optional: Auto-logout logic here
            // localStorage.removeItem('token');
            // window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

export default api;
