import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Eye, FileText, ShoppingCart, Home, RefreshCw } from 'lucide-react';
import { apiUrl } from '../../lib/api';
import { useColors } from '../../context/AppContext';

const FONT = 'Manrope, sans-serif';

type AnalyticsSummary = {
  totals: Record<string, number>;
  pageViewTimeline: Array<{ date: string; views: number }>;
  topPages: Array<{ path: string; views: number }>;
};

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

export default function AdminAnalytics() {
  const { CARD_BG, BG, BORDER, TEXT, MUTED, GOLD } = useColors();
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(apiUrl(`/api/track/summary?days=${days}`), { credentials: 'include' })
      .then(r => r.json())
      .then(json => { if (!cancelled) { setData(json as AnalyticsSummary); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [days]);

  const kpis = data ? [
    { label: 'Sessions',       value: data.totals['SESSION_START']  ?? 0, icon: Users,       color: '#3b82f6', bg: 'rgba(59,130,246,0.08)' },
    { label: 'Pages vues',     value: data.totals['PAGE_VIEW']      ?? 0, icon: Eye,         color: '#C9A227', bg: 'rgba(201,162,39,0.08)' },
    { label: 'Vues produits',  value: data.totals['PRODUCT_VIEW']   ?? 0, icon: FileText,    color: '#a78bfa', bg: 'rgba(167,139,250,0.08)' },
    { label: 'Checkouts',      value: data.totals['CHECKOUT_VIEW']  ?? 0, icon: ShoppingCart,color: '#22c55e', bg: 'rgba(34,197,94,0.08)'  },
    { label: 'Visites accueil',value: data.totals['VISIT_HOME']     ?? 0, icon: Home,        color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  ] : [];

  const chartData = data?.pageViewTimeline.slice(-days).map(d => ({
    ...d,
    label: d.date.slice(5),
  })) ?? [];

  return (
    <div className="grid gap-5">

      {/* Period selector */}
      <div className="flex items-center gap-2">
        {[7, 30, 90].map(d => (
          <button key={d} onClick={() => setDays(d)}
            style={{
              padding: '6px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, fontFamily: FONT, cursor: 'pointer',
              background: days === d ? 'rgba(201,162,39,0.15)' : BG,
              border: `1px solid ${days === d ? 'rgba(201,162,39,0.4)' : BORDER}`,
              color: days === d ? GOLD : MUTED,
            }}>
            {d}j
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 gap-2">
          <RefreshCw size={16} color={GOLD} className="animate-spin" />
          <p style={{ color: MUTED, fontFamily: FONT }}>Chargement…</p>
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {kpis.map(kpi => (
              <div key={kpi.label} className="rounded-2xl p-4" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
                <div className="flex items-center justify-between mb-3">
                  <p style={{ color: MUTED, fontSize: '10px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', fontFamily: FONT }}>
                    {kpi.label}
                  </p>
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: kpi.bg }}>
                    <kpi.icon size={13} color={kpi.color} />
                  </div>
                </div>
                <p style={{ color: TEXT, fontSize: 'clamp(20px,3vw,28px)', fontWeight: 800, fontFamily: FONT, lineHeight: 1 }}>
                  {kpi.value}
                </p>
              </div>
            ))}
          </div>

          {/* Chart */}
          {chartData.length > 0 ? (
            <div className="rounded-2xl p-5" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
              <h3 style={{ color: GOLD, fontSize: '13px', fontWeight: 700, fontFamily: FONT, marginBottom: '18px' }}>
                Pages vues / jour — {days} derniers jours
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={BORDER} vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: MUTED, fontSize: 11, fontFamily: FONT }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: MUTED, fontSize: 10, fontFamily: FONT }} axisLine={false} tickLine={false} width={30} />
                  <Tooltip content={<PageViewTooltip />} />
                  <Line type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2.5}
                    dot={{ fill: '#3b82f6', r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: '#60a5fa', strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="rounded-2xl p-10 flex items-center justify-center" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
              <p style={{ color: MUTED, fontFamily: FONT, fontSize: '13px' }}>Aucune donnée pour cette période.</p>
            </div>
          )}

          {/* Top pages */}
          {data && data.topPages.length > 0 && (
            <div className="rounded-2xl p-5" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
              <h3 style={{ color: GOLD, fontSize: '13px', fontWeight: 700, fontFamily: FONT, marginBottom: '16px' }}>
                Pages les plus visitées
              </h3>
              <div className="flex flex-col gap-3">
                {data.topPages.map(p => {
                  const maxViews = data.topPages[0]?.views ?? 1;
                  const pct = Math.round((p.views / maxViews) * 100);
                  const label = p.path.startsWith('/product/') ? `Produit ${p.path.split('/').pop()?.slice(0, 8)}…` : (PAGE_LABELS[p.path] ?? p.path);
                  return (
                    <div key={p.path}>
                      <div className="flex justify-between mb-1.5">
                        <span style={{ color: MUTED, fontSize: '12px', fontFamily: FONT }}>{label}</span>
                        <span style={{ color: TEXT, fontSize: '12px', fontWeight: 700, fontFamily: FONT }}>{p.views} vues</span>
                      </div>
                      <div style={{ height: '4px', background: BORDER, borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: '#3b82f6', borderRadius: '2px', transition: 'width 0.6s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
