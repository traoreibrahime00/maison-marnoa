import { Router } from 'express';
import { HttpError } from '../common/errors';
import { asyncHandler } from '../common/express';
import { paymentsService } from '../modules/payments/payments.service';
import { parseWaveCheckoutInput, parseWaveWebhookInput } from '../modules/payments/payments.validator';

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
    const input = parseWaveWebhookInput(req.body);
    if (!input) {
      throw new HttpError(400, 'Invalid Wave webhook payload');
    }

    const payment = await paymentsService.processWaveWebhook(input);
    res.status(200).json(payment);
  })
);
