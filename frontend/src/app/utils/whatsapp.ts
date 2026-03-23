/**
 * Maison Marnoa — WhatsApp Utility
 * Central module for all WhatsApp message formatting & redirection.
 * Replace WA_NUMBER with the real WhatsApp Business number (no + or spaces).
 */
import { apiUrl } from '../lib/api';

// Numéro WhatsApp — priorité : DB (via API) > env var > fallback
export let WA_NUMBER = import.meta.env.VITE_WA_NUMBER || '2250102528848';

// Fetch the number from DB on first use and update the module variable
fetch(apiUrl('/api/admin/general-settings'))
  .then(r => r.json())
  .then((d: { waNumber?: string }) => { if (d.waNumber) WA_NUMBER = d.waNumber; })
  .catch(() => {});

/** Format a number as FCFA price string */
export function fmtPrice(amount: number): string {
  return new Intl.NumberFormat('fr-CI').format(amount) + ' FCFA';
}

export interface OrderLine {
  productId?: string;
  name: string;
  collection: string;
  quantity: number;
  price: number;
  size?: number;
  colorLabel?: string;
}

export interface OrderPayload {
  orderId: string;
  lines: OrderLine[];
  subtotal: number;
  deliveryLabel: string;
  deliveryPrice: number;
  isGiftWrap: boolean;
  giftWrapFee: number;
  total: number;
  customer: {
    name: string;
    phone: string;
    email?: string;
    address: string;
  };
  note?: string;
  promoCode?: string;
  discountAmount?: number;
}

export interface AppointmentPayload {
  appointmentId: string;
  serviceLabel: string;
  serviceIcon: string;
  dayLabel: string;
  slot: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
  };
}

/** ─── ORDER MESSAGE ─── */
export function buildOrderMessage(order: OrderPayload): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-CI', { day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('fr-CI', { hour: '2-digit', minute: '2-digit' });

  const lines = order.lines.map((l, i) => {
    const meta = [l.size ? `Taille ${l.size}` : null, l.colorLabel || null].filter(Boolean).join(' · ');
    return `${i + 1}. *${l.name}* × ${l.quantity} ......... ${fmtPrice(l.price * l.quantity)}${meta ? `\n   └ ${meta}` : ''}`;
  }).join('\n');

  const SEP = `--------------------`;

  const rows = [
    `*NOUVELLE COMMANDE - Maison Marnoa*`,
    ``,
    `Commande : *#${order.orderId}*`,
    `Date : ${dateStr} a ${timeStr}`,
    ``,
    SEP,
    `*ARTICLES*`,
    SEP,
    lines,
    ``,
    SEP,
    `*RECAPITULATIF*`,
    SEP,
    `Sous-total : ${fmtPrice(order.subtotal)}`,
    ...(order.isGiftWrap ? [`Emballage cadeau : +${fmtPrice(order.giftWrapFee)}`] : []),
    `Livraison (${order.deliveryLabel}) : ${order.deliveryPrice === 0 ? 'GRATUITE' : fmtPrice(order.deliveryPrice)}`,
    ...(order.discountAmount ? [`Code promo (${order.promoCode}) : -${fmtPrice(order.discountAmount)}`] : []),
    ``,
    `*TOTAL : ${fmtPrice(order.total)}*`,
    ``,
    SEP,
    `*LIVRAISON*`,
    SEP,
    `Nom : ${order.customer.name}`,
    `Tel : ${order.customer.phone}`,
    `Adresse : ${order.customer.address}`,
    ...(order.customer.email ? [`Email : ${order.customer.email}`] : []),
    ...(order.note ? [``, `Note : ${order.note}`] : []),
    ``,
    `Je souhaite confirmer cette commande. Merci !`,
  ];

  return rows.join('\n');
}

/** ─── APPOINTMENT MESSAGE ─── */
export function buildAppointmentMessage(appt: AppointmentPayload): string {
  const SEP = `--------------------`;
  const rows = [
    `*Bonjour Maison Marnoa,*`,
    ``,
    `Je souhaite confirmer mon rendez-vous :`,
    ``,
    SEP,
    `*DETAILS DU RDV*`,
    SEP,
    `Prestation : *${appt.serviceLabel}*`,
    `Date : *${appt.dayLabel} a ${appt.slot}*`,
    `Lieu : Showroom Maison Marnoa - Cocody, Abidjan`,
    ``,
    SEP,
    `*MES COORDONNEES*`,
    SEP,
    `Nom : ${appt.customer.name}`,
    `Tel : ${appt.customer.phone}`,
    ...(appt.customer.email ? [`Email : ${appt.customer.email}`] : []),
    ``,
    `Merci de confirmer ce creneau !`,
  ];

  return rows.join('\n');
}

/** Open WhatsApp with a pre-filled message */
export function openWhatsApp(message: string): void {
  const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

/** ─── PENDING ORDER DB (localStorage simulation) ─── */
export interface PendingOrder {
  orderId: string;
  status: 'pending_whatsapp' | 'confirmed' | 'cancelled';
  createdAt: string;
  payload: OrderPayload;
}

export interface PendingAppointment {
  appointmentId: string;
  status: 'pending_whatsapp' | 'confirmed' | 'cancelled';
  createdAt: string;
  payload: AppointmentPayload;
}

function saveOrderToLocal(order: PendingOrder): void {
  try {
    const existing: PendingOrder[] = JSON.parse(localStorage.getItem('mn_db_orders') || '[]');
    existing.unshift(order);
    localStorage.setItem('mn_db_orders', JSON.stringify(existing.slice(0, 50))); // keep last 50
  } catch {}
}

export async function saveOrderToDb(order: PendingOrder): Promise<'api' | 'local'> {
  try {
    const res = await fetch(apiUrl('/api/orders'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order.payload),
    });

    if (!res.ok) throw new Error('Failed to persist order');
    return 'api';
  } catch (error) {
    console.error('[saveOrderToDb] API unavailable, fallback localStorage:', error);
    saveOrderToLocal(order);
    return 'local';
  }
}

export async function saveAppointmentToDb(appt: PendingAppointment): Promise<'api' | 'local'> {
  try {
    const res = await fetch(apiUrl('/api/appointments'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ref: appt.appointmentId,
        service: appt.payload.serviceLabel.toLowerCase().replace(/\s+/g, '_'),
        serviceLabel: appt.payload.serviceLabel,
        date: appt.payload.dayLabel,
        slot: appt.payload.slot,
        customerName: appt.payload.customer.name,
        customerPhone: appt.payload.customer.phone,
        customerEmail: appt.payload.customer.email,
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return 'api';
  } catch {
    try {
      const existing: PendingAppointment[] = JSON.parse(localStorage.getItem('mn_db_appointments') || '[]');
      existing.unshift(appt);
      localStorage.setItem('mn_db_appointments', JSON.stringify(existing.slice(0, 50)));
    } catch {}
    return 'local';
  }
}
