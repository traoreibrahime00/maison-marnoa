import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { Pencil, Trash2, Plus, Search, Package, AlertTriangle, Star, Zap, Sparkles, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiUrl } from '../../lib/api';
import { categories, formatPrice } from '../../data/products';
import { useColors } from '../../context/AppContext';
import { toast } from 'sonner';

const FONT = 'Manrope, sans-serif';

type ApiProduct = {
  id: string;
  name: string;
  image: string;
  category: string;
  collection: string;
  description: string;
  price: number;
  stock: number | null;
  isNew: boolean;
  isBestseller: boolean;
  isFeatured: boolean;
  createdAt: string;
};

function isRecent(dateStr: string, minutes = 60) {
  return Date.now() - new Date(dateStr).getTime() < minutes * 60 * 1000;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = Date.now();
  const diff = now - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `Il y a ${mins < 1 ? 1 : mins} min`;
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 24) return `Il y a ${hrs}h`;
  const days = Math.floor(diff / 86400000);
  if (days < 7) return `Il y a ${days}j`;
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: days > 365 ? '2-digit' : undefined });
}

const PAGE_SIZES = [12, 24, 48] as const;

const BADGE_FIELDS = [
  { field: 'isNew'        as const, icon: Sparkles, color: '#C9A227', label: 'Nouveau',   title: 'Afficher le badge "Nouveau" sur ce produit'                          },
  { field: 'isBestseller' as const, icon: Star,     color: '#f59e0b', label: 'Best',      title: 'Afficher le badge "Best-seller" sur ce produit'                     },
  { field: 'isFeatured'   as const, icon: Zap,      color: '#8b5cf6', label: 'Featured',  title: 'Afficher le badge "Mis en avant" sur ce produit'                    },
] as const;

function PriceDisplayToggle() {
  const { BG, CARD_BG, BORDER, TEXT, MUTED, GOLD } = useColors();
  const [hidePrices, setHidePrices] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(apiUrl('/api/admin/general-settings'), { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then((d: { hidePrices: boolean } | null) => {
        if (d) setHidePrices(d.hidePrices);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const togglePrices = async () => {
    const newValue = !hidePrices;
    setHidePrices(newValue);
    try {
      const res = await fetch(apiUrl('/api/admin/general-settings'), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ hidePrices: newValue }),
      });
      if (!res.ok) throw new Error();
      toast(newValue ? 'Prix masqués' : 'Prix affichés');
    } catch {
      setHidePrices(!newValue); // Revert on error
      toast.error('Erreur de sauvegarde');
    }
  };

  if (loading) return null;

  return (
    <div className="rounded-xl p-4" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span style={{ fontSize: '13px', color: GOLD }}>💰</span>
          <div>
            <p style={{ color: TEXT, fontSize: '13px', fontWeight: 700, fontFamily: FONT, marginBottom: '2px' }}>
              Afficher les prix
            </p>
            <p style={{ color: MUTED, fontSize: '11px', fontFamily: FONT }}>
              Masquer tous les prix des articles sur le site
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={togglePrices}
            style={{
              width: '44px', height: '24px', borderRadius: '12px',
              background: hidePrices ? '#ef4444' : GOLD,
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center',
              padding: '2px', transition: 'background 0.2s',
            }}
          >
            <div
              style={{
                width: '18px', height: '18px', borderRadius: '50%',
                background: '#fff', transform: hidePrices ? 'translateX(20px)' : 'translateX(0)',
                transition: 'transform 0.2s',
              }}
            />
          </button>
          <span style={{ color: hidePrices ? '#ef4444' : GOLD, fontSize: '12px', fontWeight: 600, fontFamily: FONT }}>
            {hidePrices ? 'prix caché' : 'prix visible'}
          </span>
        </div>
      </div>
    </div>
  );
}

function Pagination({ page, totalPages, total, pageSize, from, to, onPage, onPageSize, CARD_BG, BORDER, TEXT, MUTED, GOLD }: {
  page: number; totalPages: number; total: number; pageSize: number;
  from: number; to: number;
  onPage: (p: number) => void; onPageSize: (s: number) => void;
  CARD_BG: string; BORDER: string; TEXT: string; MUTED: string; GOLD: string;
}) {
  if (totalPages <= 1 && total <= PAGE_SIZES[0]) return null;

  // Build page numbers with ellipsis
  const pages: (number | '…')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('…');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push('…');
    pages.push(totalPages);
  }

  const btn = (style: React.CSSProperties) => ({
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: '8px', cursor: 'pointer', fontFamily: FONT, ...style,
  });

  return (
    <div className="flex items-center justify-between flex-wrap gap-3 px-1 pt-4">
      {/* Info + page size */}
      <div className="flex items-center gap-3">
        <span style={{ color: MUTED, fontSize: '12px', fontFamily: FONT }}>
          {from}–{to} sur <strong style={{ color: TEXT }}>{total}</strong>
        </span>
        <div className="flex rounded-lg overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
          {PAGE_SIZES.map(s => (
            <button key={s} onClick={() => onPageSize(s)}
              style={btn({
                padding: '5px 10px', fontSize: '11px', fontWeight: 700, border: 'none',
                background: pageSize === s ? 'rgba(201,162,39,0.12)' : CARD_BG,
                color: pageSize === s ? GOLD : MUTED,
              })}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Pages */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button onClick={() => onPage(page - 1)} disabled={page === 1}
            style={btn({ width: 32, height: 32, background: CARD_BG, border: `1px solid ${BORDER}`, color: page === 1 ? BORDER : MUTED, opacity: page === 1 ? 0.4 : 1 })}>
            <ChevronLeft size={14} />
          </button>

          {pages.map((p, i) => p === '…' ? (
            <span key={`e${i}`} style={{ color: MUTED, fontSize: '12px', padding: '0 4px', fontFamily: FONT }}>…</span>
          ) : (
            <button key={p} onClick={() => onPage(p as number)}
              style={btn({
                width: 32, height: 32, fontSize: '12px', fontWeight: 700,
                background: p === page ? GOLD : CARD_BG,
                color: p === page ? '#fff' : MUTED,
                border: `1px solid ${p === page ? GOLD : BORDER}`,
              } as React.CSSProperties)}>
              {p}
            </button>
          ))}

          <button onClick={() => onPage(page + 1)} disabled={page === totalPages}
            style={btn({ width: 32, height: 32, background: CARD_BG, border: `1px solid ${BORDER}`, color: page === totalPages ? BORDER : MUTED, opacity: page === totalPages ? 0.4 : 1 })}>
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}


export default function AdminProducts() {
  const { BG, CARD_BG, BORDER, TEXT, MUTED, GOLD } = useColors();
  const navigate  = useNavigate();
  const [products, setProducts]     = useState<ApiProduct[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [filterCat, setFilterCat]   = useState('all');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toggling, setToggling]     = useState<string | null>(null);
  const [page, setPage]             = useState(1);
  const [pageSize, setPageSize]     = useState<typeof PAGE_SIZES[number]>(12);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/products'));
      if (!res.ok) throw new Error('Failed');
      setProducts(await res.json() as ApiProduct[]);
    } catch { /* keep state */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const res = await fetch(apiUrl(`/api/products/${id}`), {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) { toast.error('Erreur suppression'); return; }
      setProducts(prev => prev.filter(p => p.id !== id));
      toast('Produit supprimé');
    } finally {
      setConfirmDelete(null);
      setIsDeleting(false);
    }
  };

  const handleToggle = async (product: ApiProduct, field: 'isNew' | 'isBestseller' | 'isFeatured') => {
    const key = `${product.id}-${field}`;
    setToggling(key);
    // Optimistic update
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, [field]: !p[field] } : p));
    try {
      const res = await fetch(apiUrl(`/api/products/${product.id}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ [field]: !product[field] }),
      });
      if (!res.ok) {
        // Revert on error
        setProducts(prev => prev.map(p => p.id === product.id ? { ...p, [field]: product[field] } : p));
        toast.error('Erreur de mise à jour');
      }
    } catch {
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, [field]: product[field] } : p));
      toast.error('Erreur réseau');
    } finally {
      setToggling(null);
    }
  };

  const filtered = useMemo(() => products.filter(p => {
    const matchCat    = filterCat === 'all' || p.category === filterCat;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  }), [products, filterCat, search]);

  // Reset to page 1 when filter or search changes
  useEffect(() => { setPage(1); }, [search, filterCat, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage   = Math.min(page, totalPages);
  const from       = filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const to         = Math.min(safePage * pageSize, filtered.length);
  const paginated  = useMemo(() => filtered.slice((safePage - 1) * pageSize, safePage * pageSize), [filtered, safePage, pageSize]);

  const lowStockCount = products.filter(p => p.stock !== null && p.stock <= 3).length;
  const justAdded     = paginated.filter(p => isRecent(p.createdAt, 60)).map(p => p.id);

  return (
    <>
      {/* ── Toolbar ── */}
      <div className="flex flex-col gap-3 mb-5">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl flex-1 min-w-[180px]"
            style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
            <Search size={13} color={MUTED} />
            <input
              placeholder="Rechercher…"
              value={search} onChange={e => setSearch(e.target.value)}
              className="bg-transparent outline-none flex-1"
              style={{ color: TEXT, fontSize: '13px', fontFamily: FONT }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ color: MUTED, background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', lineHeight: 1 }}>×</button>
            )}
          </div>
          {/* Refresh */}
          <button onClick={reload}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 12px', borderRadius: '10px', cursor: 'pointer', background: CARD_BG, border: `1px solid ${BORDER}`, color: MUTED, fontSize: '12px', fontFamily: FONT }}>
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Category filters */}
        <div className="flex gap-2 flex-wrap">
          {[{ id: 'all', label: 'Tous' }, ...categories.filter(c => c.id !== 'all')].map(cat => (
            <button key={cat.id} onClick={() => setFilterCat(cat.id)}
              style={{
                padding: '6px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 600,
                fontFamily: FONT, cursor: 'pointer',
                background: filterCat === cat.id ? 'rgba(201,162,39,0.12)' : CARD_BG,
                border: `1px solid ${filterCat === cat.id ? 'rgba(201,162,39,0.4)' : BORDER}`,
                color: filterCat === cat.id ? GOLD : MUTED,
              }}>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Total',        value: products.length, icon: Package,       warn: false },
          { label: 'Filtrés',      value: filtered.length, icon: Search,        warn: false  },
          { label: 'Stock faible', value: lowStockCount,   icon: AlertTriangle, warn: true  },
        ].map(({ label, value, icon: Icon, warn }) => (
          <div key={label} className="rounded-xl p-3 lg:p-4"
            style={{ background: CARD_BG, border: `1px solid ${warn && value > 0 ? 'rgba(239,68,68,0.3)' : BORDER}` }}>
            <div className="flex items-center gap-1.5 mb-1">
              <Icon size={12} color={warn && value > 0 ? '#ef4444' : MUTED} />
              <span style={{ color: MUTED, fontSize: '10px', fontFamily: FONT }}>{label}</span>
            </div>
            <p style={{ color: warn && value > 0 ? '#ef4444' : TEXT, fontSize: '22px', fontWeight: 800, fontFamily: FONT, lineHeight: 1 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Price Display Toggle ── */}
      <div className="mb-5">
        <PriceDisplayToggle />
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="flex items-center justify-center py-16 gap-2">
          <RefreshCw size={16} color={GOLD} className="animate-spin" />
          <span style={{ color: MUTED, fontFamily: FONT, fontSize: '13px' }}>Chargement…</span>
        </div>
      )}

      {!loading && paginated.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Package size={36} color={BORDER} strokeWidth={1.5} />
          <p style={{ color: MUTED, fontFamily: FONT, fontSize: '13px' }}>Aucun produit trouvé</p>
        </div>
      )}

      {/* ── Desktop table ── */}
      {!loading && paginated.length > 0 && (
        <div className="hidden lg:block rounded-2xl overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
          {/* Header */}
          <div className="grid grid-cols-[56px_1fr_110px_100px_64px_170px_80px] px-5 py-3"
            style={{ background: CARD_BG, borderBottom: `1px solid ${BORDER}` }}>
            {['Photo', 'Produit', 'Catégorie', 'Prix', 'Stock', 'Badges', ''].map((h, i) => (
              <span key={i} style={{ color: MUTED, fontSize: '10px', fontWeight: 700, letterSpacing: '0.5px', fontFamily: FONT, textTransform: 'uppercase' }}>{h}</span>
            ))}
          </div>
          <AnimatePresence>
            {paginated.map((product, i) => {
              const stockLow  = product.stock !== null && product.stock <= 3;
              const highlight = justAdded.includes(product.id);
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, delay: i < 10 ? i * 0.03 : 0 }}
                  className="grid grid-cols-[56px_1fr_110px_100px_64px_170px_80px] px-5 py-3.5 items-center"
                  style={{
                    borderBottom: i < filtered.length - 1 ? `1px solid ${BORDER}` : 'none',
                    background: highlight ? 'rgba(201,162,39,0.04)' : (i % 2 === 0 ? BG : CARD_BG),
                    boxShadow: highlight ? 'inset 3px 0 0 #C9A227' : 'none',
                  }}
                >
                  {/* Image */}
                  <div className="relative w-11 h-11 rounded-xl overflow-hidden flex-shrink-0" style={{ border: `1px solid ${highlight ? 'rgba(201,162,39,0.5)' : BORDER}` }}>
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    {highlight && (
                      <div className="absolute inset-0 flex items-end justify-center pb-0.5"
                        style={{ background: 'linear-gradient(to top, rgba(201,162,39,0.6), transparent)' }}>
                        <span style={{ color: '#fff', fontSize: '7px', fontWeight: 800, fontFamily: FONT, letterSpacing: '0.5px' }}>NEW</span>
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <div className="pr-4">
                    <div className="flex items-center gap-2">
                      <p style={{ color: TEXT, fontSize: '13px', fontWeight: 700, fontFamily: FONT }}>{product.name}</p>
                      {highlight && (
                        <span style={{ padding: '1px 6px', borderRadius: '99px', background: 'rgba(201,162,39,0.15)', color: GOLD, fontSize: '9px', fontWeight: 800, fontFamily: FONT, letterSpacing: '0.5px' }}>RÉCENT</span>
                      )}
                    </div>
                    <p style={{ color: MUTED, fontSize: '11px', fontFamily: FONT }}>{product.collection}</p>
                    <p style={{ color: MUTED, fontSize: '10px', fontFamily: FONT, opacity: 0.7 }}>{formatDate(product.createdAt)}</p>
                  </div>

                  {/* Category */}
                  <span style={{ color: MUTED, fontSize: '12px', fontFamily: FONT, textTransform: 'capitalize' }}>{product.category}</span>

                  {/* Price */}
                  <span style={{ color: GOLD, fontSize: '13px', fontWeight: 700, fontFamily: FONT }}>{formatPrice(product.price)}</span>

                  {/* Stock */}
                  <div className="flex items-center gap-1">
                    {stockLow && <AlertTriangle size={11} color="#ef4444" />}
                    <span style={{ color: stockLow ? '#ef4444' : TEXT, fontSize: '13px', fontWeight: stockLow ? 700 : 500, fontFamily: FONT }}>
                      {product.stock === null ? '∞' : product.stock}
                    </span>
                  </div>

                  {/* Badge toggles */}
                  <div className="flex items-center gap-1">
                    {BADGE_FIELDS.map(({ field, icon: Icon, color, label, title }) => {
                      const active = product[field];
                      const key    = `${product.id}-${field}`;
                      return (
                        <button key={field} title={title} disabled={toggling === key}
                          onClick={() => handleToggle(product, field)}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg"
                          style={{
                            background: active ? `${color}20` : 'transparent',
                            border: `1px solid ${active ? color + '80' : BORDER}`,
                            cursor: toggling === key ? 'wait' : 'pointer',
                            opacity: toggling === key ? 0.5 : 1,
                            transition: 'all 0.15s',
                          }}>
                          <Icon size={10} color={active ? color : MUTED} />
                          <span style={{ color: active ? color : MUTED, fontSize: '9px', fontWeight: active ? 800 : 500, fontFamily: FONT }}>{label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 pl-3" style={{ borderLeft: `1px solid ${BORDER}` }}>
                    <button
                      onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                      title="Modifier"
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg,#C9A227,#E8C84A)', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
                      <Pencil size={13} color="#fff" strokeWidth={2.5} />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(product.id)}
                      title="Supprimer"
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', cursor: 'pointer', flexShrink: 0 }}>
                      <Trash2 size={13} color="#ef4444" strokeWidth={2.5} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* ── Mobile cards ── */}
      {!loading && paginated.length > 0 && (
        <div className="lg:hidden flex flex-col gap-3">
          <AnimatePresence>
            {paginated.map((product, i) => {
              const stockLow  = product.stock !== null && product.stock <= 3;
              const highlight = justAdded.includes(product.id);
              return (
                <motion.div key={product.id}
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, delay: i < 8 ? i * 0.04 : 0 }}
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: CARD_BG,
                    border: `1px solid ${highlight ? 'rgba(201,162,39,0.45)' : BORDER}`,
                    boxShadow: highlight ? '0 0 0 1px rgba(201,162,39,0.12)' : 'none',
                  }}>

                  <div className="flex items-center gap-3 p-3">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0" style={{ border: `1px solid ${BORDER}` }}>
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      {highlight && (
                        <div className="absolute top-0.5 left-0.5 px-1 rounded" style={{ background: GOLD }}>
                          <span style={{ color: '#fff', fontSize: '7px', fontWeight: 800, fontFamily: FONT }}>NEW</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p style={{ color: TEXT, fontSize: '13px', fontWeight: 700, fontFamily: FONT }} className="truncate">{product.name}</p>
                        {highlight && <span style={{ padding: '1px 5px', borderRadius: '99px', background: 'rgba(201,162,39,0.15)', color: GOLD, fontSize: '9px', fontWeight: 800, fontFamily: FONT }}>RÉCENT</span>}
                      </div>
                      <p style={{ color: MUTED, fontSize: '11px', fontFamily: FONT }}>{product.collection} · <span style={{ textTransform: 'capitalize' }}>{product.category}</span></p>
                      <p style={{ color: MUTED, fontSize: '10px', fontFamily: FONT, opacity: 0.7 }}>{formatDate(product.createdAt)}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span style={{ color: GOLD, fontSize: '13px', fontWeight: 800, fontFamily: FONT }}>{formatPrice(product.price)}</span>
                        <span style={{ color: stockLow ? '#ef4444' : MUTED, fontSize: '11px', fontWeight: stockLow ? 700 : 500, fontFamily: FONT }}>
                          Stock : {product.stock === null ? '∞' : product.stock}{stockLow && ' ⚠️'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 flex-shrink-0">
                      <button onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.2)', cursor: 'pointer' }}>
                        <Pencil size={14} color="#C9A227" />
                      </button>
                      <button onClick={() => setConfirmDelete(product.id)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)', cursor: 'pointer' }}>
                        <Trash2 size={14} color="#ef4444" />
                      </button>
                    </div>
                  </div>

                  {/* Badge toggles */}
                  <div className="flex items-center gap-2 px-3 pb-3">
                    {BADGE_FIELDS.map(({ field, icon: Icon, color, label }) => {
                      const active = product[field];
                      const key    = `${product.id}-${field}`;
                      return (
                        <button key={field} disabled={toggling === key}
                          onClick={() => handleToggle(product, field)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg flex-1 justify-center"
                          style={{
                            background: active ? `${color}18` : 'transparent',
                            border: `1px solid ${active ? color : BORDER}`,
                            cursor: toggling === key ? 'wait' : 'pointer',
                            opacity: toggling === key ? 0.5 : 1,
                            transition: 'all 0.15s',
                            fontFamily: FONT,
                          }}>
                          <Icon size={11} color={active ? color : MUTED} />
                          <span style={{ color: active ? color : MUTED, fontSize: '11px', fontWeight: 700, fontFamily: FONT }}>{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* ── Pagination ── */}
      {!loading && filtered.length > 0 && (
        <Pagination
          page={safePage} totalPages={totalPages} total={filtered.length}
          pageSize={pageSize} from={from} to={to}
          onPage={p => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          onPageSize={s => setPageSize(s as typeof PAGE_SIZES[number])}
          CARD_BG={CARD_BG} BORDER={BORDER} TEXT={TEXT} MUTED={MUTED} GOLD={GOLD}
        />
      )}

      {/* ── FAB add ── */}
      <motion.button
        whileTap={{ scale: 0.94 }} whileHover={{ scale: 1.05 }}
        onClick={() => navigate('/admin/products/new')}
        className="fixed bottom-6 right-6 flex items-center gap-2 px-5 py-3.5 rounded-2xl"
        style={{ background: 'linear-gradient(135deg,#C9A227,#E8C84A)', boxShadow: '0 8px 24px rgba(201,162,39,0.45)', border: 'none', cursor: 'pointer', zIndex: 40 }}>
        <Plus size={18} color="#fff" />
        <span style={{ color: '#fff', fontWeight: 800, fontSize: '13px', fontFamily: FONT }}>Ajouter</span>
      </motion.button>

      {/* ── Confirm delete modal ── */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-6"
            style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(10px)' }}
            onClick={() => setConfirmDelete(null)}>
            <motion.div initial={{ scale: 0.92, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92 }}
              className="rounded-3xl p-8 max-w-xs w-full"
              style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}
              onClick={e => e.stopPropagation()}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <Trash2 size={22} color="#ef4444" />
              </div>
              <h3 style={{ color: TEXT, fontWeight: 800, fontSize: '17px', textAlign: 'center', marginBottom: '6px', fontFamily: FONT }}>
                Supprimer le produit ?
              </h3>
              <p style={{ color: MUTED, fontSize: '13px', textAlign: 'center', marginBottom: '24px', fontFamily: FONT, lineHeight: 1.5 }}>
                Cette action est irréversible.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)}
                  style={{ flex: 1, padding: '11px', borderRadius: '12px', background: 'transparent', border: `1px solid ${BORDER}`, color: MUTED, fontWeight: 600, fontSize: '13px', fontFamily: FONT, cursor: 'pointer' }}>
                  Annuler
                </button>
                <button onClick={() => handleDelete(confirmDelete)} disabled={isDeleting}
                  style={{ flex: 1, padding: '11px', borderRadius: '12px', background: isDeleting ? BORDER : '#ef4444', border: 'none', color: '#fff', fontWeight: 700, fontSize: '13px', fontFamily: FONT, cursor: isDeleting ? 'not-allowed' : 'pointer', opacity: isDeleting ? 0.7 : 1 }}>
                  {isDeleting ? <RefreshCw size={14} className="animate-spin mx-auto" /> : 'Supprimer'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
