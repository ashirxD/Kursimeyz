import { useQuery } from "@tanstack/react-query";
import api from "@/utils/Axios";

export interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  color: string;
  category: string;
}

export const useProduct = (id?: string) => {
  // Fetch grouped products for Top Picks
  const groupedProductsQuery = useQuery({
    queryKey: ["products", "grouped"],
    queryFn: async () => {
      const response = await api.get("/products/grouped");
      return response.data;
    },
    enabled: !id, // Only fetch if we're not on a detail page
  });

  // Fetch single product by ID
  const productDetailQuery = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const response = await api.get(`/products/${id}`);
      return response.data;
    },
    enabled: !!id, // Only fetch if ID is provided
  });

  return {
    groupedProducts: groupedProductsQuery.data || {},
    isGroupedLoading: groupedProductsQuery.isLoading,
    product: productDetailQuery.data as Product | undefined,
    isProductLoading: productDetailQuery.isLoading,
    productError: productDetailQuery.error,
  };
};
