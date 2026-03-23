import { useEffect, useMemo, useState } from 'react';
import { formatPrice } from '../../data/products';
import { apiUrl } from '../../lib/api';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, ShoppingBag, Package, AlertTriangle, Bell } from 'lucide-react';
import { useColors } from '../../context/AppContext';

type DashboardResponse = {
  metrics: {
    totalProducts: number;
    totalOrders: number;
    revenuePaid: number;
    lowStockCount: number;
    statuses: Record<string, number>;
  };
  salesByDay: Array<{ date: string; amount: number; orders: number }>;
  topProducts: Array<{ productId: string | null; productName: string; quantitySold: number; revenue: number }>;
  notifications: Array<{ id: string; type: string; message: string; createdAt: string; status: string; meta?: Record<string, string> }>;
};

const STATUS_FR: Record<string, string> = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmée',
  PAID: 'Payée',
  SHIPPED: 'Expédiée',
  DELIVERED: 'Livrée',
  CANCELLED: 'Annulée',
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: '#f59e0b',
  CONFIRMED: '#3b82f6',
  PAID: '#22c55e',
  SHIPPED: '#a78bfa',
  DELIVERED: '#C9A227',
  CANCELLED: '#ef4444',
};

function SalesTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  const { CARD_BG, BORDER, MUTED, GOLD } = useColors();
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '10px 14px' }}>
      <p style={{ color: MUTED, fontSize: '11px', fontFamily: 'Manrope, sans-serif', marginBottom: '4px' }}>{label}</p>
      <p style={{ color: GOLD, fontSize: '14px', fontWeight: 700, fontFamily: 'Manrope, sans-serif' }}>
        {formatPrice(payload[0]?.value ?? 0)}
      </p>
    </div>
  );
}

function BarTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  const { CARD_BG, BORDER, MUTED, GOLD } = useColors();
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '10px 14px', maxWidth: '200px' }}>
      <p style={{ color: MUTED, fontSize: '11px', fontFamily: 'Manrope, sans-serif', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</p>
      <p style={{ color: GOLD, fontSize: '14px', fontWeight: 700, fontFamily: 'Manrope, sans-serif' }}>
        {formatPrice(payload[0]?.value ?? 0)}
      </p>
    </div>
  );
}

export default function AdminDashboard() {
  const { CARD_BG, BORDER, TEXT, MUTED, GOLD } = useColors();
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
        if (!res.ok) throw new Error('Failed');
        const json = (await res.json()) as DashboardResponse;
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setError('Impossible de charger le dashboard admin.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const statusRows = useMemo(() => {
    const statuses = data?.metrics.statuses || {};
    return Object.entries(statuses).sort((a, b) => b[1] - a[1]);
  }, [data?.metrics.statuses]);

  const salesChartData = useMemo(() => {
    if (!data?.salesByDay) return [];
    return data.salesByDay.slice(-14).map(row => ({ ...row, label: row.date.slice(5) }));
  }, [data?.salesByDay]);

  const topChartData = useMemo(() => {
    if (!data?.topProducts) return [];
    return data.topProducts.slice(0, 5).map(p => ({
      name: p.productName.length > 18 ? p.productName.slice(0, 18) + '…' : p.productName,
      revenue: p.revenue,
    }));
  }, [data?.topProducts]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p style={{ color: MUTED, fontFamily: 'Manrope, sans-serif' }}>Chargement dashboard…</p>
      </div>
    );
  }

  if (error) return <p style={{ color: '#ef4444', fontFamily: 'Manrope, sans-serif' }}>{error}</p>;
  if (!data) return null;

  const kpis = [
    { label: 'Chiffre d\'affaires', value: formatPrice(data.metrics.revenuePaid), icon: TrendingUp, color: '#C9A227', bg: 'rgba(201,162,39,0.08)' },
    { label: 'Commandes',           value: data.metrics.totalOrders,              icon: ShoppingBag, color: '#3b82f6', bg: 'rgba(59,130,246,0.08)' },
    { label: 'Produits',            value: data.metrics.totalProducts,            icon: Package,     color: '#a78bfa', bg: 'rgba(167,139,250,0.08)' },
    {
      label: 'Stock critique',
      value: data.metrics.lowStockCount,
      icon: AlertTriangle,
      color: data.metrics.lowStockCount > 0 ? '#ef4444' : MUTED,
      bg:    data.metrics.lowStockCount > 0 ? 'rgba(239,68,68,0.08)' : 'rgba(148,163,184,0.05)',
    },
  ];

  return (
    <div className="grid gap-6">

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <div key={kpi.label} className="rounded-2xl p-5"
            style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
            <div className="flex items-center justify-between mb-3">
              <p style={{ color: MUTED, fontSize: '11px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', fontFamily: 'Manrope, sans-serif' }}>
                {kpi.label}
              </p>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: kpi.bg }}>
                <kpi.icon size={14} color={kpi.color} />
              </div>
            </div>
            <p style={{ color: TEXT, fontSize: '26px', fontWeight: 800, fontFamily: 'Manrope, sans-serif', lineHeight: 1 }}>
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* Sales Chart */}
      {salesChartData.length > 0 && (
        <div className="rounded-2xl p-5" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
          <h3 style={{ color: GOLD, fontSize: '13px', fontWeight: 700, fontFamily: 'Manrope, sans-serif', marginBottom: '20px' }}>
            Ventes — 14 derniers jours
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={salesChartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={BORDER} vertical={false} />
              <XAxis dataKey="label" tick={{ fill: MUTED, fontSize: 11, fontFamily: 'Manrope, sans-serif' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: MUTED, fontSize: 10, fontFamily: 'Manrope, sans-serif' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} width={40} />
              <Tooltip content={<SalesTooltip />} />
              <Line type="monotone" dataKey="amount" stroke={GOLD} strokeWidth={2.5} dot={{ fill: GOLD, r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: '#E8C84A', strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* Top Products */}
        {topChartData.length > 0 && (
          <div className="rounded-2xl p-5" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
            <h3 style={{ color: GOLD, fontSize: '13px', fontWeight: 700, marginBottom: '16px', fontFamily: 'Manrope, sans-serif' }}>
              Top 5 produits
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={topChartData} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER} horizontal={false} />
                <XAxis type="number" tick={{ fill: MUTED, fontSize: 10, fontFamily: 'Manrope, sans-serif' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" tick={{ fill: MUTED, fontSize: 10, fontFamily: 'Manrope, sans-serif' }} axisLine={false} tickLine={false} width={90} />
                <Tooltip content={<BarTooltip />} />
                <Bar dataKey="revenue" fill={GOLD} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Order Statuses */}
        <div className="rounded-2xl p-5" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
          <h3 style={{ color: GOLD, fontSize: '13px', fontWeight: 700, marginBottom: '16px', fontFamily: 'Manrope, sans-serif' }}>
            Statuts commandes
          </h3>
          <div className="flex flex-col gap-3">
            {statusRows.map(([status, count]) => {
              const color = STATUS_COLOR[status] ?? MUTED;
              const total = statusRows.reduce((s, [, n]) => s + n, 0);
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={status}>
                  <div className="flex justify-between mb-1">
                    <span style={{ color: MUTED, fontSize: '12px', fontFamily: 'Manrope, sans-serif' }}>{STATUS_FR[status] ?? status}</span>
                    <span style={{ color: TEXT, fontSize: '12px', fontWeight: 700, fontFamily: 'Manrope, sans-serif' }}>{count}</span>
                  </div>
                  <div style={{ height: '4px', background: BORDER, borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '2px', transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              );
            })}
            {statusRows.length === 0 && (
              <p style={{ color: MUTED, fontSize: '12px', fontFamily: 'Manrope, sans-serif' }}>Aucune commande.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Notifications */}
      {data.notifications.length > 0 && (
        <div className="rounded-2xl p-5" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
          <div className="flex items-center gap-2 mb-4">
            <Bell size={14} color={GOLD} />
            <h3 style={{ color: GOLD, fontSize: '13px', fontWeight: 700, fontFamily: 'Manrope, sans-serif' }}>
              Notifications récentes
            </h3>
          </div>
          <div className="flex flex-col gap-0">
            {data.notifications.slice(0, 8).map((row, i) => (
              <div key={row.id} className="flex items-start justify-between gap-4 py-3"
                style={{ borderBottom: i < Math.min(data.notifications.length, 8) - 1 ? `1px solid ${BORDER}` : 'none' }}>
                <div className="flex-1 min-w-0">
                  <p style={{ color: TEXT, fontSize: '12px', fontFamily: 'Manrope, sans-serif', lineHeight: 1.5 }}>{row.message}</p>
                  <p style={{ color: MUTED, fontSize: '10px', fontFamily: 'Manrope, sans-serif', marginTop: '2px' }}>
                    {new Date(row.createdAt).toLocaleString('fr-CI')}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {row.meta?.waClickUrl && (
                    <a href={row.meta.waClickUrl} target="_blank" rel="noopener noreferrer"
                      style={{ background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.25)', color: '#25D366', fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: '8px', fontFamily: 'Manrope, sans-serif', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                      WhatsApp
                    </a>
                  )}
                  <span style={{ color: GOLD, fontSize: '10px', fontWeight: 700, fontFamily: 'Manrope, sans-serif' }}>{row.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
