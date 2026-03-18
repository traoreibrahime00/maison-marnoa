export const ORDER_STATUSES = ['PENDING_WHATSAPP', 'CONFIRMED', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface OrderLineInput {
  productId?: string | null;
  name: string;
  collection: string;
  quantity: number;
  price: number;
  size?: number;
  colorLabel?: string;
}

export interface OrderCreateInput {
  orderId: string;
  subtotal: number;
  deliveryLabel: string;
  deliveryPrice: number;
  giftWrapFee: number;
  total: number;
  customer: {
    name: string;
    phone: string;
    email?: string;
    address: string;
  };
  note?: string;
  lines: OrderLineInput[];
}

export interface OrdersFilterInput {
  phone: string;
  email: string;
  limit: number;
}

export interface AdminOrdersFilterInput {
  status?: OrderStatus;
  orderRef?: string;
  limit: number;
  offset: number;
}

export class InsufficientStockError extends Error {
  constructor(
    public readonly productId: string,
    public readonly requested: number,
    public readonly available: number
  ) {
    super(`Insufficient stock for product ${productId}`);
    this.name = 'InsufficientStockError';
  }
}
