/**
 * Maison Marnoa — WhatsApp Utility
 * Central module for all WhatsApp message formatting & redirection.
 * Replace WA_NUMBER with the real WhatsApp Business number (no + or spaces).
 */
import { apiUrl } from '../lib/api';

// Numéro WhatsApp sans + ni espaces — défini via VITE_WA_NUMBER dans .env
export const WA_NUMBER = import.meta.env.VITE_WA_NUMBER || '2250700000000';

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

  const rows = [
    `🛍️ *NOUVELLE COMMANDE — Maison Marnoa*`,
    ``,
    `📋 *Commande :* #${order.orderId}`,
    `📅 *Date :* ${dateStr} à ${timeStr}`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━`,
    `🛒 *ARTICLES*`,
    `━━━━━━━━━━━━━━━━━━━━`,
    lines,
    ``,
    `━━━━━━━━━━━━━━━━━━━━`,
    `💰 *RÉCAPITULATIF*`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `Sous-total : ${fmtPrice(order.subtotal)}`,
    ...(order.isGiftWrap ? [`🎁 Emballage cadeau : +${fmtPrice(order.giftWrapFee)}`] : []),
    `🚚 Livraison (${order.deliveryLabel}) : ${order.deliveryPrice === 0 ? 'GRATUITE 🎉' : fmtPrice(order.deliveryPrice)}`,
    ``,
    `💳 *TOTAL : ${fmtPrice(order.total)}*`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━`,
    `📦 *LIVRAISON*`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `👤 Nom : ${order.customer.name}`,
    `📱 Téléphone : ${order.customer.phone}`,
    `📍 Adresse : ${order.customer.address}`,
    ...(order.customer.email ? [`📧 Email : ${order.customer.email}`] : []),
    ...(order.note ? [``, `📝 Note : ${order.note}`] : []),
    ``,
    `Je souhaite confirmer cette commande. Merci ! 🙏`,
  ];

  return rows.join('\n');
}

/** ─── APPOINTMENT MESSAGE ─── */
export function buildAppointmentMessage(appt: AppointmentPayload): string {
  const rows = [
    `👋 *Bonjour Maison Marnoa,*`,
    ``,
    `Je souhaite confirmer mon rendez-vous :`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━`,
    `📅 *DÉTAILS DU RDV*`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `${appt.serviceIcon} Prestation : *${appt.serviceLabel}*`,
    `📅 Date : *${appt.dayLabel} à ${appt.slot}*`,
    `📍 Lieu : Showroom Maison Marnoa · Cocody, Abidjan`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━`,
    `👤 *MES COORDONNÉES*`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `Nom : ${appt.customer.name}`,
    `📱 Téléphone : ${appt.customer.phone}`,
    ``,
    `Merci de confirmer ce créneau ! 🙏`,
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

export function saveAppointmentToDb(appt: PendingAppointment): void {
  try {
    const existing: PendingAppointment[] = JSON.parse(localStorage.getItem('mn_db_appointments') || '[]');
    existing.unshift(appt);
    localStorage.setItem('mn_db_appointments', JSON.stringify(existing.slice(0, 50)));
  } catch {}
}
