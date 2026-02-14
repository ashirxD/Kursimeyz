import { useMutation } from '@tanstack/react-query';
import api from '../utils/Axios';
import { useNavigate } from 'react-router-dom';

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
    }
}

export const useAuth = () => {
    const navigate = useNavigate();

    const registerMutation = useMutation({
        mutationFn: async (data: RegisterPayload) => {
            const response = await api.post<RegisterResponse>('/auth/register', data);
            return response.data;
        },
        onSuccess: (data) => {
            localStorage.setItem('token', data.token); // Store token
            // alert('Registration successful!'); // simple feedback
            navigate('/dashboard'); // Redirect to dashboard (or wherever)
        },
        onError: (error: any) => {
            console.error('Registration failed:', error.response?.data?.message || error.message);
            // You might want to expose this error state to the UI
        }
    });

    return {
        register: registerMutation.mutate,
        isLoading: registerMutation.isPending,
        error: registerMutation.error,
        originalMutation: registerMutation // Exposing full mutation object if needed
    };
};
