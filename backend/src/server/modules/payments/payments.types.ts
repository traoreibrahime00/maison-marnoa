export const WEBHOOK_PAYMENT_STATUSES = ['SUCCESS', 'FAILED', 'PENDING'] as const;

export type WebhookPaymentStatus = (typeof WEBHOOK_PAYMENT_STATUSES)[number];

export interface WaveCheckoutInput {
  orderRef: string;
  customerPhone?: string;
}

export interface WaveWebhookInput {
  externalRef: string;
  status: WebhookPaymentStatus;
  transactionId?: string;
  failureReason?: string;
  providerData?: Record<string, unknown>;
}
