import { useMutation } from "@tanstack/react-query";
import api from "@/utils/Axios";
import { useAuthStore } from "@/stores";

export interface UpdateProfilePayload {
  currentPassword: string;
  newEmail?: string;
  newPassword?: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    username: string;
    email: string;
    role?: string;
    image?: string;
  };
}

export const useAdminProfile = () => {
  const { user, setUser } = useAuthStore();

  const updateProfileMutation = useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => {
      const response = await api.put<UpdateProfileResponse>("/user/admin/profile", payload);
      return response.data;
    },
    onSuccess: (data) => {
      if (user) {
        setUser({ ...user, ...data.user });
      } else {
        setUser(data.user);
      }
    },
  });

  return {
    updateProfile: updateProfileMutation.mutateAsync,
    isPending: updateProfileMutation.isPending,
    error: updateProfileMutation.error,
    isSuccess: updateProfileMutation.isSuccess,
    reset: updateProfileMutation.reset,
  };
};
