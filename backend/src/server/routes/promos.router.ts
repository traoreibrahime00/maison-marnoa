import { Router } from 'express';
import { HttpError } from '../common/errors';
import { asyncHandler } from '../common/express';
import { promosService } from '../modules/promos/promos.service';

export const promosRouter = Router();

// Public: validate a promo code
// POST /api/promos/validate  { code: "MARNOA10" }
promosRouter.post(
  '/validate',
  asyncHandler(async (req, res) => {
    const code = String((req.body as Record<string, unknown>)?.code || '').trim();
    if (!code) {
      throw new HttpError(400, 'Code manquant');
    }
    const result = await promosService.validate(code);
    res.status(200).json(result);
  })
);

// Admin: list all promo codes
promosRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const promos = await promosService.listAll();
    res.status(200).json(promos);
  })
);

// Admin: create promo code
promosRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const body = (req.body || {}) as Record<string, unknown>;
    const code = String(body.code || '').trim().toUpperCase();
    const discount = Number(body.discount);
    const maxUses = body.maxUses != null ? Number(body.maxUses) : undefined;
    const expiresAt = body.expiresAt ? new Date(String(body.expiresAt)) : undefined;

    if (!code || !Number.isFinite(discount) || discount <= 0 || discount > 100) {
      throw new HttpError(400, 'Code et remise (1-100) requis');
    }

    const promo = await promosService.create({ code, discount, maxUses, expiresAt });
    res.status(201).json(promo);
  })
);

// Admin: toggle active
promosRouter.patch(
  '/:id/toggle',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const isActive = Boolean((req.body as Record<string, unknown>)?.isActive);
    const promo = await promosService.toggle(id, isActive);
    res.status(200).json(promo);
  })
);

// Admin: delete
promosRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await promosService.remove(req.params.id);
    res.status(204).send();
  })
);
