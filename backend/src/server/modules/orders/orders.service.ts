import { Prisma } from '@prisma/client';
import { ordersRepository } from './orders.repository';
import type { AdminOrdersFilterInput, OrderCreateInput, OrderStatus } from './orders.types';
import { receiptsService } from '../receipts/receipts.service';
import { notificationsService } from '../notifications/notifications.service';

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
      await notificationsService.logOrderCreated(order.orderRef, order.customerPhone);
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

  updateOrderStatus(orderRef: string, status: OrderStatus) {
    return ordersRepository.updateStatus(orderRef, status);
  },
};
