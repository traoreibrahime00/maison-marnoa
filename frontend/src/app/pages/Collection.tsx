import { useApp, useProducts } from '../context/AppContext';
import { useState, useCallback } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router';
import { Search, SlidersHorizontal, ChevronDown, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { categories as STATIC_CATEGORIES, formatPrice } from '../data/products';
import { ReassuranceBannerMobile } from '../components/ReassuranceBanner';
import { ProductCard } from '../components/ProductCard';

function PriceRangeSlider({ min, max, low, high, onChange }: {
  min: number; max: number; low: number; high: number;
  onChange: (low: number, high: number) => void;
}) {
  const range = max - min || 1;
  const lowPct  = ((low  - min) / range) * 100;
  const highPct = ((high - min) / range) * 100;

  const handleLow = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.min(Number(e.target.value), high - 1);
    onChange(v, high);
  }, [high, onChange]);

  const handleHigh = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.max(Number(e.target.value), low + 1);
    onChange(low, v);
  }, [low, onChange]);

  return (
    <div>
      {/* Track */}
      <div className="relative h-1.5 rounded-full mb-5" style={{ background: 'rgba(0,0,0,0.1)' }}>
        <div className="absolute h-full rounded-full" style={{
          left: `${lowPct}%`, right: `${100 - highPct}%`,
          background: 'linear-gradient(90deg,#C9A227,#E8C84A)',
        }} />
        {/* Low thumb */}
        <input type="range" min={min} max={max} step={Math.round(range / 100)} value={low} onChange={handleLow}
          className="absolute w-full h-full opacity-0 cursor-pointer" style={{ top: 0, left: 0, zIndex: low > max - (range * 0.05) ? 5 : 3 }} />
        {/* High thumb */}
        <input type="range" min={min} max={max} step={Math.round(range / 100)} value={high} onChange={handleHigh}
          className="absolute w-full h-full opacity-0 cursor-pointer" style={{ top: 0, left: 0, zIndex: 4 }} />
        {/* Thumb visuals */}
        <div className="absolute w-4 h-4 rounded-full border-2 -translate-y-1/2 pointer-events-none"
          style={{ left: `calc(${lowPct}% - 8px)`, top: '50%', background: '#fff', borderColor: '#C9A227', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
        <div className="absolute w-4 h-4 rounded-full border-2 -translate-y-1/2 pointer-events-none"
          style={{ left: `calc(${highPct}% - 8px)`, top: '50%', background: '#fff', borderColor: '#C9A227', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
      </div>
      {/* Labels */}
      <div className="flex justify-between">
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#C9A227', fontFamily: 'Manrope, sans-serif' }}>{formatPrice(low)}</span>
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#C9A227', fontFamily: 'Manrope, sans-serif' }}>{formatPrice(high)}</span>
      </div>
    </div>
  );
}

const GOLD = '#C9A227';

const sortOptions = [
  { id: 'featured', label: 'Populaires' },
  { id: 'price-asc', label: 'Prix croissant' },
  { id: 'price-desc', label: 'Prix décroissant' },
  { id: 'newest', label: 'Nouveautés' },
  { id: 'rating', label: 'Mieux notés' },
];

export default function Collection() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const location = useLocation();
  const { colors } = useApp();
  const { BG, CARD_BG, BORDER, TEXT, MUTED } = colors;
  const products = useProducts();

  const initialCategory = params.get('category') || 'all';
  const [activeCategory, setActiveCategory] = useState(initialCategory);

  // Catégories déduites des produits en base (avec label depuis les statiques, sinon capitalize)
  const labelMap = Object.fromEntries(STATIC_CATEGORIES.map(c => [c.id, c.label]));
  const dynamicCategories = [
    { id: 'all', label: 'Tous' },
    ...Array.from(new Set(products.map(p => p.category)))
      .sort()
      .map(id => ({ id, label: labelMap[id] ?? id.charAt(0).toUpperCase() + id.slice(1) })),
  ];
  const [sortBy, setSortBy] = useState('featured');
  const [showSort, setShowSort] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  const globalMin = products.length ? Math.min(...products.map(p => p.price)) : 0;
  const globalMax = products.length ? Math.max(...products.map(p => p.price)) : 5000000;
  const [priceRange, setPriceRange] = useState<[number, number]>([0, Infinity]);
  const priceLow  = priceRange[0] <= globalMin ? globalMin : priceRange[0];
  const priceHigh = priceRange[1] >= globalMax ? globalMax : priceRange[1];
  const priceActive = priceRange[0] > globalMin || priceRange[1] < globalMax;

  function changeCategory(cat: string) {
    setActiveCategory(cat);
    setAnimKey(k => k + 1);
  }

  const filteredProducts = products
    .filter(p => {
      const matchCat    = activeCategory === 'all' || p.category === activeCategory;
      const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.collection.toLowerCase().includes(searchQuery.toLowerCase());
      const matchPrice  = p.price >= priceLow && p.price <= priceHigh;
      return matchCat && matchSearch && matchPrice;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'newest': return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
        case 'rating': return b.rating - a.rating;
        default: return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      }
    });

  return (
    <div style={{ background: colors.BG, minHeight: '100vh', fontFamily: 'Manrope, sans-serif' }}>

      <ReassuranceBannerMobile />

      {/* ── Mobile sticky header ── */}
      <div className="lg:hidden sticky top-0 z-40 pt-12 pb-0" style={{ background: `${colors.BG}F5`, backdropFilter: 'blur(20px)', borderBottom: `1px solid ${colors.BORDER}` }}>
        <div className="px-5 flex items-center justify-between mb-4">
          <div>
            <p style={{ color: GOLD, fontWeight: 700, fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase' }}>✦ HAUTE JOAILLERIE</p>
            <h1 style={{ color: colors.TEXT, fontWeight: 800, fontSize: '22px' }}>Collection</h1>
          </div>
          <motion.button onClick={() => setShowFilters(true)} className="flex items-center gap-2 px-4 py-2 rounded-full relative" style={{ background: priceActive ? 'rgba(201,162,39,0.1)' : colors.CARD_BG, border: `1px solid ${priceActive ? GOLD : colors.BORDER}` }} whileTap={{ scale: 0.94 }}>
            <SlidersHorizontal size={14} color={priceActive ? GOLD : colors.MUTED} />
            <span style={{ color: priceActive ? GOLD : colors.MUTED, fontWeight: 600, fontSize: '11px' }}>Filtrer{priceActive ? ' ·' : ''}</span>
            {priceActive && <span style={{ width: 6, height: 6, borderRadius: '50%', background: GOLD, flexShrink: 0 }} />}
          </motion.button>
        </div>
        <div className="px-5 mb-4">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ background: colors.CARD_BG, border: `1px solid ${colors.BORDER}` }}>
            <Search size={16} color={colors.MUTED} />
            <input type="text" placeholder="Rechercher..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="flex-1 bg-transparent outline-none" style={{ color: colors.TEXT, fontFamily: 'Manrope, sans-serif', fontSize: '13px' }} />
            {searchQuery && <button onClick={() => setSearchQuery('')}><X size={14} color={colors.MUTED} /></button>}
          </div>
        </div>
        <div className="flex gap-2 px-5 pb-4 overflow-x-auto lg:overflow-x-visible lg:flex-wrap" style={{ scrollbarWidth: 'none' }}>
          {dynamicCategories.map(cat => {
            const active = activeCategory === cat.id;
            return (
              <motion.button key={cat.id} onClick={() => changeCategory(cat.id as ProductCategory)} className="px-4 py-2 rounded-full whitespace-nowrap" whileTap={{ scale: 0.94 }}
                style={{ background: active ? 'linear-gradient(135deg,#C9A227,#E8C84A,#C9A227)' : 'transparent', color: active ? '#fff' : colors.MUTED, fontWeight: active ? 700 : 500, fontSize: '12px', border: active ? 'none' : `1px solid ${colors.BORDER}`, flexShrink: 0, boxShadow: active ? '0 4px 12px rgba(201,162,39,0.25)' : 'none' }}>
                {cat.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── Desktop layout: sidebar + grid ── */}
      <div className="lg:max-w-[1400px] lg:mx-auto lg:px-10 xl:px-16 lg:pt-8">
        <div className="lg:flex lg:gap-8">

          {/* Desktop sidebar filters */}
          <aside className="hidden lg:block w-56 xl:w-64 flex-shrink-0">
            <div className="sticky top-20">
              {/* Page title */}
              <div className="mb-6">
                <p style={{ color: GOLD, fontWeight: 700, fontSize: '9px', letterSpacing: '2.5px', textTransform: 'uppercase', marginBottom: '4px' }}>✦ HAUTE JOAILLERIE</p>
                <h1 style={{ color: colors.TEXT, fontWeight: 800, fontSize: '26px' }}>Collection</h1>
              </div>

              {/* Search */}
              <div className="flex items-center gap-2 px-4 py-3 rounded-2xl mb-6" style={{ background: colors.CARD_BG, border: `1px solid ${colors.BORDER}` }}>
                <Search size={15} color={colors.MUTED} />
                <input type="text" placeholder="Rechercher..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="flex-1 bg-transparent outline-none" style={{ color: colors.TEXT, fontFamily: 'Manrope, sans-serif', fontSize: '12px' }} />
                {searchQuery && <button onClick={() => setSearchQuery('')}><X size={12} color={colors.MUTED} /></button>}
              </div>

              {/* Categories */}
              <div className="mb-6">
                <p style={{ color: colors.MUTED, fontWeight: 700, fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Catégorie</p>
                <div className="flex flex-col gap-1">
                  {dynamicCategories.map(cat => {
                    const active = activeCategory === cat.id;
                    return (
                      <motion.button key={cat.id} onClick={() => changeCategory(cat.id as ProductCategory)} whileTap={{ scale: 0.97 }}
                        className="flex items-center justify-between px-3 py-2.5 rounded-xl text-left"
                        style={{ background: active ? 'rgba(201,162,39,0.1)' : 'transparent', border: active ? `1px solid rgba(201,162,39,0.3)` : '1px solid transparent', cursor: 'pointer', transition: 'all 0.15s' }}>
                        <span style={{ color: active ? GOLD : colors.MUTED, fontWeight: active ? 700 : 400, fontSize: '13px' }}>{cat.label}</span>
                        {active && <Check size={12} color={GOLD} />}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Price range */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p style={{ color: colors.MUTED, fontWeight: 700, fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase' }}>Tranche de prix</p>
                  {priceActive && (
                    <button onClick={() => setPriceRange([0, Infinity])} style={{ color: GOLD, fontSize: '9px', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Manrope, sans-serif' }}>
                      Réinitialiser
                    </button>
                  )}
                </div>
                <PriceRangeSlider
                  min={globalMin} max={globalMax}
                  low={priceLow} high={priceHigh}
                  onChange={(l, h) => setPriceRange([l, h])}
                />
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: colors.BORDER, marginBottom: 16 }} />
              <p style={{ color: colors.MUTED, fontSize: '11px', lineHeight: 1.6 }}>
                <span style={{ color: GOLD, fontWeight: 700 }}>{filteredProducts.length}</span> pièces disponibles
              </p>
            </div>
          </aside>

          {/* Main grid */}
          <div className="flex-1 min-w-0 px-4 lg:px-0 pb-28 lg:pb-8">
            {/* Sort bar */}
            <div className="flex items-center justify-between py-3 lg:py-0 lg:mb-5">
              <span className="lg:hidden" style={{ color: colors.MUTED, fontSize: '12px' }}>
                <span style={{ color: GOLD, fontWeight: 700 }}>{filteredProducts.length}</span> pièces
              </span>
              <span className="hidden lg:block" style={{ color: colors.MUTED, fontSize: '13px' }}>
                <span style={{ color: GOLD, fontWeight: 700 }}>{filteredProducts.length}</span> résultats
              </span>
              <div className="relative">
                <motion.button onClick={() => setShowSort(!showSort)} className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: colors.CARD_BG, border: `1px solid ${colors.BORDER}` }} whileTap={{ scale: 0.94 }}>
                  <span style={{ color: colors.MUTED, fontSize: '12px', fontWeight: 600 }}>{sortOptions.find(s => s.id === sortBy)?.label}</span>
                  <ChevronDown size={12} color={colors.MUTED} />
                </motion.button>
                <AnimatePresence>
                  {showSort && (
                    <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }} transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-48 rounded-2xl overflow-hidden z-50"
                      style={{ background: colors.CARD_BG, border: `1px solid ${colors.BORDER}`, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
                      {sortOptions.map(opt => (
                        <button key={opt.id} onClick={() => { setSortBy(opt.id); setShowSort(false); }} className="w-full px-4 py-3 text-left"
                          style={{ color: sortBy === opt.id ? GOLD : colors.TEXT, fontWeight: sortBy === opt.id ? 700 : 400, fontSize: '13px', background: sortBy === opt.id ? 'rgba(201,162,39,0.08)' : 'transparent', borderBottom: `1px solid ${colors.BORDER}`, fontFamily: 'Manrope, sans-serif' }}>
                          {opt.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Product grid */}
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Search size={36} color={colors.MUTED} />
                <p style={{ color: colors.MUTED, fontSize: '14px' }}>Aucun résultat pour cette recherche</p>
              </div>
            ) : (
              <motion.div
                key={animKey}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
                {filteredProducts.map((product, idx) => (
                  <ProductCard key={product.id} product={product} index={idx} />
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Sort backdrop */}
      {showSort && <div className="fixed inset-0 z-40" onClick={() => setShowSort(false)} />}

      {/* Mobile filter sheet */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div className="fixed inset-0 z-[60]" style={{ background: 'rgba(0,0,0,0.3)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFilters(false)} />
            <motion.div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full z-[60] rounded-t-3xl p-6" style={{ maxWidth: '430px', background: CARD_BG, border: `1px solid ${BORDER}` }} initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
              <div className="flex items-center justify-between mb-6">
                <h3 style={{ color: TEXT, fontWeight: 700, fontSize: '18px' }}>Filtrer par</h3>
                <button onClick={() => setShowFilters(false)}><X size={20} color={MUTED} /></button>
              </div>
              <p style={{ color: GOLD, fontWeight: 700, fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>Catégorie</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {dynamicCategories.map(cat => {
                  const active = activeCategory === cat.id;
                  return (
                    <motion.button key={cat.id} onClick={() => changeCategory(cat.id)} className="px-4 py-2 rounded-full" whileTap={{ scale: 0.93 }}
                      style={{ background: active ? 'linear-gradient(135deg,#C9A227,#E8C84A)' : 'transparent', color: active ? '#fff' : MUTED, fontWeight: active ? 700 : 500, fontSize: '12px', border: active ? 'none' : `1px solid ${BORDER}` }}>
                      {cat.label}
                    </motion.button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between mb-3">
                <p style={{ color: GOLD, fontWeight: 700, fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase' }}>Tranche de prix</p>
                {priceActive && (
                  <button onClick={() => setPriceRange([0, Infinity])} style={{ color: MUTED, fontSize: '10px', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Manrope, sans-serif' }}>
                    Réinitialiser
                  </button>
                )}
              </div>
              <div className="mb-6 px-1">
                <PriceRangeSlider
                  min={globalMin} max={globalMax}
                  low={priceLow} high={priceHigh}
                  onChange={(l, h) => setPriceRange([l, h])}
                />
              </div>

              <motion.button onClick={() => setShowFilters(false)} className="w-full py-4 rounded-2xl" whileTap={{ scale: 0.97 }}
                style={{ background: 'linear-gradient(135deg,#C9A227,#E8C84A,#C9A227)', color: '#fff', fontWeight: 700, fontSize: '14px', boxShadow: '0 4px 16px rgba(201,162,39,0.3)' }}>
                Voir les {filteredProducts.length} pièces
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}