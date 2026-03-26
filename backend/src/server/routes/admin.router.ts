import { Router } from 'express';
import { asyncHandler, requireAdmin } from '../common/express';
import { adminService } from '../modules/admin/admin.service';
import { notificationsService } from '../modules/notifications/notifications.service';
import { parseAdminOrdersFilter } from '../modules/orders/orders.validator';
import { shippingService } from '../modules/shipping/shipping.service';
import { ordersRepository } from '../modules/orders/orders.repository';
import { HttpError } from '../common/errors';

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

adminRouter.delete(
  '/orders',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { ids } = req.body as { ids?: unknown };
    if (!Array.isArray(ids) || ids.length === 0) throw new HttpError(400, 'ids[] requis');
    const result = await ordersRepository.bulkDelete(ids as string[]);
    res.json({ deleted: result.count });
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

adminRouter.delete(
  '/notifications',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { ids } = req.body as { ids?: unknown };
    if (!Array.isArray(ids) || ids.length === 0) throw new HttpError(400, 'ids[] requis');
    const result = await notificationsService.deleteMany(ids as string[]);
    res.json({ deleted: result.count });
  })
);

// ── Shipping zones (admin) ──

adminRouter.get(
  '/shipping',
  asyncHandler(async (_req, res) => {
    const [zones, settings] = await Promise.all([
      shippingService.getAllZones(),
      shippingService.getShippingSettings(),
    ]);
    res.json({ zones, ...settings });
  })
);

adminRouter.post(
  '/shipping/zones',
  asyncHandler(async (req, res) => {
    const d = req.body as Record<string, unknown>;
    if (!d.name || !d.zoneKey) throw new Error('name and zoneKey are required');
    const zone = await shippingService.createZone({
      name: String(d.name),
      zoneKey: String(d.zoneKey),
      description: d.description ? String(d.description) : '',
      icon: d.icon ? String(d.icon) : '🚚',
      price: Number(d.price || 0),
      isFree: Boolean(d.isFree),
      isActive: d.isActive !== false,
      sortOrder: Number(d.sortOrder || 0),
    });
    res.status(201).json(zone);
  })
);

adminRouter.patch(
  '/shipping/zones/:id',
  asyncHandler(async (req, res) => {
    const d = req.body as Record<string, unknown>;
    const zone = await shippingService.updateZone(req.params.id, {
      name: d.name !== undefined ? String(d.name) : undefined,
      description: d.description !== undefined ? String(d.description) : undefined,
      icon: d.icon !== undefined ? String(d.icon) : undefined,
      price: d.price !== undefined ? Number(d.price) : undefined,
      isFree: d.isFree !== undefined ? Boolean(d.isFree) : undefined,
      isActive: d.isActive !== undefined ? Boolean(d.isActive) : undefined,
      sortOrder: d.sortOrder !== undefined ? Number(d.sortOrder) : undefined,
    });
    res.json(zone);
  })
);

adminRouter.delete(
  '/shipping/zones/:id',
  asyncHandler(async (req, res) => {
    await shippingService.deleteZone(req.params.id);
    res.status(204).end();
  })
);

// ── General settings (WA number, gift wrap fee) ──

adminRouter.get(
  '/general-settings',
  asyncHandler(async (_req, res) => {
    const [waNumber, giftWrapFee] = await Promise.all([
      shippingService.getSetting('wa_number', '2250102528848'),
      shippingService.getSetting('gift_wrap_fee', '2500'),
    ]);
    res.json({ waNumber, giftWrapFee: Number(giftWrapFee) });
  })
);

adminRouter.patch(
  '/general-settings',
  asyncHandler(async (req, res) => {
    const d = req.body as Record<string, unknown>;
    const ops: Promise<unknown>[] = [];
    if (d.waNumber !== undefined) {
      ops.push(shippingService.setSetting('wa_number', String(d.waNumber).replace(/\D/g, '')));
    }
    if (d.giftWrapFee !== undefined) {
      ops.push(shippingService.setSetting('gift_wrap_fee', String(Number(d.giftWrapFee))));
    }
    await Promise.all(ops);
    const [waNumber, giftWrapFee] = await Promise.all([
      shippingService.getSetting('wa_number', '2250102528848'),
      shippingService.getSetting('gift_wrap_fee', '2500'),
    ]);
    res.json({ waNumber, giftWrapFee: Number(giftWrapFee) });
  })
);

adminRouter.patch(
  '/hero-settings',
  asyncHandler(async (req, res) => {
    const d = req.body as Record<string, unknown>;
    const ops: Promise<unknown>[] = [];
    const heroKeys = ['mediaUrl', 'mediaType', 'badge', 'title1', 'title2', 'subtitle', 'cta1', 'cta2'] as const;
    const keyMap: Record<string, string> = {
      mediaUrl: 'hero_media_url', mediaType: 'hero_media_type',
      badge: 'hero_badge', title1: 'hero_title1', title2: 'hero_title2',
      subtitle: 'hero_subtitle', cta1: 'hero_cta1', cta2: 'hero_cta2',
    };
    for (const k of heroKeys) {
      if (d[k] !== undefined) ops.push(shippingService.setSetting(keyMap[k], String(d[k])));
    }
    await Promise.all(ops);
    res.json({ ok: true });
  })
);

adminRouter.patch(
  '/shipping/settings',
  asyncHandler(async (req, res) => {
    const d = req.body as Record<string, unknown>;
    const ops: Promise<unknown>[] = [];
    if (d.freeThreshold !== undefined) {
      ops.push(shippingService.setSetting('shipping_free_threshold', String(Number(d.freeThreshold))));
    }
    if (d.freeZone !== undefined) {
      ops.push(shippingService.setSetting('shipping_free_zone', String(d.freeZone)));
    }
    if (d.codEnabled !== undefined) {
      ops.push(shippingService.setSetting('shipping_cod_enabled', d.codEnabled ? 'true' : 'false'));
    }
    await Promise.all(ops);
    res.json(await shippingService.getShippingSettings());
  })
);
