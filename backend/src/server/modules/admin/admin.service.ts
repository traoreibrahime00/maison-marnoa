import { prisma } from '../../common/prisma';
import { analyticsService } from '../analytics/analytics.service';
import { notificationsService } from '../notifications/notifications.service';
import type { AdminOrdersFilterInput } from '../orders/orders.types';
import { ordersService } from '../orders/orders.service';

export const adminService = {
  listOrders(filter: AdminOrdersFilterInput) {
    return ordersService.listOrdersForAdmin(filter);
  },

  async listPayments(limit = 50) {
    const safeLimit = Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 200) : 50;
    return prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
      take: safeLimit,
      include: {
        order: {
          select: {
            orderRef: true,
            customerName: true,
            customerPhone: true,
            status: true,
          },
        },
      },
    });
  },

  async dashboard() {
    const [
      totalProducts,
      totalOrders,
      paidRevenue,
      statuses,
      lowStock,
      topProducts,
      recentOrders,
      payments,
      analytics,
      notifications,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        where: { status: 'PAID' },
        _sum: { total: true },
      }),
      prisma.order.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      prisma.product.findMany({
        where: {
          stock: { not: null, lte: 3 },
        },
        orderBy: { stock: 'asc' },
        take: 20,
      }),
      prisma.orderItem.groupBy({
        by: ['productId', 'productName'],
        where: {
          order: { status: 'PAID' },
        },
        _sum: {
          quantity: true,
          lineTotal: true,
        },
        orderBy: {
          _sum: {
            quantity: 'desc',
          },
        },
        take: 10,
      }),
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          items: true,
          payments: true,
          receipt: true,
        },
      }),
      prisma.payment.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          order: {
            select: {
              orderRef: true,
              customerName: true,
              customerPhone: true,
            },
          },
        },
      }),
      analyticsService.summary(30),
      notificationsService.listRecent(20),
    ]);

    const statusMap = statuses.reduce<Record<string, number>>((acc, row) => {
      acc[row.status] = row._count._all;
      return acc;
    }, {});

    const fromDate = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const paidOrders = await prisma.order.findMany({
      where: {
        status: 'PAID',
        createdAt: { gte: fromDate },
      },
      select: {
        createdAt: true,
        total: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const salesByDay: Record<string, { date: string; amount: number; orders: number }> = {};
    for (const order of paidOrders) {
      const day = order.createdAt.toISOString().slice(0, 10);
      if (!salesByDay[day]) {
        salesByDay[day] = { date: day, amount: 0, orders: 0 };
      }
      salesByDay[day].amount += order.total;
      salesByDay[day].orders += 1;
    }

    return {
      metrics: {
        totalProducts,
        totalOrders,
        revenuePaid: paidRevenue._sum.total || 0,
        statuses: statusMap,
        lowStockCount: lowStock.length,
      },
      lowStock,
      topProducts: topProducts.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantitySold: item._sum.quantity || 0,
        revenue: item._sum.lineTotal || 0,
      })),
      recentOrders,
      recentPayments: payments,
      salesByDay: Object.values(salesByDay),
      analytics,
      notifications,
    };
  },
};
