import { useMutation } from "@tanstack/react-query";
import api from "../utils/Axios";
import { useLocation, useNavigate, type Location } from "react-router-dom";
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
    emailVerified?: boolean;
  };
}

interface RegisterResponse {
  success: boolean;
  requiresEmailVerification: boolean;
  email: string;
  message: string;
}

const AUTH_PAGES = ["/login", "/signup", "/verify-otp"];

/** The page a guard sent the shopper away from, if any, so sign-in can return them to it. */
export const getReturnPath = (location: Location): string | null => {
  const from = (location.state as { from?: Location } | null)?.from;
  if (!from?.pathname) return null;

  return `${from.pathname}${from.search ?? ""}${from.hash ?? ""}`;
};

export const useAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // After signing in on a dedicated auth page, go back to where the shopper was
  // headed (or home). Signing in from the quick-login popup happens on the page
  // they were already looking at, so they stay on it.
  const finishSignIn = () => {
    if (!AUTH_PAGES.includes(location.pathname)) return;
    navigate(getReturnPath(location) ?? "/dashboard", { replace: true });
  };
  const { login: storeLogin, setError } = useAuthStore();

  const loginMutation = useMutation({
    // The caller shows its own message for this one.
    meta: { silent: true },
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await api.post<AuthResponse>("/auth/login", data);
      return response.data;
    },
    onSuccess: (data) => {
      storeLogin(data.user, data.token);
      finishSignIn();
    },
    onError: (error: any, variables) => {
      if (error.response?.data?.requiresEmailVerification) {
        navigate("/verify-otp", {
          state: {
            email: error.response.data.email || variables.email,
            from: (location.state as { from?: Location } | null)?.from,
          },
        });
        return;
      }

      const message = getErrorMessage(error);
      setError(message);
      console.error("Login failed:", message);
    },
  });

  const registerMutation = useMutation({
    // The caller shows its own message for this one.
    meta: { silent: true },
    mutationFn: async (data: RegisterPayload) => {
      const response = await api.post<RegisterResponse>("/auth/register", data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      navigate("/verify-otp", {
        state: {
          email: data.email || variables.email,
          from: (location.state as { from?: Location } | null)?.from,
        },
      });
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
      // Send Google ID token to backend for verification
      // Security: The backend will verify this token with Google
      const response = await api.post<AuthResponse>("/auth/google", {
        token: credentialResponse.credential,
      });
      return response.data;
    },
    onSuccess: (data) => {
      // Store user data and token in auth store
      storeLogin(data.user, data.token);
      finishSignIn();
    },
    onError: (error: any) => {
      const message = getErrorMessage(error);
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

interface MessageResponse {
  success: boolean;
  message: string;
}

export const useForgotPassword = () => {
  const requestResetOtpMutation = useMutation({
    // The caller shows its own message for this one.
    meta: { silent: true },
    mutationFn: async (email: string) => {
      const response = await api.post<MessageResponse>("/auth/forgot-password", { email });
      return response.data;
    },
  });

  const verifyResetOtpMutation = useMutation({
    // The caller shows its own message for this one.
    meta: { silent: true },
    mutationFn: async (data: { email: string; otp: string }) => {
      const response = await api.post<MessageResponse>("/auth/verify-reset-otp", data);
      return response.data;
    },
  });

  const resetPasswordMutation = useMutation({
    // The caller shows its own message for this one.
    meta: { silent: true },
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await api.post<MessageResponse>("/auth/reset-password", data);
      return response.data;
    },
  });

  return {
    requestResetOtp: requestResetOtpMutation.mutateAsync,
    isRequestingOtp: requestResetOtpMutation.isPending,
    requestOtpError: requestResetOtpMutation.error,
    verifyResetOtp: verifyResetOtpMutation.mutateAsync,
    isVerifyingOtp: verifyResetOtpMutation.isPending,
    verifyOtpError: verifyResetOtpMutation.error,
    resetPassword: resetPasswordMutation.mutateAsync,
    isResettingPassword: resetPasswordMutation.isPending,
    resetPasswordError: resetPasswordMutation.error,
  };
};
