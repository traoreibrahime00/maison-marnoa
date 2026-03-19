import type { ProductInput, ProductPatchInput } from './products.types';

export function parseProductInput(raw: unknown): ProductInput | null {
  if (!raw || typeof raw !== 'object') return null;

  const data = raw as Record<string, unknown>;
  const id = String(data.id || '').trim();
  const name = String(data.name || '').trim();
  const image = String(data.image || '').trim();
  const category = String(data.category || '').trim();
  const collection = String(data.collection || '').trim();
  const description = String(data.description || '').trim();
  const price = Number(data.price);

  if (!id || !name || !image || !category || !collection || !description || Number.isNaN(price)) {
    return null;
  }

  return {
    id,
    name,
    price,
    originalPrice: data.originalPrice != null ? Number(data.originalPrice) || null : null,
    image,
    images: Array.isArray(data.images) ? (data.images as string[]).filter(s => typeof s === 'string') : [image],
    category,
    collection,
    description,
    material: typeof data.material === 'string' ? data.material : '',
    weight: typeof data.weight === 'string' ? data.weight : '',
    sizes: Array.isArray(data.sizes) ? (data.sizes as number[]).filter(n => typeof n === 'number') : [],
    colorVariants: Array.isArray(data.colorVariants) ? data.colorVariants as ProductInput['colorVariants'] : null,
    rating: typeof data.rating === 'number' ? data.rating : 4.5,
    reviews: typeof data.reviews === 'number' ? data.reviews : 0,
    isNew: Boolean(data.isNew),
    isBestseller: Boolean(data.isBestseller),
    isFeatured: Boolean(data.isFeatured),
    stock: data.stock === '' || data.stock === null || typeof data.stock === 'undefined' ? null : Number(data.stock),
  };
}

export function parseProductPatchInput(raw: unknown): ProductPatchInput | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw as Record<string, unknown>;

  const patch: ProductPatchInput = {};

  if (typeof data.name !== 'undefined') patch.name = String(data.name || '').trim();
  if (typeof data.price !== 'undefined') patch.price = Number(data.price);
  if (typeof data.originalPrice !== 'undefined') patch.originalPrice = data.originalPrice != null ? Number(data.originalPrice) : null;
  if (typeof data.image !== 'undefined') patch.image = String(data.image || '').trim();
  if (typeof data.images !== 'undefined') patch.images = Array.isArray(data.images) ? data.images as string[] : undefined;
  if (typeof data.category !== 'undefined') patch.category = String(data.category || '').trim();
  if (typeof data.collection !== 'undefined') patch.collection = String(data.collection || '').trim();
  if (typeof data.description !== 'undefined') patch.description = String(data.description || '').trim();
  if (typeof data.material !== 'undefined') patch.material = String(data.material || '');
  if (typeof data.weight !== 'undefined') patch.weight = String(data.weight || '');
  if (typeof data.sizes !== 'undefined') patch.sizes = Array.isArray(data.sizes) ? data.sizes as number[] : [];
  if (typeof data.colorVariants !== 'undefined') patch.colorVariants = Array.isArray(data.colorVariants) ? data.colorVariants as ProductPatchInput['colorVariants'] : null;
  if (typeof data.rating !== 'undefined') patch.rating = Number(data.rating);
  if (typeof data.reviews !== 'undefined') patch.reviews = Number(data.reviews);
  if (typeof data.isNew !== 'undefined') patch.isNew = Boolean(data.isNew);
  if (typeof data.isBestseller !== 'undefined') patch.isBestseller = Boolean(data.isBestseller);
  if (typeof data.isFeatured !== 'undefined') patch.isFeatured = Boolean(data.isFeatured);
  if (typeof data.stock !== 'undefined') {
    patch.stock = data.stock === '' || data.stock === null ? null : Number(data.stock);
  }

  const hasInvalidNumber = typeof patch.price === 'number' && Number.isNaN(patch.price);
  const hasInvalidStock = typeof patch.stock === 'number' && Number.isNaN(patch.stock);
  if (hasInvalidNumber || hasInvalidStock) return null;

  return patch;
}
