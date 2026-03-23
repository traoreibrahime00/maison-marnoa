import { prisma } from '../../common/prisma';
import type { AnalyticsEventInput } from './analytics.types';

export const analyticsService = {
  trackEvent(input: AnalyticsEventInput) {
    return prisma.analyticsEvent.create({
      data: {
        type: input.type,
        productId: input.productId || null,
        value: input.value,
        source: input.source || null,
        meta: input.meta || undefined,
      },
    });
  },

  async summary(days = 30) {
    const safeDays = Math.min(Math.max(days, 1), 365);
    const from = new Date(Date.now() - safeDays * 24 * 60 * 60 * 1000);

    const events = await prisma.analyticsEvent.findMany({
      where: { createdAt: { gte: from } },
      orderBy: { createdAt: 'asc' },
      select: {
        type: true,
        value: true,
        createdAt: true,
      },
    });

    const totals: Record<string, number> = {};
    const byDay: Record<string, number> = {};

    for (const event of events) {
      totals[event.type] = (totals[event.type] || 0) + event.value;
      const day = event.createdAt.toISOString().slice(0, 10);
      byDay[day] = (byDay[day] || 0) + event.value;
    }

    return {
      from,
      totals,
      timeline: Object.entries(byDay).map(([date, value]) => ({ date, value })),
    };
  },
};
