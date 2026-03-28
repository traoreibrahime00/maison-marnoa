import { useEffect, useMemo, useState } from 'react';
import { formatPrice } from '../../data/products';
import { apiUrl } from '../../lib/api';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, ShoppingBag, Package, AlertTriangle, Bell, Trash2, X, RefreshCw, MessageCircle, Users, Eye, FileText } from 'lucide-react';
import { useColors } from '../../context/AppContext';
import { toast } from 'sonner';

const FONT = 'Manrope, sans-serif';

type Notif = {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  status: string;
  meta?: Record<string, string>;
};

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
  notifications: Notif[];
};

type AnalyticsSummary = {
  totals: Record<string, number>;
  pageViewTimeline: Array<{ date: string; views: number }>;
  topPages: Array<{ path: string; views: number }>;
};

function PageViewTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  const { CARD_BG, BORDER, MUTED, TEXT } = useColors();
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '10px 14px' }}>
      <p style={{ color: MUTED, fontSize: '11px', fontFamily: FONT, marginBottom: '4px' }}>{label}</p>
      <p style={{ color: TEXT, fontSize: '14px', fontWeight: 700, fontFamily: FONT }}>{payload[0]?.value ?? 0} vues</p>
    </div>
  );
}

const PAGE_LABELS: Record<string, string> = {
  '/': 'Accueil',
  '/collection': 'Collection',
  '/collections': 'Collection',
  '/cart': 'Panier',
  '/checkout': 'Checkout',
  '/wishlist': 'Favoris',
  '/appointment': 'Rendez-vous',
  '/login': 'Connexion',
  '/search': 'Recherche',
  '/orders': 'Commandes',
  '/profile': 'Profil',
};

const STATUS_FR: Record<string, string> = {
  PENDING: 'En attente', CONFIRMED: 'Confirmée', PAID: 'Payée',
  SHIPPED: 'Expédiée',   DELIVERED: 'Livrée',    CANCELLED: 'Annulée',
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: '#f59e0b', CONFIRMED: '#3b82f6', PAID: '#22c55e',
  SHIPPED: '#a78bfa', DELIVERED: '#C9A227', CANCELLED: '#ef4444',
};

function SalesTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  const { CARD_BG, BORDER, MUTED, GOLD } = useColors();
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '10px 14px' }}>
      <p style={{ color: MUTED, fontSize: '11px', fontFamily: FONT, marginBottom: '4px' }}>{label}</p>
      <p style={{ color: GOLD, fontSize: '14px', fontWeight: 700, fontFamily: FONT }}>{formatPrice(payload[0]?.value ?? 0)}</p>
    </div>
  );
}

function BarTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  const { CARD_BG, BORDER, MUTED, GOLD } = useColors();
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '10px 14px', maxWidth: '200px' }}>
      <p style={{ color: MUTED, fontSize: '11px', fontFamily: FONT, marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</p>
      <p style={{ color: GOLD, fontSize: '14px', fontWeight: 700, fontFamily: FONT }}>{formatPrice(payload[0]?.value ?? 0)}</p>
    </div>
  );
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

export default function AdminDashboard() {
  const { CARD_BG, BG, BORDER, TEXT, MUTED, GOLD } = useColors();
  const [data, setData]         = useState<DashboardResponse | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [notifs, setNotifs]     = useState<Notif[]>([]);
  const [deletingId, setDeletingId]   = useState<string | null>(null);
  const [clearConfirm, setClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true); setError('');
      try {
        const [dashRes, analyticsRes] = await Promise.all([
          fetch(apiUrl('/api/admin/dashboard'), { credentials: 'include' }),
          fetch(apiUrl('/api/track/summary?days=30'), { credentials: 'include' }),
        ]);
        if (!dashRes.ok) throw new Error('Failed');
        const json = await dashRes.json() as DashboardResponse;
        if (!cancelled) { setData(json); setNotifs(json.notifications ?? []); }
        if (analyticsRes.ok) {
          const analyticsJson = await analyticsRes.json() as AnalyticsSummary;
          if (!cancelled) setAnalytics(analyticsJson);
        }
      } catch {
        if (!cancelled) setError('Impossible de charger le dashboard.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const deleteNotif = async (id: string) => {
    setDeletingId(id);
    setNotifs(prev => prev.filter(n => n.id !== id)); // optimistic
    try {
      const res = await fetch(apiUrl('/api/admin/notifications'), {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        credentials: 'include', body: JSON.stringify({ ids: [id] }),
      });
      if (!res.ok) toast.error('Erreur suppression');
    } catch { toast.error('Erreur réseau'); }
    finally { setDeletingId(null); }
  };

  const clearAllNotifs = async () => {
    if (notifs.length === 0) return;
    setClearing(true);
    const ids = notifs.map(n => n.id);
    setNotifs([]); // optimistic
    setClearConfirm(false);
    try {
      const res = await fetch(apiUrl('/api/admin/notifications'), {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        credentials: 'include', body: JSON.stringify({ ids }),
      });
      if (res.ok) {
        const { deleted } = await res.json() as { deleted: number };
        toast.success(`${deleted} notification${deleted > 1 ? 's' : ''} effacée${deleted > 1 ? 's' : ''}`);
      } else {
        toast.error('Erreur suppression');
      }
    } catch { toast.error('Erreur réseau'); }
    finally { setClearing(false); }
  };

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
      <div className="flex items-center justify-center py-24 gap-2">
        <RefreshCw size={16} color={GOLD} className="animate-spin" />
        <p style={{ color: MUTED, fontFamily: FONT }}>Chargement…</p>
      </div>
    );
  }

  if (error) return <p style={{ color: '#ef4444', fontFamily: FONT }}>{error}</p>;
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
    <div className="grid gap-5">

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map(kpi => (
          <div key={kpi.label} className="rounded-2xl p-4 lg:p-5"
            style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
            <div className="flex items-center justify-between mb-3">
              <p style={{ color: MUTED, fontSize: '10px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', fontFamily: FONT }}>
                {kpi.label}
              </p>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: kpi.bg }}>
                <kpi.icon size={14} color={kpi.color} />
              </div>
            </div>
            <p style={{ color: TEXT, fontSize: 'clamp(18px,3vw,26px)', fontWeight: 800, fontFamily: FONT, lineHeight: 1 }}>
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Analytics ── */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* KPIs visiteurs */}
          <div className="rounded-2xl p-5" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
            <h3 style={{ color: GOLD, fontSize: '13px', fontWeight: 700, fontFamily: FONT, marginBottom: '16px' }}>
              Audience — 30 derniers jours
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Sessions', value: analytics.totals['SESSION_START'] ?? 0, icon: Users, color: '#3b82f6', bg: 'rgba(59,130,246,0.08)' },
                { label: 'Pages vues', value: analytics.totals['PAGE_VIEW'] ?? 0, icon: Eye, color: '#C9A227', bg: 'rgba(201,162,39,0.08)' },
                { label: 'Vues produits', value: analytics.totals['PRODUCT_VIEW'] ?? 0, icon: FileText, color: '#a78bfa', bg: 'rgba(167,139,250,0.08)' },
              ].map(stat => (
                <div key={stat.label} className="rounded-xl p-3" style={{ background: BG }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-2" style={{ background: stat.bg }}>
                    <stat.icon size={13} color={stat.color} />
                  </div>
                  <p style={{ color: TEXT, fontSize: '20px', fontWeight: 800, fontFamily: FONT, lineHeight: 1 }}>{stat.value}</p>
                  <p style={{ color: MUTED, fontSize: '10px', fontFamily: FONT, marginTop: '4px' }}>{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Top pages */}
            {analytics.topPages.length > 0 && (
              <div className="mt-4">
                <p style={{ color: MUTED, fontSize: '11px', fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase', fontFamily: FONT, marginBottom: '10px' }}>
                  Pages populaires
                </p>
                <div className="flex flex-col gap-2">
                  {analytics.topPages.slice(0, 5).map(p => {
                    const maxViews = analytics.topPages[0]?.views ?? 1;
                    const pct = Math.round((p.views / maxViews) * 100);
                    const label = p.path.startsWith('/product/') ? 'Produit' : (PAGE_LABELS[p.path] ?? p.path);
                    return (
                      <div key={p.path}>
                        <div className="flex justify-between mb-1">
                          <span style={{ color: MUTED, fontSize: '11px', fontFamily: FONT }}>{label}</span>
                          <span style={{ color: TEXT, fontSize: '11px', fontWeight: 700, fontFamily: FONT }}>{p.views}</span>
                        </div>
                        <div style={{ height: '3px', background: BORDER, borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: '#C9A227', borderRadius: '2px' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Page views chart */}
          {analytics.pageViewTimeline.length > 0 && (
            <div className="rounded-2xl p-5" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
              <h3 style={{ color: GOLD, fontSize: '13px', fontWeight: 700, fontFamily: FONT, marginBottom: '18px' }}>
                Pages vues / jour
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart
                  data={analytics.pageViewTimeline.slice(-30).map(d => ({ ...d, label: d.date.slice(5) }))}
                  margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={BORDER} vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: MUTED, fontSize: 11, fontFamily: FONT }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: MUTED, fontSize: 10, fontFamily: FONT }} axisLine={false} tickLine={false} width={30} />
                  <Tooltip content={<PageViewTooltip />} />
                  <Line type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: '#3b82f6', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: '#60a5fa', strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* ── Sales chart ── */}
      {salesChartData.length > 0 && (
        <div className="rounded-2xl p-5" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
          <h3 style={{ color: GOLD, fontSize: '13px', fontWeight: 700, fontFamily: FONT, marginBottom: '18px' }}>
            Ventes — 14 derniers jours
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={salesChartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={BORDER} vertical={false} />
              <XAxis dataKey="label" tick={{ fill: MUTED, fontSize: 11, fontFamily: FONT }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: MUTED, fontSize: 10, fontFamily: FONT }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} width={40} />
              <Tooltip content={<SalesTooltip />} />
              <Line type="monotone" dataKey="amount" stroke={GOLD} strokeWidth={2.5} dot={{ fill: GOLD, r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: '#E8C84A', strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top products */}
        {topChartData.length > 0 && (
          <div className="rounded-2xl p-5" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
            <h3 style={{ color: GOLD, fontSize: '13px', fontWeight: 700, marginBottom: '16px', fontFamily: FONT }}>Top 5 produits</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={topChartData} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER} horizontal={false} />
                <XAxis type="number" tick={{ fill: MUTED, fontSize: 10, fontFamily: FONT }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" tick={{ fill: MUTED, fontSize: 10, fontFamily: FONT }} axisLine={false} tickLine={false} width={90} />
                <Tooltip content={<BarTooltip />} />
                <Bar dataKey="revenue" fill={GOLD} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Order statuses */}
        <div className="rounded-2xl p-5" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
          <h3 style={{ color: GOLD, fontSize: '13px', fontWeight: 700, marginBottom: '16px', fontFamily: FONT }}>Statuts commandes</h3>
          <div className="flex flex-col gap-3">
            {statusRows.map(([status, count]) => {
              const color = STATUS_COLOR[status] ?? MUTED;
              const total = statusRows.reduce((s, [, n]) => s + n, 0);
              const pct   = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={status}>
                  <div className="flex justify-between mb-1.5">
                    <span style={{ color: MUTED, fontSize: '12px', fontFamily: FONT }}>{STATUS_FR[status] ?? status}</span>
                    <span style={{ color: TEXT, fontSize: '12px', fontWeight: 700, fontFamily: FONT }}>{count}</span>
                  </div>
                  <div style={{ height: '4px', background: BORDER, borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '2px', transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              );
            })}
            {statusRows.length === 0 && <p style={{ color: MUTED, fontSize: '12px', fontFamily: FONT }}>Aucune commande.</p>}
          </div>
        </div>
      </div>

      {/* ── Notifications ── */}
      <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${notifs.length === 0 ? BORDER : 'rgba(201,162,39,0.2)'}` }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ background: CARD_BG, borderBottom: notifs.length > 0 ? `1px solid ${BORDER}` : 'none' }}>
          <div className="flex items-center gap-2">
            <Bell size={14} color={GOLD} />
            <h3 style={{ color: GOLD, fontSize: '13px', fontWeight: 700, fontFamily: FONT }}>
              Notifications récentes
            </h3>
            {notifs.length > 0 && (
              <span style={{ padding: '1px 7px', borderRadius: '99px', background: 'rgba(201,162,39,0.15)', color: GOLD, fontSize: '10px', fontWeight: 700, fontFamily: FONT }}>
                {notifs.length}
              </span>
            )}
          </div>

          {notifs.length > 0 && (
            <div className="flex items-center gap-2">
              {clearConfirm ? (
                <>
                  <span style={{ color: MUTED, fontSize: '11px', fontFamily: FONT }}>Tout effacer ?</span>
                  <button onClick={() => setClearConfirm(false)}
                    style={{ padding: '4px 10px', borderRadius: '7px', border: `1px solid ${BORDER}`, cursor: 'pointer', background: 'none', color: MUTED, fontSize: '11px', fontFamily: FONT }}>
                    Annuler
                  </button>
                  <button onClick={clearAllNotifs} disabled={clearing}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '7px', border: 'none', cursor: clearing ? 'not-allowed' : 'pointer', background: '#ef4444', color: '#fff', fontSize: '11px', fontWeight: 700, fontFamily: FONT, opacity: clearing ? 0.7 : 1 }}>
                    {clearing ? <RefreshCw size={10} className="animate-spin" /> : <Trash2 size={10} />}
                    Confirmer
                  </button>
                </>
              ) : (
                <button onClick={() => setClearConfirm(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '8px', border: `1px solid rgba(239,68,68,0.25)`, cursor: 'pointer', background: 'rgba(239,68,68,0.05)', color: '#ef4444', fontSize: '11px', fontWeight: 700, fontFamily: FONT }}>
                  <Trash2 size={11} /> Tout effacer
                </button>
              )}
            </div>
          )}
        </div>

        {/* Empty state */}
        {notifs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 gap-2" style={{ background: CARD_BG }}>
            <Bell size={24} color={BORDER} strokeWidth={1.5} />
            <p style={{ color: MUTED, fontSize: '12px', fontFamily: FONT }}>Aucune notification</p>
          </div>
        )}

        {/* List */}
        {notifs.length > 0 && (
          <div style={{ background: CARD_BG }}>
            {notifs.slice(0, 20).map((row, i) => (
              <div key={row.id}
                className="flex items-start gap-3 px-5 py-3.5"
                style={{
                  borderBottom: i < Math.min(notifs.length, 20) - 1 ? `1px solid ${BORDER}` : 'none',
                  opacity: deletingId === row.id ? 0.4 : 1,
                  transition: 'opacity 0.15s',
                }}>

                {/* Icon */}
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: row.meta?.direction === 'TO_CLIENT' ? 'rgba(37,211,102,0.1)' : 'rgba(201,162,39,0.1)' }}>
                  {row.meta?.direction === 'TO_CLIENT'
                    ? <MessageCircle size={13} color="#25D366" />
                    : <Bell size={13} color={GOLD} />
                  }
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p style={{ color: TEXT, fontSize: '12px', fontFamily: FONT, lineHeight: 1.5 }}>
                    {row.message.length > 120 ? row.message.slice(0, 120) + '…' : row.message}
                  </p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span style={{ color: MUTED, fontSize: '10px', fontFamily: FONT }}>{timeAgo(row.createdAt)}</span>
                    <span style={{ color: MUTED, fontSize: '10px', fontFamily: FONT, opacity: 0.6 }}>{row.status}</span>
                    {row.meta?.waClickUrl && (
                      <a href={row.meta.waClickUrl} target="_blank" rel="noopener noreferrer"
                        style={{ color: '#25D366', fontSize: '10px', fontWeight: 700, fontFamily: FONT, textDecoration: 'none' }}>
                        → Envoyer WA
                      </a>
                    )}
                  </div>
                </div>

                {/* Delete button */}
                <button onClick={() => deleteNotif(row.id)} disabled={deletingId === row.id}
                  style={{ width: '26px', height: '26px', borderRadius: '8px', border: `1px solid ${BORDER}`, cursor: 'pointer', background: 'none', color: MUTED, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#ef444440'; (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = BORDER; (e.currentTarget as HTMLButtonElement).style.color = MUTED; }}>
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
