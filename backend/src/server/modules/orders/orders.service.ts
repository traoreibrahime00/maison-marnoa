import { Prisma } from '@prisma/client';
import { ordersRepository } from './orders.repository';
import type { AdminOrdersFilterInput, OrderCreateInput, OrderStatus } from './orders.types';
import { receiptsService } from '../receipts/receipts.service';
import { notificationsService } from '../notifications/notifications.service';
import { HttpError } from '../../common/errors';
import { prisma } from '../../common/prisma';
import { auth } from '../../auth/auth';
import { promosRepository } from '../promos/promos.repository';

function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let pw = '';
  for (let i = 0; i < 8; i++) pw += chars[Math.floor(Math.random() * chars.length)];
  return pw;
}

export const ordersService = {
  listOrders(phone: string, email: string, limit: number) {
    return ordersRepository.listByContact(phone, email, limit);
  },

  listOrdersForAdmin(filter: AdminOrdersFilterInput) {
    return ordersRepository.listForAdmin(filter);
  },

  async createOrGetOrder(input: OrderCreateInput) {
    // Keep checkout idempotent: if the same orderRef is sent again, return the existing order.
    try {
      const order = await ordersRepository.create(input);
      await receiptsService.ensureForOrder(order);
      await notificationsService.logOrderCreated(order.orderRef, order.customerPhone, order.customerName, order.total);
      // Increment promo usage if a valid code was applied
      if (input.promoCode) {
        promosRepository.incrementUsed(input.promoCode).catch(() => {});
      }
      return order;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return ordersRepository.findByOrderRef(input.orderId);
      }
      throw error;
    }
  },

  findOrder(orderRef: string) {
    return ordersRepository.findByOrderRef(orderRef);
  },

  findOrderById(id: string) {
    return ordersRepository.findById(id);
  },

  async updateOrderStatus(orderRef: string, status: OrderStatus) {
    const order = await ordersRepository.updateStatus(orderRef, status);
    // Notification client (fire-and-forget)
    void notificationsService.logOrderStatusChanged(
      orderRef,
      status,
      order.customerPhone,
      order.customerName
    );
    return order;
  },

  lookupOrder(orderRef: string, email: string) {
    return ordersRepository.findByRefAndEmail(orderRef, email);
  },

  async guestCheckout(input: OrderCreateInput, isAuthenticated = false) {
    const email = input.customer.email;

    // 1. Create order (stock checked at creation, decremented on CONFIRMED)
    const order = await ordersService.createOrGetOrder(input);

    // 2. Auto-create account for guest with email (skip if already authenticated)
    let accountCreated = false;
    let tempPassword: string | undefined;

    if (email && input.customer.name && !isAuthenticated) {
      const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
      if (!existing) {
        tempPassword = generateTempPassword();
        try {
          await auth.api.signUpEmail({
            body: { name: input.customer.name, email, password: tempPassword },
            headers: new Headers(),
          });
          accountCreated = true;
        } catch {
          tempPassword = undefined;
        }
      }
    }

    return { order, accountCreated, tempPassword };
  },
};
