import { useEffect, useMemo, useState } from 'react';
import { formatPrice } from '../../data/products';
import { apiUrl } from '../../lib/api';

type DashboardResponse = {
  metrics: {
    totalProducts: number;
    totalOrders: number;
    revenuePaid: number;
    lowStockCount: number;
    statuses: Record<string, number>;
  };
  salesByDay: Array<{ date: string; amount: number; orders: number }>;
  notifications: Array<{ id: string; type: string; message: string; createdAt: string; status: string }>;
};

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(apiUrl('/api/admin/dashboard'));
        if (!res.ok) throw new Error('Failed to load dashboard');
        const json = (await res.json()) as DashboardResponse;
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setError('Impossible de charger le dashboard admin.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const statusRows = useMemo(() => {
    const statuses = data?.metrics.statuses || {};
    return Object.entries(statuses).sort((a, b) => b[1] - a[1]);
  }, [data?.metrics.statuses]);

  if (loading) {
    return <p style={{ color: '#9A8A74', fontFamily: 'Manrope, sans-serif' }}>Chargement dashboard…</p>;
  }

  if (error) {
    return <p style={{ color: '#ef4444', fontFamily: 'Manrope, sans-serif' }}>{error}</p>;
  }

  if (!data) return null;

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Produits', value: data.metrics.totalProducts },
          { label: 'Commandes', value: data.metrics.totalOrders },
          { label: 'CA payé', value: formatPrice(data.metrics.revenuePaid) },
          { label: 'Stock critique', value: data.metrics.lowStockCount },
        ].map(card => (
          <div key={card.label} className="rounded-2xl p-4" style={{ background: '#1E1A12', border: '1px solid #3A2E1E' }}>
            <p style={{ color: '#9A8A74', fontSize: '11px', marginBottom: '6px', fontFamily: 'Manrope, sans-serif' }}>{card.label}</p>
            <p style={{ color: '#F5EFE0', fontSize: '24px', fontWeight: 800, fontFamily: 'Manrope, sans-serif' }}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl p-5" style={{ background: '#1E1A12', border: '1px solid #3A2E1E' }}>
          <h3 style={{ color: '#C9A227', fontSize: '13px', fontWeight: 700, marginBottom: '12px', fontFamily: 'Manrope, sans-serif' }}>Statuts commandes</h3>
          <div className="flex flex-col gap-2">
            {statusRows.map(([status, count]) => (
              <div key={status} className="flex justify-between">
                <span style={{ color: '#9A8A74', fontSize: '12px', fontFamily: 'Manrope, sans-serif' }}>{status}</span>
                <span style={{ color: '#F5EFE0', fontSize: '12px', fontWeight: 700, fontFamily: 'Manrope, sans-serif' }}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl p-5" style={{ background: '#1E1A12', border: '1px solid #3A2E1E' }}>
          <h3 style={{ color: '#C9A227', fontSize: '13px', fontWeight: 700, marginBottom: '12px', fontFamily: 'Manrope, sans-serif' }}>Ventes récentes</h3>
          <div className="flex flex-col gap-2">
            {data.salesByDay.slice(-8).map(row => (
              <div key={row.date} className="flex justify-between">
                <span style={{ color: '#9A8A74', fontSize: '12px', fontFamily: 'Manrope, sans-serif' }}>{row.date}</span>
                <span style={{ color: '#F5EFE0', fontSize: '12px', fontWeight: 700, fontFamily: 'Manrope, sans-serif' }}>{formatPrice(row.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl p-5" style={{ background: '#1E1A12', border: '1px solid #3A2E1E' }}>
        <h3 style={{ color: '#C9A227', fontSize: '13px', fontWeight: 700, marginBottom: '12px', fontFamily: 'Manrope, sans-serif' }}>Notifications WhatsApp</h3>
        <div className="flex flex-col gap-2">
          {data.notifications.slice(0, 10).map(row => (
            <div key={row.id} className="flex justify-between gap-4" style={{ borderBottom: '1px solid #2A2218', paddingBottom: '8px' }}>
              <div>
                <p style={{ color: '#F5EFE0', fontSize: '12px', fontFamily: 'Manrope, sans-serif' }}>{row.message}</p>
                <p style={{ color: '#9A8A74', fontSize: '10px', fontFamily: 'Manrope, sans-serif' }}>{new Date(row.createdAt).toLocaleString('fr-CI')}</p>
              </div>
              <span style={{ color: '#C9A227', fontSize: '10px', fontWeight: 700, fontFamily: 'Manrope, sans-serif', whiteSpace: 'nowrap' }}>{row.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
