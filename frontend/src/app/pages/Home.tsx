import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Search, ShoppingBag, ArrowRight, Sparkles, Diamond, Clock } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { IMAGES, Product, categories as STATIC_CATEGORIES } from '../data/products';
import { useApp, useColors, useProducts } from '../context/AppContext';
import { MaisonMarnoaLogo } from '../components/MaisonMarnoaLogo';
import { SkeletonList, SkeletonHorizontal } from '../components/SkeletonCard';
import { ProductCard } from '../components/ProductCard';
import { trackEvent } from '../lib/analytics';
import { apiUrl } from '../lib/api';

type HeroSettings = {
  mediaUrl: string; mediaType: string;
  badge: string; title1: string; title2: string;
  subtitle: string; cta1: string; cta2: string;
};
const HERO_DEFAULTS: HeroSettings = {
  mediaUrl: '', mediaType: 'image',
  badge: 'Collection Exclusive', title1: 'Haute', title2: 'Joaillerie',
  subtitle: "L'excellence joaillière au cœur d'Abidjan. Des créations soigneusement sélectionnées aux quatre coins du monde.",
  cta1: 'Explorer la collection', cta2: 'Showroom Abidjan',
};

const GOLD = '#C9A227';

/** Scroll-reveal wrapper — fades + slides up when entering the viewport */
function SectionReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
}

function GoldText({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ background: 'linear-gradient(135deg,#B8860B,#D4AF35,#C9A227)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
      {children}
    </span>
  );
}


function CategoryPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  const { MUTED, BORDER } = useColors();
  return (
    <motion.button onClick={onClick} className="px-4 py-2 rounded-full whitespace-nowrap flex-shrink-0" whileTap={{ scale: 0.94 }}
      style={{ background: active ? 'linear-gradient(135deg,#C9A227,#E8C84A,#C9A227)' : 'transparent', color: active ? '#fff' : MUTED, fontWeight: active ? 700 : 500, fontSize: '12px', letterSpacing: '0.5px', border: active ? 'none' : `1px solid ${BORDER}`, boxShadow: active ? '0 4px 12px rgba(201,162,39,0.3)' : 'none', transition: 'all 0.2s' }}>
      {label}
    </motion.button>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { cartCount, recentlyViewed } = useApp();
  const colors = useColors();
  const products = useProducts();

  const { scrollY } = useScroll();
  const { BG, CARD_BG, BORDER, TEXT, MUTED } = colors;
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [hero, setHero] = useState<HeroSettings>(HERO_DEFAULTS);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroImgY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);

  useEffect(() => { const t = setTimeout(() => setLoading(false), 900); return () => clearTimeout(t); }, []);
  useEffect(() => { trackEvent({ type: 'VISIT_HOME' }); }, []);
  useEffect(() => {
    fetch(apiUrl('/api/settings/hero'))
      .then(r => r.ok ? r.json() : null)
      .then((d: HeroSettings | null) => { if (d) setHero(d); })
      .catch(() => {});
  }, []);

  const labelMap = Object.fromEntries(STATIC_CATEGORIES.map(c => [c.id, c.label]));
  const cats = [
    { id: 'all', label: 'Tous' },
    ...Array.from(new Set(products.map(p => p.category)))
      .sort()
      .map(id => ({ id, label: labelMap[id] ?? id.charAt(0).toUpperCase() + id.slice(1) })),
  ];
  const newArrivals = products.filter(p => p.isNew).slice(0, 8);
  const bestsellers = products.filter(p => p.isBestseller).slice(0, 8);
  const featured = products.filter(p => p.isFeatured).slice(0, 8);
  const filteredFeatured = activeCategory === 'all' ? featured : products.filter(p => p.category === activeCategory).slice(0, 8);
  const recentProducts = recentlyViewed.map(id => products.find(p => p.id === id)).filter(Boolean).slice(0, 8) as Product[];

  return (
    <div style={{ background: BG, minHeight: '100vh' }}>

      {/* ── Mobile-only header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="lg:hidden sticky top-0 z-40 px-5 pt-12 pb-4 flex items-center justify-between"
        style={{ background: `${BG}F5`, backdropFilter: 'blur(20px)', borderBottom: `1px solid ${BORDER}` }}
      >
        <MaisonMarnoaLogo variant="auto" size="md" />
        <div className="flex items-center gap-3">
          <motion.button onClick={() => navigate('/search')} className="w-10 h-10 flex items-center justify-center rounded-full" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }} whileTap={{ scale: 0.88 }}>
            <Search size={18} color={MUTED} />
          </motion.button>
          <motion.button className="w-10 h-10 flex items-center justify-center rounded-full relative" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }} onClick={() => navigate('/cart')} whileTap={{ scale: 0.88 }}>
            <ShoppingBag size={18} color={MUTED} />
            <AnimatePresence>
              {cartCount > 0 && <motion.span key="b" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px]" style={{ background: GOLD, color: '#fff', fontWeight: 700 }}>{cartCount}</motion.span>}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.div>

      {/* ── HERO ── */}
      <motion.div
        ref={heroRef}
        initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative mx-3 mt-3 lg:mx-0 lg:mt-0 lg:rounded-none rounded-3xl overflow-hidden"
      >
        {/* Background: video or image */}
        {hero.mediaType === 'video' && hero.mediaUrl ? (
          <video
            src={hero.mediaUrl} autoPlay muted loop playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{ transform: 'scale(1.12)' }}
          />
        ) : (
          <motion.img
            src={hero.mediaUrl || IMAGES.hero}
            alt="Maison Marnoa"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ y: heroImgY, scale: 1.12 }}
          />
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg,rgba(0,0,0,0.08) 0%,rgba(0,0,0,0.62) 100%)' }} />

        {/* Content — NOT absolute, drives the height of the hero */}
        <div className="relative z-10 flex flex-col justify-end px-5 pt-16 pb-6 lg:px-16 xl:px-20 lg:pt-28 lg:pb-14" style={{ minHeight: 'clamp(320px, 52vh, 580px)' }}>
          {hero.badge && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-3 w-fit"
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(8px)' }}>
              <Sparkles size={10} color="#fff" />
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '9px', letterSpacing: '2.5px', textTransform: 'uppercase' }}>{hero.badge}</span>
            </motion.div>
          )}

          <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}
            style={{ color: '#fff', fontWeight: 800, fontSize: 'clamp(26px, 7vw, 68px)', lineHeight: 1.1, marginBottom: '10px' }}>
            {hero.title1}<br />
            <span style={{ background: 'linear-gradient(135deg,#FFE17A,#C9A227)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{hero.title2}</span>
          </motion.h1>

          {hero.subtitle && (
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5 }}
              style={{ color: 'rgba(255,255,255,0.88)', fontSize: 'clamp(11px, 3.2vw, 17px)', lineHeight: 1.55, marginBottom: '18px', maxWidth: '420px' }}>
              {hero.subtitle}
            </motion.p>
          )}

          <div className="flex gap-2 flex-wrap">
            {hero.cta1 && (
              <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.5 }}
                whileTap={{ scale: 0.96 }} onClick={() => navigate('/collection')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full"
                style={{ background: 'linear-gradient(135deg,#C9A227,#E8C84A,#C9A227)', color: '#fff', fontWeight: 700, fontSize: 'clamp(11px,3vw,14px)', boxShadow: '0 4px 20px rgba(201,162,39,0.45)', whiteSpace: 'nowrap' }}>
                {hero.cta1} <ArrowRight size={14} />
              </motion.button>
            )}
            {hero.cta2 && (
              <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.5 }}
                whileTap={{ scale: 0.96 }} onClick={() => navigate('/appointment')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full"
                style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 600, fontSize: 'clamp(11px,3vw,14px)', border: '1px solid rgba(255,255,255,0.35)', backdropFilter: 'blur(8px)', whiteSpace: 'nowrap' }}>
                {hero.cta2}
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Brand promise strip (desktop only) ── */}
      <div className="hidden lg:flex items-center justify-center gap-0" style={{ borderBottom: `1px solid ${BORDER}` }}>
        {[
          { icon: '✦', label: 'Or 18K certifié' },
          { icon: '✦', label: 'Sélection mondiale' },
          { icon: '✦', label: 'Livraison sécurisée' },
          { icon: '✦', label: 'Garantie 2 ans' },
          { icon: '✦', label: 'Paiement en 3×' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2 flex-1 justify-center py-4 text-center" style={{ borderRight: i < 4 ? `1px solid ${BORDER}` : 'none' }}>
            <span style={{ color: GOLD, fontSize: '10px' }}>{item.icon}</span>
            <span style={{ color: MUTED, fontSize: '11px', fontWeight: 600, letterSpacing: '0.5px' }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="lg:max-w-[1400px] lg:mx-auto lg:px-10 xl:px-16">

        {/* Category Pills */}
        <div className="px-4 lg:px-0 mt-6 lg:mt-8">
          <div className="flex gap-2 overflow-x-auto lg:overflow-x-visible lg:flex-wrap pb-1" style={{ scrollbarWidth: 'none' }}>
            {cats.map(cat => (
              <CategoryPill key={cat.id} label={cat.label} active={activeCategory === cat.id} onClick={() => setActiveCategory(cat.id)} />
            ))}
          </div>
        </div>

        {/* Recently Viewed */}
        <AnimatePresence>
          {recentProducts.length > 0 && activeCategory === 'all' && (
            <SectionReveal>
            <motion.div key="recent" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-8">
              <div className="px-5 lg:px-0 flex items-center justify-between mb-5">
                <div>
                  <div className="flex items-center gap-1.5 mb-1"><Clock size={12} color={GOLD} /><p style={{ color: GOLD, fontWeight: 700, fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase' }}>VUS RÉCEMMENT</p></div>
                  <h2 style={{ color: TEXT, fontWeight: 700, fontSize: 'clamp(18px,2vw,24px)' }}>Votre Historique</h2>
                </div>
              </div>
              {/* Mobile: scroll horizontal / Desktop: grille */}
              {/* Bestseller List */}
        <div className="flex overflow-x-auto gap-4 md:gap-6 px-4 md:px-8 pb-12 snap-x snap-mandatory hide-scrollbar max-w-[1400px] mx-auto">
          {recentProducts.map((product, i) => (
            <div key={product.id} className="snap-start min-w-[160px] md:min-w-[200px] max-w-[200px] flex-shrink-0">
                    <ProductCard product={product} index={i} />
                  </div>
                ))}
              </div>
            </motion.div>
            </SectionReveal>
          )}
        </AnimatePresence>

        {/* New Arrivals */}
        <AnimatePresence mode="wait">
          {activeCategory === 'all' && (
            <SectionReveal delay={0.05}>
            <motion.div key="new" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-10">
              <div className="px-5 lg:px-0 flex items-center justify-between mb-5">
                <div>
                  <p style={{ color: GOLD, fontWeight: 700, fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase' }}>✦ NOUVEAUTÉS</p>
                  <h2 style={{ color: TEXT, fontWeight: 700, fontSize: 'clamp(18px,2vw,24px)' }}>Dernières Pièces</h2>
                </div>
                <motion.button onClick={() => navigate('/collection')} className="flex items-center gap-1" whileTap={{ scale: 0.93 }}>
                  <span style={{ color: GOLD, fontWeight: 700, fontSize: '12px' }}>Voir tout</span><ArrowRight size={13} color={GOLD} />
                </motion.button>
              </div>
              {/* Mobile: scroll / Desktop: grille 4 cols */}
              <div className="flex gap-3 px-5 lg:px-0 overflow-x-auto pb-2 lg:overflow-visible lg:grid lg:grid-cols-4 xl:grid-cols-5 lg:gap-4" style={{ scrollbarWidth: 'none' }}>
                {loading
                  ? <SkeletonHorizontal count={4} />
                  : newArrivals.map((p, i) => (
                    <div key={p.id} className="flex-shrink-0 w-[160px] lg:w-auto">
                      <ProductCard product={p} index={i} />
                    </div>
                  ))}
              </div>
            </motion.div>
            </SectionReveal>
          )}
        </AnimatePresence>

        {/* Bestsellers / Filtered */}
        <SectionReveal delay={0.08}>
        <div className="mt-10 px-4 lg:px-0 pb-28 lg:pb-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p style={{ color: GOLD, fontWeight: 700, fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase' }}>✦ SÉLECTION</p>
              <h2 style={{ color: TEXT, fontWeight: 700, fontSize: 'clamp(18px,2vw,24px)' }}>
                {activeCategory === 'all' ? 'Meilleures Ventes' : cats.find(c => c.id === activeCategory)?.label}
              </h2>
            </div>
            <motion.button onClick={() => navigate(`/collection${activeCategory !== 'all' ? `?category=${activeCategory}` : ''}`)} className="flex items-center gap-1" whileTap={{ scale: 0.93 }}>
              <span style={{ color: GOLD, fontWeight: 700, fontSize: '12px' }}>Voir tout</span><ArrowRight size={13} color={GOLD} />
            </motion.button>
          </div>
          {/* Product grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
            {loading
              ? <SkeletonList count={4} />
              : (activeCategory === 'all' ? bestsellers : filteredFeatured).map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </div>
        </SectionReveal>

        {/* Brand Promise — desktop: 2 colonnes */}
        <SectionReveal delay={0.1}>
        <div
          className="mx-4 lg:mx-0 mt-10 rounded-2xl overflow-hidden"
          style={{ border: `1px solid ${BORDER}` }}
        >
          <div className="lg:grid lg:grid-cols-2">
            {/* Left: texte */}
            <div className="p-6 lg:p-10 flex flex-col justify-center" style={{ background: CARD_BG }}>
              <div className="flex items-center gap-2 mb-4">
                <Diamond size={16} color={GOLD} />
                <span style={{ color: GOLD, fontWeight: 700, fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase' }}>Notre Promesse</span>
              </div>
              <h2 style={{ color: TEXT, fontWeight: 800, fontSize: 'clamp(20px,2.5vw,32px)', lineHeight: 1.25, marginBottom: '12px' }}>
                La Haute Joaillerie<br /><GoldText>à votre portée</GoldText>
              </h2>
              <p style={{ color: MUTED, fontSize: 'clamp(12px,1.1vw,14px)', lineHeight: 1.7, marginBottom: '24px', maxWidth: '400px' }}>
                Maison Marnoa sélectionne rigoureusement les plus belles pièces auprès des meilleurs créateurs et maisons joaillières à travers le monde, pour vous les proposer à Abidjan.
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[{ label: 'Or 18K', sub: 'Certifié' }, { label: '100%', sub: 'Sélectionnés' }, { label: 'Monde', sub: 'Origines' }].map(item => (
                  <div key={item.label} className="rounded-xl p-3 text-center" style={{ background: 'linear-gradient(135deg,#FDF8E8,#FFF3C0)', border: `1px solid rgba(201,162,39,0.2)` }}>
                    <p style={{ color: GOLD, fontWeight: 800, fontSize: 'clamp(15px,1.5vw,20px)' }}>{item.label}</p>
                    <p style={{ color: MUTED, fontWeight: 500, fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase' }}>{item.sub}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* Right: image */}
            <div className="hidden lg:block relative" style={{ minHeight: '300px' }}>
              <img src={IMAGES.hero} alt="Atelier Marnoa" className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,rgba(0,0,0,0.1),transparent)' }} />
            </div>
          </div>
        </div>
        </SectionReveal>

        {/* Showroom Banner */}
        <SectionReveal delay={0.12}>
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-4 lg:mx-0 mt-4 mb-2 rounded-2xl overflow-hidden relative cursor-pointer"
          style={{ height: 'clamp(100px,12vw,160px)' }}
          onClick={() => navigate('/appointment')}
        >
          <img src={IMAGES.packaging} alt="Showroom" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,rgba(0,0,0,0.6) 0%,rgba(0,0,0,0.2) 100%)' }} />
          <div className="absolute inset-0 flex items-center justify-between px-6 lg:px-12">
            <div>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '4px' }}>✦ SHOWROOM ABIDJAN</p>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: 'clamp(14px,1.8vw,22px)' }}>Essayez en boutique</p>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'clamp(11px,1vw,14px)' }}>Réservez votre rendez-vous</p>
            </div>
            <motion.div whileHover={{ scale: 1.08 }} className="w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#C9A227,#E8C84A)', boxShadow: '0 4px 16px rgba(201,162,39,0.4)' }}>
              <ArrowRight size={18} color="#fff" />
            </motion.div>
          </div>
        </motion.div>
        </SectionReveal>

      </div>{/* /max-w container */}
      <div className="h-28 lg:h-8" />
    </div>
  );
}
