import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Heart, Star, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatPrice, type Product } from '../data/products';
import { useApp, useColors } from '../context/AppContext';
import { toast } from 'sonner';

const GOLD = '#C9A227';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const navigate = useNavigate();
  const { toggleWishlist, isWishlisted } = useApp();
  const { CARD_BG, BORDER, TEXT, MUTED } = useColors();
  const { hidePrices } = useApp();
  const wishlisted = isWishlisted(product.id);
  const [hovered, setHovered] = useState(false);

  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4), ease: [0.25, 0.46, 0.45, 0.94] }}
      whileTap={{ scale: 0.97 }}
      className="rounded-2xl overflow-hidden cursor-pointer group"
      style={{
        background: CARD_BG,
        border: `1px solid ${BORDER}`,
        boxShadow: hovered ? '0 8px 32px rgba(201,162,39,0.15)' : '0 2px 12px rgba(0,0,0,0.06)',
        transition: 'box-shadow 0.25s',
      }}
      onClick={() => navigate(`/product/${product.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Image ── */}
      <div className="relative overflow-hidden w-full" style={{ aspectRatio: '4/5' }}>
        <motion.img
          src={product.image} alt={product.name}
          className="absolute inset-0 w-full h-full object-cover object-center"
          animate={{ scale: hovered ? 1.07 : 1 }}
          transition={{ duration: 0.45 }}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom,transparent 50%,rgba(0,0,0,0.18) 100%)' }} />

        {/* Desktop hover CTA */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-0 hidden lg:flex items-center justify-center"
              style={{ background: 'linear-gradient(180deg,rgba(0,0,0,0.12) 0%,rgba(201,162,39,0.22) 100%)', backdropFilter: 'blur(1px)' }}
            >
              <motion.div
                initial={{ scale: 0.85, opacity: 0, y: 8 }} animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ delay: 0.04, duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="flex items-center gap-2 px-4 py-2 rounded-full"
                style={{ background: 'linear-gradient(135deg,#C9A227,#E8C84A)', color: '#fff', fontWeight: 700, fontSize: '12px', boxShadow: '0 4px 16px rgba(201,162,39,0.5)' }}
              >
                Voir la pièce <ArrowRight size={12} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top-left badge : promo > nouveau > bestseller */}
        {discount ? (
          <div className="absolute top-2.5 left-2.5 px-2 py-1 rounded-full"
            style={{ background: '#ef4444', color: '#fff', fontWeight: 700, fontSize: '9px', letterSpacing: '0.5px', backdropFilter: 'blur(8px)' }}>
            -{discount}%
          </div>
        ) : product.isNew ? (
          <div className="absolute top-2.5 left-2.5 px-2 py-1 rounded-full"
            style={{ background: 'linear-gradient(135deg,#C9A227,#E8C84A)', color: '#fff', fontWeight: 700, fontSize: '9px', backdropFilter: 'blur(8px)' }}>
            Nouveau
          </div>
        ) : product.isBestseller ? (
          <div className="absolute top-2.5 left-2.5 px-2 py-1 rounded-full"
            style={{ background: 'rgba(255,255,255,0.92)', color: GOLD, fontWeight: 700, fontSize: '9px', border: `1px solid ${GOLD}`, backdropFilter: 'blur(8px)' }}>
            Bestseller
          </div>
        ) : null}

        {/* Stock alert — bottom left */}
        {product.stock != null && product.stock <= 4 && (
          <div className="absolute bottom-2.5 left-2.5 px-2 py-1 rounded-full"
            style={{ background: 'rgba(239,68,68,0.9)', color: '#fff', fontWeight: 700, fontSize: '9px', backdropFilter: 'blur(8px)' }}>
            Plus que {product.stock} !
          </div>
        )}

        {/* Wishlist — top right */}
        <motion.button
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', border: `1px solid ${wishlisted ? GOLD : 'rgba(0,0,0,0.08)'}`, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
          whileTap={{ scale: 0.85 }}
          onClick={e => {
            e.stopPropagation();
            toggleWishlist(product.id);
            if (!wishlisted) toast('❤️ Ajouté aux favoris', { description: product.name, duration: 2000 });
          }}
        >
          <Heart size={13} fill={wishlisted ? GOLD : 'none'} color={wishlisted ? GOLD : MUTED} />
        </motion.button>
      </div>

      {/* ── Info ── */}
      <div className="p-3 lg:p-4">
        {/* Collection */}
        <p className="truncate mb-0.5" style={{ color: GOLD, fontWeight: 700, fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
          {product.collection}
        </p>
        {/* Name */}
        <p className="truncate mb-1.5" style={{ fontWeight: 600, fontSize: '13px', color: TEXT }}>
          {product.name}
        </p>
        {/* Stars */}
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={9} fill={i < Math.floor(product.rating) ? GOLD : 'none'} color={GOLD} />
          ))}
          <span style={{ fontSize: '9px', color: MUTED, marginLeft: '2px' }}>({product.reviews})</span>
        </div>
        {/* Price */}
        {hidePrices ? (
          <div className="flex items-center justify-center py-2">
            <span style={{ fontSize: '12px', color: MUTED, fontStyle: 'italic' }}>Prix sur demande</span>
          </div>
        ) : (
          <div className="flex items-baseline gap-1.5">
            <span style={{ fontWeight: 800, fontSize: '14px', color: GOLD }}>{formatPrice(product.price)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span style={{ fontSize: '10px', color: '#B0A090', textDecoration: 'line-through' }}>
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
