import { Router } from 'express';
import { asyncHandler } from '../common/express';
import { shippingService } from '../modules/shipping/shipping.service';

export const shippingRouter = Router();

// Public: active zones + settings (used by Checkout)
shippingRouter.get(
  '/zones',
  asyncHandler(async (_req, res) => {
    const [zones, settings] = await Promise.all([
      shippingService.getActiveZones(),
      shippingService.getShippingSettings(),
    ]);
    res.json({ zones, ...settings });
  })
);
