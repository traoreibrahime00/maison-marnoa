import { Router } from 'express';
import { asyncHandler } from '../common/express';
import { adminService } from '../modules/admin/admin.service';
import { notificationsService } from '../modules/notifications/notifications.service';
import { parseAdminOrdersFilter } from '../modules/orders/orders.validator';

export const adminRouter = Router();

adminRouter.get(
  '/dashboard',
  asyncHandler(async (_req, res) => {
    const dashboard = await adminService.dashboard();
    res.status(200).json(dashboard);
  })
);

adminRouter.get(
  '/orders',
  asyncHandler(async (req, res) => {
    const filter = parseAdminOrdersFilter(req.query);
    const orders = await adminService.listOrders(filter);
    res.status(200).json(orders);
  })
);

adminRouter.get(
  '/payments',
  asyncHandler(async (req, res) => {
    const limit = Number(req.query.limit || 50);
    const payments = await adminService.listPayments(limit);
    res.status(200).json(payments);
  })
);

adminRouter.get(
  '/notifications',
  asyncHandler(async (req, res) => {
    const limit = Number(req.query.limit || 20);
    const notifications = await notificationsService.listRecent(limit);
    res.status(200).json(notifications);
  })
);
