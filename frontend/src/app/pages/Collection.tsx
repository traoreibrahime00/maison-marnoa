import { useApp, useProducts } from '../context/AppContext';
import { useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router';
import { Search, SlidersHorizontal, Heart, Star, ChevronDown, X, Check, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { categories, formatPrice, ProductCategory } from '../data/products';
import { ReassuranceBannerMobile } from '../components/ReassuranceBanner';

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
  const { colors, toggleWishlist, isWishlisted } = useApp();
  const { BG, CARD_BG, BORDER, TEXT, MUTED } = colors;
  const products = useProducts();

  const initialCategory = (params.get('category') as ProductCategory) || 'all';
  const [activeCategory, setActiveCategory] = useState<ProductCategory>(initialCategory);
  const [sortBy, setSortBy] = useState('featured');
  const [showSort, setShowSort] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [animKey, setAnimKey] = useState(0);

  function changeCategory(cat: ProductCategory) {
    setActiveCategory(cat);
    setAnimKey(k => k + 1);
  }

  const filteredProducts = products
    .filter(p => {
      const matchCat = activeCategory === 'all' || p.category === activeCategory;
      const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.collection.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
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
          <motion.button onClick={() => setShowFilters(true)} className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: colors.CARD_BG, border: `1px solid ${colors.BORDER}` }} whileTap={{ scale: 0.94 }}>
            <SlidersHorizontal size={14} color={colors.MUTED} /><span style={{ color: colors.MUTED, fontWeight: 600, fontSize: '11px' }}>Filtrer</span>
          </motion.button>
        </div>
        <div className="px-5 mb-4">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ background: colors.CARD_BG, border: `1px solid ${colors.BORDER}` }}>
            <Search size={16} color={colors.MUTED} />
            <input type="text" placeholder="Rechercher..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="flex-1 bg-transparent outline-none" style={{ color: colors.TEXT, fontFamily: 'Manrope, sans-serif', fontSize: '13px' }} />
            {searchQuery && <button onClick={() => setSearchQuery('')}><X size={14} color={colors.MUTED} /></button>}
          </div>
        </div>
        <div className="flex gap-2 px-5 pb-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {categories.map(cat => {
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
                  {categories.map(cat => {
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
                {filteredProducts.map((product, idx) => {
                  const wishlisted = isWishlisted(product.id);
                  const isHovered = hoveredCard === product.id;
                  return (
                    <motion.div key={product.id}
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: Math.min(idx * 0.04, 0.4) }}
                      whileTap={{ scale: 0.97 }}
                      className="rounded-2xl overflow-hidden cursor-pointer group relative"
                      style={{ background: colors.CARD_BG, border: `1px solid ${colors.BORDER}`, boxShadow: isHovered ? '0 8px 32px rgba(201,162,39,0.18)' : '0 2px 12px rgba(0,0,0,0.06)', transition: 'box-shadow 0.25s' }}
                      onClick={() => navigate(`/product/${product.id}`)}
                      onMouseEnter={() => setHoveredCard(product.id)}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      <div className="relative overflow-hidden" style={{ aspectRatio: '1/1' }}>
                        <motion.img src={product.image} alt={product.name} className="w-full h-full object-cover"
                          animate={{ scale: isHovered ? 1.07 : 1 }}
                          transition={{ duration: 0.4 }}
                        />
                        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom,transparent 55%,rgba(0,0,0,0.12) 100%)' }} />

                        {/* Desktop hover overlay */}
                        <AnimatePresence>
                          {isHovered && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="absolute inset-0 hidden lg:flex flex-col items-center justify-center gap-2"
                              style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(201,162,39,0.28) 100%)', backdropFilter: 'blur(1px)' }}
                            >
                              <motion.div
                                initial={{ scale: 0.85, opacity: 0, y: 8 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                transition={{ delay: 0.05, duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
                                className="flex items-center gap-2 px-4 py-2 rounded-full"
                                style={{ background: 'linear-gradient(135deg,#C9A227,#E8C84A)', color: '#fff', fontWeight: 700, fontSize: '12px', boxShadow: '0 4px 16px rgba(201,162,39,0.5)' }}
                              >
                                Voir la pièce <ArrowRight size={12} />
                              </motion.div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {(product.isNew || product.isBestseller) && (
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full"
                            style={{ background: product.isNew ? 'linear-gradient(135deg,#C9A227,#E8C84A)' : 'rgba(255,255,255,0.92)', color: product.isNew ? '#fff' : GOLD, fontWeight: 700, fontSize: '8px', letterSpacing: '1px', textTransform: 'uppercase', border: product.isNew ? 'none' : `1px solid ${GOLD}`, backdropFilter: 'blur(8px)' }}>
                            {product.isNew ? 'Nouveau' : 'Top vente'}
                          </div>
                        )}
                        <motion.button
                          className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', border: `1px solid ${wishlisted ? GOLD : 'rgba(0,0,0,0.08)'}` }}
                          whileTap={{ scale: 0.84 }} onClick={e => { e.stopPropagation(); toggleWishlist(product.id); }}>
                          <Heart size={13} fill={wishlisted ? GOLD : 'none'} color={wishlisted ? GOLD : MUTED} />
                        </motion.button>
                      </div>
                      <div className="p-3 lg:p-4">
                        <p style={{ color: GOLD, fontWeight: 700, fontSize: '8px', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '2px' }}>{product.collection}</p>
                        <p className="truncate" style={{ color: TEXT, fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>{product.name}</p>
                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => <Star key={i} size={8} fill={i < Math.floor(product.rating) ? GOLD : 'none'} color={GOLD} />)}
                          <span style={{ color: MUTED, fontSize: '9px' }}>({product.reviews})</span>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                          <span style={{ color: GOLD, fontWeight: 800, fontSize: '14px' }}>{formatPrice(product.price)}</span>
                          {product.originalPrice && <span style={{ color: '#B0A090', fontSize: '10px', textDecoration: 'line-through' }}>{formatPrice(product.originalPrice)}</span>}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
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
                {categories.map(cat => {
                  const active = activeCategory === cat.id;
                  return (
                    <motion.button key={cat.id} onClick={() => { changeCategory(cat.id as ProductCategory); setShowFilters(false); }} className="px-4 py-2 rounded-full" whileTap={{ scale: 0.93 }}
                      style={{ background: active ? 'linear-gradient(135deg,#C9A227,#E8C84A)' : 'transparent', color: active ? '#fff' : MUTED, fontWeight: active ? 700 : 500, fontSize: '12px', border: active ? 'none' : `1px solid ${BORDER}` }}>
                      {cat.label}
                    </motion.button>
                  );
                })}
              </div>
              <motion.button onClick={() => setShowFilters(false)} className="w-full py-4 rounded-2xl" whileTap={{ scale: 0.97 }}
                style={{ background: 'linear-gradient(135deg,#C9A227,#E8C84A,#C9A227)', color: '#fff', fontWeight: 700, fontSize: '14px', boxShadow: '0 4px 16px rgba(201,162,39,0.3)' }}>
                Appliquer les filtres
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}