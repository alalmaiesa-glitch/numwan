import "server-only";
import type { NumwanPaymentProvider } from "./types";
import { edfaPayProvider } from "./edfapay";

const unconfiguredProvider:NumwanPaymentProvider={
  async createCheckout(){
    throw new Error("PAYMENT_PROVIDER_NOT_CONFIGURED");
  },
  async verifyWebhook(){
    throw new Error("PAYMENT_PROVIDER_NOT_CONFIGURED");
  }
};

export function getPaymentProvider():NumwanPaymentProvider{
  const provider=(process.env.PAYMENT_PROVIDER||"unconfigured").trim().toLowerCase();

  if(provider==="unconfigured") return unconfiguredProvider;
  if(provider==="edfapay") return edfaPayProvider;

  throw new Error("PAYMENT_PROVIDER_ADAPTER_NOT_IMPLEMENTED");
}
