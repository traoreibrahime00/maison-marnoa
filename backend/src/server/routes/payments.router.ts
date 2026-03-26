import { Router } from 'express';
import { createHmac, timingSafeEqual } from 'crypto';
import { HttpError } from '../common/errors';
import { asyncHandler } from '../common/express';
import { paymentsService } from '../modules/payments/payments.service';
import { parseWaveCheckoutInput, parseWaveWebhookInput } from '../modules/payments/payments.validator';
import { env } from '../common/env';

function verifyWaveSignature(rawBody: string, signature: string | undefined, secret: string): boolean {
  if (!signature || !secret) return false;
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

export const paymentsRouter = Router();

paymentsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const orderRef = String(req.query.orderRef || '').trim();
    if (!orderRef) {
      throw new HttpError(400, 'Missing orderRef query parameter');
    }

    const payments = await paymentsService.listOrderPayments(orderRef);
    res.status(200).json(payments);
  })
);

paymentsRouter.post(
  '/wave/checkout',
  asyncHandler(async (req, res) => {
    const input = parseWaveCheckoutInput(req.body);
    if (!input) {
      throw new HttpError(400, 'Invalid Wave checkout payload');
    }

    const checkout = await paymentsService.createWaveCheckout(input);
    res.status(201).json(checkout);
  })
);

paymentsRouter.post(
  '/wave/webhook',
  asyncHandler(async (req, res) => {
    // Vérification signature Wave si le secret est configuré
    if (env.WAVE_WEBHOOK_SECRET) {
      const signature = req.headers['wave-signature'] as string | undefined;
      const rawBody = JSON.stringify(req.body);
      if (!verifyWaveSignature(rawBody, signature, env.WAVE_WEBHOOK_SECRET)) {
        console.warn('[Wave webhook] Signature invalide ou manquante');
        throw new HttpError(401, 'Invalid webhook signature');
      }
    }

    const input = parseWaveWebhookInput(req.body);
    if (!input) {
      throw new HttpError(400, 'Invalid Wave webhook payload');
    }

    const payment = await paymentsService.processWaveWebhook(input);
    res.status(200).json(payment);
  })
);
