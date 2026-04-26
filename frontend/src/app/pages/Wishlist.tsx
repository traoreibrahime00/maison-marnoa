import { useNavigate } from 'react-router';
import { Heart, ShoppingBag, ArrowRight, X, Bell, BellOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatPrice } from '../data/products';
import { useApp, useColors, useProducts } from '../context/AppContext';
import { toast } from 'sonner';

export default function Wishlist() {
  const navigate = useNavigate();
  const { wishlist, toggleWishlist, addToCart, togglePriceAlert, hasPriceAlert, hidePrices } = useApp();
  const { BG, CARD_BG, BORDER, TEXT, MUTED, GOLD } = useColors();
  const products = useProducts();

  const wishlisted = products.filter(p => wishlist.includes(p.id));

  const handleAddToCart = (product: typeof products[0]) => {
    addToCart(product, product.sizes?.[0]);
    toast('🛍️ Ajouté au panier !', { description: product.name, duration: 2000 });
  };

  const handleToggleAlert = (productId: string, name: string) => {
    const willActivate = !hasPriceAlert(productId);
    togglePriceAlert(productId);
    if (willActivate) {
      toast('🔔 Alerte activée !', { description: `Vous serez notifié(e) si le prix de "${name}" baisse.`, duration: 3000 });
    } else {
      toast('🔕 Alerte désactivée', { description: name, duration: 2000 });
    }
  };

  return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: 'Manrope, sans-serif' }}>
      {/* Mobile Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="sticky top-0 z-40 pt-12 lg:hidden px-5 pb-4" style={{ background: `${BG}F5`, backdropFilter: 'blur(20px)', borderBottom: `1px solid ${BORDER}` }}>
        <p style={{ color: GOLD, fontWeight: 700, fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '2px' }}>✦ MA LISTE</p>
        <div className="flex items-center justify-between">
          <h1 style={{ color: TEXT, fontWeight: 800, fontSize: '22px' }}>Mes Favoris</h1>
          {wishlisted.length > 0 && (
            <span className="px-3 py-1 rounded-full" style={{ background: 'linear-gradient(135deg, #C9A227, #E8C84A)', color: '#fff', fontSize: '11px', fontWeight: 700 }}>
              {wishlisted.length}
            </span>
          )}
        </div>
      </motion.div>

      {wishlisted.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col items-center justify-center px-8 py-24 gap-6">
          <motion.div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ background: CARD_BG, border: `1px solid ${BORDER}`, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }} animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
            <Heart size={40} color={MUTED} />
          </motion.div>
          <div className="text-center">
            <h2 style={{ color: TEXT, fontWeight: 700, fontSize: '20px', marginBottom: '8px' }}>Votre liste est vide</h2>
            <p style={{ color: MUTED, fontSize: '13px', lineHeight: 1.6 }}>Ajoutez des bijoux à vos favoris pour les retrouver facilement et être alerté(e) des baisses de prix.</p>
          </div>
          <motion.button onClick={() => navigate('/collection')} className="flex items-center gap-2 px-8 py-4 rounded-2xl" whileTap={{ scale: 0.97 }} style={{ background: 'linear-gradient(135deg, #C9A227, #E8C84A)', color: '#fff', fontWeight: 700, fontSize: '14px', boxShadow: '0 4px 16px rgba(201,162,39,0.3)' }}>
            Explorer la collection<ArrowRight size={16} />
          </motion.button>
        </motion.div>
      ) : (
        <div className="lg:max-w-[1200px] lg:mx-auto lg:px-10 xl:px-16 lg:py-8">
          {/* Desktop title */}
          <div className="hidden lg:block mb-8">
            <p style={{ color: GOLD, fontWeight: 700, fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '4px' }}>✦ MA LISTE</p>
            <h1 style={{ color: TEXT, fontWeight: 800, fontSize: '32px' }}>Mes Favoris</h1>
          </div>

          <div className="px-4 py-4 lg:px-0 lg:py-0 pb-28 lg:pb-8">
            <p style={{ color: MUTED, fontSize: '12px', marginBottom: '16px' }}>
              <span style={{ color: GOLD, fontWeight: 700 }}>{wishlisted.length}</span> pièce{wishlisted.length > 1 ? 's' : ''} dans vos favoris
            </p>

            {/* Price alert hint */}
            <div className="flex items-start gap-3 px-4 py-3 rounded-2xl mb-4" style={{ background: 'linear-gradient(135deg, #FDF8E8, #FFF3C0)', border: `1px solid rgba(201,162,39,0.2)` }}>
              <Bell size={15} color={GOLD} className="flex-shrink-0 mt-0.5" />
              <p style={{ color: TEXT, fontSize: '12px', lineHeight: 1.5 }}>
                <span style={{ fontWeight: 700 }}>Alerte prix :</span> activez la clochette 🔔 pour être notifié(e) si le prix d'un bijou baisse.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4 mb-6">
              <AnimatePresence>
                {wishlisted.map((product, idx) => {
                  const alertOn = hasPriceAlert(product.id);
                  return (
                    <motion.div key={product.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20, height: 0 }} transition={{ duration: 0.3, delay: idx * 0.05 }} className="flex gap-3 p-3 rounded-2xl" style={{ background: CARD_BG, border: `1px solid ${BORDER}`, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                      {/* Image */}
                      <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer relative" onClick={() => navigate(`/product/${product.id}`)}>
                        <motion.img src={product.image} alt={product.name} className="w-full h-full object-cover" whileHover={{ scale: 1.06 }} transition={{ duration: 0.3 }} />
                        {product.stock && product.stock <= 3 && (
                          <div className="absolute bottom-0 left-0 right-0 py-1 text-center" style={{ background: 'rgba(239,68,68,0.85)', color: '#fff', fontSize: '8px', fontWeight: 700 }}>
                            Plus que {product.stock} !
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p style={{ color: GOLD, fontWeight: 700, fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '2px' }}>{product.collection}</p>
                        <p className="truncate" style={{ color: TEXT, fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{product.name}</p>
                        <div style={{ fontWeight: 800, fontSize: '15px', background: 'linear-gradient(135deg, #B8860B, #D4AF35)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '8px' }}>
                           {hidePrices ? 'Prix sur demande' : formatPrice(product.price)}
                        </div>

                        <div className="flex gap-2">
                          <motion.button onClick={() => handleAddToCart(product)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl" whileTap={{ scale: 0.93 }} style={{ background: 'linear-gradient(135deg, #C9A227, #E8C84A)', color: '#fff', fontWeight: 700, fontSize: '11px', boxShadow: '0 2px 8px rgba(201,162,39,0.25)' }}>
                            <ShoppingBag size={12} />Ajouter
                          </motion.button>
                          <motion.button onClick={() => handleToggleAlert(product.id, product.name)} className="w-8 h-8 flex items-center justify-center rounded-xl" style={{ background: alertOn ? 'rgba(201,162,39,0.1)' : 'rgba(0,0,0,0.04)', border: `1px solid ${alertOn ? GOLD : BORDER}` }} whileTap={{ scale: 0.85 }}>
                            {alertOn ? <Bell size={13} color={GOLD} /> : <BellOff size={13} color={MUTED} />}
                          </motion.button>
                          <motion.button onClick={() => toggleWishlist(product.id)} className="w-8 h-8 flex items-center justify-center rounded-xl" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }} whileTap={{ scale: 0.85 }}>
                            <X size={13} color="#ef4444" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            <motion.button onClick={() => { wishlisted.forEach(p => addToCart(p, p.sizes?.[0])); navigate('/cart'); }} className="w-full lg:w-auto lg:px-10 flex items-center justify-center gap-2 py-4 rounded-2xl" whileTap={{ scale: 0.97 }} style={{ background: 'linear-gradient(135deg, #C9A227 0%, #E8C84A 50%, #C9A227 100%)', color: '#fff', fontWeight: 700, fontSize: '14px', boxShadow: '0 4px 16px rgba(201,162,39,0.3)' }}>
              <ShoppingBag size={18} />Tout ajouter au panier
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}