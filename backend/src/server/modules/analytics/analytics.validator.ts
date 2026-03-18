import type { AnalyticsEventInput } from './analytics.types';

export function parseAnalyticsEvent(raw: unknown): AnalyticsEventInput | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw as Record<string, unknown>;

  const type = String(data.type || '').trim().toUpperCase();
  if (!type) return null;

  const value = Number(data.value || 1);

  return {
    type,
    productId: data.productId ? String(data.productId).trim() : undefined,
    value: Number.isFinite(value) && value > 0 ? Math.min(value, 10000) : 1,
    source: data.source ? String(data.source).trim() : undefined,
    meta: typeof data.meta === 'object' && data.meta ? (data.meta as Record<string, unknown>) : undefined,
  };
}
