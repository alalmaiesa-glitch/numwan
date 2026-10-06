export type NumwanPaymentStatus =
  | "PENDING"
  | "AWAITING_PAYMENT"
  | "PAID"
  | "FAILED"
  | "REFUNDED"
  | "CANCELED";

export type CreateCheckoutInput = {
  orderId: string;
  orderCode: string;
  amountSar: number;
  buyerEmail: string;
  buyerName: string;
  buyerPhone: string;
  successUrl: string;
  cancelUrl: string;
};

export type CreateCheckoutResult = {
  provider: string;
  providerCheckoutId: string;
  checkoutUrl: string;
};

export type VerifiedPaymentEvent = {
  provider: string;
  providerPaymentId: string;
  providerReference?: string;
  orderCode: string;
  status: Extract<NumwanPaymentStatus,"PENDING"|"PAID"|"FAILED"|"REFUNDED"|"CANCELED">;
  amountSar: number;
  occurredAt: string;
};

export interface NumwanPaymentProvider {
  createCheckout(input:CreateCheckoutInput):Promise<CreateCheckoutResult>;
  verifyWebhook(request:Request):Promise<VerifiedPaymentEvent>;
}
