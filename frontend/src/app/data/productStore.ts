import { Product, products as staticProducts } from './products';
import { apiUrl } from '../lib/api';

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
export async function saveCustomProduct(product: Product): Promise<void> {
  try {
    const res = await fetch(apiUrl('/api/products'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    if (!res.ok) throw new Error('Failed to save product');
    window.dispatchEvent(new Event('mn_products_updated'));
  } catch (error) {
    console.error('Error saving custom product API:', error);
  }
}

/** Override fields of a static product */
export async function saveProductOverride(id: string, data: Partial<Product>): Promise<void> {
  try {
    // In our Postgres design, static products are already seeded.
    // We treat overrides as a normal upsert since the product exists in DB.
    const mergedData = { id, ...data }; 
    const res = await fetch(apiUrl('/api/products'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mergedData)
    });
    if (!res.ok) throw new Error('Failed to save override');
    window.dispatchEvent(new Event('mn_products_updated'));
  } catch (error) {
    console.error('Error saving override API:', error);
  }
}

/** Delete a product (soft-delete for statics, hard-delete for custom) */
export async function deleteProduct(id: string): Promise<void> {
  try {
    // We can simply delete the product straight out of the database for both cases
    const res = await fetch(apiUrl(`/api/products/${id}`), {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete product');
    window.dispatchEvent(new Event('mn_products_updated'));
  } catch (error) {
    console.error('Error deleting product API:', error);
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
