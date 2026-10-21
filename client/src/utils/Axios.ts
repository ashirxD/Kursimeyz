import axios, {
  type InternalAxiosRequestConfig,
  AxiosError,
  type AxiosResponse,
} from "axios";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "@/stores/toastStore";
import { isSessionError } from "@/utils/apiError";

// Ordinary requests that have not answered in this long almost never will; waiting
// forever just leaves a spinner. Uploads legitimately take longer.
const REQUEST_TIMEOUT_MS = 30_000;
const UPLOAD_TIMEOUT_MS = 120_000;

const api = axios.create({
  timeout: REQUEST_TIMEOUT_MS,
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
    // Let the browser set multipart boundary for file uploads
    if (config.data instanceof FormData) {
      config.timeout = UPLOAD_TIMEOUT_MS;
      const headers = config.headers as any;

      if (typeof headers.delete === "function") {
        headers.delete("Content-Type");
        headers.delete("content-type");
      } else {
        delete headers["Content-Type"];
        delete headers["content-type"];
      }
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
    // The session ended (or the token is no good) while someone was signed in: sign
    // them out cleanly and say why, rather than leaving every screen failing in turn.
    // Only when a token was actually sent — a wrong password on the login form is
    // also a 401, and is not this.
    const hadToken = Boolean(error.config?.headers?.Authorization);
    if (hadToken && isSessionError(error) && useAuthStore.getState().isAuthenticated) {
      useAuthStore.getState().logout();
      toast.info("Your session has expired. Please sign in again.");
    }

    return Promise.reject(error);
  },
);

export default api;
