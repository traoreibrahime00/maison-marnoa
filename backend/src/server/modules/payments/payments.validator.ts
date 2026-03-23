import { WEBHOOK_PAYMENT_STATUSES, type WaveCheckoutInput, type WaveWebhookInput } from './payments.types';

export function parseWaveCheckoutInput(raw: unknown): WaveCheckoutInput | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw as Record<string, unknown>;

  const orderRef = String(data.orderRef || '').trim();
  if (!orderRef) return null;

  const customerPhone = data.customerPhone ? String(data.customerPhone).trim() : undefined;

  return { orderRef, customerPhone };
}

export function parseWaveWebhookInput(raw: unknown): WaveWebhookInput | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw as Record<string, unknown>;

  const externalRef = String(data.externalRef || '').trim();
  const status = String(data.status || '').trim().toUpperCase();

  if (!externalRef || !WEBHOOK_PAYMENT_STATUSES.includes(status as any)) {
    return null;
  }

  return {
    externalRef,
    status: status as WaveWebhookInput['status'],
    transactionId: data.transactionId ? String(data.transactionId).trim() : undefined,
    failureReason: data.failureReason ? String(data.failureReason) : undefined,
    providerData: typeof data.providerData === 'object' && data.providerData ? (data.providerData as Record<string, unknown>) : undefined,
  };
}
