import { Router } from 'express';
import { HttpError } from '../common/errors';
import { asyncHandler } from '../common/express';
import { analyticsService } from '../modules/analytics/analytics.service';
import { parseAnalyticsEvent } from '../modules/analytics/analytics.validator';

export const analyticsRouter = Router();

analyticsRouter.post(
  '/events',
  asyncHandler(async (req, res) => {
    const input = parseAnalyticsEvent(req.body);
    if (!input) throw new HttpError(400, 'Invalid analytics event payload');

    const event = await analyticsService.trackEvent(input);
    res.status(201).json(event);
  })
);

analyticsRouter.get(
  '/summary',
  asyncHandler(async (req, res) => {
    const days = Math.min(Number(req.query.days || 30), 365);
    const [summary, topPages] = await Promise.all([
      analyticsService.summary(days),
      analyticsService.topPages(days),
    ]);
    res.json({ ...summary, topPages });
  })
);
