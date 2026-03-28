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
      select: { type: true, value: true, createdAt: true },
    });

    const totals: Record<string, number> = {};
    const pageViewsByDay: Record<string, number> = {};

    for (const event of events) {
      totals[event.type] = (totals[event.type] || 0) + event.value;
      if (event.type === 'PAGE_VIEW') {
        const day = event.createdAt.toISOString().slice(0, 10);
        pageViewsByDay[day] = (pageViewsByDay[day] || 0) + event.value;
      }
    }

    return {
      from,
      totals,
      pageViewTimeline: Object.entries(pageViewsByDay).map(([date, views]) => ({ date, views })),
    };
  },

  async topPages(days = 30) {
    const safeDays = Math.min(Math.max(days, 1), 365);
    const from = new Date(Date.now() - safeDays * 24 * 60 * 60 * 1000);

    const events = await prisma.analyticsEvent.findMany({
      where: { type: 'PAGE_VIEW', createdAt: { gte: from } },
      select: { meta: true },
    });

    const counts: Record<string, number> = {};
    for (const e of events) {
      const path = (e.meta as Record<string, string> | null)?.path ?? '/';
      counts[path] = (counts[path] || 0) + 1;
    }

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([path, views]) => ({ path, views }));
  },
};
