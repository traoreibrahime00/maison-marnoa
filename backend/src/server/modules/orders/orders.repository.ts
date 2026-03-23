import { Prisma } from '@prisma/client';
import { prisma } from '../../common/prisma';
import type { AdminOrdersFilterInput, OrderCreateInput, OrderStatus } from './orders.types';
import { InsufficientStockError } from './orders.types';

export const ordersRepository = {
  listByContact(phone: string, email: string, limit: number) {
    const where: Prisma.OrderWhereInput = {
      OR: [
        phone ? { customerPhone: phone } : undefined,
        email ? { customerEmail: email } : undefined,
      ].filter(Boolean) as Prisma.OrderWhereInput[],
    };

    return prisma.order.findMany({
      where,
      include: { items: true, payments: true, receipt: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  },

  create(data: OrderCreateInput) {
    return prisma.$transaction(async tx => {
      // Check stock availability at creation (but don't decrement yet — decrement happens on CONFIRMED)
      for (const line of data.lines) {
        if (!line.productId) continue;
        const product = await tx.product.findUnique({
          where: { id: line.productId },
          select: { id: true, stock: true },
        });
        if (!product) continue;
        if (product.stock !== null && product.stock < line.quantity) {
          throw new InsufficientStockError(product.id, line.quantity, product.stock);
        }
      }

      return tx.order.create({
        data: {
          orderRef: data.orderId,
          status: 'PENDING_WHATSAPP',
          paymentMethod: 'WHATSAPP',
          subtotal: data.subtotal,
          deliveryLabel: data.deliveryLabel,
          deliveryPrice: data.deliveryPrice,
          giftWrapFee: data.giftWrapFee,
          total: data.total,
          customerName: data.customer.name,
          customerPhone: data.customer.phone,
          customerEmail: data.customer.email || null,
          customerAddress: data.customer.address,
          note: data.note || null,
          items: {
            create: data.lines.map(line => ({
              productId: line.productId || null,
              productName: line.name,
              collection: line.collection,
              quantity: line.quantity,
              unitPrice: line.price,
              size: typeof line.size === 'undefined' ? null : line.size,
              colorLabel: line.colorLabel || null,
              lineTotal: line.quantity * line.price,
            })),
          },
        },
        include: { items: true, payments: true, receipt: true },
      });
    });
  },

  findByOrderRef(orderRef: string) {
    return prisma.order.findUnique({
      where: { orderRef },
      include: { items: true, payments: true, receipt: true },
    });
  },

  findByRefAndEmail(orderRef: string, email: string) {
    return prisma.order.findFirst({
      where: {
        orderRef,
        customerEmail: { equals: email, mode: 'insensitive' },
      },
      include: { items: true, payments: true, receipt: true },
    });
  },

  findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: { items: true, payments: true, receipt: true },
    });
  },

  listForAdmin(filter: AdminOrdersFilterInput) {
    const where: Prisma.OrderWhereInput = {
      status: filter.status,
      orderRef: filter.orderRef ? { contains: filter.orderRef, mode: 'insensitive' } : undefined,
    };

    return prisma.order.findMany({
      where,
      include: { items: true, payments: true, receipt: true },
      orderBy: { createdAt: 'desc' },
      take: filter.limit,
      skip: filter.offset,
    });
  },

  updateStatus(orderRef: string, status: OrderStatus) {
    return prisma.$transaction(async tx => {
      // Decrement stock when admin confirms the order
      if (status === 'CONFIRMED') {
        const order = await tx.order.findUnique({
          where: { orderRef },
          include: { items: true },
        });
        if (order) {
          for (const item of order.items) {
            if (!item.productId) continue;
            const product = await tx.product.findUnique({
              where: { id: item.productId },
              select: { id: true, stock: true },
            });
            if (!product) continue;
            if (product.stock !== null && product.stock < item.quantity) {
              throw new InsufficientStockError(product.id, item.quantity, product.stock);
            }
            if (product.stock !== null) {
              await tx.product.update({
                where: { id: product.id },
                data: { stock: { decrement: item.quantity } },
              });
            }
          }
        }
      }

      return tx.order.update({
        where: { orderRef },
        data: { status },
        include: { items: true, payments: true, receipt: true },
      });
    });
  },
};
