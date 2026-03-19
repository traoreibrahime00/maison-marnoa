import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft, Plus, Minus, Trash2, Tag, ShoppingBag, ArrowRight,
  Truck, Gift, MessageSquare, Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp, useColors } from '../context/AppContext';
import { formatPrice } from '../data/products';
import { openWhatsApp } from '../utils/whatsapp';
import { apiUrl } from '../lib/api';
import { toast } from 'sonner';

const SHIPPING      = 3000;
const FREE_SHIPPING = 50000; // FCFA threshold for free Abidjan delivery

export default function Cart() {
  const navigate = useNavigate();
  const {
    cartItems, updateQuantity, removeFromCart, cartTotal,
    isGiftWrap, setIsGiftWrap, giftMessage, setGiftMessage,
  } = useApp();
  const { BG, CARD_BG, BORDER, TEXT, MUTED, GOLD } = useColors();

  const [promoCode, setPromoCode]       = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(10); // % from server
  const [promoError, setPromoError]     = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

  const discount = promoApplied ? Math.round(cartTotal * (promoDiscount / 100)) : 0;
  const giftWrapFee  = isGiftWrap ? 2500 : 0;
  const freeShipping = cartTotal >= FREE_SHIPPING;
  const shipping     = cartItems.length > 0 ? (freeShipping ? 0 : SHIPPING) : 0;
  const total        = cartTotal - discount + shipping + giftWrapFee;

  /* Free shipping progress */
  const remaining  = Math.max(FREE_SHIPPING - cartTotal, 0);
  const progressPct = Math.min((cartTotal / FREE_SHIPPING) * 100, 100);

  const applyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoError('');
    try {
      const res = await fetch(apiUrl('/api/promos/validate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode.trim() }),
      });
      const data = await res.json() as { valid: boolean; discount: number; error?: string };
      if (data.valid) {
        setPromoApplied(true);
        setPromoDiscount(data.discount);
        toast('🎉 Code promo appliqué !', { description: `-${data.discount}% de réduction`, duration: 2500 });
      } else {
        setPromoError(data.error || 'Code promo invalide');
        setPromoApplied(false);
      }
    } catch {
      setPromoError('Erreur réseau, réessayez.');
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemove = (productId: string, size?: number, name?: string) => {
    removeFromCart(productId, size);
    toast(`${name} retiré du panier`, { duration: 2000 });
  };

  const handleWhatsAppCheckout = () => {
    if (cartItems.length === 0) {
      toast('Votre panier est vide', { duration: 2000 });
      return;
    }

    const lines = cartItems.map(item =>
      `- ${item.product.name} x${item.quantity}${item.size ? ` (Taille ${item.size})` : ''}`
    );

    const message = [
      'Bonjour Maison Marnoa, je souhaite commander :',
      ...lines,
      '',
      `Total estimé : ${formatPrice(total)}`,
      'Merci de me confirmer la disponibilité et la livraison.',
    ].join('\n');

    openWhatsApp(message);
  };

  return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: 'Manrope, sans-serif' }}>
      {/* Mobile header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 pt-12 lg:hidden px-5 pb-4 flex items-center gap-4"
        style={{ background: `${BG}F5`, backdropFilter: 'blur(20px)', borderBottom: `1px solid ${BORDER}` }}
      >
        <motion.button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: CARD_BG, border: `1px solid ${BORDER}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
          whileTap={{ scale: 0.88 }}
        >
          <ArrowLeft size={18} color={TEXT} />
        </motion.button>
        <div className="flex-1">
          <h1 style={{ color: TEXT, fontWeight: 800, fontSize: '20px' }}>Mon Panier</h1>
          <p style={{ color: MUTED, fontSize: '12px' }}>
            {cartItems.length === 0 ? 'Panier vide' : `${cartItems.reduce((s, i) => s + i.quantity, 0)} article${cartItems.length > 1 ? 's' : ''}`}
          </p>
        </div>
      </motion.div>

      {cartItems.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="flex flex-col items-center justify-center px-8 py-20 gap-6"
        >
          <div className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{ background: CARD_BG, border: `1px solid ${BORDER}`, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
            <ShoppingBag size={40} color={MUTED} />
          </div>
          <div className="text-center">
            <h2 style={{ color: TEXT, fontWeight: 700, fontSize: '20px', marginBottom: '8px' }}>Votre panier est vide</h2>
            <p style={{ color: MUTED, fontSize: '13px', lineHeight: 1.6 }}>Découvrez notre collection exclusive et ajoutez vos pièces favorites.</p>
          </div>
          <motion.button
            onClick={() => navigate('/collection')}
            className="flex items-center gap-2 px-8 py-4 rounded-2xl"
            whileTap={{ scale: 0.97 }}
            style={{ background: 'linear-gradient(135deg, #C9A227, #E8C84A)', color: '#fff', fontWeight: 700, fontSize: '14px', boxShadow: '0 4px 16px rgba(201,162,39,0.3)' }}
          >
            Explorer la collection <ArrowRight size={16} />
          </motion.button>
        </motion.div>
      ) : (
        <div className="lg:max-w-[1200px] lg:mx-auto lg:px-10 xl:px-16 lg:py-8">
          {/* Desktop page title */}
          <div className="hidden lg:flex items-center gap-4 mb-8">
            <motion.button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED, fontSize: '13px', fontWeight: 500 }}
              whileHover={{ x: -3 }}
            >
              <ArrowLeft size={16} color={MUTED} /> Continuer mes achats
            </motion.button>
            <div style={{ flex: 1, height: 1, background: BORDER }} />
            <h1 style={{ color: TEXT, fontWeight: 800, fontSize: '24px' }}>Mon Panier</h1>
          </div>

          <div className="px-4 py-4 lg:px-0 lg:py-0 lg:grid lg:grid-cols-[1fr_380px] lg:gap-10 lg:items-start">
            {/* ── Left column ── */}
            <div>
              {/* ── FREE SHIPPING PROGRESS BAR ── */}
              {cartItems.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl p-4 mb-4"
                  style={{
                    background: freeShipping
                      ? 'linear-gradient(135deg,#e8f5e9,#f1f8e9)'
                      : 'linear-gradient(135deg, #FDF8E8, #FFF3C0)',
                    border: `1px solid ${freeShipping ? 'rgba(34,197,94,0.3)' : 'rgba(201,162,39,0.25)'}`,
                    boxShadow: remaining > 0 && remaining <= 10000 ? '0 0 0 2px rgba(201,162,39,0.2)' : 'none',
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={!freeShipping && remaining <= 10000 ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        <Truck size={14} color={freeShipping ? '#22c55e' : GOLD} />
                      </motion.div>
                      {freeShipping ? (
                        <span style={{ color: '#16a34a', fontWeight: 700, fontSize: '12px' }}>
                          🎉 Livraison Abidjan offerte !
                        </span>
                      ) : remaining <= 10000 ? (
                        <span style={{ color: TEXT, fontWeight: 700, fontSize: '12px' }}>
                          🔥 Plus que <span style={{ color: '#ef4444', fontWeight: 800 }}>{formatPrice(remaining)}</span> pour la livraison gratuite !
                        </span>
                      ) : (
                        <span style={{ color: TEXT, fontWeight: 700, fontSize: '12px' }}>
                          Ajoutez <span style={{ color: GOLD }}>{formatPrice(remaining)}</span> pour la livraison <strong>gratuite</strong>
                        </span>
                      )}
                    </div>
                    <span style={{ color: MUTED, fontSize: '10px', fontWeight: 600 }}>
                      {Math.round(progressPct)}%
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.08)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPct}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      style={{ background: freeShipping ? 'linear-gradient(90deg,#22c55e,#16a34a)' : 'linear-gradient(90deg,#C9A227,#E8C84A)' }}
                    />
                  </div>
                  {!freeShipping && (
                    <p style={{ color: MUTED, fontSize: '10px', marginTop: '6px' }}>
                      Livraison Abidjan gratuite dès {formatPrice(FREE_SHIPPING)} d'achats
                    </p>
                  )}
                </motion.div>
              )}

              {/* Items */}
              <div className="flex flex-col gap-3 mb-5">
                <AnimatePresence initial={false}>
                  {cartItems.map((item, idx) => (
                    <motion.div
                      key={`${item.product.id}-${item.size}-${idx}`}
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex gap-3 p-3 rounded-2xl"
                      style={{ background: CARD_BG, border: `1px solid ${BORDER}`, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}
                    >
                      <div
                        className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer"
                        onClick={() => navigate(`/product/${item.product.id}`)}
                      >
                        <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p style={{ color: GOLD, fontWeight: 700, fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '2px' }}>{item.product.collection}</p>
                        <p className="truncate" style={{ color: TEXT, fontWeight: 600, fontSize: '13px', marginBottom: '2px' }}>{item.product.name}</p>
                        {item.size && <p style={{ color: MUTED, fontSize: '11px', marginBottom: '8px' }}>Taille : {item.size}</p>}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 rounded-xl px-2" style={{ background: 'rgba(201,162,39,0.08)', border: `1px solid rgba(201,162,39,0.2)` }}>
                            <motion.button className="w-7 h-7 flex items-center justify-center rounded-lg" whileTap={{ scale: 0.85 }} onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.size)}>
                              <Minus size={12} color={GOLD} />
                            </motion.button>
                            <span style={{ color: TEXT, fontWeight: 700, fontSize: '13px', minWidth: '16px', textAlign: 'center' }}>{item.quantity}</span>
                            <motion.button className="w-7 h-7 flex items-center justify-center rounded-lg" whileTap={{ scale: 0.85 }} onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.size)}>
                              <Plus size={12} color={GOLD} />
                            </motion.button>
                          </div>
                          <div className="flex items-center gap-3">
                            <span style={{ color: GOLD, fontWeight: 800, fontSize: '14px' }}>{formatPrice(item.product.price * item.quantity)}</span>
                            <motion.button
                              onClick={() => handleRemove(item.product.id, item.size, item.product.name)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg"
                              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
                              whileTap={{ scale: 0.85 }}
                            >
                              <Trash2 size={12} color="#ef4444" />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <motion.button
                onClick={() => navigate('/collection')}
                className="w-full py-3 flex items-center justify-center gap-2 rounded-2xl mb-5 lg:hidden"
                whileTap={{ scale: 0.97 }}
                style={{ background: 'transparent', border: `1px solid ${BORDER}`, color: MUTED, fontSize: '12px', fontWeight: 600 }}
              >
                <ArrowLeft size={14} /> Continuer mes achats
              </motion.button>

              {/* Gift Wrap */}
              <div className="rounded-2xl p-4 mb-5" style={{ background: CARD_BG, border: `1px solid ${BORDER}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FDF8E8, #FFF3C0)' }}>
                      <Gift size={16} color={GOLD} />
                    </div>
                    <div>
                      <p style={{ color: TEXT, fontWeight: 700, fontSize: '13px' }}>C'est un cadeau ?</p>
                      <p style={{ color: MUTED, fontSize: '11px' }}>Coffret luxe + Message personnalisé (+2 500 FCFA)</p>
                    </div>
                  </div>
                  <motion.button
                    onClick={() => { setIsGiftWrap(!isGiftWrap); }}
                    className="relative w-11 h-6 rounded-full flex-shrink-0"
                    style={{ background: isGiftWrap ? 'linear-gradient(135deg, #C9A227, #E8C84A)' : BORDER, transition: 'background 0.2s' }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <motion.div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow" animate={{ left: isGiftWrap ? '22px' : '2px' }} transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                  </motion.button>
                </div>
                <AnimatePresence>
                  {isGiftWrap && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                      <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${BORDER}` }}>
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare size={13} color={GOLD} />
                          <span style={{ color: MUTED, fontSize: '11px', fontWeight: 600 }}>Message sur la carte (optionnel)</span>
                        </div>
                        <textarea
                          placeholder="Joyeux anniversaire ! Avec tout mon amour... 💎"
                          value={giftMessage}
                          onChange={e => setGiftMessage(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 rounded-xl outline-none resize-none"
                          style={{ background: BG, border: `1px solid ${BORDER}`, color: TEXT, fontFamily: 'Manrope, sans-serif', fontSize: '12px', lineHeight: 1.6 }}
                        />
                        <p style={{ color: MUTED, fontSize: '10px', marginTop: '4px' }}>Max. 150 caractères · {150 - giftMessage.length} restants</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Promo Code */}
              <div className="rounded-2xl p-4 mb-5" style={{ background: CARD_BG, border: `1px solid ${BORDER}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <Tag size={14} color={GOLD} />
                  <span style={{ color: TEXT, fontWeight: 700, fontSize: '13px' }}>Code promo</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Entrez votre code"
                    value={promoCode}
                    onChange={e => { setPromoCode(e.target.value); setPromoError(''); }}
                    className="flex-1 px-4 py-2.5 rounded-xl outline-none"
                    style={{ background: BG, border: `1px solid ${promoApplied ? GOLD : BORDER}`, color: TEXT, fontFamily: 'Manrope, sans-serif', fontSize: '13px' }}
                  />
                  <motion.button
                    onClick={applyPromo}
                    disabled={promoLoading || promoApplied}
                    className="px-4 py-2.5 rounded-xl flex items-center gap-1.5"
                    whileTap={{ scale: 0.95 }}
                    style={{ background: promoApplied ? 'rgba(34,197,94,0.12)' : 'linear-gradient(135deg, #C9A227, #E8C84A)', color: promoApplied ? '#22c55e' : '#fff', fontWeight: 700, fontSize: '12px', border: promoApplied ? '1px solid rgba(34,197,94,0.3)' : 'none', opacity: promoLoading ? 0.7 : 1 }}
                  >
                    {promoLoading
                      ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : promoApplied ? 'Appliqué ✓' : 'Appliquer'}
                  </motion.button>
                </div>
                {promoError && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px' }}>{promoError}</p>}
                {promoApplied && <p style={{ color: '#22c55e', fontSize: '11px', marginTop: '6px' }}>Code MARNOA10 — 10% de réduction !</p>}
                {!promoApplied && !promoError && <p style={{ color: MUTED, fontSize: '10px', marginTop: '6px' }}>Essayez : MARNOA10 pour 10% de réduction</p>}
              </div>

              {/* Paiement 3x mention */}
              <div className="flex items-start gap-3 px-4 py-3 rounded-2xl mb-5" style={{ background: 'rgba(201,162,39,0.06)', border: `1px solid rgba(201,162,39,0.15)` }}>
                <Zap size={14} color={GOLD} className="mt-0.5 flex-shrink-0" />
                <p style={{ color: MUTED, fontSize: '11px', lineHeight: 1.6 }}>
                  <span style={{ color: TEXT, fontWeight: 700 }}>Paiement en 3 fois sans frais disponible</span> — conditions validées avec un conseiller sur WhatsApp lors de votre commande.
                </p>
              </div>

              {/* Bottom spacer for BottomNav on mobile */}
              <div className="h-28 lg:hidden" />
            </div>

            {/* ── Right column: summary (sticky on desktop) ── */}
            <div className="lg:sticky lg:top-24 pb-28 lg:pb-0">
              <div className="rounded-2xl p-4 mb-5" style={{ background: CARD_BG, border: `1px solid ${BORDER}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <h3 style={{ color: TEXT, fontWeight: 700, fontSize: '15px', marginBottom: '16px' }}>Récapitulatif</h3>
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between">
                    <span style={{ color: MUTED, fontSize: '13px' }}>Sous-total</span>
                    <span style={{ color: TEXT, fontSize: '13px', fontWeight: 600 }}>{formatPrice(cartTotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between">
                      <span style={{ color: '#22c55e', fontSize: '13px' }}>Réduction (10%)</span>
                      <span style={{ color: '#22c55e', fontSize: '13px', fontWeight: 600 }}>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  {isGiftWrap && (
                    <div className="flex justify-between">
                      <div className="flex items-center gap-1.5">
                        <Gift size={12} color={MUTED} />
                        <span style={{ color: MUTED, fontSize: '13px' }}>Emballage cadeau</span>
                      </div>
                      <span style={{ color: TEXT, fontSize: '13px', fontWeight: 600 }}>+{formatPrice(giftWrapFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <div className="flex items-center gap-1.5">
                      <Truck size={12} color={freeShipping ? '#22c55e' : MUTED} />
                      <span style={{ color: freeShipping ? '#22c55e' : MUTED, fontSize: '13px' }}>Livraison Abidjan</span>
                    </div>
                    <span style={{ color: freeShipping ? '#22c55e' : TEXT, fontSize: '13px', fontWeight: 600 }}>
                      {freeShipping ? 'GRATUITE 🎉' : formatPrice(SHIPPING)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-3" style={{ borderTop: `1px solid ${BORDER}` }}>
                    <span style={{ color: TEXT, fontWeight: 700, fontSize: '15px' }}>Total estimé</span>
                    <span style={{ fontWeight: 800, fontSize: '18px', background: 'linear-gradient(135deg, #B8860B, #D4AF35)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* WhatsApp CTA */}
              <div className="hidden lg:flex flex-col gap-3">
                <motion.button
                  onClick={handleWhatsAppCheckout}
                  className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl"
                  whileTap={{ scale: 0.97 }}
                  style={{ background: '#25D366', fontWeight: 700, fontSize: '15px', color: '#fff', boxShadow: '0 4px 20px rgba(37,211,102,0.3)' }}
                >
                  Commander via WhatsApp <ArrowRight size={18} />
                </motion.button>
                <motion.button
                  onClick={() => navigate('/checkout')}
                  className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl"
                  whileTap={{ scale: 0.97 }}
                  style={{ background: 'linear-gradient(135deg, #C9A227 0%, #E8C84A 50%, #C9A227 100%)', fontWeight: 700, fontSize: '15px', color: '#fff', boxShadow: '0 4px 20px rgba(201,162,39,0.35)' }}
                >
                  Payer avec Wave <ArrowRight size={18} />
                </motion.button>
              </div>
              <p className="hidden lg:block" style={{ color: MUTED, fontSize: '10px', textAlign: 'center', letterSpacing: '0.5px' }}>
                💬 Commande confirmée par un conseiller Marnoa
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile sticky checkout bar (above BottomNav) ── */}
      {cartItems.length > 0 && (
        <div
          className="fixed left-1/2 -translate-x-1/2 w-full lg:hidden z-40 px-4 py-3"
          style={{ bottom: '76px', maxWidth: '430px', background: `${BG}F8`, backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderTop: `1px solid ${BORDER}`, boxShadow: '0 -4px 16px rgba(0,0,0,0.07)' }}
        >
          <div className="flex items-center gap-3">
            <div className="min-w-0">
              <p style={{ color: MUTED, fontSize: '10px', fontWeight: 600, letterSpacing: '0.5px' }}>TOTAL ESTIMÉ</p>
              <span style={{ fontWeight: 800, fontSize: '17px', background: 'linear-gradient(135deg, #B8860B, #D4AF35)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {formatPrice(total)}
              </span>
            </div>
            <div className="flex-1 flex items-center gap-2">
              <motion.button
                onClick={handleWhatsAppCheckout}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl"
                whileTap={{ scale: 0.97 }}
                style={{ background: '#25D366', color: '#fff', fontWeight: 700, fontSize: '13px', boxShadow: '0 4px 16px rgba(37,211,102,0.28)', whiteSpace: 'nowrap' }}
              >
                WhatsApp
              </motion.button>
              <motion.button
                onClick={() => navigate('/checkout')}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl"
                whileTap={{ scale: 0.97 }}
                style={{ background: 'linear-gradient(135deg, #C9A227 0%, #E8C84A 50%, #C9A227 100%)', color: '#fff', fontWeight: 700, fontSize: '13px', boxShadow: '0 4px 16px rgba(201,162,39,0.35)', whiteSpace: 'nowrap' }}
              >
                Wave
              </motion.button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
