import {
  ORDER_STATUSES,
  type AdminOrdersFilterInput,
  type OrderCreateInput,
  type OrderStatus,
  type OrdersFilterInput,
  type PaymentMethodInput,
} from './orders.types';

const VALID_PAYMENT_METHODS: PaymentMethodInput[] = ['WAVE', 'CASH_ON_DELIVERY', 'WHATSAPP'];

function normalizePhone(phone?: string): string {
  if (!phone) return '';
  return phone.replace(/\s+/g, '').trim();
}

function normalizeEmail(email?: string): string {
  if (!email) return '';
  return email.trim().toLowerCase();
}

export function parseOrdersFilter(raw: unknown): OrdersFilterInput {
  const query = (raw || {}) as Record<string, unknown>;
  const limit = Number(query.limit || 20);

  return {
    phone: normalizePhone(String(query.phone || '')),
    email: normalizeEmail(String(query.email || '')),
    limit: Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 100) : 20,
  };
}

export function parseOrderPayload(raw: unknown): OrderCreateInput | null {
  if (!raw || typeof raw !== 'object') return null;

  const data = raw as Record<string, any>;
  const orderId = String(data.orderId || '').trim();
  const customerName = String(data.customer?.name || '').trim();
  const customerPhone = normalizePhone(String(data.customer?.phone || ''));
  const customerAddress = String(data.customer?.address || '').trim();
  const lines = Array.isArray(data.lines) ? data.lines : [];

  if (!orderId || !customerName || !customerPhone || !customerAddress || lines.length === 0) {
    return null;
  }

  const parsedLines = lines
    .map((line: any) => ({
      productId: line.productId ? String(line.productId) : undefined,
      name: String(line.name || '').trim(),
      collection: String(line.collection || '').trim(),
      quantity: Number(line.quantity || 1),
      price: Number(line.price || 0),
      size: typeof line.size === 'undefined' || line.size === null ? undefined : Number(line.size),
      colorLabel: line.colorLabel ? String(line.colorLabel) : undefined,
    }))
    .filter(line => line.name && line.collection && Number.isFinite(line.quantity) && line.quantity > 0 && Number.isFinite(line.price) && line.price >= 0);

  if (parsedLines.length === 0) return null;

  const rawMethod = String(data.paymentMethod || '').toUpperCase() as PaymentMethodInput;

  return {
    orderId,
    paymentMethod: VALID_PAYMENT_METHODS.includes(rawMethod) ? rawMethod : 'WAVE',
    subtotal: Number(data.subtotal || 0),
    deliveryLabel: String(data.deliveryLabel || 'Livraison'),
    deliveryPrice: Number(data.deliveryPrice || 0),
    giftWrapFee: Number(data.giftWrapFee || 0),
    total: Number(data.total || 0),
    customer: {
      name: customerName,
      phone: customerPhone,
      email: normalizeEmail(String(data.customer?.email || '')) || undefined,
      address: customerAddress,
    },
    note: data.note ? String(data.note) : undefined,
    lines: parsedLines,
  };
}

export function parseOrderRef(raw: unknown): string {
  return String(raw || '').trim();
}

export function parseLookupQuery(raw: unknown): { orderRef: string; email: string } | null {
  const query = (raw || {}) as Record<string, unknown>;
  const orderRef = String(query.ref || '').trim().toUpperCase();
  const email = normalizeEmail(String(query.email || ''));
  if (!orderRef || !email) return null;
  return { orderRef, email };
}

export function parseOrderStatus(raw: unknown): OrderStatus | null {
  const value = String(raw || '').trim() as OrderStatus;
  return ORDER_STATUSES.includes(value) ? value : null;
}

export function parseAdminOrdersFilter(raw: unknown): AdminOrdersFilterInput {
  const query = (raw || {}) as Record<string, unknown>;
  const status = parseOrderStatus(query.status);
  const limit = Number(query.limit || 50);
  const page = Number(query.page || 1);

  return {
    status: status || undefined,
    orderRef: query.orderRef ? String(query.orderRef).trim() : undefined,
    limit: Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 200) : 50,
    offset: Number.isFinite(page) ? Math.max(page - 1, 0) * (Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 200) : 50) : 0,
  };
}
