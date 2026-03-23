import { prisma } from '../../common/prisma';

export const paymentsRepository = {
  createWavePayment(orderId: string, amount: number, externalRef: string, providerData?: Record<string, unknown>) {
    return prisma.payment.create({
      data: {
        orderId,
        method: 'WAVE',
        status: 'INITIATED',
        amount,
        externalRef,
        providerData: providerData || undefined,
      },
      include: { order: true },
    });
  },

  findByExternalRef(externalRef: string) {
    return prisma.payment.findUnique({
      where: { externalRef },
      include: { order: true },
    });
  },

  findLatestOpenByOrder(orderId: string) {
    return prisma.payment.findFirst({
      where: {
        orderId,
        status: { in: ['INITIATED', 'PENDING'] },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  updateByExternalRef(
    externalRef: string,
    data: {
      status: 'PENDING' | 'SUCCESS' | 'FAILED';
      transactionId?: string;
      failureReason?: string;
      providerData?: Record<string, unknown>;
      paidAt?: Date;
    }
  ) {
    return prisma.payment.update({
      where: { externalRef },
      data: {
        status: data.status,
        transactionId: data.transactionId,
        failureReason: data.failureReason,
        providerData: data.providerData,
        paidAt: data.paidAt,
      },
      include: { order: true },
    });
  },

  listByOrderRef(orderRef: string) {
    return prisma.payment.findMany({
      where: {
        order: {
          orderRef,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },
};
