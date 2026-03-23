import { useEffect, useState } from 'react';
import { MessageCircle, ExternalLink, RefreshCw, Phone, Mail, Package, ChevronDown, ChevronUp, Truck, Copy } from 'lucide-react';
import { formatPrice } from '../../data/products';
import { apiUrl } from '../../lib/api';
import { toast } from 'sonner';
import { useColors } from '../../context/AppContext';

type OrderRow = {
  id: string;
  orderRef: string;
  status: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  total: number;
  paymentMethod: string;
  createdAt: string;
  note?: string;
  items?: Array<{ productName: string; quantity: number; unitPrice: number; size?: number }>;
};

type Notification = {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  status: string;
  meta?: { waClickUrl?: string; direction?: string };
};

const FILTER_TABS = [
  { key: 'ALL',              label: 'Toutes' },
  { key: 'PENDING_WHATSAPP', label: 'Nouvelles' },
  { key: 'CONFIRMED',        label: 'Confirmées' },
  { key: 'PAID',             label: 'Payées' },
  { key: 'SHIPPED',          label: 'Expédiées' },
  { key: 'DELIVERED',        label: 'Livrées' },
  { key: 'CANCELLED',        label: 'Annulées' },
] as const;

type FilterKey = (typeof FILTER_TABS)[number]['key'];

const STATUS_COLOR: Record<string, string> = {
  PENDING_WHATSAPP: '#f59e0b',
  CONFIRMED:        '#3b82f6',
  PAID:             '#22c55e',
  SHIPPED:          '#8b5cf6',
  DELIVERED:        '#C9A227',
  CANCELLED:        '#ef4444',
};

const STATUS_FR: Record<string, string> = {
  PENDING_WHATSAPP: 'Nouvelle',
  CONFIRMED:        'Confirmée',
  PAID:             'Payée',
  SHIPPED:          'Expédiée',
  DELIVERED:        'Livrée',
  CANCELLED:        'Annulée',
};

// Workflow WhatsApp : PENDING → CONFIRMED (stock décrémenté) → SHIPPED → DELIVERED
const NEXT_ACTIONS: Record<string, Array<{ label: string; status: string; color: string; bg: string }>> = {
  PENDING_WHATSAPP: [
    { label: '✅ Confirmer la commande',   status: 'CONFIRMED', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
    { label: '❌ Annuler',                 status: 'CANCELLED', color: '#ef4444', bg: 'rgba(239,68,68,0.1)'   },
  ],
  CONFIRMED: [
    { label: '🚚 Déclencher la livraison', status: 'SHIPPED',   color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)' },
    { label: '❌ Annuler',                 status: 'CANCELLED', color: '#ef4444', bg: 'rgba(239,68,68,0.1)'   },
  ],
  SHIPPED: [
    { label: '🎁 Marquer comme livrée',    status: 'DELIVERED', color: '#C9A227', bg: 'rgba(201,162,39,0.15)' },
  ],
};

const STATUS_WA_MSG: Record<string, (name: string, ref: string) => string> = {
  CONFIRMED: (name, ref) =>
    `Bonjour ${name},\n\nVotre commande *#${ref}* a ete confirmee par notre equipe.\nNous preparons vos bijoux avec soin.\n\nMerci pour votre confiance !\nMaison Marnoa - Haute Joaillerie`,
  SHIPPED: (name, ref) =>
    `Bonjour ${name},\n\nVotre commande *#${ref}* est en cours de livraison.\nNotre livreur vous contactera sous peu.\n\nMaison Marnoa`,
  DELIVERED: (name, ref) =>
    `Bonjour ${name},\n\nVotre commande *#${ref}* a bien ete livree.\nNous esperons que vous etes satisfait(e) de votre achat.\n\nA tres bientot !\nMaison Marnoa`,
  CANCELLED: (name, ref) =>
    `Bonjour ${name},\n\nNous sommes desoles, votre commande *#${ref}* n'a pas pu etre traitee.\nContactez-nous pour plus d'informations.\n\nMaison Marnoa`,
};

function buildStatusWAUrl(order: OrderRow, nextStatus: string): string {
  const phone = order.customerPhone.replace(/\D/g, '');
  const firstName = order.customerName.split(' ')[0];
  const builder = STATUS_WA_MSG[nextStatus];
  const msg = builder
    ? builder(firstName, order.orderRef)
    : `Bonjour ${firstName},\n\nMise a jour de votre commande *#${order.orderRef}*.\n\nMaison Marnoa`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
}

function buildClientWAUrl(phone: string, orderRef: string): string {
  const clean = phone.replace(/\D/g, '');
  const msg = encodeURIComponent(`Bonjour,\n\nMise a jour de votre commande *#${orderRef}* - Maison Marnoa.`);
  return `https://wa.me/${clean}?text=${msg}`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'À l\'instant';
  if (mins < 60) return `Il y a ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `Il y a ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `Il y a ${days}j`;
}

function DeliverySheet({ order, CARD_BG, TEXT, MUTED, GOLD }: { order: OrderRow; CARD_BG: string; TEXT: string; MUTED: string; GOLD: string }) {
  const copyInfo = () => {
    const text = `📦 Livraison Maison Marnoa\n\nRef: #${order.orderRef}\nClient: ${order.customerName}\nTél: ${order.customerPhone}${order.customerAddress ? `\nAdresse: ${order.customerAddress}` : ''}\nMontant: ${formatPrice(order.total)}`;
    navigator.clipboard.writeText(text);
    toast('Informations copiées pour le livreur');
  };

  return (
    <div className="mt-4 rounded-2xl p-4 flex flex-col gap-3" style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.25)' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck size={14} color="#8b5cf6" />
          <span style={{ color: '#8b5cf6', fontWeight: 700, fontSize: '12px' }}>Fiche livreur</span>
        </div>
        <button
          onClick={copyInfo}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
          style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)', color: '#8b5cf6', fontSize: '11px', fontWeight: 700, fontFamily: 'Manrope, sans-serif' }}
        >
          <Copy size={11} /> Copier tout
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl px-3 py-2" style={{ background: CARD_BG }}>
          <p style={{ color: MUTED, fontSize: '9px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 3 }}>Client</p>
          <p style={{ color: TEXT, fontWeight: 700, fontSize: '12px' }}>{order.customerName}</p>
        </div>
        <div className="rounded-xl px-3 py-2" style={{ background: CARD_BG }}>
          <p style={{ color: MUTED, fontSize: '9px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 3 }}>Téléphone</p>
          <a href={`tel:${order.customerPhone}`} style={{ color: GOLD, fontWeight: 700, fontSize: '12px', textDecoration: 'none' }}>{order.customerPhone}</a>
        </div>
        {order.customerAddress && (
          <div className="col-span-2 rounded-xl px-3 py-2" style={{ background: CARD_BG }}>
            <p style={{ color: MUTED, fontSize: '9px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 3 }}>Adresse de livraison</p>
            <p style={{ color: TEXT, fontSize: '12px' }}>{order.customerAddress}</p>
          </div>
        )}
        <div className="rounded-xl px-3 py-2" style={{ background: CARD_BG }}>
          <p style={{ color: MUTED, fontSize: '9px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 3 }}>Montant à percevoir</p>
          <p style={{ color: '#22c55e', fontWeight: 800, fontSize: '14px' }}>{formatPrice(order.total)}</p>
        </div>
        <div className="rounded-xl px-3 py-2" style={{ background: CARD_BG }}>
          <p style={{ color: MUTED, fontSize: '9px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 3 }}>Réf. commande</p>
          <p style={{ color: GOLD, fontWeight: 700, fontSize: '12px' }}>#{order.orderRef}</p>
        </div>
      </div>
    </div>
  );
}

function OrderCard({ order, onStatusChange, BG, CARD_BG, BORDER, TEXT, MUTED, GOLD }: { order: OrderRow; onStatusChange: (ref: string, status: string) => Promise<void>; BG: string; CARD_BG: string; BORDER: string; TEXT: string; MUTED: string; GOLD: string }) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);

  const actions   = NEXT_ACTIONS[order.status] ?? [];
  const color     = STATUS_COLOR[order.status] ?? MUTED;
  const isNew     = order.status === 'PENDING_WHATSAPP';
  const isShipped = order.status === 'SHIPPED';

  const handleAction = async (nextStatus: string) => {
    setUpdating(true);
    await onStatusChange(order.orderRef, nextStatus);
    setUpdating(false);
    // Auto-ouvre WhatsApp avec le message de statut pré-rempli (l'admin envoie ou ferme)
    window.open(buildStatusWAUrl(order, nextStatus), '_blank');
  };

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: CARD_BG,
        border: `1px solid ${isNew ? 'rgba(245,158,11,0.4)' : BORDER}`,
        boxShadow: isNew ? '0 0 0 1px rgba(245,158,11,0.15)' : 'none',
      }}
    >
      {/* Card header */}
      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left: ref + client */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span style={{ color: GOLD, fontWeight: 800, fontSize: '14px' }}>#{order.orderRef}</span>
              {isNew && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />
                  <span style={{ color: '#f59e0b', fontSize: '9px', fontWeight: 700, letterSpacing: '0.5px' }}>NOUVEAU</span>
                </span>
              )}
              <span className="px-2 py-0.5 rounded-lg" style={{ background: `${color}18`, color, fontSize: '10px', fontWeight: 700 }}>
                {STATUS_FR[order.status] ?? order.status}
              </span>
            </div>

            <p style={{ color: TEXT, fontWeight: 700, fontSize: '15px', marginBottom: 2 }}>{order.customerName}</p>

            <div className="flex items-center gap-3 flex-wrap">
              <a href={`tel:${order.customerPhone}`} className="flex items-center gap-1" style={{ color: MUTED, fontSize: '11px', textDecoration: 'none' }}>
                <Phone size={10} /> {order.customerPhone}
              </a>
              {order.customerEmail && (
                <span className="flex items-center gap-1" style={{ color: MUTED, fontSize: '11px' }}>
                  <Mail size={10} /> {order.customerEmail}
                </span>
              )}
              <span style={{ color: MUTED, fontSize: '10px' }}>{timeAgo(order.createdAt)}</span>
            </div>
          </div>

          {/* Right: total */}
          <div className="text-right flex-shrink-0">
            <p style={{ color: GOLD, fontWeight: 800, fontSize: '18px' }}>{formatPrice(order.total)}</p>
            <p style={{ color: MUTED, fontSize: '10px', marginTop: 2 }}>WhatsApp</p>
          </div>
        </div>

        {/* Confirmed notice */}
        {order.status === 'CONFIRMED' && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)' }}>
            <Truck size={12} color="#8b5cf6" />
            <span style={{ color: '#8b5cf6', fontSize: '11px', fontWeight: 600 }}>Commande confirmée — déclenchez la livraison quand prête</span>
          </div>
        )}

        {/* Action buttons */}
        {actions.length > 0 && (
          <div className="flex gap-2 mt-4 flex-wrap">
            {actions.map(action => (
              <button
                key={action.status}
                onClick={() => handleAction(action.status)}
                disabled={updating}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl"
                style={{
                  background: action.bg,
                  border: `1px solid ${action.color}40`,
                  color: action.color,
                  fontSize: '12px',
                  fontWeight: 700,
                  fontFamily: 'Manrope, sans-serif',
                  opacity: updating ? 0.6 : 1,
                  cursor: updating ? 'not-allowed' : 'pointer',
                }}
              >
                {updating ? <RefreshCw size={11} className="animate-spin" /> : null}
                {action.label}
              </button>
            ))}
          </div>
        )}

        {/* Delivery sheet when shipped */}
        {isShipped && <DeliverySheet order={order} CARD_BG={CARD_BG} TEXT={TEXT} MUTED={MUTED} GOLD={GOLD} />}

        {/* Quick links */}
        <div className="flex items-center gap-2 mt-3">
          <a
            href={buildClientWAUrl(order.customerPhone, order.orderRef)}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
            style={{ background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.2)', color: '#25D366', fontSize: '11px', fontWeight: 700, textDecoration: 'none' }}
          >
            <MessageCircle size={12} /> WhatsApp client
          </a>
          <a
            href={apiUrl(`/api/receipts/${order.orderRef}/html`)}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
            style={{ background: 'rgba(201,162,39,0.08)', border: '1px solid rgba(201,162,39,0.2)', color: GOLD, fontSize: '11px', fontWeight: 700, textDecoration: 'none' }}
          >
            <ExternalLink size={12} /> Reçu
          </a>
          <button
            onClick={() => setExpanded(v => !v)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl ml-auto"
            style={{ background: 'transparent', border: `1px solid ${BORDER}`, color: MUTED, fontSize: '11px', fontFamily: 'Manrope, sans-serif' }}
          >
            {expanded ? <><ChevronUp size={12} /> Réduire</> : <><ChevronDown size={12} /> Détails</>}
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${BORDER}`, padding: '16px 20px', background: BG }}>
          {order.customerAddress && (
            <p style={{ color: MUTED, fontSize: '11px', marginBottom: 8 }}>
              📍 <span style={{ color: TEXT }}>{order.customerAddress}</span>
            </p>
          )}
          {order.note && (
            <p style={{ color: MUTED, fontSize: '11px', marginBottom: 12 }}>
              📝 <span style={{ color: TEXT, fontStyle: 'italic' }}>"{order.note}"</span>
            </p>
          )}
          {order.items && order.items.length > 0 && (
            <div className="flex flex-col gap-2">
              <p style={{ color: MUTED, fontSize: '10px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 4 }}>Articles</p>
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package size={11} color={GOLD} />
                    <span style={{ color: TEXT, fontSize: '12px' }}>{item.productName}</span>
                    {item.size && <span style={{ color: MUTED, fontSize: '10px' }}>T.{item.size}</span>}
                  </div>
                  <span style={{ color: MUTED, fontSize: '11px' }}>x{item.quantity} · {formatPrice(item.unitPrice)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminOrders() {
  const { BG, CARD_BG, BORDER, TEXT, MUTED, GOLD } = useColors();
  const [filter, setFilter] = useState<FilterKey>('ALL');
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const load = async () => {
    setLoading(true);
    const query = new URLSearchParams({ limit: '100' });
    if (filter !== 'ALL') query.set('status', filter);
    try {
      const [ordersRes, notifsRes] = await Promise.all([
        fetch(apiUrl(`/api/admin/orders?${query}`), { credentials: 'include' }),
        fetch(apiUrl('/api/admin/notifications?limit=30'), { credentials: 'include' }),
      ]);
      const [orders, notifs] = await Promise.all([ordersRes.json(), notifsRes.json()]);
      setRows(orders as OrderRow[]);
      setNotifications(notifs as Notification[]);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter]);

  const updateStatus = async (orderRef: string, nextStatus: string) => {
    const res = await fetch(apiUrl(`/api/orders/${orderRef}`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status: nextStatus }),
    });
    if (!res.ok) { toast.error('Erreur lors de la mise à jour'); return; }
    setRows(prev => prev.map(o => o.orderRef === orderRef ? { ...o, status: nextStatus } : o));
    toast(`Commande #${orderRef} → ${STATUS_FR[nextStatus] ?? nextStatus}`);
    setTimeout(async () => {
      const res2 = await fetch(apiUrl('/api/admin/notifications?limit=30'), { credentials: 'include' });
      if (res2.ok) setNotifications(await res2.json() as Notification[]);
    }, 800);
  };

  const pendingClientNotifs = notifications.filter(
    n => n.meta?.direction === 'TO_CLIENT' && n.status === 'QUEUED'
  );

  const newOrders = rows.filter(o => o.status === 'PENDING_WHATSAPP');
  const counts: Record<string, number> = {};
  rows.forEach(o => { counts[o.status] = (counts[o.status] ?? 0) + 1; });

  return (
    <div className="flex flex-col gap-5">

      {/* Notifications client à envoyer */}
      {pendingClientNotifs.length > 0 && (
        <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: 'rgba(37,211,102,0.05)', border: '1px solid rgba(37,211,102,0.25)' }}>
          <p style={{ color: '#25D366', fontWeight: 700, fontSize: '12px' }}>
            📲 {pendingClientNotifs.length} message{pendingClientNotifs.length > 1 ? 's' : ''} à envoyer au{pendingClientNotifs.length > 1 ? 'x' : ''} client{pendingClientNotifs.length > 1 ? 's' : ''}
          </p>
          {pendingClientNotifs.slice(0, 3).map(n => (
            <div key={n.id} className="flex items-start justify-between gap-4 px-4 py-3 rounded-xl" style={{ background: CARD_BG }}>
              <p style={{ color: MUTED, fontSize: '11px', lineHeight: 1.5, flex: 1, whiteSpace: 'pre-line' }}>
                {n.message.slice(0, 120)}…
              </p>
              {n.meta?.waClickUrl && (
                <a href={n.meta.waClickUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#25D366,#128C7E)', color: '#fff', fontSize: '11px', fontWeight: 700, textDecoration: 'none' }}>
                  <MessageCircle size={12} /> Envoyer
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Filter tabs + refresh */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTER_TABS.map(tab => {
          const count = tab.key === 'ALL' ? rows.length : (counts[tab.key] ?? 0);
          const active = filter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
              style={{
                background: active ? 'rgba(201,162,39,0.12)' : CARD_BG,
                border: `1px solid ${active ? GOLD : BORDER}`,
                color: active ? GOLD : MUTED,
                fontSize: '12px', fontWeight: 700, fontFamily: 'Manrope, sans-serif', cursor: 'pointer',
              }}
            >
              {tab.label}
              {count > 0 && (
                <span className="px-1.5 py-0.5 rounded-full" style={{ background: active ? 'rgba(201,162,39,0.2)' : BG, fontSize: '10px', color: active ? GOLD : MUTED }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
        <button
          onClick={load}
          className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl"
          style={{ background: CARD_BG, border: `1px solid ${BORDER}`, color: MUTED, fontSize: '12px', fontFamily: 'Manrope, sans-serif', cursor: 'pointer' }}
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Actualiser
        </button>
      </div>

      {/* Orders */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw size={20} color={GOLD} className="animate-spin" />
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Package size={32} color={BORDER} />
          <p style={{ color: MUTED, fontFamily: 'Manrope, sans-serif' }}>Aucune commande.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filter === 'ALL' && newOrders.length > 0 && (
            <p style={{ color: '#f59e0b', fontSize: '11px', fontWeight: 700, fontFamily: 'Manrope, sans-serif' }}>
              🔔 {newOrders.length} nouvelle{newOrders.length > 1 ? 's' : ''} commande{newOrders.length > 1 ? 's' : ''} à traiter
            </p>
          )}
          {rows.map(order => (
            <OrderCard key={order.id} order={order} onStatusChange={updateStatus} BG={BG} CARD_BG={CARD_BG} BORDER={BORDER} TEXT={TEXT} MUTED={MUTED} GOLD={GOLD} />
          ))}
        </div>
      )}
    </div>
  );
}
