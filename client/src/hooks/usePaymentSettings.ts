import { useQuery } from "@tanstack/react-query";
import api from "@/utils/Axios";

export interface PaymentSettings {
  whatsappNumber: string;
  easypaisaAccountNumber: string;
  easypaisaRedirectUrl: string;
  jazzcashAccountNumber: string;
  jazzcashRedirectUrl: string;
  bankAccountNumber: string;
  bankName: string;
  bankAccountTitle: string;
}

export const EMPTY_PAYMENT_SETTINGS: PaymentSettings = {
  whatsappNumber: "",
  easypaisaAccountNumber: "",
  easypaisaRedirectUrl: "",
  jazzcashAccountNumber: "",
  jazzcashRedirectUrl: "",
  bankAccountNumber: "",
  bankName: "",
  bankAccountTitle: "",
};

/** Where to send money and who to message, shared by checkout and the success page. */
export const usePaymentSettings = () => {
  const { data } = useQuery<PaymentSettings>({
    queryKey: ["payment-settings"],
    queryFn: async () => {
      const response = await api.get("/user/payment-settings");
      return { ...EMPTY_PAYMENT_SETTINGS, ...response.data.data };
    },
    staleTime: 5 * 60 * 1000,
    // The page still works without it; the account details just stay hidden.
    meta: { silent: true },
  });

  return { paymentSettings: data ?? EMPTY_PAYMENT_SETTINGS };
};
