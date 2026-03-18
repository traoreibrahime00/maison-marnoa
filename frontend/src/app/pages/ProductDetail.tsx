import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  ArrowLeft, Heart, Share2, Star, ShoppingBag, Ruler, Package,
  Shield, ChevronRight, Plus, Minus, ZoomIn, X, Eye, Flame,
  Check, Gift, CreditCard, ChevronDown, ChevronUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatPrice, IMAGES, Product } from '../data/products';
import { useApp, useColors, useProducts } from '../context/AppContext';
import { toast } from 'sonner';
import { trackEvent } from '../lib/analytics';

const GOLD = '#C9A227';

function StarRating({ rating, size = 12 }: { rating: number; size?: number }) {
  return (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={size} fill={i < Math.floor(rating) ? GOLD : (i < rating ? GOLD : 'none')} color={GOLD} style={{ opacity: i < rating ? 1 : 0.3 }} />
      ))}
    </div>
  );
}

export default function ProductDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { addToCart, toggleWishlist, isWishlisted, addToRecentlyViewed } = useApp();
  const { BG, CARD_BG, BORDER, TEXT, MUTED } = useColors();
  const products = useProducts();

  const product = products.find(p => p.id === id);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<number | undefined>(product?.sizes?.[0]);
  const [selectedColor, setSelectedColor] = useState<string>(product?.colorVariants?.[0]?.id ?? '');
  const [qty, setQty] = useState(1);
  const [addedAnim, setAddedAnim] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [expandDesc, setExpandDesc] = useState(false);
  const [showZoom, setShowZoom] = useState(false);
  const [showPackaging, setShowPackaging] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const [viewers] = useState(() => Math.floor(Math.random() * 12) + 3);
  const ctaRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Track recently viewed
  useEffect(() => {
    if (id) addToRecentlyViewed(id);
    if (id) trackEvent({ type: 'PRODUCT_VIEW', productId: id });
  }, [id, addToRecentlyViewed]);

  // Sticky CTA observer
  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => setShowStickyCTA(!entry.isIntersecting), { threshold: 0 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = null;
  }, []);
  const onTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  }, []);
  const onTouchEnd = useCallback(() => {
    if (touchStartX.current === null || touchEndX.current === null || !product) return;
    const dist = touchStartX.current - touchEndX.current;
    if (Math.abs(dist) >= 50) {
      if (dist > 0) setActiveImage(prev => Math.min(prev + 1, product.images.length - 1));
      else setActiveImage(prev => Math.max(prev - 1, 0));
    }
  }, [product]);

  if (!product) {
    return (
      <div style={{ background: BG, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="text-center">
          <p style={{ color: MUTED, fontFamily: 'Manrope, sans-serif' }}>Produit introuvable</p>
          <button onClick={() => navigate('/collection')} style={{ color: GOLD, fontFamily: 'Manrope, sans-serif', marginTop: '16px' }}>Retour à la collection</button>
        </div>
      </div>
    );
  }

  const wishlisted = isWishlisted(product.id);
  const similar = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  const installmentAmount = formatPrice(Math.round(product.price / 3));

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addToCart(product, selectedSize);
    setAddedAnim(true);
    toast('🛍️ Ajouté au panier !', { description: `${product.name}${selectedSize ? ` — Taille ${selectedSize}` : ''}`, duration: 2500 });
    setTimeout(() => setAddedAnim(false), 2000);
  };

  const handleBuyNow = () => {
    for (let i = 0; i < qty; i++) addToCart(product, selectedSize);
    navigate('/checkout');
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, text: `Découvrez ce bijou chez Maison Marnoa`, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast('🔗 Lien copié !', { duration: 2000 });
      }
    } catch {}
  };

  return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: 'Manrope, sans-serif' }}>

      {/* ══ DESKTOP: 2-col layout ══ */}
      <div className="lg:max-w-[1400px] lg:mx-auto lg:px-10 xl:px-16 lg:pt-8 lg:pb-16 lg:flex lg:gap-12">

      {/* ── LEFT : Gallery ── */}
      <div
        className="lg:w-[520px] xl:w-[580px] lg:flex-shrink-0 relative"
        onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
      >
        {/* On desktop: taller gallery */}
        <div className="hidden lg:block lg:sticky lg:top-24" style={{ height: '580px', background: '#F5EFE0', borderRadius: 20, overflow: 'hidden' }}>
          <AnimatePresence mode="wait">
            <motion.img key={`d-${activeImage}`} src={product.images[activeImage]} alt={product.name}
              className="w-full h-full object-cover cursor-zoom-in"
              initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.35 }}
              onClick={() => setShowZoom(true)} />
          </AnimatePresence>
          {/* Thumbnail strip */}
          {product.images.length > 1 && (
            <div className="absolute bottom-4 left-4 flex gap-2">
              {product.images.map((img, i) => (
                <motion.button key={i} onClick={() => setActiveImage(i)} className="w-14 h-14 rounded-xl overflow-hidden" style={{ border: `2px solid ${i === activeImage ? GOLD : 'rgba(255,255,255,0.5)'}`, opacity: i === activeImage ? 1 : 0.65 }} whileTap={{ scale: 0.88 }}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Mobile gallery (unchanged) */}
        <div className="lg:hidden relative" style={{ height: 'clamp(300px, 85vw, 420px)', background: '#F5EFE0' }}>
          <AnimatePresence mode="wait">
            <motion.img key={activeImage} src={product.images[activeImage]} alt={product.name}
              className="w-full h-full object-cover select-none"
              initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.35 }}
              onClick={() => setShowZoom(true)} />
          </AnimatePresence>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom,rgba(0,0,0,0.15) 0%,transparent 35%,rgba(0,0,0,0.18) 100%)', pointerEvents: 'none' }} />
          {product.images.length > 1 && (
            <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-3">
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => setActiveImage(prev => Math.max(prev - 1, 0))}
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer' }}
              >
                <ArrowLeft size={15} color="#fff" />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => setActiveImage(prev => Math.min(prev + 1, product.images.length - 1))}
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer' }}
              >
                <ArrowLeft size={15} color="#fff" style={{ transform: 'rotate(180deg)' }} />
              </motion.button>
            </div>
          )}
          {/* Mobile top bar */}
          <div className="absolute top-0 left-0 right-0 pt-12 px-5 flex items-center justify-between">
            <motion.button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', border: `1px solid rgba(0,0,0,0.08)` }} whileTap={{ scale: 0.88 }}><ArrowLeft size={18} color={TEXT} /></motion.button>
            <div className="flex gap-2">
              <motion.button onClick={() => toggleWishlist(product.id)} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', border: `1px solid ${wishlisted ? GOLD : 'rgba(0,0,0,0.08)'}` }} whileTap={{ scale: 0.88 }}><Heart size={16} fill={wishlisted ? GOLD : 'none'} color={wishlisted ? GOLD : TEXT} /></motion.button>
              <motion.button onClick={handleShare} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', border: `1px solid rgba(0,0,0,0.08)` }} whileTap={{ scale: 0.88 }}><Share2 size={16} color={TEXT} /></motion.button>
              <motion.button onClick={() => setShowZoom(true)} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', border: `1px solid rgba(0,0,0,0.08)` }} whileTap={{ scale: 0.88 }}><ZoomIn size={16} color={TEXT} /></motion.button>
            </div>
          </div>
          {product.images.length > 1 && (
            <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-2">
              {product.images.map((_, i) => (
                <motion.button key={i} onClick={() => setActiveImage(i)} className="rounded-full" animate={{ width: i === activeImage ? '20px' : '6px', background: i === activeImage ? GOLD : 'rgba(255,255,255,0.6)' }} style={{ height: '6px' }} />
              ))}
            </div>
          )}
          {product.images.length > 1 && (
            <div className="absolute bottom-5 left-5 flex gap-2">
              {product.images.map((img, i) => (
                <motion.button key={i} onClick={() => setActiveImage(i)} className="w-12 h-12 rounded-xl overflow-hidden" style={{ border: `2px solid ${i === activeImage ? GOLD : 'rgba(255,255,255,0.5)'}`, opacity: i === activeImage ? 1 : 0.7 }} whileTap={{ scale: 0.88 }}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT : Product Info ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="rounded-t-3xl lg:rounded-none -mt-6 lg:mt-0 relative z-10 px-5 lg:px-0 pt-6 pb-32 lg:pb-8 lg:flex-1 lg:min-w-0"
        style={{ background: BG }}>

        {/* Desktop: back + share row */}
        <div className="hidden lg:flex items-center justify-between mb-6">
          <motion.button onClick={() => navigate(-1)} className="flex items-center gap-2" style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED, fontSize: '13px', fontWeight: 500 }} whileHover={{ x: -3 }}>
            <ArrowLeft size={16} color={MUTED} /> Retour à la collection
          </motion.button>
          <div className="flex gap-2">
            <motion.button onClick={() => toggleWishlist(product.id)} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: CARD_BG, border: `1px solid ${wishlisted ? GOLD : BORDER}` }} whileTap={{ scale: 0.88 }}><Heart size={16} fill={wishlisted ? GOLD : 'none'} color={wishlisted ? GOLD : MUTED} /></motion.button>
            <motion.button onClick={handleShare} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }} whileTap={{ scale: 0.88 }}><Share2 size={16} color={MUTED} /></motion.button>
            <motion.button onClick={() => setShowZoom(true)} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }} whileTap={{ scale: 0.88 }}><ZoomIn size={16} color={MUTED} /></motion.button>
          </div>
        </div>

        {/* Scarcity + Social Proof */}
        <div className="flex items-center gap-3 mb-3">
          {product.stock && product.stock <= 5 && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
              <Flame size={10} color="#ef4444" />
              <span style={{ color: '#ef4444', fontWeight: 700, fontSize: '10px' }}>Plus que {product.stock} en stock</span>
            </motion.div>
          )}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: 'rgba(201,162,39,0.08)', border: `1px solid rgba(201,162,39,0.2)` }}>
            <Eye size={10} color={GOLD} />
            <span style={{ color: GOLD, fontWeight: 700, fontSize: '10px' }}>{viewers} personnes regardent</span>
          </div>
        </div>

        {/* Collection + Rating */}
        <div className="flex items-center justify-between mb-2">
          <span style={{ color: GOLD, fontWeight: 700, fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase' }}>{product.collection}</span>
          <button onClick={() => setShowReviews(true)} className="flex items-center gap-1.5">
            <StarRating rating={product.rating} size={12} />
            <span style={{ color: MUTED, fontSize: '11px' }}>{product.rating} ({product.reviews})</span>
          </button>
        </div>

        {/* Name */}
        <h1 style={{ color: TEXT, fontWeight: 800, fontSize: '26px', lineHeight: 1.2, marginBottom: '8px' }}>{product.name}</h1>

        {/* Price + Installments */}
        <div className="mb-5">
          <div className="flex items-center gap-3 mb-2">
            <span style={{ fontWeight: 800, fontSize: '24px', background: 'linear-gradient(135deg, #B8860B, #D4AF35)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span style={{ color: '#B0A090', fontSize: '14px', textDecoration: 'line-through' }}>{formatPrice(product.originalPrice)}</span>
            )}
          </div>
          {/* Installments */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl w-fit" style={{ background: 'rgba(201,162,39,0.06)', border: `1px solid rgba(201,162,39,0.2)` }}>
            <CreditCard size={12} color={GOLD} />
            <span style={{ color: GOLD, fontWeight: 600, fontSize: '11px' }}>ou 3×{installmentAmount} sans frais</span>
          </div>
        </div>

        {/* Color Variants */}
        {product.colorVariants && product.colorVariants.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <span style={{ color: TEXT, fontWeight: 700, fontSize: '14px' }}>
                Métal — <span style={{ color: MUTED, fontWeight: 500 }}>{product.colorVariants.find(c => c.id === selectedColor)?.label}</span>
              </span>
            </div>
            <div className="flex gap-3">
              {product.colorVariants.map(variant => {
                const active = selectedColor === variant.id;
                return (
                  <motion.button key={variant.id} onClick={() => setSelectedColor(variant.id)} whileTap={{ scale: 0.9 }} className="flex flex-col items-center gap-1.5">
                    <div className="relative w-9 h-9 rounded-full" style={{ border: `2.5px solid ${active ? GOLD : 'transparent'}`, padding: '2px' }}>
                      <div className="w-full h-full rounded-full" style={{ background: variant.hexColor, border: '1px solid rgba(0,0,0,0.1)', boxShadow: active ? `0 0 0 2px ${GOLD}30` : 'none' }} />
                      {active && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: GOLD }}>
                          <Check size={9} color="#fff" />
                        </div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {/* Specs */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="px-4 py-3 rounded-2xl" style={{ background: CARD_BG, border: `1px solid ${BORDER}`, boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
            <p style={{ color: MUTED, fontWeight: 600, fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '4px' }}>MÉTAL</p>
            <p style={{ color: TEXT, fontWeight: 600, fontSize: '13px' }}>{product.material}</p>
          </div>
          <div className="px-4 py-3 rounded-2xl" style={{ background: CARD_BG, border: `1px solid ${BORDER}`, boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
            <p style={{ color: MUTED, fontWeight: 600, fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '4px' }}>POIDS</p>
            <p style={{ color: TEXT, fontWeight: 600, fontSize: '13px' }}>{product.weight}</p>
          </div>
        </div>

        {/* Size Selection */}
        {product.sizes && (
          <div className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <span style={{ color: TEXT, fontWeight: 700, fontSize: '14px' }}>Taille</span>
              <button onClick={() => setShowSizeGuide(true)} className="flex items-center gap-1">
                <Ruler size={12} color={GOLD} />
                <span style={{ color: GOLD, fontWeight: 600, fontSize: '11px' }}>Guide des tailles</span>
              </button>
            </div>
            <div className="flex gap-2">
              {product.sizes.map(size => {
                const active = selectedSize === size;
                return (
                  <motion.button key={size} onClick={() => setSelectedSize(size)} className="w-12 h-12 rounded-2xl flex items-center justify-center" whileTap={{ scale: 0.9 }} style={{ background: active ? 'linear-gradient(135deg, #C9A227, #E8C84A)' : CARD_BG, border: `1.5px solid ${active ? GOLD : BORDER}`, color: active ? '#fff' : TEXT, fontWeight: active ? 700 : 500, fontSize: '14px', boxShadow: active ? '0 4px 12px rgba(201,162,39,0.3)' : '0 1px 4px rgba(0,0,0,0.04)', transition: 'all 0.2s' }}>
                    {size}
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {/* Description */}
        <div className="mb-5">
          <h3 style={{ color: TEXT, fontWeight: 700, fontSize: '15px', marginBottom: '8px' }}>Description</h3>
          <p style={{ color: MUTED, fontSize: '13px', lineHeight: 1.7, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: expandDesc ? 'unset' : 3, WebkitBoxOrient: 'vertical' } as React.CSSProperties}>
            {product.description}
          </p>
          <button onClick={() => setExpandDesc(!expandDesc)} style={{ color: GOLD, fontWeight: 600, fontSize: '12px', marginTop: '6px' }}>
            {expandDesc ? 'Voir moins' : 'Voir plus'}
          </button>
        </div>

        {/* Guarantees */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {[{ icon: Shield, label: 'Garantie 2 ans' }, { icon: Package, label: 'Livraison sécurisée' }, { icon: Star, label: 'Or certifié 18K' }].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1.5 p-3 rounded-2xl" style={{ background: CARD_BG, border: `1px solid ${BORDER}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FDF8E8, #FFF3C0)' }}>
                <Icon size={14} color={GOLD} />
              </div>
              <span style={{ color: MUTED, fontSize: '9px', textAlign: 'center', lineHeight: 1.3, fontWeight: 600, letterSpacing: '0.3px' }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Packaging Preview — "Waouh" animated button */}
        <PackagingPreviewButton onOpen={() => setShowPackaging(true)} CARD_BG={CARD_BG} BORDER={BORDER} TEXT={TEXT} MUTED={MUTED} GOLD={GOLD} packagingImg={IMAGES.packaging} />

        {/* Quantity + Add to Cart */}
        <div ref={ctaRef} className="flex gap-3 mb-4">
          <div className="flex items-center gap-3 px-4 rounded-2xl" style={{ background: CARD_BG, border: `1px solid ${BORDER}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <motion.button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-8 h-8 flex items-center justify-center rounded-full" style={{ background: qty === 1 ? 'transparent' : 'rgba(201,162,39,0.12)' }} whileTap={{ scale: 0.85 }}>
              <Minus size={14} color={qty === 1 ? MUTED : GOLD} />
            </motion.button>
            <span style={{ color: TEXT, fontWeight: 700, fontSize: '16px', minWidth: '20px', textAlign: 'center' }}>{qty}</span>
            <motion.button onClick={() => setQty(q => q + 1)} className="w-8 h-8 flex items-center justify-center rounded-full" style={{ background: 'rgba(201,162,39,0.12)' }} whileTap={{ scale: 0.85 }}>
              <Plus size={14} color={GOLD} />
            </motion.button>
          </div>
          <motion.button onClick={handleAddToCart} className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl" whileTap={{ scale: 0.97 }} style={{ background: addedAnim ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'linear-gradient(135deg, #C9A227 0%, #E8C84A 50%, #C9A227 100%)', transition: 'background 0.3s ease', boxShadow: addedAnim ? '0 4px 16px rgba(34,197,94,0.3)' : '0 4px 16px rgba(201,162,39,0.35)' }}>
            <ShoppingBag size={18} color="#fff" />
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '14px' }}>{addedAnim ? 'Ajouté !' : 'Ajouter au panier'}</span>
          </motion.button>
        </div>

        {/* Buy Now */}
        <motion.button onClick={handleBuyNow} className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl mb-6" whileTap={{ scale: 0.97 }} style={{ background: 'transparent', border: `1.5px solid ${GOLD}`, color: GOLD, fontWeight: 700, fontSize: '14px' }}>
          ⚡ Acheter Maintenant
        </motion.button>

        {/* Reviews Section */}
        {product.reviewsList && product.reviewsList.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 style={{ color: TEXT, fontWeight: 700, fontSize: '16px' }}>Avis clients</h3>
                <div className="flex items-center gap-2 mt-1">
                  <StarRating rating={product.rating} size={14} />
                  <span style={{ color: MUTED, fontSize: '12px' }}>{product.rating}/5 · {product.reviews} avis</span>
                </div>
              </div>
              <button onClick={() => setShowReviews(true)} className="flex items-center gap-1">
                <span style={{ color: GOLD, fontWeight: 600, fontSize: '11px' }}>Voir tout</span>
                <ChevronRight size={12} color={GOLD} />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {product.reviewsList.slice(0, 2).map(review => (
                <div key={review.id} className="p-4 rounded-2xl" style={{ background: CARD_BG, border: `1px solid ${BORDER}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #C9A227, #E8C84A)' }}>
                        <span style={{ color: '#fff', fontWeight: 700, fontSize: '11px' }}>{review.initials}</span>
                      </div>
                      <div>
                        <p style={{ color: TEXT, fontWeight: 600, fontSize: '12px' }}>{review.author}</p>
                        <p style={{ color: MUTED, fontSize: '10px' }}>{review.location}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <StarRating rating={review.rating} size={10} />
                      {review.verified && (
                        <span className="flex items-center gap-0.5" style={{ color: '#22c55e', fontSize: '9px', fontWeight: 600 }}>
                          <Check size={8} /> Achat vérifié
                        </span>
                      )}
                    </div>
                  </div>
                  <p style={{ color: MUTED, fontSize: '12px', lineHeight: 1.6 }}>{review.text}</p>
                  <p style={{ color: '#B0A090', fontSize: '10px', marginTop: '6px' }}>{review.date}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Similar Products */}
        {similar.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ color: TEXT, fontWeight: 700, fontSize: '16px' }}>Produits similaires</h3>
              <button onClick={() => navigate(`/collection?category=${product.category}`)} className="flex items-center gap-1">
                <span style={{ color: GOLD, fontWeight: 600, fontSize: '11px' }}>Voir tout</span>
                <ChevronRight size={12} color={GOLD} />
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
              {similar.map(p => (
                <motion.div key={p.id} className="flex-shrink-0 w-36 rounded-2xl overflow-hidden cursor-pointer" style={{ background: CARD_BG, border: `1px solid ${BORDER}`, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} onClick={() => navigate(`/product/${p.id}`)} whileTap={{ scale: 0.96 }}>
                  <img src={p.image} alt={p.name} className="w-full aspect-square object-cover" />
                  <div className="p-2">
                    <p className="truncate" style={{ color: TEXT, fontWeight: 600, fontSize: '11px', marginBottom: '2px' }}>{p.name}</p>
                    <p style={{ color: GOLD, fontWeight: 700, fontSize: '11px' }}>{formatPrice(p.price)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      </div>{/* /desktop 2-col */}

      {/* ===== STICKY BOTTOM CTA (mobile only) ===== */}
      <AnimatePresence>
        {showStickyCTA && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed left-1/2 -translate-x-1/2 w-full z-40 px-4 py-3 lg:hidden"
            style={{ bottom: '76px', maxWidth: '430px', background: `${BG}F8`, backdropFilter: 'blur(20px)', borderTop: `1px solid ${BORDER}`, boxShadow: '0 -4px 16px rgba(0,0,0,0.08)' }}
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="truncate" style={{ color: TEXT, fontWeight: 600, fontSize: '12px', maxWidth: '160px' }}>{product.name}</p>
                <span style={{ fontWeight: 800, fontSize: '14px', background: 'linear-gradient(135deg, #B8860B, #D4AF35)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {formatPrice(product.price)}
                </span>
              </div>
              <div className="flex gap-2">
                <motion.button onClick={handleAddToCart} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl" whileTap={{ scale: 0.95 }} style={{ background: addedAnim ? '#22c55e' : 'linear-gradient(135deg, #C9A227, #E8C84A)', color: '#fff', fontWeight: 700, fontSize: '12px', boxShadow: '0 3px 12px rgba(201,162,39,0.35)' }}>
                  <ShoppingBag size={14} />
                  {addedAnim ? 'Ajouté !' : 'Panier'}
                </motion.button>
                <motion.button onClick={handleBuyNow} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl" whileTap={{ scale: 0.95 }} style={{ background: 'transparent', border: `1.5px solid ${GOLD}`, color: GOLD, fontWeight: 700, fontSize: '12px' }}>
                  ⚡ Acheter
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== IMAGE ZOOM MODAL ===== */}
      <AnimatePresence>
        {showZoom && (
          <>
            <motion.div className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.92)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowZoom(false)} />
            <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <img src={product.images[activeImage]} alt={product.name} className="w-full h-auto max-h-[85vh] object-contain rounded-2xl" />
              <button onClick={() => setShowZoom(false)} className="absolute top-14 right-4 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
                <X size={18} color="#fff" />
              </button>
              {product.images.length > 1 && (
                <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2">
                  {product.images.map((_, i) => (
                    <button key={i} onClick={() => setActiveImage(i)} className="w-2 h-2 rounded-full transition-all" style={{ background: i === activeImage ? GOLD : 'rgba(255,255,255,0.4)' }} />
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ===== PACKAGING MODAL — "Waouh" effect ===== */}
      <AnimatePresence>
        {showPackaging && (
          <>
            <motion.div className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.5)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPackaging(false)} />
            <motion.div
              className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full z-50 rounded-t-3xl overflow-hidden"
              style={{ maxWidth: '480px', background: BG, border: `1px solid ${BORDER}` }}
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {/* ── Animated packaging reveal ── */}
              <PackagingAnimation packagingImg={IMAGES.packaging} GOLD={GOLD} onClose={() => setShowPackaging(false)} />

              <div className="p-5">
                {[
                  { icon: '🎁', title: 'Coffret signature', desc: 'Boîte rigide noire & or avec ruban satiné' },
                  { icon: '📜', title: "Certificat d'authenticité", desc: 'Numéroté, signé par nos experts joailliers' },
                  { icon: '🛍️', title: 'Sac cadeau Marnoa', desc: 'Papier de soie doré, carte de vœux incluse' },
                  { icon: '✨', title: 'Kit entretien offert', desc: 'Chiffon microfibre + guide des soins Or 18K' },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3 mb-4">
                    <span style={{ fontSize: '20px' }}>{item.icon}</span>
                    <div>
                      <p style={{ color: TEXT, fontWeight: 700, fontSize: '13px', marginBottom: '2px' }}>{item.title}</p>
                      <p style={{ color: MUTED, fontSize: '11px' }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
                <div className="flex items-center gap-2 px-4 py-3 rounded-2xl" style={{ background: 'linear-gradient(135deg, #FDF8E8, #FFF3C0)', border: `1px solid rgba(201,162,39,0.2)` }}>
                  <Gift size={16} color={GOLD} />
                  <p style={{ color: TEXT, fontWeight: 600, fontSize: '12px' }}>Emballage cadeau inclus dans chaque commande</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ===== ALL REVIEWS MODAL ===== */}
      <AnimatePresence>
        {showReviews && product.reviewsList && (
          <>
            <motion.div className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.4)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowReviews(false)} />
            <motion.div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full z-50 rounded-t-3xl" style={{ maxWidth: '430px', background: BG, border: `1px solid ${BORDER}`, maxHeight: '80vh', overflowY: 'auto' }} initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
              <div className="sticky top-0 px-5 pt-5 pb-4 flex items-center justify-between" style={{ background: BG, borderBottom: `1px solid ${BORDER}` }}>
                <div>
                  <h3 style={{ color: TEXT, fontWeight: 700, fontSize: '18px' }}>Avis clients</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating rating={product.rating} size={13} />
                    <span style={{ color: MUTED, fontSize: '12px' }}>{product.rating}/5 · {product.reviews} avis vérifiés</span>
                  </div>
                </div>
                <button onClick={() => setShowReviews(false)} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
                  <X size={16} color={MUTED} />
                </button>
              </div>
              <div className="p-5 flex flex-col gap-4">
                {product.reviewsList.map(review => (
                  <div key={review.id} className="p-4 rounded-2xl" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #C9A227, #E8C84A)' }}>
                          <span style={{ color: '#fff', fontWeight: 700, fontSize: '12px' }}>{review.initials}</span>
                        </div>
                        <div>
                          <p style={{ color: TEXT, fontWeight: 600, fontSize: '13px' }}>{review.author}</p>
                          <p style={{ color: MUTED, fontSize: '10px' }}>{review.location}</p>
                        </div>
                      </div>
                      {review.verified && (
                        <span className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: 'rgba(34,197,94,0.08)', color: '#22c55e', fontSize: '9px', fontWeight: 700 }}>
                          <Check size={8} /> Vérifié
                        </span>
                      )}
                    </div>
                    <StarRating rating={review.rating} size={12} />
                    <p style={{ color: MUTED, fontSize: '13px', lineHeight: 1.6, marginTop: '8px' }}>{review.text}</p>
                    <p style={{ color: '#B0A090', fontSize: '10px', marginTop: '6px' }}>{review.date}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ===== SIZE GUIDE MODAL ===== */}
      <AnimatePresence>
        {showSizeGuide && (
          <>
            <motion.div className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.3)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSizeGuide(false)} />
            <motion.div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full z-50 rounded-t-3xl p-6" style={{ maxWidth: '430px', background: CARD_BG, border: `1px solid ${BORDER}` }} initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
              <div className="flex items-center justify-between mb-4">
                <h3 style={{ color: TEXT, fontWeight: 700, fontSize: '18px', fontFamily: 'Manrope, sans-serif' }}>Guide des tailles</h3>
                <button onClick={() => setShowSizeGuide(false)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: BG }}>
                  <X size={15} color={MUTED} />
                </button>
              </div>
              <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr>{['Tour de doigt (mm)', 'Taille FR', 'Taille US'].map(h => <th key={h} style={{ color: GOLD, fontWeight: 700, fontSize: '10px', textAlign: 'left', paddingBottom: '8px', letterSpacing: '0.5px', fontFamily: 'Manrope, sans-serif' }}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {[['50mm', '50', '5'], ['52mm', '52', '6'], ['54mm', '54', '7'], ['56mm', '56', '7.5'], ['58mm', '58', '8.5'], ['60mm', '60', '9']].map(row => (
                    <tr key={row[0]} style={{ borderTop: `1px solid ${BORDER}` }}>
                      {row.map((cell, i) => <td key={i} style={{ color: TEXT, fontSize: '13px', paddingTop: '10px', paddingBottom: '10px', fontFamily: 'Manrope, sans-serif' }}>{cell}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
              <motion.button onClick={() => setShowSizeGuide(false)} className="w-full py-4 rounded-2xl mt-4" whileTap={{ scale: 0.97 }} style={{ background: 'linear-gradient(135deg, #C9A227, #E8C84A)', color: '#fff', fontWeight: 700, fontFamily: 'Manrope, sans-serif', boxShadow: '0 4px 16px rgba(201,162,39,0.3)' }}>
                Fermer
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Packaging Preview Button ──
function PackagingPreviewButton({ onOpen, CARD_BG, BORDER, TEXT, MUTED, GOLD, packagingImg }: { onOpen: () => void; CARD_BG: string; BORDER: string; TEXT: string; MUTED: string; GOLD: string; packagingImg: string }) {
  return (
    <motion.button whileTap={{ scale: 0.98 }} onClick={onOpen} className="w-full flex items-center justify-between p-4 rounded-2xl mb-5" style={{ background: 'linear-gradient(135deg, #FDF8E8, #FFF3C0)', border: `1px solid rgba(201,162,39,0.25)` }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
          <img src={packagingImg} alt="Packaging" className="w-full h-full object-cover" />
        </div>
        <div className="text-left">
          <p style={{ color: TEXT, fontWeight: 700, fontSize: '13px', marginBottom: '2px' }}>Ce qui arrive chez vous</p>
          <p style={{ color: MUTED, fontSize: '11px' }}>Coffret luxe · Certificat · Sac cadeau</p>
        </div>
      </div>
      <ChevronRight size={16} color={GOLD} />
    </motion.button>
  );
}

// ── Packaging Animation ──
function PackagingAnimation({ packagingImg, GOLD, onClose }: { packagingImg: string; GOLD: string; onClose: () => void }) {
  return (
    <div className="relative h-48">
      <img src={packagingImg} alt="Packaging Marnoa" className="w-full h-full object-cover" />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.5) 100%)' }} />
      <div className="absolute bottom-4 left-5">
        <p style={{ color: '#fff', fontWeight: 800, fontSize: '18px' }}>Votre écrin Marnoa</p>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>Une expérience luxueuse dès l'unboxing</p>
      </div>
      <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)' }}>
        <X size={16} color="#fff" />
      </button>
    </div>
  );
}
