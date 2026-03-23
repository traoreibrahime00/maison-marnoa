import { prisma } from '../../common/prisma';
import { HttpError } from '../../common/errors';
import { env } from '../../common/env';
import { notificationsService } from '../notifications/notifications.service';
import { receiptsService } from '../receipts/receipts.service';
import { paymentsRepository } from './payments.repository';
import type { WaveCheckoutInput, WaveWebhookInput } from './payments.types';

function buildExternalRef(orderRef: string): string {
  const nonce = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `WAVE-${orderRef}-${Date.now()}-${nonce}`;
}

/**
 * Calls the real Wave Checkout Sessions API.
 * Docs: https://docs.wave.com/business/checkout
 *
 * Returns the wave_launch_url to redirect the customer to.
 * Falls back to a mock URL in development when WAVE_API_KEY is not set.
 */
async function createWaveCheckoutSession(params: {
  amount: number;
  currency: string;
  clientReference: string;
  customerPhone?: string;
}): Promise<string> {
  // Priority 1: static merchant link (simplest — no API key needed)
  if (env.WAVE_MERCHANT_URL) {
    const url = new URL(env.WAVE_MERCHANT_URL);
    url.searchParams.set('amount', String(Math.round(params.amount)));
    return url.toString();
  }

  // Priority 2: Wave Checkout Sessions API (advanced — needs WAVE_API_KEY)
  if (env.WAVE_API_KEY) {
    const body = {
      amount: String(Math.round(params.amount)),
      currency: params.currency,
      error_url: env.WAVE_ERROR_URL,
      success_url: `${env.WAVE_SUCCESS_URL}?ref=${params.clientReference}`,
      client_reference: params.clientReference,
      ...(params.customerPhone ? { restrict_payer_mobile: params.customerPhone } : {}),
    };

    const res = await fetch('https://api.wave.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.WAVE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text().catch(() => res.statusText);
      throw new HttpError(502, `Wave API error: ${err}`);
    }

    const data = await res.json() as { wave_launch_url: string };
    if (!data.wave_launch_url) throw new HttpError(502, 'Wave did not return a launch URL');
    return data.wave_launch_url;
  }

  // Dev fallback
  return `https://pay.wave.com/m/mock_checkout?ref=${encodeURIComponent(params.clientReference)}&amount=${params.amount}`;
}

function mapWebhookStatus(status: WaveWebhookInput['status']): 'PENDING' | 'SUCCESS' | 'FAILED' {
  if (status === 'SUCCESS') return 'SUCCESS';
  if (status === 'FAILED') return 'FAILED';
  return 'PENDING';
}

export const paymentsService = {
  async createWaveCheckout(input: WaveCheckoutInput) {
    const order = await prisma.order.findUnique({
      where: { orderRef: input.orderRef },
      include: { receipt: true },
    });

    if (!order) {
      throw new HttpError(404, 'Order not found');
    }

    if (!order.receipt) {
      await receiptsService.ensureForOrder(order);
    }

    const existing = await paymentsRepository.findLatestOpenByOrder(order.id);
    if (existing) {
      // Re-create session for existing payment (Wave sessions expire)
      const checkoutUrl = await createWaveCheckoutSession({
        amount: Math.round(order.total),
        currency: 'XOF',
        clientReference: existing.externalRef,
        customerPhone: input.customerPhone,
      });
      return { payment: existing, checkoutUrl, orderRef: order.orderRef };
    }

    const externalRef = buildExternalRef(order.orderRef);

    // Create the real Wave checkout session
    const checkoutUrl = await createWaveCheckoutSession({
      amount: Math.round(order.total),
      currency: 'XOF',
      clientReference: externalRef,
      customerPhone: input.customerPhone,
    });

    const payment = await paymentsRepository.createWavePayment(order.id, order.total, externalRef, {
      customerPhone: input.customerPhone || null,
      orderRef: order.orderRef,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { paymentMethod: 'WAVE' },
    });

    return { payment, checkoutUrl, orderRef: order.orderRef };
  },

  async processWaveWebhook(input: WaveWebhookInput) {
    const payment = await paymentsRepository.findByExternalRef(input.externalRef);
    if (!payment) {
      throw new HttpError(404, 'Payment not found');
    }

    const status = mapWebhookStatus(input.status);
    const paidAt = status === 'SUCCESS' ? new Date() : undefined;

    const updated = await paymentsRepository.updateByExternalRef(input.externalRef, {
      status,
      transactionId: input.transactionId,
      failureReason: input.failureReason,
      providerData: input.providerData,
      paidAt,
    });

    if (status === 'SUCCESS') {
      await prisma.order.update({
        where: { id: payment.orderId },
        data: {
          status: 'PAID',
          paymentMethod: 'WAVE',
        },
      });

      await receiptsService.markPaid(payment.orderId);
      await notificationsService.logPaymentSucceeded(payment.order.orderRef, payment.externalRef, input.transactionId);
    }

    return updated;
  },

  listOrderPayments(orderRef: string) {
    return paymentsRepository.listByOrderRef(orderRef);
  },
};
