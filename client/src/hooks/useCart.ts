import {
  useQuery,
  useMutation,
  useQueryClient,
  type MutateOptions,
} from "@tanstack/react-query";
import api from "@/utils/Axios";
import { useAuthStore } from "@/stores/authStore";
import { isValidPakistaniMobile } from "@/utils/phone";

type AddToCartVariables = {
  productId: string;
  quantity?: number;
};

type AddToCartOptions = MutateOptions<any, any, AddToCartVariables, unknown>;

const isPhoneRequiredError = (err: any) =>
  err.response?.status === 428 && err.response?.data?.code === "PHONE_REQUIRED";

export const useCart = () => {
  const queryClient = useQueryClient();
  const {
    isAuthenticated,
    user,
    setQuickAuthModalOpen,
    requestPhoneForCart,
  } = useAuthStore();

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
    enabled: isAuthenticated,
  });

  // Add to cart
  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity }: AddToCartVariables) => {
      if (!isAuthenticated) {
        setQuickAuthModalOpen(true);
        throw new Error("Auth required");
      }
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
      if (err.message !== "Auth required" && !isPhoneRequiredError(err)) {
        console.error("Add to cart error:", err.response?.data || err.message);
      }
    },
  });

  const addToCart = (
    variables: AddToCartVariables,
    options?: AddToCartOptions,
  ) => {
    if (!isAuthenticated) {
      setQuickAuthModalOpen(true);
      return;
    }

    const retry = () => addToCartMutation.mutate(variables, options);

    if (!isValidPakistaniMobile(user?.phone)) {
      requestPhoneForCart({ ...variables, retry });
      return;
    }

    addToCartMutation.mutate(variables, {
      ...options,
      onError: (error, mutationVariables, context) => {
        if (isPhoneRequiredError(error)) {
          requestPhoneForCart({
            ...mutationVariables,
            retry: () => addToCartMutation.mutate(mutationVariables, options),
          });
          return;
        }

        options?.onError?.(error, mutationVariables, context, undefined as any);
      },
    });
  };

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
    onMutate: async ({ productId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });

      const previousCart = queryClient.getQueryData<any>(["cart"]);

      queryClient.setQueryData<any>(["cart"], (currentCart: any) => {
        if (!currentCart?.items) return currentCart;

        return {
          ...currentCart,
          items: currentCart.items.map((item: any) =>
            item.product?._id === productId
              ? { ...item, quantity }
              : item,
          ),
        };
      });

      return { previousCart };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(["cart"], context.previousCart);
      }
    },
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(["cart"], updatedCart);
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
    addToCart,
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
