import { useMutation } from "@tanstack/react-query";
import api from "../utils/Axios";
import { useNavigate } from "react-router-dom";

interface RegisterPayload {
  email: string;
  username: string;
  password: string;
  fullName: string;
}

interface RegisterResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

export const useAuth = () => {
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await api.post<RegisterResponse>("/auth/login", data);
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    },
    onError: (error: any) => {
      console.error(
        "Login failed:",
        error.response?.data?.message || error.message,
      );
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterPayload) => {
      const response = await api.post<RegisterResponse>("/auth/register", data);
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    },
    onError: (error: any) => {
      console.error(
        "Registration failed:",
        error.response?.data?.message || error.message,
      );
    },
  });

  return {
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,
  };
};
