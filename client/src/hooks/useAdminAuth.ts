import { useMutation } from "@tanstack/react-query";
import api from "../utils/Axios";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores";
import type { CredentialResponse } from "@react-oauth/google";
import { getErrorMessage } from "@/utils/apiError";

interface RegisterPayload {
  email: string;
  username: string;
  password: string;
  fullName: string;
  phone: string;
}

interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    phone?: string;
    image?: string;
    provider?: string;
    role?: string;
  };
}

export const useAdminAuth = () => {
  const navigate = useNavigate();
  const { login: storeLogin, setError } = useAuthStore();

  const loginMutation = useMutation({
    // The caller shows its own message for this one.
    meta: { silent: true },
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await api.post<AuthResponse>("/auth/admin-login", data);
      return response.data;
    },
    onSuccess: (data) => {
      storeLogin(data.user, data.token);
      navigate("/admin/dashboard");
    },
    onError: (error: any) => {
      const message = getErrorMessage(error);
      setError(message);
    },
  });

  const registerMutation = useMutation({
    // The caller shows its own message for this one.
    meta: { silent: true },
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
      const message = getErrorMessage(error);
      setError(message);
      console.error("Registration failed:", message);
    },
  });

  // Google OAuth mutation
  const googleAuthMutation = useMutation({
    // The caller shows its own message for this one.
    meta: { silent: true },
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
      const message = getErrorMessage(error);
      setError(message);
      console.error("Google authentication failed:", message);
    },
  });

  const readError = (error: unknown) => (error ? getErrorMessage(error) : null);

  return {
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    loginError: readError(loginMutation.error),
    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    registerError: readError(registerMutation.error),
    googleAuth: googleAuthMutation.mutate,
    isGoogleAuthing: googleAuthMutation.isPending,
    googleAuthError: readError(googleAuthMutation.error),
  };

};
