import { Router } from 'express';
import { HttpError } from '../common/errors';
import { asyncHandler, requireAdmin } from '../common/express';
import { productsService } from '../modules/products/products.service';
import { parseProductInput, parseProductPatchInput } from '../modules/products/products.validator';

export const productsRouter = Router();

productsRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const products = await productsService.listProducts();
    res.status(200).json(products);
  })
);

productsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = String(req.params.id || '').trim();
    if (!id) throw new HttpError(400, 'Missing product id');

    const product = await productsService.findProduct(id);
    if (!product) throw new HttpError(404, 'Product not found');

    res.status(200).json(product);
  })
);

productsRouter.post(
  '/',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const input = parseProductInput(req.body);
    if (!input) throw new HttpError(400, 'Invalid product payload');

    const product = await productsService.saveProduct(input);
    res.status(200).json(product);
  })
);

productsRouter.patch(
  '/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = String(req.params.id || '').trim();
    if (!id) throw new HttpError(400, 'Missing product id');

    const patch = parseProductPatchInput(req.body);
    if (!patch) throw new HttpError(400, 'Invalid product patch payload');

    const updated = await productsService.updateProduct(id, patch);
    res.status(200).json(updated);
  })
);

productsRouter.delete(
  '/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = String(req.params.id || '').trim();
    if (!id) throw new HttpError(400, 'Missing product id');

    await productsService.removeProduct(id);
    res.status(200).json({ success: true });
  })
);
