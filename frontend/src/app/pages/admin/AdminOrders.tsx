import { useEffect, useState } from 'react';
import { MessageCircle, ExternalLink } from 'lucide-react';
import { formatPrice } from '../../data/products';
import { apiUrl } from '../../lib/api';

type OrderRow = {
  id: string;
  orderRef: string;
  status: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  total: number;
  paymentMethod: string;
  createdAt: string;
};

type Notification = {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  status: string;
  meta?: { waClickUrl?: string; direction?: string };
};

const STATUSES = ['ALL', 'PENDING_WHATSAPP', 'CONFIRMED', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;

const STATUS_COLORS: Record<string, string> = {
  PENDING_WHATSAPP: '#C9A227',
  CONFIRMED:        '#3b82f6',
  PAID:             '#22c55e',
  SHIPPED:          '#8b5cf6',
  DELIVERED:        '#10b981',
  CANCELLED:        '#ef4444',
};

const STATUS_FR: Record<string, string> = {
  PENDING_WHATSAPP: 'En attente',
  CONFIRMED:        'Confirmée',
  PAID:             'Payée',
  SHIPPED:          'Expédiée',
  DELIVERED:        'Livrée',
  CANCELLED:        'Annulée',
};

function buildClientWAUrl(phone: string, orderRef: string): string {
  const clean = phone.replace(/\D/g, '');
  const msg = encodeURIComponent(
    `👋 Bonjour,\n\nVoici une mise à jour concernant votre commande *#${orderRef}* — Maison Marnoa.`
  );
  return `https://wa.me/${clean}?text=${msg}`;
}

export default function AdminOrders() {
  const [status, setStatus]     = useState<(typeof STATUSES)[number]>('ALL');
  const [rows, setRows]         = useState<OrderRow[]>([]);
  const [loading, setLoading]   = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const query = new URLSearchParams({ limit: '100' });
      if (status !== 'ALL') query.set('status', status);
      try {
        const [ordersRes, notifsRes] = await Promise.all([
          fetch(apiUrl(`/api/admin/orders?${query.toString()}`)),
          fetch(apiUrl('/api/admin/notifications?limit=20')),
        ]);
        const [orders, notifs] = await Promise.all([ordersRes.json(), notifsRes.json()]);
        if (!cancelled) {
          setRows(orders as OrderRow[]);
          setNotifications(notifs as Notification[]);
        }
      } catch {
        if (!cancelled) setRows([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [status]);

  const updateStatus = async (orderRef: string, nextStatus: string) => {
    const res = await fetch(apiUrl(`/api/orders/${orderRef}`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    });
    if (!res.ok) return;
    setRows(prev => prev.map(o => o.orderRef === orderRef ? { ...o, status: nextStatus } : o));

    // Find latest notification for this order to show client link
    setTimeout(async () => {
      const res2 = await fetch(apiUrl('/api/admin/notifications?limit=20'));
      if (res2.ok) setNotifications(await res2.json());
    }, 800);
  };

  const pendingClientNotifs = notifications.filter(
    n => n.meta?.direction === 'TO_CLIENT' && n.status === 'QUEUED'
  );

  return (
    <div>
      {/* Notifications client à envoyer */}
      {pendingClientNotifs.length > 0 && (
        <div className="mb-5 rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(37,211,102,0.3)', background: 'rgba(37,211,102,0.04)' }}>
          <button
            className="w-full flex items-center justify-between px-5 py-4"
            onClick={() => setShowNotifs(v => !v)}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span style={{ color: '#F5EFE0', fontWeight: 700, fontSize: '13px', fontFamily: 'Manrope, sans-serif' }}>
                {pendingClientNotifs.length} notification{pendingClientNotifs.length > 1 ? 's' : ''} client à envoyer
              </span>
            </div>
            <span style={{ color: '#9A8A74', fontSize: '11px', fontFamily: 'Manrope, sans-serif' }}>
              {showNotifs ? 'Masquer ↑' : 'Voir ↓'}
            </span>
          </button>
          {showNotifs && (
            <div style={{ borderTop: '1px solid #2A2218' }}>
              {pendingClientNotifs.map(n => (
                <div key={n.id} className="flex items-start gap-4 px-5 py-3" style={{ borderBottom: '1px solid #2A2218' }}>
                  <div className="flex-1">
                    <p style={{ color: '#F5EFE0', fontSize: '11px', fontFamily: 'Manrope, sans-serif', whiteSpace: 'pre-line', lineHeight: 1.5 }}>
                      {n.message}
                    </p>
                    <p style={{ color: '#9A8A74', fontSize: '10px', marginTop: '4px', fontFamily: 'Manrope, sans-serif' }}>
                      {new Date(n.createdAt).toLocaleString('fr-CI')}
                    </p>
                  </div>
                  {n.meta?.waClickUrl && (
                    <a
                      href={n.meta.waClickUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg,#25D366,#128C7E)', color: '#fff', fontSize: '11px', fontWeight: 700, fontFamily: 'Manrope, sans-serif', textDecoration: 'none' }}
                    >
                      <MessageCircle size={12} />
                      Envoyer
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filtres statuts */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {STATUSES.map(s => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            style={{
              padding: '6px 10px', borderRadius: '10px',
              border: `1px solid ${status === s ? '#C9A227' : '#3A2E1E'}`,
              background: status === s ? 'rgba(201,162,39,0.12)' : '#1E1A12',
              color: status === s ? '#C9A227' : '#9A8A74',
              fontSize: '11px', fontFamily: 'Manrope, sans-serif', fontWeight: 700, cursor: 'pointer',
            }}
          >
            {s === 'ALL' ? 'Toutes' : STATUS_FR[s] ?? s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #3A2E1E' }}>
        <div className="grid px-4 py-3" style={{ gridTemplateColumns: '140px 1fr 110px 110px 150px 200px', background: '#1E1A12', borderBottom: '1px solid #3A2E1E' }}>
          {['Référence', 'Client', 'Statut', 'Total', 'Date', 'Actions'].map(h => (
            <span key={h} style={{ color: '#9A8A74', fontSize: '11px', fontWeight: 700, fontFamily: 'Manrope, sans-serif' }}>{h}</span>
          ))}
        </div>

        {loading ? (
          <div className="px-4 py-6" style={{ color: '#9A8A74', fontFamily: 'Manrope, sans-serif' }}>Chargement…</div>
        ) : rows.length === 0 ? (
          <div className="px-4 py-6" style={{ color: '#9A8A74', fontFamily: 'Manrope, sans-serif' }}>Aucune commande.</div>
        ) : (
          rows.map((order, idx) => (
            <div
              key={order.id}
              className="grid items-center px-4 py-3"
              style={{ gridTemplateColumns: '140px 1fr 110px 110px 150px 200px', background: idx % 2 ? '#1A1410' : '#1E1A12', borderBottom: '1px solid #2A2218' }}
            >
              <span style={{ color: '#C9A227', fontSize: '11px', fontWeight: 700, fontFamily: 'Manrope, sans-serif' }}>
                {order.orderRef}
              </span>

              <div>
                <p style={{ color: '#F5EFE0', fontSize: '12px', fontWeight: 700, fontFamily: 'Manrope, sans-serif' }}>{order.customerName}</p>
                <p style={{ color: '#9A8A74', fontSize: '10px', fontFamily: 'Manrope, sans-serif' }}>{order.customerPhone}</p>
              </div>

              <span
                className="px-2 py-1 rounded-lg text-center inline-block"
                style={{ color: STATUS_COLORS[order.status] ?? '#9A8A74', fontSize: '10px', fontWeight: 700, fontFamily: 'Manrope, sans-serif', background: `${STATUS_COLORS[order.status] ?? '#9A8A74'}18` }}
              >
                {STATUS_FR[order.status] ?? order.status}
              </span>

              <span style={{ color: '#F5EFE0', fontSize: '12px', fontWeight: 700, fontFamily: 'Manrope, sans-serif' }}>
                {formatPrice(order.total)}
              </span>

              <span style={{ color: '#9A8A74', fontSize: '10px', fontFamily: 'Manrope, sans-serif' }}>
                {new Date(order.createdAt).toLocaleString('fr-CI')}
              </span>

              <div className="flex items-center gap-2">
                <select
                  value={order.status}
                  onChange={e => updateStatus(order.orderRef, e.target.value)}
                  style={{ background: '#2A2218', border: '1px solid #3A2E1E', color: '#F5EFE0', borderRadius: '8px', padding: '5px', fontSize: '10px', fontFamily: 'Manrope, sans-serif', flex: 1 }}
                >
                  {STATUSES.filter(s => s !== 'ALL').map(s => (
                    <option key={s} value={s}>{STATUS_FR[s] ?? s}</option>
                  ))}
                </select>
                <a
                  href={buildClientWAUrl(order.customerPhone, order.orderRef)}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Contacter le client sur WhatsApp"
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(37,211,102,0.15)', border: '1px solid rgba(37,211,102,0.25)' }}
                >
                  <MessageCircle size={13} color="#25D366" />
                </a>
                <a
                  href={apiUrl(`/api/receipts/${order.orderRef}/html`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Voir le reçu"
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(201,162,39,0.12)', border: '1px solid rgba(201,162,39,0.2)' }}
                >
                  <ExternalLink size={13} color="#C9A227" />
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
