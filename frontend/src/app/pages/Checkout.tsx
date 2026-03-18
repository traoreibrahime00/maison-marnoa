import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft, MapPin, Truck, MessageCircle, Shield,
  ChevronDown, ChevronUp, Gift, MessageSquare, User, Mail, Phone, FileText,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp, useColors } from '../context/AppContext';
import { formatPrice } from '../data/products';
import {
  buildOrderMessage, openWhatsApp, saveOrderToDb,
  fmtPrice, type OrderPayload,
} from '../utils/whatsapp';
import { toast } from 'sonner';
import { apiUrl } from '../lib/api';
import { trackEvent } from '../lib/analytics';

const DELIVERY_OPTIONS = [
  { id: 'abidjan', label: 'Abidjan Express', sub: 'Livraison sous 24h', price: 3000, icon: '⚡' },
  { id: 'national', label: 'National (Intérieur)', sub: 'Livraison 48h – 72h', price: 5000, icon: '🚚' },
  { id: 'retrait', label: 'Retrait en Showroom', sub: 'Cocody, Abidjan · Gratuit', price: 0, icon: '🏪' },
];

const FREE_SHIPPING_THRESHOLD = 50000;

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  note: string;
}

export default function Checkout() {
  const navigate = useNavigate();
  const {
    cartItems, cartTotal, clearCart, setLastOrderId, isGiftWrap, giftMessage,
    currentUser, updateProfile,
  } = useApp();
  const { BG, CARD_BG, BORDER, TEXT, MUTED, GOLD } = useColors();

  const [form, setForm] = useState<FormData>({ fullName: '', email: '', phone: '+225 ', address: '', note: '' });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [delivery, setDelivery] = useState('abidjan');
  const [expandSummary, setExpandSummary] = useState(false);
  const [processing, setProcessing] = useState(false);

  const freeShipping   = cartTotal >= FREE_SHIPPING_THRESHOLD;
  const selectedDelivery = DELIVERY_OPTIONS.find(d => d.id === delivery)!;
  const deliveryPrice  = freeShipping && delivery === 'abidjan' ? 0 : selectedDelivery.price;
  const giftWrapFee    = isGiftWrap ? 2500 : 0;
  const total          = cartTotal + deliveryPrice + giftWrapFee;

  useEffect(() => {
    if (!currentUser) return;
    setForm(prev => ({
      ...prev,
      fullName: prev.fullName || currentUser.name || '',
      email: prev.email || currentUser.email || '',
      phone: prev.phone === '+225 ' ? (currentUser.phone || prev.phone) : prev.phone,
    }));
  }, [currentUser]);

  useEffect(() => {
    trackEvent({ type: 'CHECKOUT_VIEW', value: cartItems.length || 1 });
  }, [cartItems.length]);

  const validate = (): boolean => {
    const e: Partial<FormData> = {};
    if (!form.fullName.trim()) e.fullName = 'Nom requis';
    if (form.phone.replace(/\s/g, '').length < 9) e.phone = 'Téléphone requis';
    if (!form.address.trim()) e.address = 'Adresse requise';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const buildPayload = (orderId: string): OrderPayload => ({
    orderId,
    lines: cartItems.map(item => ({
      name: item.product.name,
      collection: item.product.collection,
      quantity: item.quantity,
      price: item.product.price,
      size: item.size,
      productId: item.product.id,
    })),
    subtotal: cartTotal,
    deliveryLabel: selectedDelivery.label,
    deliveryPrice,
    isGiftWrap,
    giftWrapFee,
    total,
    customer: {
      name: form.fullName,
      phone: form.phone,
      email: form.email || undefined,
      address: delivery === 'retrait' ? 'Retrait Showroom Marnoa · Cocody' : form.address,
    },
    note: form.note || undefined,
  });

  const handleConfirmWhatsApp = async () => {
    if (!validate()) return;
    setProcessing(true);

    const orderId = `MN-${Math.floor(10000 + Math.random() * 90000)}`;
    const payload = buildPayload(orderId);

    // ── Sauvegarde "DB" pré-redirection ──
    const persistedIn = await saveOrderToDb({
      orderId,
      status: 'pending_whatsapp',
      createdAt: new Date().toISOString(),
      payload,
    });

    if (currentUser) {
      updateProfile({
        name: form.fullName.trim(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim(),
      });
    }

    if (persistedIn === 'local') {
      toast('Commande enregistrée localement', {
        description: 'Connexion backend indisponible, synchronisation à prévoir.',
        duration: 2500,
      });
    }

    // Persist order id for confirmation page
    setLastOrderId(orderId);

    // Build message & navigate
    const message = buildOrderMessage(payload);
    clearCart();

    navigate('/order-confirmation');

    // Open WhatsApp after short delay so confirmation screen renders first
    setTimeout(() => openWhatsApp(message), 500);

    setProcessing(false);
  };

  const handleWaveCheckout = async () => {
    if (!validate()) return;
    setProcessing(true);

    const orderId = `MN-${Math.floor(10000 + Math.random() * 90000)}`;
    const payload = buildPayload(orderId);

    try {
      const orderRes = await fetch(apiUrl('/api/orders'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!orderRes.ok) {
        throw new Error('Failed to create order before Wave checkout');
      }

      const waveRes = await fetch(apiUrl('/api/payments/wave/checkout'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderRef: orderId,
          customerPhone: form.phone,
        }),
      });

      if (!waveRes.ok) {
        throw new Error('Failed to create Wave checkout');
      }

      const waveCheckout = (await waveRes.json()) as { checkoutUrl?: string };
      if (!waveCheckout.checkoutUrl) {
        throw new Error('Missing checkoutUrl from Wave endpoint');
      }

      if (currentUser) {
        updateProfile({
          name: form.fullName.trim(),
          email: form.email.trim() || undefined,
          phone: form.phone.trim(),
        });
      }

      setLastOrderId(orderId);
      clearCart();
      navigate('/order-confirmation');

      setTimeout(() => window.open(waveCheckout.checkoutUrl, '_blank'), 500);
      toast('Redirection vers Wave', {
        description: 'Finalisez votre paiement sécurisé.',
        duration: 2400,
      });
    } catch (error) {
      console.error('[WaveCheckout]', error);
      toast('Paiement Wave indisponible', {
        description: 'Réessayez dans un instant ou utilisez WhatsApp.',
        duration: 2600,
      });
    } finally {
      setProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

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
        <h1 style={{ color: TEXT, fontWeight: 800, fontSize: '18px' }}>Finaliser la commande</h1>
      </motion.div>

      <div className="lg:max-w-[1100px] lg:mx-auto lg:px-10 xl:px-16 lg:py-8">
        {/* Desktop title */}
        <div className="hidden lg:flex items-center gap-4 mb-8">
          <motion.button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED, fontSize: '13px', fontWeight: 500 }}
            whileHover={{ x: -3 }}
          >
            <ArrowLeft size={16} color={MUTED} /> Retour au panier
          </motion.button>
          <div style={{ flex: 1, height: 1, background: BORDER }} />
          <h1 style={{ color: TEXT, fontWeight: 800, fontSize: '24px' }}>Finaliser la commande</h1>
        </div>

        <div className="px-4 py-4 lg:px-0 lg:py-0 lg:grid lg:grid-cols-[1fr_360px] lg:gap-10 lg:items-start">
          {/* ── Left: form ── */}
          <div>
            {/* Guest checkout notice */}
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl mb-5"
              style={{ background: 'rgba(201,162,39,0.06)', border: `1px solid rgba(201,162,39,0.15)` }}
            >
              <User size={14} color={GOLD} className="flex-shrink-0" />
              <p style={{ color: MUTED, fontSize: '12px', lineHeight: 1.5 }}>
                Vous pouvez commander <span style={{ color: TEXT, fontWeight: 700 }}>sans créer de compte</span>. Un conseiller vous contacte sur WhatsApp pour confirmer.
              </p>
            </motion.div>

            {/* Gift summary if enabled */}
            {isGiftWrap && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 px-4 py-3 rounded-2xl mb-5"
                style={{ background: 'linear-gradient(135deg, #FDF8E8, #FFF3C0)', border: `1px solid rgba(201,162,39,0.25)` }}
              >
                <Gift size={16} color={GOLD} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p style={{ color: TEXT, fontWeight: 700, fontSize: '13px', marginBottom: '2px' }}>Emballage cadeau activé 🎁</p>
                  {giftMessage ? (
                    <div className="flex items-start gap-1.5">
                      <MessageSquare size={11} color={MUTED} className="mt-0.5 flex-shrink-0" />
                      <p style={{ color: MUTED, fontSize: '11px', lineHeight: 1.5, fontStyle: 'italic' }}>"{giftMessage}"</p>
                    </div>
                  ) : (
                    <p style={{ color: MUTED, fontSize: '11px' }}>Coffret luxe + Ruban satiné inclus</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── Section 1: Delivery Address ── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(201,162,39,0.1)' }}>
                  <MapPin size={14} color={GOLD} />
                </div>
                <h2 style={{ color: TEXT, fontWeight: 700, fontSize: '16px' }}>Vos coordonnées</h2>
              </div>
              <div className="flex flex-col gap-3">
                {/* Name */}
                <div>
                  <label style={{ color: MUTED, fontSize: '11px', fontWeight: 600, letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                    Nom complet *
                  </label>
                  <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl" style={{ background: CARD_BG, border: `1px solid ${errors.fullName ? '#ef4444' : BORDER}` }}>
                    <User size={15} color={MUTED} />
                    <input
                      type="text" placeholder="Jean-Marc Koffi"
                      value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                      className="flex-1 bg-transparent outline-none"
                      style={{ color: TEXT, fontFamily: 'Manrope, sans-serif', fontSize: '14px' }}
                    />
                  </div>
                  {errors.fullName && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{errors.fullName}</p>}
                </div>
                {/* Phone */}
                <div>
                  <label style={{ color: MUTED, fontSize: '11px', fontWeight: 600, letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                    Téléphone WhatsApp *
                  </label>
                  <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl" style={{ background: CARD_BG, border: `1px solid ${errors.phone ? '#ef4444' : BORDER}` }}>
                    <Phone size={15} color={MUTED} />
                    <input
                      type="tel" placeholder="+225 07 00 00 00 00"
                      value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      className="flex-1 bg-transparent outline-none"
                      style={{ color: TEXT, fontFamily: 'Manrope, sans-serif', fontSize: '14px' }}
                    />
                  </div>
                  {errors.phone && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{errors.phone}</p>}
                </div>
                {/* Email optional */}
                <div>
                  <label style={{ color: MUTED, fontSize: '11px', fontWeight: 600, letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                    E-mail <span style={{ fontWeight: 400 }}>(optionnel)</span>
                  </label>
                  <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
                    <Mail size={15} color={MUTED} />
                    <input
                      type="email" placeholder="jean@exemple.com"
                      value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className="flex-1 bg-transparent outline-none"
                      style={{ color: TEXT, fontFamily: 'Manrope, sans-serif', fontSize: '14px' }}
                    />
                  </div>
                </div>
                {/* Address — hidden if retrait */}
                <AnimatePresence>
                  {delivery !== 'retrait' && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <label style={{ color: MUTED, fontSize: '11px', fontWeight: 600, letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                        Adresse de livraison *
                      </label>
                      <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl" style={{ background: CARD_BG, border: `1px solid ${errors.address ? '#ef4444' : BORDER}` }}>
                        <MapPin size={15} color={MUTED} />
                        <input
                          type="text" placeholder="Cocody, Cité des Arts, Villa 45"
                          value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                          className="flex-1 bg-transparent outline-none"
                          style={{ color: TEXT, fontFamily: 'Manrope, sans-serif', fontSize: '14px' }}
                        />
                      </div>
                      {errors.address && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{errors.address}</p>}
                    </motion.div>
                  )}
                </AnimatePresence>
                {/* Note */}
                <div>
                  <label style={{ color: MUTED, fontSize: '11px', fontWeight: 600, letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                    Note pour le conseiller <span style={{ fontWeight: 400 }}>(optionnel)</span>
                  </label>
                  <div className="flex items-start gap-3 px-4 py-3 rounded-2xl" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
                    <FileText size={15} color={MUTED} className="mt-0.5 flex-shrink-0" />
                    <textarea
                      placeholder="Paiement 3× souhaité, heure de livraison préférée…"
                      value={form.note}
                      onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                      rows={2}
                      className="flex-1 bg-transparent outline-none resize-none"
                      style={{ color: TEXT, fontFamily: 'Manrope, sans-serif', fontSize: '13px', lineHeight: 1.6 }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ── Section 2: Delivery ── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(201,162,39,0.1)' }}>
                  <Truck size={14} color={GOLD} />
                </div>
                <h2 style={{ color: TEXT, fontWeight: 700, fontSize: '16px' }}>Mode de livraison</h2>
              </div>
              <div className="flex flex-col gap-2">
                {DELIVERY_OPTIONS.map(opt => {
                  const active  = delivery === opt.id;
                  const isFree  = opt.id === 'abidjan' && freeShipping;
                  const displayPrice = isFree ? 0 : opt.price;
                  return (
                    <motion.button
                      key={opt.id}
                      onClick={() => setDelivery(opt.id)}
                      className="flex items-center justify-between px-4 py-4 rounded-2xl text-left"
                      whileTap={{ scale: 0.98 }}
                      style={{ background: active ? 'rgba(201,162,39,0.06)' : CARD_BG, border: `1.5px solid ${active ? GOLD : BORDER}`, boxShadow: active ? '0 4px 12px rgba(201,162,39,0.15)' : '0 1px 4px rgba(0,0,0,0.04)', transition: 'all 0.2s' }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ border: `2px solid ${active ? GOLD : BORDER}`, background: active ? GOLD : 'transparent' }}>
                          {active && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <div>
                          <p style={{ color: TEXT, fontWeight: 600, fontSize: '14px' }}>{opt.icon} {opt.label}</p>
                          <p style={{ color: MUTED, fontSize: '11px' }}>{opt.sub}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {isFree ? (
                          <div>
                            <span style={{ color: '#22c55e', fontWeight: 700, fontSize: '13px' }}>GRATUITE 🎉</span>
                            <p style={{ color: '#B0A090', fontSize: '10px', textDecoration: 'line-through' }}>{fmtPrice(DELIVERY_OPTIONS[0].price)}</p>
                          </div>
                        ) : (
                          <span style={{ color: displayPrice === 0 ? '#22c55e' : GOLD, fontWeight: 700, fontSize: '14px' }}>
                            {displayPrice === 0 ? 'Gratuit' : formatPrice(displayPrice)}
                          </span>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* ── WhatsApp CTA (mobile) ── */}
            <div className="lg:hidden pb-28">
              {/* Order total recap */}
              <div className="rounded-2xl p-4 mb-4" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
                <div className="flex justify-between items-center">
                  <span style={{ color: TEXT, fontWeight: 700, fontSize: '15px' }}>Total estimé</span>
                  <span style={{ fontWeight: 800, fontSize: '18px', background: 'linear-gradient(135deg, #B8860B, #D4AF35)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {formatPrice(total)}
                  </span>
                </div>
                {deliveryPrice === 0 && delivery === 'abidjan' && (
                  <p style={{ color: '#22c55e', fontSize: '11px', marginTop: '4px' }}>🎉 Livraison Abidjan offerte !</p>
                )}
              </div>

              <motion.button
                onClick={handleConfirmWhatsApp}
                disabled={processing}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl mb-3"
                whileTap={{ scale: 0.97 }}
                style={{ background: processing ? 'rgba(37,211,102,0.5)' : 'linear-gradient(135deg, #25D366, #128C7E)', color: '#fff', fontWeight: 800, fontSize: '15px', boxShadow: processing ? 'none' : '0 4px 20px rgba(37,211,102,0.35)' }}
              >
                {processing ? (
                  <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Préparation…</>
                ) : (
                  <><MessageCircle size={20} /> Confirmer sur WhatsApp 📲</>
                )}
              </motion.button>
              <motion.button
                onClick={handleWaveCheckout}
                disabled={processing}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl mb-3"
                whileTap={{ scale: 0.97 }}
                style={{ background: processing ? 'rgba(8,145,178,0.45)' : 'linear-gradient(135deg, #0891B2, #2563EB)', color: '#fff', fontWeight: 800, fontSize: '15px', boxShadow: processing ? 'none' : '0 4px 16px rgba(37,99,235,0.35)' }}
              >
                {processing ? (
                  <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Préparation…</>
                ) : (
                  <><Shield size={18} /> Payer avec Wave 💳</>
                )}
              </motion.button>
              <p style={{ color: MUTED, fontSize: '10px', textAlign: 'center', marginBottom: '32px' }}>
                Un conseiller Marnoa confirme votre commande sous 24h
              </p>
            </div>
          </div>

          {/* ── Right: Order Summary (desktop sticky) ── */}
          <div className="hidden lg:block">
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="rounded-2xl mb-5"
              style={{ background: CARD_BG, border: `1px solid ${BORDER}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            >
              <button className="w-full px-4 py-4 flex items-center justify-between" onClick={() => setExpandSummary(!expandSummary)}>
                <div className="flex items-center gap-2">
                  <span style={{ color: TEXT, fontWeight: 700, fontSize: '14px' }}>Récapitulatif</span>
                  <span className="px-2 py-0.5 rounded-full" style={{ background: 'rgba(201,162,39,0.1)', color: GOLD, fontSize: '10px', fontWeight: 700 }}>
                    {cartItems.length} article{cartItems.length > 1 ? 's' : ''}
                  </span>
                </div>
                {expandSummary ? <ChevronUp size={16} color={MUTED} /> : <ChevronDown size={16} color={MUTED} />}
              </button>
              <AnimatePresence>
                {expandSummary && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} style={{ overflow: 'hidden', borderTop: `1px solid ${BORDER}` }}>
                    {cartItems.map((item, i) => (
                      <div key={i} className="flex gap-3 px-4 py-3" style={{ borderBottom: `1px solid ${BORDER}` }}>
                        <img src={item.product.image} alt={item.product.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="truncate" style={{ color: TEXT, fontWeight: 600, fontSize: '12px' }}>{item.product.name}</p>
                          <p style={{ color: MUTED, fontSize: '10px' }}>{item.size ? `Taille ${item.size} · ` : ''}Qté : {item.quantity}</p>
                        </div>
                        <span style={{ color: GOLD, fontWeight: 700, fontSize: '12px', flexShrink: 0 }}>{formatPrice(item.product.price * item.quantity)}</span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="px-4 py-4">
                <div className="flex justify-between mb-2">
                  <span style={{ color: MUTED, fontSize: '13px' }}>Sous-total</span>
                  <span style={{ color: TEXT, fontSize: '13px', fontWeight: 600 }}>{formatPrice(cartTotal)}</span>
                </div>
                {isGiftWrap && (
                  <div className="flex justify-between mb-2">
                    <span style={{ color: MUTED, fontSize: '13px' }}>Emballage cadeau</span>
                    <span style={{ color: TEXT, fontSize: '13px', fontWeight: 600 }}>+{formatPrice(giftWrapFee)}</span>
                  </div>
                )}
                <div className="flex justify-between mb-2">
                  <span style={{ color: MUTED, fontSize: '13px' }}>Livraison</span>
                  <span style={{ color: deliveryPrice === 0 ? '#22c55e' : TEXT, fontSize: '13px', fontWeight: 600 }}>
                    {deliveryPrice === 0 ? '🎉 Gratuite' : formatPrice(deliveryPrice)}
                  </span>
                </div>
                <div className="flex justify-between pt-3" style={{ borderTop: `1px solid ${BORDER}` }}>
                  <span style={{ color: TEXT, fontWeight: 700, fontSize: '15px' }}>Total estimé</span>
                  <span style={{ fontWeight: 800, fontSize: '18px', background: 'linear-gradient(135deg, #B8860B, #D4AF35)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {formatPrice(total)}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* 3x mention */}
            <div className="flex items-start gap-2 px-4 py-3 rounded-2xl mb-5" style={{ background: 'rgba(201,162,39,0.06)', border: `1px solid rgba(201,162,39,0.15)` }}>
              <span style={{ fontSize: '14px' }}>💳</span>
              <p style={{ color: MUTED, fontSize: '11px', lineHeight: 1.6 }}>
                <span style={{ color: TEXT, fontWeight: 700 }}>Paiement en 3 fois sans frais</span> — à valider avec votre conseiller sur WhatsApp.
              </p>
            </div>

            {/* Desktop WhatsApp CTA */}
            <motion.button
              onClick={handleConfirmWhatsApp}
              disabled={processing}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl mb-3"
              whileTap={{ scale: 0.97 }}
              style={{ background: processing ? 'rgba(37,211,102,0.5)' : 'linear-gradient(135deg, #25D366, #128C7E)', color: '#fff', fontWeight: 800, fontSize: '15px', letterSpacing: '0.3px', boxShadow: processing ? 'none' : '0 4px 20px rgba(37,211,102,0.35)' }}
            >
              {processing ? (
                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Préparation…</>
              ) : (
                <><MessageCircle size={20} /> Confirmer sur WhatsApp 📲</>
              )}
            </motion.button>
            <motion.button
              onClick={handleWaveCheckout}
              disabled={processing}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl mb-3"
              whileTap={{ scale: 0.97 }}
              style={{ background: processing ? 'rgba(8,145,178,0.45)' : 'linear-gradient(135deg, #0891B2, #2563EB)', color: '#fff', fontWeight: 800, fontSize: '15px', letterSpacing: '0.3px', boxShadow: processing ? 'none' : '0 4px 16px rgba(37,99,235,0.35)' }}
            >
              {processing ? (
                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Préparation…</>
              ) : (
                <><Shield size={18} /> Payer avec Wave 💳</>
              )}
            </motion.button>
            <div className="flex items-center justify-center gap-1.5">
              <Shield size={11} color={MUTED} />
              <p style={{ color: MUTED, fontSize: '10px' }}>Un conseiller Marnoa confirme sous 24h</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
