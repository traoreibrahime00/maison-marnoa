export type OrderStatus = 'PENDING_WHATSAPP' | 'CONFIRMED' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export const ORDER_STATUS_META: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  PENDING_WHATSAPP: { label: 'En attente',  color: '#f59e0b', bg: 'rgba(245,158,11,0.1)'  },
  CONFIRMED:        { label: 'Confirmée',   color: '#3b82f6', bg: 'rgba(59,130,246,0.1)'  },
  PAID:             { label: 'Payée',        color: '#22c55e', bg: 'rgba(34,197,94,0.1)'   },
  SHIPPED:          { label: 'Expédiée',    color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)'  },
  DELIVERED:        { label: 'Livrée',      color: '#C9A227', bg: 'rgba(201,162,39,0.1)'  },
  CANCELLED:        { label: 'Annulée',     color: '#ef4444', bg: 'rgba(239,68,68,0.1)'   },
};
