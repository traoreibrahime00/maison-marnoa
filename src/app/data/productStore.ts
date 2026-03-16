import { Product, products as staticProducts } from './products';

const KEYS = {
  custom: 'mn_custom_products',
  overrides: 'mn_product_overrides',
  deleted: 'mn_deleted_products',
};

function load<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function save(key: string, value: unknown) {
  try { 
    localStorage.setItem(key, JSON.stringify(value)); 
    window.dispatchEvent(new Event('mn_products_updated'));
  } catch {}
}

export function getCustomProducts(): Product[] {
  return load<Product[]>(KEYS.custom, []);
}

export function getProductOverrides(): Record<string, Partial<Product>> {
  return load<Record<string, Partial<Product>>>(KEYS.overrides, {});
}

export function getDeletedIds(): string[] {
  return load<string[]>(KEYS.deleted, []);
}

/** Returns all products for the public site: static (with overrides applied) + custom, minus deleted */
export function getMergedProducts(): Product[] {
  const overrides = getProductOverrides();
  const deleted   = new Set(getDeletedIds());
  const custom    = getCustomProducts();

  const base = staticProducts
    .filter(p => !deleted.has(p.id))
    .map(p => overrides[p.id] ? { ...p, ...overrides[p.id] } : { ...p });

  return [...base, ...custom.filter(p => !deleted.has(p.id)).map(p => ({ ...p }))];
}

/** Upsert a custom product (new or edited custom) */
export function saveCustomProduct(product: Product): void {
  const list = getCustomProducts();
  const idx  = list.findIndex(p => p.id === product.id);
  if (idx >= 0) list[idx] = product; else list.push(product);
  save(KEYS.custom, list);
}

/** Override fields of a static product */
export function saveProductOverride(id: string, data: Partial<Product>): void {
  const overrides = getProductOverrides();
  overrides[id] = { ...(overrides[id] ?? {}), ...data };
  save(KEYS.overrides, overrides);
}

/** Delete a product (soft-delete for statics, hard-delete for custom) */
export function deleteProduct(id: string): void {
  const isStatic = staticProducts.some(p => p.id === id);
  if (isStatic) {
    const deleted = getDeletedIds();
    if (!deleted.includes(id)) save(KEYS.deleted, [...deleted, id]);
  } else {
    const list = getCustomProducts().filter(p => p.id !== id);
    save(KEYS.custom, list);
  }
}

/** Generate a unique ID for new custom products */
export function generateProductId(): string {
  return `custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

/** True if the id belongs to a static product */
export function isStaticProduct(id: string): boolean {
  return staticProducts.some(p => p.id === id);
}
