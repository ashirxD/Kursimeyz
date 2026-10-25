import { useQuery } from "@tanstack/react-query";
import api from "@/utils/Axios";

export interface PublicReview {
  _id: string;
  rating: number;
  comment: string;
  /** First name and last initial only, e.g. "Ayesha K.". */
  name: string;
  createdAt: string;
}

/** What buyers wrote about a product. Public, so it works before signing in. */
export const useProductReviews = (productId?: string) => {
  const { data = [], isLoading } = useQuery<PublicReview[]>({
    queryKey: ["product", productId, "reviews"],
    queryFn: async () => {
      const response = await api.get(`/reviews/product/${productId}`);
      return response.data.data;
    },
    enabled: Boolean(productId),
    staleTime: 60 * 1000,
    // Reviews are a bonus; the page is fine without them.
    meta: { silent: true },
  });

  return { reviews: data, isReviewsLoading: isLoading };
};
