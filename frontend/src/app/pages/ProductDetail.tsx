import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  ArrowLeft, Heart, Share2, Star, ShoppingBag, Ruler,
  Shield, ChevronRight, Plus, Minus, ZoomIn, X,
  Check, Gift, CreditCard, Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatPrice, IMAGES, Product } from '../data/products';
import { useApp, useColors, useProducts } from '../context/AppContext';
import { toast } from 'sonner';
import { trackEvent } from '../lib/analytics';
import { useSEO } from '../hooks/useSEO';

const GOLD = '#C9A227';

function StarRating({ rating, size = 12 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={size} fill={i < rating ? GOLD : 'none'} color={GOLD} style={{ opacity: i < rating ? 1 : 0.3 }} />
      ))}
    </div>
  );
}

export default function ProductDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { addToCart, removeFromCart, updateQuantity, toggleWishlist, isWishlisted, cartItems } = useApp();
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
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const ctaRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useSEO(product ? {
    title: `${product.name} — ${product.collection}`,
    description: `${product.description} ${product.material}. Livraison en Côte d'Ivoire et Afrique de l'Ouest.`,
    canonical: `/product/${product.id}`,
    image: product.image,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      image: product.images,
      sku: product.id,
      brand: { '@type': 'Brand', name: 'Maison Marnoa' },
      material: product.material,
      offers: {
        '@type': 'Offer',
        url: `https://maisonmarnoa.com/product/${product.id}`,
        priceCurrency: 'XOF',
        price: product.price,
        availability: (product.stock ?? 1) > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        seller: { '@type': 'Organization', name: 'Maison Marnoa' },
      },
      aggregateRating: product.reviews > 0 ? {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviews,
        bestRating: 5,
      } : undefined,
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://maisonmarnoa.com/' },
          { '@type': 'ListItem', position: 2, name: 'Collection', item: 'https://maisonmarnoa.com/collection' },
          { '@type': 'ListItem', position: 3, name: product.name, item: `https://maisonmarnoa.com/product/${product.id}` },
        ],
      },
    },
  } : {});

  useEffect(() => {
    if (id) trackEvent({ type: 'PRODUCT_VIEW', productId: id });
  }, [id]);

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
          <button onClick={() => navigate('/collection')} style={{ color: GOLD, fontFamily: 'Manrope, sans-serif', marginTop: '16px' }}>
            Retour à la collection
          </button>
        </div>
      </div>
    );
  }

  const wishlisted = isWishlisted(product.id);
  const cartItem = cartItems.find(item => item.product.id === product.id && (!selectedSize || item.size === selectedSize));
  const isInCart = !!cartItem;

  const handleCartIncrease = () => {
    if (cartItem) updateQuantity(product.id, cartItem.quantity + 1, cartItem.size);
  };
  const handleCartDecrease = () => {
    if (!cartItem) return;
    if (cartItem.quantity <= 1) removeFromCart(product.id, cartItem.size);
    else updateQuantity(product.id, cartItem.quantity - 1, cartItem.size);
  };
  const similar = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 6);
  const allImages = product.images?.length > 0 ? product.images : [product.image];

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addToCart(product, selectedSize);
    setAddedAnim(true);
    toast('Ajouté au panier', { description: `${product.name}${selectedSize ? ` · Taille ${selectedSize}` : ''}`, duration: 2000 });
    setTimeout(() => setAddedAnim(false), 2000);
  };


  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, text: `Découvrez ce bijou chez Maison Marnoa`, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast('Lien copié !', { duration: 1500 });
      }
    } catch {}
  };

  return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: 'Manrope, sans-serif' }}>

      {/* ══ DESKTOP: 2-col layout ══ */}
      <div className="lg:max-w-[1200px] lg:mx-auto lg:px-10 xl:px-16 lg:pt-8 lg:pb-16 lg:grid lg:grid-cols-[520px_1fr] xl:grid-cols-[560px_1fr] lg:gap-14">

        {/* ── Gallery ── */}
        <div
          className="lg:sticky lg:top-24 lg:self-start"
          onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
        >
          {/* Main image */}
          <div
            className="relative overflow-hidden lg:rounded-2xl"
            style={{ height: 'clamp(320px, 90vw, 480px)', background: '#F5EFE0', maxHeight: '520px' }}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImage}
                src={allImages[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover select-none cursor-zoom-in"
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => setShowZoom(true)}
              />
            </AnimatePresence>

            {/* Gradient overlay */}
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, transparent 30%, transparent 65%, rgba(0,0,0,0.15) 100%)' }} />

            {/* Mobile top bar */}
            <div className="absolute top-0 left-0 right-0 pt-12 px-4 flex items-center justify-between lg:hidden">
              <motion.button
                onClick={() => navigate(-1)}
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(8px)' }}
                whileTap={{ scale: 0.88 }}
              >
                <ArrowLeft size={17} color="#1C1510" />
              </motion.button>
              <div className="flex gap-2">
                <motion.button
                  onClick={() => toggleWishlist(product.id)}
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(8px)', border: wishlisted ? `1px solid ${GOLD}` : 'none' }}
                  whileTap={{ scale: 0.88 }}
                >
                  <Heart size={15} fill={wishlisted ? GOLD : 'none'} color={wishlisted ? GOLD : '#1C1510'} />
                </motion.button>
                <motion.button
                  onClick={handleShare}
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(8px)' }}
                  whileTap={{ scale: 0.88 }}
                >
                  <Share2 size={15} color="#1C1510" />
                </motion.button>
                <motion.button
                  onClick={() => setShowZoom(true)}
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(8px)' }}
                  whileTap={{ scale: 0.88 }}
                >
                  <ZoomIn size={15} color="#1C1510" />
                </motion.button>
              </div>
            </div>

            {/* Stock badge */}
            {product.stock !== undefined && product.stock <= 5 && (
              <div className="absolute bottom-4 left-4">
                <span className="px-3 py-1.5 rounded-full text-white text-xs font-bold"
                  style={{ background: 'rgba(239,68,68,0.85)', backdropFilter: 'blur(6px)' }}>
                  Plus que {product.stock} en stock
                </span>
              </div>
            )}

            {/* Dots (mobile) */}
            {allImages.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 lg:hidden"
                style={{ bottom: product.stock !== undefined && product.stock <= 5 ? '44px' : '14px' }}>
                {allImages.map((_, i) => (
                  <motion.button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    animate={{ width: i === activeImage ? '18px' : '6px', background: i === activeImage ? GOLD : 'rgba(255,255,255,0.55)' }}
                    style={{ height: '6px', borderRadius: '3px' }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Thumbnail strip (desktop + mobile if many images) */}
          {allImages.length > 1 && (
            <div className="flex gap-2 mt-3 px-4 lg:px-0 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {allImages.map((img, i) => (
                <motion.button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0"
                  style={{
                    border: `2px solid ${i === activeImage ? GOLD : BORDER}`,
                    opacity: i === activeImage ? 1 : 0.6,
                  }}
                  whileTap={{ scale: 0.92 }}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* ── Product Info ── */}
        <div className="px-4 pt-5 pb-32 lg:px-0 lg:pt-0 lg:pb-8">

          {/* Desktop: back + actions */}
          <div className="hidden lg:flex items-center justify-between mb-6">
            <motion.button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED, fontSize: '13px' }}
              whileHover={{ x: -3 }}
            >
              <ArrowLeft size={15} color={MUTED} /> Retour
            </motion.button>
            <div className="flex gap-2">
              <motion.button onClick={() => toggleWishlist(product.id)} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: CARD_BG, border: `1px solid ${wishlisted ? GOLD : BORDER}` }} whileTap={{ scale: 0.88 }}>
                <Heart size={15} fill={wishlisted ? GOLD : 'none'} color={wishlisted ? GOLD : MUTED} />
              </motion.button>
              <motion.button onClick={handleShare} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }} whileTap={{ scale: 0.88 }}>
                <Share2 size={15} color={MUTED} />
              </motion.button>
            </div>
          </div>

          {/* Collection + Rating */}
          <div className="flex items-center justify-between mb-3">
            <span style={{ color: GOLD, fontWeight: 700, fontSize: '10px', letterSpacing: '2.5px', textTransform: 'uppercase' }}>
              {product.collection}
            </span>
            <div className="flex items-center gap-1.5">
              <StarRating rating={product.rating} size={11} />
              <span style={{ color: MUTED, fontSize: '11px' }}>{product.rating} ({product.reviews})</span>
            </div>
          </div>

          {/* Name */}
          <h1 style={{ color: TEXT, fontWeight: 800, fontSize: '26px', lineHeight: 1.2, marginBottom: '14px' }}>
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <span style={{ fontWeight: 800, fontSize: '26px', background: 'linear-gradient(135deg,#B8860B,#D4AF35)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <span style={{ color: MUTED, fontSize: '14px', textDecoration: 'line-through' }}>
                  {formatPrice(product.originalPrice)}
                </span>
                <span style={{ background: '#ef4444', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px' }}>
                  -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                </span>
              </>
            )}
          </div>
          {product.originalPrice && product.originalPrice > product.price && (
            <p style={{ color: '#22c55e', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
              Vous économisez {formatPrice(product.originalPrice - product.price)}
            </p>
          )}
          <div className="flex items-center gap-1.5 mb-5">
            <CreditCard size={12} color={GOLD} />
            <span style={{ color: MUTED, fontSize: '12px' }}>
              ou <span style={{ color: GOLD, fontWeight: 600 }}>3×{formatPrice(Math.round(product.price / 3))}</span> sans frais via WhatsApp
            </span>
          </div>

          {/* Color Variants */}
          {product.colorVariants && product.colorVariants.length > 0 && (
            <div className="mb-5">
              <p style={{ color: TEXT, fontWeight: 600, fontSize: '13px', marginBottom: '10px' }}>
                Métal — <span style={{ color: MUTED, fontWeight: 500 }}>{product.colorVariants.find(c => c.id === selectedColor)?.label}</span>
              </p>
              <div className="flex gap-3">
                {product.colorVariants.map(variant => {
                  const active = selectedColor === variant.id;
                  return (
                    <motion.button key={variant.id} onClick={() => setSelectedColor(variant.id)} whileTap={{ scale: 0.9 }}>
                      <div className="relative w-8 h-8 rounded-full" style={{ padding: '2px', border: `2px solid ${active ? GOLD : 'transparent'}` }}>
                        <div className="w-full h-full rounded-full" style={{ background: variant.hexColor, border: '1px solid rgba(0,0,0,0.1)' }} />
                        {active && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: GOLD }}>
                            <Check size={8} color="#fff" />
                          </div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-3">
                <p style={{ color: TEXT, fontWeight: 600, fontSize: '13px' }}>Taille</p>
                <button onClick={() => setShowSizeGuide(true)} className="flex items-center gap-1">
                  <Ruler size={11} color={GOLD} />
                  <span style={{ color: GOLD, fontWeight: 600, fontSize: '11px' }}>Guide</span>
                </button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map(size => {
                  const active = selectedSize === size;
                  return (
                    <motion.button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className="w-11 h-11 rounded-xl flex items-center justify-center"
                      whileTap={{ scale: 0.92 }}
                      style={{
                        background: active ? 'linear-gradient(135deg,#C9A227,#E8C84A)' : CARD_BG,
                        border: `1.5px solid ${active ? GOLD : BORDER}`,
                        color: active ? '#fff' : TEXT,
                        fontWeight: active ? 700 : 500,
                        fontSize: '14px',
                        boxShadow: active ? '0 3px 10px rgba(201,162,39,0.28)' : 'none',
                      }}
                    >
                      {size}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="mb-5">
            <p style={{
              color: MUTED, fontSize: '13px', lineHeight: 1.75,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: expandDesc ? 'unset' : 3,
              WebkitBoxOrient: 'vertical',
            } as React.CSSProperties}>
              {product.description}
            </p>
            {product.description.length > 120 && (
              <button onClick={() => setExpandDesc(!expandDesc)} style={{ color: GOLD, fontWeight: 600, fontSize: '12px', marginTop: '4px' }}>
                {expandDesc ? 'Voir moins ↑' : 'Voir plus ↓'}
              </button>
            )}
          </div>

          {/* Specs — inline */}
          {(product.material || product.weight) && (
            <div className="flex gap-4 mb-5 pb-5" style={{ borderBottom: `1px solid ${BORDER}` }}>
              {product.material && (
                <div>
                  <p style={{ color: MUTED, fontSize: '9px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '3px' }}>MÉTAL</p>
                  <p style={{ color: TEXT, fontWeight: 600, fontSize: '13px' }}>{product.material}</p>
                </div>
              )}
              {product.weight && (
                <div>
                  <p style={{ color: MUTED, fontSize: '9px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '3px' }}>POIDS</p>
                  <p style={{ color: TEXT, fontWeight: 600, fontSize: '13px' }}>{product.weight}</p>
                </div>
              )}
              <div>
                <p style={{ color: MUTED, fontSize: '9px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '3px' }}>CATÉGORIE</p>
                <p style={{ color: TEXT, fontWeight: 600, fontSize: '13px', textTransform: 'capitalize' }}>{product.category}</p>
              </div>
            </div>
          )}

          {/* Guarantees — inline pills */}
          <div className="flex gap-2 flex-wrap mb-5">
            {[
              { icon: Shield, label: 'Garantie 2 ans' },
              { icon: Gift, label: 'Coffret inclus' },
              { icon: Star, label: 'Or certifié 18K' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
                <Icon size={12} color={GOLD} />
                <span style={{ color: MUTED, fontSize: '11px', fontWeight: 600 }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Quantity + CTA */}
          <div ref={ctaRef} className="flex flex-col gap-3 mb-5">
            {/* Stock urgency */}
            {product.stock !== undefined && product.stock > 0 && product.stock < 10 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                <p style={{ color: '#ef4444', fontSize: '12px', fontWeight: 700 }}>
                  Plus que {product.stock} en stock — commandez vite !
                </p>
              </motion.div>
            )}

            {/* Quantity row — hidden once in cart (stepper takes over) */}
            {!isInCart && (
              <div className="flex items-center gap-3">
                <p style={{ color: MUTED, fontSize: '12px', fontWeight: 600 }}>Qté</p>
                <div className="flex items-center gap-3 px-3 py-2 rounded-xl" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
                  <motion.button onClick={() => setQty(q => Math.max(1, q - 1))} whileTap={{ scale: 0.85 }} className="w-7 h-7 flex items-center justify-center rounded-lg" style={{ background: qty === 1 ? 'transparent' : 'rgba(201,162,39,0.1)' }}>
                    <Minus size={13} color={qty === 1 ? MUTED : GOLD} />
                  </motion.button>
                  <span style={{ color: TEXT, fontWeight: 700, fontSize: '15px', minWidth: '18px', textAlign: 'center' }}>{qty}</span>
                  <motion.button onClick={() => setQty(q => Math.min(q + 1, product.stock ?? 99))} disabled={qty >= (product.stock ?? 99)} whileTap={{ scale: 0.85 }} className="w-7 h-7 flex items-center justify-center rounded-lg" style={{ background: qty >= (product.stock ?? 99) ? 'transparent' : 'rgba(201,162,39,0.1)', opacity: qty >= (product.stock ?? 99) ? 0.3 : 1 }}>
                    <Plus size={13} color={GOLD} />
                  </motion.button>
                </div>
                <span style={{ color: MUTED, fontSize: '12px' }}>
                  = <span style={{ color: TEXT, fontWeight: 700 }}>{formatPrice(product.price * qty)}</span>
                </span>
              </div>
            )}

            {/* Add to cart / stepper */}
            {isInCart ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-2xl overflow-hidden flex-1" style={{ border: '2px solid #22c55e' }}>
                  <motion.button
                    onClick={handleCartDecrease} whileTap={{ scale: 0.9 }}
                    className="flex items-center justify-center py-3.5"
                    style={{ width: 52, background: 'rgba(34,197,94,0.08)', flexShrink: 0 }}
                  >
                    {cartItem && cartItem.quantity <= 1
                      ? <Trash2 size={16} color="#ef4444" />
                      : <Minus size={16} color="#22c55e" />
                    }
                  </motion.button>
                  <span className="flex-1 text-center" style={{ color: TEXT, fontWeight: 800, fontSize: '18px' }}>
                    {cartItem?.quantity ?? 0}
                  </span>
                  <motion.button
                    onClick={handleCartIncrease} whileTap={{ scale: 0.9 }}
                    className="flex items-center justify-center py-3.5"
                    style={{ width: 52, background: 'rgba(34,197,94,0.08)', flexShrink: 0 }}
                  >
                    <Plus size={16} color="#22c55e" />
                  </motion.button>
                </div>
                <motion.button
                  onClick={() => navigate('/cart')} whileTap={{ scale: 0.97 }}
                  className="flex items-center justify-center gap-2 px-5 py-4 rounded-2xl"
                  style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)', boxShadow: '0 4px 16px rgba(34,197,94,0.28)' }}
                >
                  <ShoppingBag size={17} color="#fff" />
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: '14px' }}>Panier</span>
                </motion.button>
              </div>
            ) : (
              <motion.button
                onClick={handleAddToCart}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl"
                whileTap={{ scale: 0.97 }}
                style={{
                  background: addedAnim ? 'linear-gradient(135deg,#22c55e,#16a34a)' : 'linear-gradient(135deg,#C9A227,#E8C84A)',
                  transition: 'background 0.3s',
                  boxShadow: addedAnim ? '0 4px 16px rgba(34,197,94,0.28)' : '0 4px 16px rgba(201,162,39,0.32)',
                }}
              >
                {addedAnim
                  ? <><Check size={17} color="#fff" /><span style={{ color: '#fff', fontWeight: 700, fontSize: '15px' }}>Ajouté !</span></>
                  : <><ShoppingBag size={17} color="#fff" /><span style={{ color: '#fff', fontWeight: 700, fontSize: '15px' }}>Ajouter au panier</span></>
                }
              </motion.button>
            )}
          </div>

          {/* Reviews */}
          {product.reviewsList && product.reviewsList.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <StarRating rating={product.rating} size={13} />
                  <span style={{ color: MUTED, fontSize: '12px' }}>{product.rating}/5 · {product.reviews} avis</span>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {product.reviewsList.slice(0, 2).map(review => (
                  <div key={review.id} className="p-4 rounded-2xl" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg,#C9A227,#E8C84A)' }}>
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
                          <span style={{ color: '#22c55e', fontSize: '9px', fontWeight: 700 }}>✓ Vérifié</span>
                        )}
                      </div>
                    </div>
                    <p style={{ color: MUTED, fontSize: '12px', lineHeight: 1.6 }}>{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Similar products */}
          {similar.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p style={{ color: TEXT, fontWeight: 700, fontSize: '14px' }}>Vous aimerez aussi</p>
                <button onClick={() => navigate(`/collection?category=${product.category}`)} className="flex items-center gap-1">
                  <span style={{ color: GOLD, fontWeight: 600, fontSize: '11px' }}>Voir tout</span>
                  <ChevronRight size={12} color={GOLD} />
                </button>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                {similar.map(p => (
                  <motion.div
                    key={p.id}
                    className="flex-shrink-0 w-36 rounded-2xl overflow-hidden cursor-pointer"
                    style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}
                    onClick={() => navigate(`/product/${p.id}`)}
                    whileTap={{ scale: 0.96 }}
                  >
                    <div className="w-full aspect-square overflow-hidden" style={{ background: '#F5EFE0' }}>
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-2.5">
                      <p className="truncate" style={{ color: TEXT, fontWeight: 600, fontSize: '11px', marginBottom: '2px' }}>{p.name}</p>
                      <p style={{ color: GOLD, fontWeight: 700, fontSize: '11px' }}>{formatPrice(p.price)}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>{/* /desktop 2-col */}

      {/* ── Sticky bottom CTA (mobile) ── */}
      <AnimatePresence>
        {showStickyCTA && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="fixed left-1/2 -translate-x-1/2 w-full z-40 px-4 py-3 lg:hidden"
            style={{ bottom: '76px', maxWidth: '430px', background: `${BG}F8`, backdropFilter: 'blur(20px)', borderTop: `1px solid ${BORDER}` }}
          >
            <div className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <p className="truncate" style={{ color: TEXT, fontWeight: 600, fontSize: '12px' }}>{product.name}</p>
                <span style={{ fontWeight: 800, fontSize: '14px', background: 'linear-gradient(135deg,#B8860B,#D4AF35)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {isInCart
                    ? formatPrice(product.price * (cartItem?.quantity ?? 1))
                    : formatPrice(product.price * qty)
                  }
                </span>
              </div>
              {isInCart ? (
                <div className="flex items-center rounded-xl overflow-hidden" style={{ border: '2px solid #22c55e' }}>
                  <motion.button onClick={handleCartDecrease} whileTap={{ scale: 0.9 }}
                    className="flex items-center justify-center px-3 py-2.5"
                    style={{ background: 'rgba(34,197,94,0.08)' }}
                  >
                    {cartItem && cartItem.quantity <= 1
                      ? <Trash2 size={13} color="#ef4444" />
                      : <Minus size={13} color="#22c55e" />
                    }
                  </motion.button>
                  <span style={{ color: TEXT, fontWeight: 800, fontSize: '15px', minWidth: '28px', textAlign: 'center' }}>
                    {cartItem?.quantity ?? 0}
                  </span>
                  <motion.button onClick={handleCartIncrease} whileTap={{ scale: 0.9 }}
                    className="flex items-center justify-center px-3 py-2.5"
                    style={{ background: 'rgba(34,197,94,0.08)' }}
                  >
                    <Plus size={13} color="#22c55e" />
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  onClick={handleAddToCart}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl"
                  whileTap={{ scale: 0.95 }}
                  style={{ background: addedAnim ? '#22c55e' : 'linear-gradient(135deg,#C9A227,#E8C84A)', color: '#fff', fontWeight: 700, fontSize: '13px' }}
                >
                  <ShoppingBag size={14} />
                  {addedAnim ? 'Ajouté !' : 'Panier'}
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Zoom modal ── */}
      <AnimatePresence>
        {showZoom && (
          <>
            <motion.div className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.94)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowZoom(false)} />
            <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}>
              <img src={allImages[activeImage]} alt={product.name} className="w-full h-auto max-h-[88vh] object-contain rounded-2xl" />
              <button onClick={() => setShowZoom(false)} className="absolute top-12 right-4 w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}>
                <X size={18} color="#fff" />
              </button>
              {allImages.length > 1 && (
                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
                  {allImages.map((_, i) => (
                    <button key={i} onClick={() => setActiveImage(i)} className="rounded-full transition-all"
                      style={{ width: i === activeImage ? '18px' : '7px', height: '7px', background: i === activeImage ? GOLD : 'rgba(255,255,255,0.35)' }} />
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Size guide modal ── */}
      <AnimatePresence>
        {showSizeGuide && (
          <>
            <motion.div className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.4)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowSizeGuide(false)} />
            <motion.div
              className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full z-50 rounded-t-3xl p-6"
              style={{ maxWidth: '430px', background: CARD_BG, border: `1px solid ${BORDER}` }}
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 style={{ color: TEXT, fontWeight: 700, fontSize: '17px' }}>Guide des tailles</h3>
                <button onClick={() => setShowSizeGuide(false)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: BG }}>
                  <X size={15} color={MUTED} />
                </button>
              </div>
              <table className="w-full">
                <thead>
                  <tr>
                    {['Tour de doigt (mm)', 'Taille FR', 'Taille US'].map(h => (
                      <th key={h} style={{ color: GOLD, fontWeight: 700, fontSize: '10px', textAlign: 'left', paddingBottom: '10px', letterSpacing: '0.5px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[['50mm', '50', '5'], ['52mm', '52', '6'], ['54mm', '54', '7'], ['56mm', '56', '7.5'], ['58mm', '58', '8.5'], ['60mm', '60', '9']].map(row => (
                    <tr key={row[0]} style={{ borderTop: `1px solid ${BORDER}` }}>
                      {row.map((cell, i) => (
                        <td key={i} style={{ color: TEXT, fontSize: '13px', padding: '10px 0' }}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <motion.button onClick={() => setShowSizeGuide(false)} className="w-full py-3.5 rounded-2xl mt-4" whileTap={{ scale: 0.97 }}
                style={{ background: 'linear-gradient(135deg,#C9A227,#E8C84A)', color: '#fff', fontWeight: 700 }}>
                Fermer
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
