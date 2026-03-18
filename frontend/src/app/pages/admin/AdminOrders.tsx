import { useEffect, useState } from 'react';
import { formatPrice } from '../../data/products';
import { apiUrl } from '../../lib/api';

type OrderRow = {
  id: string;
  orderRef: string;
  status: string;
  customerName: string;
  customerPhone: string;
  total: number;
  createdAt: string;
};

const STATUSES = ['ALL', 'PENDING_WHATSAPP', 'CONFIRMED', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;

export default function AdminOrders() {
  const [status, setStatus] = useState<(typeof STATUSES)[number]>('ALL');
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      const query = new URLSearchParams({ limit: '100' });
      if (status !== 'ALL') query.set('status', status);

      try {
        const res = await fetch(apiUrl(`/api/admin/orders?${query.toString()}`));
        if (!res.ok) throw new Error('Failed to fetch admin orders');
        const data = (await res.json()) as OrderRow[];
        if (!cancelled) setRows(data);
      } catch {
        if (!cancelled) setRows([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [status]);

  const updateStatus = async (orderRef: string, nextStatus: string) => {
    const res = await fetch(apiUrl(`/api/orders/${orderRef}`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    });

    if (!res.ok) return;

    setRows(prev => prev.map(order => (order.orderRef === orderRef ? { ...order, status: nextStatus } : order)));
  };

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {STATUSES.map(s => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            style={{
              padding: '6px 10px',
              borderRadius: '10px',
              border: `1px solid ${status === s ? '#C9A227' : '#3A2E1E'}`,
              background: status === s ? 'rgba(201,162,39,0.12)' : '#1E1A12',
              color: status === s ? '#C9A227' : '#9A8A74',
              fontSize: '11px',
              fontFamily: 'Manrope, sans-serif',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #3A2E1E' }}>
        <div className="grid grid-cols-[140px_1fr_120px_120px_170px_160px] px-4 py-3" style={{ background: '#1E1A12', borderBottom: '1px solid #3A2E1E' }}>
          {['Référence', 'Client', 'Statut', 'Total', 'Date', 'Action'].map(h => (
            <span key={h} style={{ color: '#9A8A74', fontSize: '11px', fontWeight: 700, fontFamily: 'Manrope, sans-serif' }}>{h}</span>
          ))}
        </div>

        {loading ? (
          <div className="px-4 py-6" style={{ color: '#9A8A74', fontFamily: 'Manrope, sans-serif' }}>Chargement des commandes…</div>
        ) : rows.length === 0 ? (
          <div className="px-4 py-6" style={{ color: '#9A8A74', fontFamily: 'Manrope, sans-serif' }}>Aucune commande.</div>
        ) : (
          rows.map((order, idx) => (
            <div
              key={order.id}
              className="grid grid-cols-[140px_1fr_120px_120px_170px_160px] px-4 py-3 items-center"
              style={{ background: idx % 2 ? '#1A1410' : '#1E1A12', borderBottom: '1px solid #2A2218' }}
            >
              <span style={{ color: '#C9A227', fontSize: '11px', fontWeight: 700, fontFamily: 'Manrope, sans-serif' }}>{order.orderRef}</span>
              <div>
                <p style={{ color: '#F5EFE0', fontSize: '12px', fontWeight: 700, fontFamily: 'Manrope, sans-serif' }}>{order.customerName}</p>
                <p style={{ color: '#9A8A74', fontSize: '10px', fontFamily: 'Manrope, sans-serif' }}>{order.customerPhone}</p>
              </div>
              <span style={{ color: '#9A8A74', fontSize: '11px', fontFamily: 'Manrope, sans-serif' }}>{order.status}</span>
              <span style={{ color: '#F5EFE0', fontSize: '12px', fontWeight: 700, fontFamily: 'Manrope, sans-serif' }}>{formatPrice(order.total)}</span>
              <span style={{ color: '#9A8A74', fontSize: '11px', fontFamily: 'Manrope, sans-serif' }}>{new Date(order.createdAt).toLocaleString('fr-CI')}</span>
              <select
                value={order.status}
                onChange={e => updateStatus(order.orderRef, e.target.value)}
                style={{
                  background: '#2A2218',
                  border: '1px solid #3A2E1E',
                  color: '#F5EFE0',
                  borderRadius: '8px',
                  padding: '6px',
                  fontSize: '11px',
                  fontFamily: 'Manrope, sans-serif',
                }}
              >
                {STATUSES.filter(s => s !== 'ALL').map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
