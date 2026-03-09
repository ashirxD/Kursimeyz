import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/utils/Axios";
import { useNavigate } from "react-router-dom";

export interface OrderItem {
  product: string;
  quantity: number;
  price: number;
}

export interface ShippingAddress {
  street: string;
  city: string;
  zipCode: string;
  phone: string;
}

export interface OrderPayload {
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: "Cash" | "Card";
  itemsPrice: number;
  shippingPrice: number;
  totalPrice: number;
}

export const useOrder = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: OrderPayload) => {
      const response = await api.post("/order", orderData);
      return response.data.data;
    },
    onSuccess: () => {
      // Invalidate cart since it gets cleared on the server
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      navigate("/order-success");
    },
    onError: (err: any) => {
      console.error("Order creation error:", err.response?.data || err.message);
    },
  });

  const myOrdersQuery = useQuery({
    queryKey: ["orders", "me"],
    queryFn: async () => {
      const response = await api.get("/order/myorders");
      return response.data.data;
    },
  });

  return {
    createOrder: createOrderMutation.mutate,
    isCreating: createOrderMutation.isPending,
    createError: createOrderMutation.error,
    myOrders: myOrdersQuery.data || [],
    ordersLoading: myOrdersQuery.isLoading,
    ordersError: myOrdersQuery.error,
  };
};
