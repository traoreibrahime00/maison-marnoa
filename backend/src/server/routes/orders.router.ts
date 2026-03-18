import { Router } from 'express';
import { HttpError } from '../common/errors';
import { asyncHandler } from '../common/express';
import { ordersService } from '../modules/orders/orders.service';
import { InsufficientStockError } from '../modules/orders/orders.types';
import { parseOrderPayload, parseOrderRef, parseOrdersFilter, parseOrderStatus } from '../modules/orders/orders.validator';

export const ordersRouter = Router();

ordersRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const filter = parseOrdersFilter(req.query);
    if (!filter.phone && !filter.email) {
      throw new HttpError(400, 'Missing phone or email filter');
    }

    const orders = await ordersService.listOrders(filter.phone, filter.email, filter.limit);
    res.status(200).json(orders);
  })
);

ordersRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const input = parseOrderPayload(req.body);
    if (!input) {
      throw new HttpError(400, 'Invalid order payload');
    }

    try {
      const order = await ordersService.createOrGetOrder(input);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof InsufficientStockError) {
        throw new HttpError(409, 'Insufficient stock', {
          productId: error.productId,
          requested: error.requested,
          available: error.available,
        });
      }
      throw error;
    }
  })
);

ordersRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const orderRefOrId = parseOrderRef(req.params.id);
    if (!orderRefOrId) {
      throw new HttpError(400, 'Missing order id');
    }

    const order =
      (await ordersService.findOrder(orderRefOrId)) ||
      (await ordersService.findOrderById(orderRefOrId));

    if (!order) {
      throw new HttpError(404, 'Order not found');
    }

    res.status(200).json(order);
  })
);

ordersRouter.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const orderRef = parseOrderRef(req.params.id);
    if (!orderRef) {
      throw new HttpError(400, 'Missing order id');
    }

    const status = parseOrderStatus((req.body as Record<string, unknown> | undefined)?.status);
    if (!status) {
      throw new HttpError(400, 'Invalid status');
    }

    const order = await ordersService.updateOrderStatus(orderRef, status);
    res.status(200).json(order);
  })
);
