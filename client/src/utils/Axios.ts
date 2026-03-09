import axios, {
  type InternalAxiosRequestConfig,
  AxiosError,
  type AxiosResponse,
} from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    (import.meta.env.VITE_BASE_URL
      ? `${import.meta.env.VITE_BASE_URL}/api`
      : "http://localhost:5000/api"),
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add JWT token to headers
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    console.log(
      `Axios Request: ${config.method?.toUpperCase()} ${config.url}`,
      token ? "Token Found" : "No Token",
    );
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    console.error("Axios Request Error:", error);
    return Promise.reject(error);
  },
);

// Response interceptor to handle global errors (like 401 Unauthorized)
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`Axios Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error: AxiosError) => {
    console.error(
      `Axios Response Error: ${error.response?.status} ${error.config?.url}`,
      error.response?.data,
    );
    if (error.response && error.response.status === 401) {
      // Optional: Auto-logout logic here
    }
    return Promise.reject(error);
  },
);

export default api;
