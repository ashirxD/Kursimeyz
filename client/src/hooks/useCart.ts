import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/utils/Axios";

export const useCart = () => {
  const queryClient = useQueryClient();

  // Fetch cart
  const {
    data: cart,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const response = await api.get("/cart");
      return response.data.data;
    },
    // Only enable if user is logged in
    enabled: !!localStorage.getItem("token"),
  });

  // Add to cart
  const addToCartMutation = useMutation({
    mutationFn: async ({
      productId,
      quantity,
    }: {
      productId: string;
      quantity?: number;
    }) => {
      console.log("Sending Add to Cart request:", { productId, quantity });
      const response = await api.post("/cart/add", { productId, quantity });
      console.log("Add to Cart response:", response.data);
      return response.data.data;
    },
    onSuccess: () => {
      // Invalidate both cart and count related queries
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (err: any) => {
      console.error("Add to cart error:", err.response?.data || err.message);
    },
  });

  // Update quantity
  const updateQuantityMutation = useMutation({
    mutationFn: async ({
      productId,
      quantity,
    }: {
      productId: string;
      quantity: number;
    }) => {
      const response = await api.put("/cart/update", { productId, quantity });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  // Remove from cart
  const removeFromCartMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await api.delete(`/cart/remove/${productId}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  // Clear cart
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const response = await api.delete("/cart/clear");
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  return {
    cart,
    isLoading,
    error,
    addToCart: addToCartMutation.mutate,
    isAdding: addToCartMutation.isPending,
    updateQuantity: updateQuantityMutation.mutate,
    removeFromCart: removeFromCartMutation.mutate,
    clearCart: clearCartMutation.mutate,
    itemsCount: cart?.items?.length || 0,
    totalItems:
      cart?.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) ||
      0,
  };
};
