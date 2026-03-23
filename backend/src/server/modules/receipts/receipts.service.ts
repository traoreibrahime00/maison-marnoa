import { prisma } from '../../common/prisma';

interface ReceiptOrderRef {
  id: string;
  orderRef: string;
  total: number;
  customerEmail?: string | null;
}

function buildReceiptNumber(orderRef: string): string {
  const year = new Date().getFullYear();
  return `RC-${year}-${orderRef}`;
}

export const receiptsService = {
  async ensureForOrder(order: ReceiptOrderRef) {
    const existing = await prisma.receipt.findUnique({ where: { orderId: order.id } });
    if (existing) return existing;

    return prisma.receipt.create({
      data: {
        orderId: order.id,
        receiptNumber: buildReceiptNumber(order.orderRef),
        amount: order.total,
        customerEmail: order.customerEmail || null,
        downloadUrl: `/api/receipts/${order.orderRef}/html`,
      },
    });
  },

  async markPaid(orderId: string) {
    return prisma.receipt.updateMany({
      where: { orderId },
      data: { paidAt: new Date() },
    });
  },

  findByOrderRef(orderRef: string) {
    return prisma.receipt.findFirst({
      where: { order: { orderRef } },
      include: {
        order: {
          include: {
            items: true,
            payments: true,
          },
        },
      },
    });
  },

  async markSent(orderRef: string) {
    await prisma.receipt.updateMany({
      where: { order: { orderRef } },
      data: { sentAt: new Date() },
    });
  },
};
