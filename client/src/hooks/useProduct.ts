import { useQuery } from "@tanstack/react-query";
import api from "@/utils/Axios";
import type { ProductDimensions } from "@/utils/productPricing";
import type { ProductFinish } from "@/utils/productFinish";
import type { ImageDisplay } from "@/utils/productImageDisplay";

export interface Product {
  _id: string;
  name: string;
  price: number;
  discountPrice?: number | null;
  image: string;
  images?: string[];
  /** How each gallery photo is framed on the card. See utils/productImageDisplay.ts. */
  imageDisplay?: ImageDisplay[];
  /** Whether the card swaps to the second photo on hover. Absent means yes. */
  hoverPhoto?: boolean;
  description: string;
  dimensions?: ProductDimensions | null;
  finish?: ProductFinish | null;
  /** Legacy single colour, mirroring finish.fabric.color.hex. */
  color?: string;
  category: string;
  /** Category display name within the product type, e.g. "Slim". */
  subCategory?: string | null;
  subCategorySlug?: string | null;
  /** On the admin-curated Top Picks shelf on the storefront home. */
  isTopPick?: boolean;
  averageRating?: number;
  ratingCount?: number;
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
