import { prisma } from '../../common/prisma';
import { HttpError } from '../../common/errors';
import { notificationsService } from '../notifications/notifications.service';
import { receiptsService } from '../receipts/receipts.service';
import { paymentsRepository } from './payments.repository';
import type { WaveCheckoutInput, WaveWebhookInput } from './payments.types';

function buildExternalRef(orderRef: string): string {
  const nonce = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `WAVE-${orderRef}-${Date.now()}-${nonce}`;
}

function buildCheckoutUrl(externalRef: string): string {
  return `https://pay.wave.com/mock-checkout?ref=${encodeURIComponent(externalRef)}`;
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
      return {
        payment: existing,
        checkoutUrl: buildCheckoutUrl(existing.externalRef),
        orderRef: order.orderRef,
      };
    }

    const externalRef = buildExternalRef(order.orderRef);
    const payment = await paymentsRepository.createWavePayment(order.id, order.total, externalRef, {
      customerPhone: input.customerPhone || null,
      orderRef: order.orderRef,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { paymentMethod: 'WAVE' },
    });

    return {
      payment,
      checkoutUrl: buildCheckoutUrl(payment.externalRef),
      orderRef: order.orderRef,
    };
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
