import { prisma } from '../../common/prisma';
import { env } from '../../common/env';

export const notificationsService = {
  async logOrderCreated(orderRef: string, customerPhone: string): Promise<void> {
    const recipient = env.ADMIN_WHATSAPP_NUMBER || undefined;
    const message = `Nouvelle commande ${orderRef} (${customerPhone}).`;

    await prisma.notificationLog.create({
      data: {
        channel: 'WHATSAPP',
        type: 'ORDER_CREATED',
        recipient,
        status: recipient ? 'QUEUED' : 'SKIPPED',
        message,
        meta: {
          orderRef,
          customerPhone,
          provider: 'WHATSAPP_BUSINESS',
        },
      },
    });
  },

  async logPaymentSucceeded(orderRef: string, externalRef: string, transactionId?: string): Promise<void> {
    const recipient = env.ADMIN_WHATSAPP_NUMBER || undefined;

    await prisma.notificationLog.create({
      data: {
        channel: 'WHATSAPP',
        type: 'PAYMENT_SUCCEEDED',
        recipient,
        status: recipient ? 'QUEUED' : 'SKIPPED',
        message: `Paiement confirme pour ${orderRef}.`,
        meta: {
          orderRef,
          externalRef,
          transactionId: transactionId || null,
        },
      },
    });
  },

  listRecent(limit = 20) {
    const safeLimit = Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 200) : 20;
    return prisma.notificationLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: safeLimit,
    });
  },
};
