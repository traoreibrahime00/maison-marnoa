import { useEffect, useState } from 'react';
import {
  MessageCircle, ExternalLink, RefreshCw, Phone, Mail,
  Package, ChevronDown, ChevronUp, Truck, Copy, Trash2, AlertTriangle,
} from 'lucide-react';
import { formatPrice } from '../../data/products';
import { apiUrl } from '../../lib/api';
import { toast } from 'sonner';
import { useColors } from '../../context/AppContext';

const FONT = 'Manrope, sans-serif';

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

const NEXT_ACTIONS: Record<string, Array<{ label: string; status: string; color: string; bg: string }>> = {
  PENDING_WHATSAPP: [
    { label: '✅ Confirmer',    status: 'CONFIRMED', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
    { label: '❌ Annuler',      status: 'CANCELLED', color: '#ef4444', bg: 'rgba(239,68,68,0.08)'  },
  ],
  CONFIRMED: [
    { label: '🚚 En livraison', status: 'SHIPPED',   color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
    { label: '❌ Annuler',      status: 'CANCELLED', color: '#ef4444', bg: 'rgba(239,68,68,0.08)'  },
  ],
  SHIPPED: [
    { label: '🎁 Livrée',       status: 'DELIVERED', color: '#C9A227', bg: 'rgba(201,162,39,0.12)' },
  ],
};

const STATUS_WA_MSG: Record<string, (name: string, ref: string) => string> = {
  CONFIRMED: (n, r) => `Bonjour ${n},\n\nVotre commande *#${r}* a ete confirmee.\nNous preparons vos bijoux avec soin.\n\nMerci !\nMaison Marnoa`,
  SHIPPED:   (n, r) => `Bonjour ${n},\n\nVotre commande *#${r}* est en cours de livraison.\n\nMaison Marnoa`,
  DELIVERED: (n, r) => `Bonjour ${n},\n\nVotre commande *#${r}* a bien ete livree.\nMerci de votre confiance !\n\nMaison Marnoa`,
  CANCELLED: (n, r) => `Bonjour ${n},\n\nVotre commande *#${r}* n'a pas pu etre traitee.\nContactez-nous pour plus d'infos.\n\nMaison Marnoa`,
};

function buildStatusWAUrl(order: OrderRow, nextStatus: string) {
  const phone = order.customerPhone.replace(/\D/g, '');
  const firstName = order.customerName.split(' ')[0];
  const msg = (STATUS_WA_MSG[nextStatus]?.(firstName, order.orderRef))
    ?? `Bonjour ${firstName},\n\nMise a jour commande *#${order.orderRef}*.\n\nMaison Marnoa`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'À l\'instant';
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}j`;
}

/* ── Fiche livreur ── */
function DeliverySheet({ order, CARD_BG, TEXT, MUTED, GOLD }: { order: OrderRow; CARD_BG: string; TEXT: string; MUTED: string; GOLD: string }) {
  const copy = () => {
    navigator.clipboard.writeText(
      `📦 Livraison Maison Marnoa\nRef: #${order.orderRef}\nClient: ${order.customerName}\nTél: ${order.customerPhone}${order.customerAddress ? `\nAdresse: ${order.customerAddress}` : ''}\nMontant: ${formatPrice(order.total)}`
    );
    toast('Infos copiées pour le livreur');
  };
  return (
    <div className="mt-3 rounded-xl p-4 flex flex-col gap-3" style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><Truck size={13} color="#8b5cf6" /><span style={{ color: '#8b5cf6', fontWeight: 700, fontSize: '12px', fontFamily: FONT }}>Fiche livreur</span></div>
        <button onClick={copy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', color: '#8b5cf6', fontSize: '11px', fontWeight: 700, fontFamily: FONT, cursor: 'pointer' }}>
          <Copy size={11} /> Copier
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg px-3 py-2" style={{ background: CARD_BG }}>
          <p style={{ color: MUTED, fontSize: '9px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 2, fontFamily: FONT }}>Client</p>
          <p style={{ color: TEXT, fontWeight: 700, fontSize: '12px', fontFamily: FONT }}>{order.customerName}</p>
        </div>
        <div className="rounded-lg px-3 py-2" style={{ background: CARD_BG }}>
          <p style={{ color: MUTED, fontSize: '9px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 2, fontFamily: FONT }}>Téléphone</p>
          <a href={`tel:${order.customerPhone}`} style={{ color: GOLD, fontWeight: 700, fontSize: '12px', textDecoration: 'none', fontFamily: FONT }}>{order.customerPhone}</a>
        </div>
        {order.customerAddress && (
          <div className="col-span-2 rounded-lg px-3 py-2" style={{ background: CARD_BG }}>
            <p style={{ color: MUTED, fontSize: '9px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 2, fontFamily: FONT }}>Adresse</p>
            <p style={{ color: TEXT, fontSize: '12px', fontFamily: FONT }}>{order.customerAddress}</p>
          </div>
        )}
        <div className="rounded-lg px-3 py-2" style={{ background: CARD_BG }}>
          <p style={{ color: MUTED, fontSize: '9px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 2, fontFamily: FONT }}>Montant</p>
          <p style={{ color: '#22c55e', fontWeight: 800, fontSize: '14px', fontFamily: FONT }}>{formatPrice(order.total)}</p>
        </div>
        <div className="rounded-lg px-3 py-2" style={{ background: CARD_BG }}>
          <p style={{ color: MUTED, fontSize: '9px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 2, fontFamily: FONT }}>Réf.</p>
          <p style={{ color: GOLD, fontWeight: 700, fontSize: '12px', fontFamily: FONT }}>#{order.orderRef}</p>
        </div>
      </div>
    </div>
  );
}

/* ── Order card ── */
function OrderCard({ order, onStatusChange, onDelete, BG, CARD_BG, BORDER, TEXT, MUTED, GOLD }: {
  order: OrderRow;
  onStatusChange: (ref: string, status: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  BG: string; CARD_BG: string; BORDER: string; TEXT: string; MUTED: string; GOLD: string;
}) {
  const [expanded, setExpanded]       = useState(false);
  const [updating, setUpdating]       = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting]       = useState(false);

  const actions   = NEXT_ACTIONS[order.status] ?? [];
  const color     = STATUS_COLOR[order.status] ?? MUTED;
  const isNew     = order.status === 'PENDING_WHATSAPP';
  const isShipped = order.status === 'SHIPPED';
  const isDone    = order.status === 'DELIVERED' || order.status === 'CANCELLED';

  const handleAction = async (nextStatus: string) => {
    setUpdating(true);
    await onStatusChange(order.orderRef, nextStatus);
    setUpdating(false);
    window.open(buildStatusWAUrl(order, nextStatus), '_blank');
  };

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete(order.id);
  };

  return (
    <div className="rounded-2xl overflow-hidden" style={{
      background: CARD_BG,
      border: `1px solid ${isNew ? 'rgba(245,158,11,0.35)' : BORDER}`,
      boxShadow: isNew ? '0 0 0 1px rgba(245,158,11,0.1)' : 'none',
      opacity: deleting ? 0 : 1,
      transform: deleting ? 'scale(0.97)' : 'scale(1)',
      transition: 'opacity 0.2s, transform 0.2s',
    }}>

      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start justify-between gap-3">

          {/* Left */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span style={{ color: GOLD, fontWeight: 800, fontSize: '13px', fontFamily: FONT }}>#{order.orderRef}</span>
              {isNew && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />
                  <span style={{ color: '#f59e0b', fontSize: '9px', fontWeight: 700, letterSpacing: '0.5px', fontFamily: FONT }}>NOUVEAU</span>
                </span>
              )}
              <span className="px-2 py-0.5 rounded-lg" style={{ background: `${color}18`, color, fontSize: '10px', fontWeight: 700, fontFamily: FONT }}>
                {STATUS_FR[order.status] ?? order.status}
              </span>
              <span style={{ color: MUTED, fontSize: '10px', fontFamily: FONT }}>{timeAgo(order.createdAt)}</span>
            </div>
            <p style={{ color: TEXT, fontWeight: 700, fontSize: '14px', fontFamily: FONT, marginBottom: 3 }}>{order.customerName}</p>
            <div className="flex items-center gap-3 flex-wrap">
              <a href={`tel:${order.customerPhone}`} className="flex items-center gap-1" style={{ color: MUTED, fontSize: '11px', textDecoration: 'none', fontFamily: FONT }}>
                <Phone size={10} /> {order.customerPhone}
              </a>
              {order.customerEmail && (
                <span className="flex items-center gap-1" style={{ color: MUTED, fontSize: '11px', fontFamily: FONT }}>
                  <Mail size={10} /> {order.customerEmail}
                </span>
              )}
            </div>
          </div>

          {/* Right: total */}
          <div className="text-right flex-shrink-0">
            <p style={{ color: GOLD, fontWeight: 800, fontSize: '17px', fontFamily: FONT }}>{formatPrice(order.total)}</p>
            <p style={{ color: MUTED, fontSize: '10px', fontFamily: FONT, marginTop: 1 }}>WhatsApp</p>
          </div>
        </div>

        {/* Confirmed hint */}
        {order.status === 'CONFIRMED' && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.18)' }}>
            <Truck size={11} color="#8b5cf6" />
            <span style={{ color: '#8b5cf6', fontSize: '11px', fontWeight: 600, fontFamily: FONT }}>Confirmée — déclenchez la livraison quand prête</span>
          </div>
        )}

        {/* Action buttons */}
        {actions.length > 0 && (
          <div className="flex gap-2 mt-3 flex-wrap">
            {actions.map(a => (
              <button key={a.status} onClick={() => handleAction(a.status)} disabled={updating}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '7px 14px', borderRadius: '10px', cursor: updating ? 'not-allowed' : 'pointer',
                  background: a.bg, border: `1px solid ${a.color}30`,
                  color: a.color, fontSize: '12px', fontWeight: 700, fontFamily: FONT,
                  opacity: updating ? 0.6 : 1,
                }}>
                {updating && <RefreshCw size={11} className="animate-spin" />}
                {a.label}
              </button>
            ))}
          </div>
        )}

        {/* Delivery sheet */}
        {isShipped && <DeliverySheet order={order} CARD_BG={CARD_BG} TEXT={TEXT} MUTED={MUTED} GOLD={GOLD} />}
      </div>

      {/* Footer */}
      <div className="px-4 pb-4 flex items-center gap-2 flex-wrap" style={{ borderTop: `1px solid ${BORDER}`, paddingTop: '10px' }}>
        <a href={`https://wa.me/${order.customerPhone.replace(/\D/g,'')}?text=${encodeURIComponent(`Bonjour,\n\nMise a jour commande *#${order.orderRef}* - Maison Marnoa.`)}`}
          target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
          style={{ background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.2)', color: '#25D366', fontSize: '11px', fontWeight: 700, textDecoration: 'none', fontFamily: FONT }}>
          <MessageCircle size={11} /> WhatsApp
        </a>
        <a href={apiUrl(`/api/receipts/${order.orderRef}/html`)} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
          style={{ background: 'rgba(201,162,39,0.07)', border: '1px solid rgba(201,162,39,0.18)', color: GOLD, fontSize: '11px', fontWeight: 700, textDecoration: 'none', fontFamily: FONT }}>
          <ExternalLink size={11} /> Reçu
        </a>
        <button onClick={() => setExpanded(v => !v)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg"
          style={{ background: 'transparent', border: `1px solid ${BORDER}`, color: MUTED, fontSize: '11px', fontFamily: FONT, cursor: 'pointer' }}>
          {expanded ? <><ChevronUp size={11} /> Réduire</> : <><ChevronDown size={11} /> Détails</>}
        </button>

        {/* Delete — terminal statuses */}
        {isDone && (
          <div className="ml-auto flex items-center gap-1.5">
            {deleteConfirm ? (
              <>
                <span style={{ color: MUTED, fontSize: '11px', fontFamily: FONT }}>Supprimer ?</span>
                <button onClick={handleDelete} disabled={deleting}
                  style={{ padding: '5px 10px', borderRadius: '7px', border: 'none', cursor: 'pointer', background: 'rgba(239,68,68,0.12)', color: '#ef4444', fontSize: '11px', fontWeight: 700, fontFamily: FONT }}>
                  {deleting ? '…' : 'Confirmer'}
                </button>
                <button onClick={() => setDeleteConfirm(false)}
                  style={{ padding: '5px 8px', borderRadius: '7px', border: `1px solid ${BORDER}`, cursor: 'pointer', background: 'none', color: MUTED, fontSize: '11px', fontFamily: FONT }}>
                  Annuler
                </button>
              </>
            ) : (
              <button onClick={() => setDeleteConfirm(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', borderRadius: '7px', border: `1px solid ${BORDER}`, cursor: 'pointer', background: 'none', color: MUTED, fontSize: '11px', fontFamily: FONT }}>
                <Trash2 size={11} /> Supprimer
              </button>
            )}
          </div>
        )}
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${BORDER}`, padding: '14px 16px', background: BG }}>
          {order.customerAddress && (
            <p style={{ color: MUTED, fontSize: '11px', marginBottom: 8, fontFamily: FONT }}>
              📍 <span style={{ color: TEXT }}>{order.customerAddress}</span>
            </p>
          )}
          {order.note && (
            <p style={{ color: MUTED, fontSize: '11px', marginBottom: 12, fontFamily: FONT }}>
              📝 <span style={{ color: TEXT, fontStyle: 'italic' }}>"{order.note}"</span>
            </p>
          )}
          {order.items && order.items.length > 0 && (
            <div className="flex flex-col gap-2">
              <p style={{ color: MUTED, fontSize: '9px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 4, fontFamily: FONT }}>Articles</p>
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package size={10} color={GOLD} />
                    <span style={{ color: TEXT, fontSize: '12px', fontFamily: FONT }}>{item.productName}</span>
                    {item.size && <span style={{ color: MUTED, fontSize: '10px', fontFamily: FONT }}>T.{item.size}</span>}
                  </div>
                  <span style={{ color: MUTED, fontSize: '11px', fontFamily: FONT }}>×{item.quantity} · {formatPrice(item.unitPrice)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Page principale ── */
export default function AdminOrders() {
  const { BG, CARD_BG, BORDER, TEXT, MUTED, GOLD } = useColors();
  const [filter, setFilter]         = useState<FilterKey>('ALL');
  const [rows, setRows]             = useState<OrderRow[]>([]);
  const [loading, setLoading]       = useState(true);
  const [clearConfirm, setClearConfirm] = useState(false);
  const [clearing, setClearing]     = useState(false);

  const load = async () => {
    setLoading(true);
    const q = new URLSearchParams({ limit: '100' });
    if (filter !== 'ALL') q.set('status', filter);
    try {
      const res = await fetch(apiUrl(`/api/admin/orders?${q}`), { credentials: 'include' });
      setRows(res.ok ? await res.json() as OrderRow[] : []);
    } catch { setRows([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); setClearConfirm(false); }, [filter]);

  const updateStatus = async (orderRef: string, nextStatus: string) => {
    const res = await fetch(apiUrl(`/api/orders/${orderRef}`), {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      credentials: 'include', body: JSON.stringify({ status: nextStatus }),
    });
    if (!res.ok) { toast.error('Erreur mise à jour'); return; }
    setRows(prev => prev.map(o => o.orderRef === orderRef ? { ...o, status: nextStatus } : o));
    toast(`#${orderRef} → ${STATUS_FR[nextStatus] ?? nextStatus}`);
  };

  const deleteOne = async (id: string) => {
    const res = await fetch(apiUrl('/api/admin/orders'), {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      credentials: 'include', body: JSON.stringify({ ids: [id] }),
    });
    if (!res.ok) { toast.error('Erreur suppression'); return; }
    setTimeout(() => setRows(prev => prev.filter(o => o.id !== id)), 220);
    toast('Commande supprimée');
  };

  const clearAll = async () => {
    if (rows.length === 0) return;
    setClearing(true);
    const ids = rows.map(o => o.id);
    const res = await fetch(apiUrl('/api/admin/orders'), {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      credentials: 'include', body: JSON.stringify({ ids }),
    });
    setClearing(false);
    if (!res.ok) { toast.error('Erreur suppression'); return; }
    const { deleted } = await res.json() as { deleted: number };
    setRows([]);
    setClearConfirm(false);
    toast.success(`${deleted} commande${deleted > 1 ? 's' : ''} supprimée${deleted > 1 ? 's' : ''}`);
  };

  const counts: Record<string, number> = {};
  rows.forEach(o => { counts[o.status] = (counts[o.status] ?? 0) + 1; });
  const newCount = counts['PENDING_WHATSAPP'] ?? 0;

  const filterLabel = FILTER_TABS.find(t => t.key === filter)?.label ?? '';

  return (
    <div className="flex flex-col gap-4">

      {/* ── Barre filtre + actions ── */}
      <div className="flex flex-col gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {FILTER_TABS.map(tab => {
            const count = tab.key === 'ALL' ? rows.length : (counts[tab.key] ?? 0);
            const active = filter === tab.key;
            return (
              <button key={tab.key} onClick={() => { setFilter(tab.key); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  padding: '6px 12px', borderRadius: '10px', cursor: 'pointer',
                  background: active ? 'rgba(201,162,39,0.12)' : CARD_BG,
                  border: `1px solid ${active ? GOLD : BORDER}`,
                  color: active ? GOLD : MUTED,
                  fontSize: '12px', fontWeight: 700, fontFamily: FONT,
                  transition: 'all 0.15s',
                }}>
                {tab.label}
                {count > 0 && (
                  <span style={{ padding: '1px 6px', borderRadius: '99px', background: active ? 'rgba(201,162,39,0.18)' : BG, fontSize: '10px', color: active ? GOLD : MUTED, fontFamily: FONT }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
          <button onClick={load}
            style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '10px', cursor: 'pointer', background: CARD_BG, border: `1px solid ${BORDER}`, color: MUTED, fontSize: '12px', fontFamily: FONT }}>
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Actualiser
          </button>
        </div>

        {/* Bandeau "Nouvelles" */}
        {newCount > 0 && filter === 'ALL' && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
            style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.25)' }}>
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse inline-block" />
            <span style={{ color: '#f59e0b', fontSize: '12px', fontWeight: 700, fontFamily: FONT }}>
              {newCount} nouvelle{newCount > 1 ? 's' : ''} commande{newCount > 1 ? 's' : ''} à traiter
            </span>
          </div>
        )}

        {/* Confirmation clear all */}
        {rows.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl"
            style={{ background: CARD_BG, border: `1px solid ${clearConfirm ? 'rgba(239,68,68,0.35)' : BORDER}`, transition: 'border-color 0.2s' }}>
            {clearConfirm ? (
              <>
                <AlertTriangle size={14} color="#ef4444" />
                <span style={{ color: TEXT, fontSize: '12px', fontFamily: FONT, flex: 1 }}>
                  Supprimer définitivement les <strong>{rows.length}</strong> commandes {filter !== 'ALL' && `"${filterLabel}"`} ?
                </span>
                <button onClick={() => setClearConfirm(false)}
                  style={{ padding: '5px 12px', borderRadius: '8px', border: `1px solid ${BORDER}`, cursor: 'pointer', background: 'none', color: MUTED, fontSize: '12px', fontFamily: FONT }}>
                  Annuler
                </button>
                <button onClick={clearAll} disabled={clearing}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 14px', borderRadius: '8px', border: 'none', cursor: clearing ? 'not-allowed' : 'pointer', background: '#ef4444', color: '#fff', fontSize: '12px', fontWeight: 700, fontFamily: FONT, opacity: clearing ? 0.7 : 1 }}>
                  {clearing ? <RefreshCw size={11} className="animate-spin" /> : <Trash2 size={11} />}
                  {clearing ? 'Suppression…' : 'Confirmer'}
                </button>
              </>
            ) : (
              <>
                <span style={{ color: MUTED, fontSize: '12px', fontFamily: FONT, flex: 1 }}>
                  {rows.length} commande{rows.length > 1 ? 's' : ''} {filter !== 'ALL' ? `"${filterLabel}"` : 'au total'}
                </span>
                <button onClick={() => setClearConfirm(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '8px', border: `1px solid rgba(239,68,68,0.3)`, cursor: 'pointer', background: 'rgba(239,68,68,0.06)', color: '#ef4444', fontSize: '12px', fontWeight: 700, fontFamily: FONT }}>
                  <Trash2 size={11} /> Tout supprimer
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Liste ── */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw size={20} color={GOLD} className="animate-spin" />
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Package size={32} color={BORDER} strokeWidth={1.5} />
          <p style={{ color: MUTED, fontFamily: FONT, fontSize: '13px' }}>Aucune commande{filter !== 'ALL' ? ` dans "${filterLabel}"` : ''}.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              onStatusChange={updateStatus}
              onDelete={deleteOne}
              BG={BG} CARD_BG={CARD_BG} BORDER={BORDER} TEXT={TEXT} MUTED={MUTED} GOLD={GOLD}
            />
          ))}
        </div>
      )}
    </div>
  );
}
