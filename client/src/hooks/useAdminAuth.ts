import { useMutation } from "@tanstack/react-query";
import api from "../utils/Axios";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores";
import type { CredentialResponse } from "@react-oauth/google";

interface RegisterPayload {
  email: string;
  username: string;
  password: string;
  fullName: string;
}

interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    image?: string;
    provider?: string;
    role?: string;
  };
}

export const useAdminAuth = () => {
  const navigate = useNavigate();
  const { login: storeLogin, setError } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await api.post<AuthResponse>("/auth/login", data);
      return response.data;
    },
    onSuccess: (data) => {
      console.log("Admin login success:", data);
      storeLogin(data.user, data.token);
      
      // Check if user is admin and redirect accordingly
      if (data.user.role === 'admin') {
        console.log("User is admin, redirecting to admin dashboard");
        navigate("/admin/dashboard");
      } else {
        console.log("User is not admin, role:", data.user.role);
        setError("Access denied. Admin privileges required.");
        // Clear auth state since user is not admin
        localStorage.removeItem("token");
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message;
      setError(message);
      console.error("Admin login failed:", message);
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterPayload) => {
      const response = await api.post<AuthResponse>("/auth/register", data);
      return response.data;
    },
    onSuccess: (data) => {
      storeLogin(data.user, data.token);
      if (data.user.role === 'admin') {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message;
      setError(message);
      console.error("Registration failed:", message);
    },
  });

  // Google OAuth mutation
  const googleAuthMutation = useMutation({
    mutationFn: async (credentialResponse: CredentialResponse) => {
      const response = await api.post<AuthResponse>("/auth/google", {
        token: credentialResponse.credential,
      });
      return response.data;
    },
    onSuccess: (data) => {
      storeLogin(data.user, data.token);
      if (data.user.role === 'admin') {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message;
      setError(message);
      console.error("Google authentication failed:", message);
    },
  });

  return {
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,
    googleAuth: googleAuthMutation.mutate,
    isGoogleAuthing: googleAuthMutation.isPending,
    googleAuthError: googleAuthMutation.error,
  };
};
