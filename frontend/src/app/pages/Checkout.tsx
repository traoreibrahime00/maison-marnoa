import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft, MapPin, User, Phone, FileText, ChevronDown, ChevronUp,
  Gift, Package, MessageCircle, Tag, X, Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp, useColors } from '../context/AppContext';
import { formatPrice } from '../data/products';
import { buildOrderMessage, openWhatsApp } from '../utils/whatsapp';
import { toast } from 'sonner';
import { apiUrl } from '../lib/api';
import { trackEvent } from '../lib/analytics';

interface ShippingZone {
  id: string; name: string; zoneKey: string;
  description: string; icon: string; price: number; isFree: boolean;
}

const FALLBACK_ZONES: ShippingZone[] = [
  { id: 'abidjan',  name: 'Abidjan Express',     zoneKey: 'abidjan',  description: 'Livraison sous 24h',  icon: '⚡', price: 3000, isFree: false },
  { id: 'national', name: 'National (Intérieur)', zoneKey: 'national', description: 'Livraison 48h–72h',  icon: '🚚', price: 5000, isFree: false },
  { id: 'retrait',  name: 'Retrait Showroom',     zoneKey: 'retrait',  description: 'Cocody · Gratuit',   icon: '🏪', price: 0,    isFree: true  },
];

interface FormData { fullName: string; phone: string; address: string; note: string; }

export default function Checkout() {
  const navigate = useNavigate();
  const {
    cartItems, cartTotal, clearCart, setLastOrderId,
    isGiftWrap, giftMessage, currentUser, isLoggedIn, login, updateProfile,
  } = useApp();
  const { BG, CARD_BG, BORDER, TEXT, MUTED, GOLD } = useColors();

  const [form, setForm]         = useState<FormData>({ fullName: '', phone: '+225 ', address: '', note: '' });
  const [errors, setErrors]     = useState<Partial<FormData>>({});
  const [delivery, setDelivery] = useState('abidjan');
  const [zones, setZones]       = useState<ShippingZone[]>(FALLBACK_ZONES);
  const [freeThreshold, setFreeThreshold] = useState(0);
  const [freeZone, setFreeZone] = useState('abidjan');
  const [processing, setProcessing] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [expandSummary, setExpandSummary] = useState(false);

  // Promo code
  const [promoInput,    setPromoInput]    = useState('');
  const [promoCode,     setPromoCode]     = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0); // percentage
  const [promoError,    setPromoError]    = useState('');
  const [promoLoading,  setPromoLoading]  = useState(false);

  // Pre-fill from logged-in user
  useEffect(() => {
    if (!currentUser) return;
    setForm(prev => ({
      ...prev,
      fullName: currentUser.name  || prev.fullName,
      phone:    currentUser.phone || prev.phone,
    }));
  }, [currentUser]);

  useEffect(() => {
    trackEvent({ type: 'CHECKOUT_VIEW', value: cartItems.length || 1 });
  }, []);

  // Fetch shipping zones
  useEffect(() => {
    fetch(apiUrl('/api/shipping/zones'))
      .then(r => r.json())
      .then((d: { zones: ShippingZone[]; freeThreshold: number; freeZone: string }) => {
        if (d.zones?.length) setZones(d.zones);
        if (d.freeThreshold !== undefined) setFreeThreshold(d.freeThreshold);
        if (d.freeZone) setFreeZone(d.freeZone);
      })
      .catch(() => {});
  }, []);

  const selectedZone    = zones.find(z => z.zoneKey === delivery) ?? zones[0];
  const freeShipping    = freeThreshold > 0 && cartTotal >= freeThreshold && (freeZone === 'all' || freeZone === selectedZone?.zoneKey);
  const deliveryPrice   = (selectedZone?.isFree || freeShipping) ? 0 : (selectedZone?.price ?? 0);
  const giftWrapFee     = isGiftWrap ? 2500 : 0;
  const discountAmount  = promoCode ? Math.round(cartTotal * promoDiscount / 100) : 0;
  const total           = cartTotal + deliveryPrice + giftWrapFee - discountAmount;

  const applyPromo = async () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    setPromoLoading(true);
    setPromoError('');
    try {
      const res = await fetch(apiUrl('/api/promos/validate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json() as { valid: boolean; discount: number; error?: string };
      if (data.valid) {
        setPromoCode(code);
        setPromoDiscount(data.discount);
        setPromoError('');
      } else {
        setPromoCode('');
        setPromoDiscount(0);
        setPromoError(data.error ?? 'Code invalide');
      }
    } catch {
      setPromoError('Erreur réseau, réessayez.');
    } finally {
      setPromoLoading(false);
    }
  };

  const removePromo = () => {
    setPromoCode('');
    setPromoDiscount(0);
    setPromoInput('');
    setPromoError('');
  };

  const validate = (): boolean => {
    const e: Partial<FormData> = {};
    if (!form.fullName.trim()) e.fullName = 'Nom requis';
    if (form.phone.replace(/\s/g, '').length < 9) e.phone = 'Téléphone requis';
    if (delivery !== 'retrait' && !form.address.trim()) e.address = 'Adresse requise';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleOrder = async () => {
    if (!validate()) return;
    setProcessing(true);

    const orderId = `MN-${Math.floor(10000 + Math.random() * 90000)}`;
    const customerAddress = delivery === 'retrait' ? 'Retrait Showroom Marnoa · Cocody' : form.address;

    const payload = {
      orderId,
      lines: cartItems.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        collection: item.product.collection,
        quantity: item.quantity,
        price: item.product.price,
        size: item.size,
      })),
      subtotal: cartTotal,
      deliveryLabel: selectedZone.name,
      deliveryPrice,
      isGiftWrap,
      giftWrapFee,
      total,
      customer: {
        name: form.fullName,
        phone: form.phone,
        address: customerAddress,
      },
      note: form.note || undefined,
      paymentMethod: 'WHATSAPP' as const,
      promoCode: promoCode || undefined,
      discountAmount: discountAmount || undefined,
    };

    try {
      const res = await fetch(apiUrl('/api/orders/checkout'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string; details?: { available?: number } };
        if (res.status === 409) {
          const available = data.details?.available ?? 0;
          toast.error('Stock insuffisant', {
            description: available === 0
              ? 'Un article n\'est plus disponible.'
              : `Il reste seulement ${available} exemplaire(s).`,
          });
          return;
        }
        throw new Error('checkout failed');
      }

      const { orderRef, accountCreated, tempPassword } = await res.json() as {
        orderRef: string; accountCreated: boolean; tempPassword?: string;
      };

      // Auto-login guest if account was created
      if (accountCreated && tempPassword) {
        try {
          const signInRes = await fetch(apiUrl('/api/auth/sign-in/email'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email: '', password: tempPassword }),
          });
          if (signInRes.ok) {
            const u = (await signInRes.json() as { user?: { id?: string; name?: string; email?: string; role?: string } }).user ?? {};
            login({ id: u.id, name: u.name || form.fullName, email: u.email, phone: form.phone, role: 'client' });
          }
        } catch { /* non-blocking */ }
      } else if (currentUser) {
        updateProfile({ name: form.fullName.trim(), phone: form.phone.trim() });
      }

      // Open WhatsApp with pre-filled order message
      const waMessage = buildOrderMessage({ ...payload, orderId: orderRef });
      openWhatsApp(waMessage);

      setLastOrderId(orderRef);
      setSubmitted(true);
      clearCart();
      navigate('/order-confirmation', { state: { orderRef, accountCreated, tempPassword } });
    } catch {
      toast.error('Erreur réseau', { description: 'Vérifiez votre connexion et réessayez.' });
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    if (!submitted && cartItems.length === 0) navigate('/cart');
  }, [cartItems.length, navigate]);

  if (cartItems.length === 0) return null;

  const field = (
    key: keyof FormData,
    label: string,
    icon: React.ReactNode,
    placeholder: string,
    type = 'text',
  ) => (
    <div>
      <label style={{ color: MUTED, fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
        {label}
      </label>
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
        style={{ background: BG, border: `1.5px solid ${errors[key] ? '#ef4444' : BORDER}`, transition: 'border-color .15s' }}>
        {icon}
        <input
          type={type}
          placeholder={placeholder}
          value={form[key]}
          onChange={e => { setForm(p => ({ ...p, [key]: e.target.value })); setErrors(p => ({ ...p, [key]: undefined })); }}
          className="flex-1 bg-transparent outline-none"
          style={{ color: TEXT, fontFamily: 'Manrope, sans-serif', fontSize: '14px' }}
        />
      </div>
      {errors[key] && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: 4 }}>{errors[key]}</p>}
    </div>
  );

  return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: 'Manrope, sans-serif' }}>
      {/* Mobile header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 pt-12 lg:hidden px-5 pb-4 flex items-center gap-4"
        style={{ background: `${BG}F5`, backdropFilter: 'blur(20px)', borderBottom: `1px solid ${BORDER}` }}
      >
        <motion.button onClick={() => navigate('/cart')} whileTap={{ scale: 0.88 }}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
          <ArrowLeft size={18} color={TEXT} />
        </motion.button>
        <div>
          <h1 style={{ color: TEXT, fontWeight: 800, fontSize: '18px' }}>Commander</h1>
          <p style={{ color: MUTED, fontSize: '11px' }}>via WhatsApp</p>
        </div>
      </motion.div>

      <div className="lg:max-w-[1080px] lg:mx-auto lg:px-10 xl:px-16 lg:py-10">
        {/* Desktop title */}
        <div className="hidden lg:flex items-center gap-3 mb-8">
          <motion.button onClick={() => navigate('/cart')} whileHover={{ x: -3 }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED, fontSize: '13px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <ArrowLeft size={15} /> Retour au panier
          </motion.button>
          <div style={{ flex: 1, height: 1, background: BORDER }} />
          <h1 style={{ color: TEXT, fontWeight: 800, fontSize: '22px' }}>Commander via WhatsApp</h1>
        </div>

        <div className="px-4 pb-32 lg:pb-0 lg:px-0 lg:grid lg:grid-cols-[1fr_360px] lg:gap-10 lg:items-start">

          {/* ── Left: form ── */}
          <div className="flex flex-col gap-5 pt-5 lg:pt-0">

            {/* Coordonnées */}
            <div className="rounded-2xl p-5 flex flex-col gap-4"
              style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
              <p style={{ color: TEXT, fontWeight: 700, fontSize: '14px' }}>Vos coordonnées</p>
              {field('fullName', 'Nom complet', <User size={15} color={MUTED} />, 'Kouassi Jean')}
              {field('phone',    'Téléphone',   <Phone size={15} color={MUTED} />, '+225 07 00 00 00 00', 'tel')}
            </div>

            {/* Livraison */}
            <div className="rounded-2xl p-5 flex flex-col gap-4"
              style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
              <p style={{ color: TEXT, fontWeight: 700, fontSize: '14px' }}>Mode de livraison</p>
              <div className="flex flex-col gap-2">
                {zones.map(zone => {
                  const zonePrice = (zone.isFree || (freeShipping && (freeZone === 'all' || freeZone === zone.zoneKey))) ? 0 : zone.price;
                  const active = delivery === zone.zoneKey;
                  return (
                    <motion.button
                      key={zone.zoneKey}
                      onClick={() => setDelivery(zone.zoneKey)}
                      whileTap={{ scale: 0.99 }}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-left w-full"
                      style={{
                        background: active ? `rgba(201,162,39,0.08)` : BG,
                        border: `1.5px solid ${active ? GOLD : BORDER}`,
                        transition: 'all .15s',
                      }}
                    >
                      <span style={{ fontSize: '20px' }}>{zone.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p style={{ color: TEXT, fontWeight: 600, fontSize: '13px' }}>{zone.name}</p>
                        <p style={{ color: MUTED, fontSize: '11px' }}>{zone.description}</p>
                      </div>
                      <span style={{ color: zonePrice === 0 ? '#22c55e' : GOLD, fontWeight: 700, fontSize: '13px', flexShrink: 0 }}>
                        {zonePrice === 0 ? 'Gratuit' : formatPrice(zonePrice)}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Address — hidden for showroom pickup */}
              {delivery !== 'retrait' && (
                <div>
                  <label style={{ color: MUTED, fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                    Adresse de livraison
                  </label>
                  <div className="flex items-start gap-3 px-4 py-3 rounded-2xl"
                    style={{ background: BG, border: `1.5px solid ${errors.address ? '#ef4444' : BORDER}` }}>
                    <MapPin size={15} color={MUTED} className="mt-0.5 flex-shrink-0" />
                    <textarea
                      placeholder="Quartier, rue, numéro..."
                      value={form.address}
                      onChange={e => { setForm(p => ({ ...p, address: e.target.value })); setErrors(p => ({ ...p, address: undefined })); }}
                      rows={2}
                      className="flex-1 bg-transparent outline-none resize-none"
                      style={{ color: TEXT, fontFamily: 'Manrope, sans-serif', fontSize: '14px', lineHeight: 1.5 }}
                    />
                  </div>
                  {errors.address && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: 4 }}>{errors.address}</p>}
                </div>
              )}
            </div>

            {/* Note optionnelle */}
            <div className="rounded-2xl p-5" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
              {field('note', 'Note (optionnel)', <FileText size={15} color={MUTED} />, 'Instructions particulières, taille à confirmer...')}
            </div>

            {/* Code promo */}
            <div className="rounded-2xl p-5" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
              <div className="flex items-center gap-2 mb-3">
                <Tag size={14} color={GOLD} />
                <p style={{ color: TEXT, fontWeight: 700, fontSize: '14px' }}>Code promo</p>
              </div>
              {promoCode ? (
                <div className="flex items-center justify-between px-4 py-3 rounded-xl"
                  style={{ background: 'rgba(34,197,94,0.08)', border: '1.5px solid rgba(34,197,94,0.25)' }}>
                  <div className="flex items-center gap-2">
                    <Check size={14} color="#22c55e" />
                    <span style={{ color: '#22c55e', fontWeight: 700, fontSize: '13px' }}>{promoCode}</span>
                    <span style={{ color: '#22c55e', fontSize: '12px' }}>— {promoDiscount}% de remise</span>
                  </div>
                  <button onClick={removePromo} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                    <X size={14} color="#22c55e" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl"
                    style={{ background: BG, border: `1.5px solid ${promoError ? '#ef4444' : BORDER}` }}>
                    <Tag size={13} color={MUTED} />
                    <input
                      type="text"
                      placeholder="MARNOA10"
                      value={promoInput}
                      onChange={e => { setPromoInput(e.target.value.toUpperCase()); setPromoError(''); }}
                      onKeyDown={e => e.key === 'Enter' && applyPromo()}
                      className="flex-1 bg-transparent outline-none"
                      style={{ color: TEXT, fontFamily: 'Manrope, sans-serif', fontSize: '14px', letterSpacing: '1px' }}
                    />
                  </div>
                  <motion.button
                    onClick={applyPromo}
                    disabled={promoLoading || !promoInput.trim()}
                    whileTap={{ scale: 0.96 }}
                    className="px-4 py-3 rounded-xl flex items-center gap-1"
                    style={{
                      background: promoInput.trim() ? `linear-gradient(135deg,${GOLD},#E8C84A)` : BORDER,
                      color: '#fff', fontWeight: 700, fontSize: '13px', border: 'none',
                      cursor: promoInput.trim() ? 'pointer' : 'not-allowed',
                      opacity: promoLoading ? 0.7 : 1,
                    }}
                  >
                    {promoLoading
                      ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      : 'Appliquer'}
                  </motion.button>
                </div>
              )}
              {promoError && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: 6 }}>{promoError}</p>}
            </div>

            {/* Gift wrap info */}
            {isGiftWrap && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                style={{ background: 'rgba(201,162,39,0.06)', border: `1px solid rgba(201,162,39,0.2)` }}>
                <Gift size={14} color={GOLD} />
                <p style={{ color: MUTED, fontSize: '12px' }}>
                  <span style={{ color: TEXT, fontWeight: 700 }}>Emballage cadeau</span> inclus
                  {giftMessage && <> · <em>"{giftMessage.slice(0, 40)}{giftMessage.length > 40 ? '…' : ''}"</em></>}
                </p>
              </div>
            )}
          </div>

          {/* ── Right: summary + CTA ── */}
          <div className="lg:sticky lg:top-24 mt-5 lg:mt-0">
            {/* Order summary */}
            <div className="rounded-2xl overflow-hidden mb-4" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
              <button
                onClick={() => setExpandSummary(v => !v)}
                className="w-full px-5 py-4 flex items-center justify-between"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <div className="flex items-center gap-2">
                  <Package size={15} color={GOLD} />
                  <span style={{ color: TEXT, fontWeight: 700, fontSize: '14px' }}>
                    {cartItems.reduce((s, i) => s + i.quantity, 0)} article{cartItems.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span style={{ color: GOLD, fontWeight: 800, fontSize: '16px' }}>{formatPrice(total)}</span>
                  {expandSummary ? <ChevronUp size={14} color={MUTED} /> : <ChevronDown size={14} color={MUTED} />}
                </div>
              </button>

              <AnimatePresence>
                {expandSummary && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                    style={{ borderTop: `1px solid ${BORDER}` }}
                  >
                    <div className="px-5 py-4 flex flex-col gap-3">
                      {cartItems.map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <img src={item.product.image} alt={item.product.name}
                            className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="truncate" style={{ color: TEXT, fontWeight: 600, fontSize: '12px' }}>{item.product.name}</p>
                            {item.size && <p style={{ color: MUTED, fontSize: '10px' }}>Taille {item.size}</p>}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p style={{ color: TEXT, fontSize: '12px', fontWeight: 600 }}>{formatPrice(item.product.price * item.quantity)}</p>
                            <p style={{ color: MUTED, fontSize: '10px' }}>×{item.quantity}</p>
                          </div>
                        </div>
                      ))}
                      <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 12, marginTop: 4 }} className="flex flex-col gap-1.5">
                        <div className="flex justify-between">
                          <span style={{ color: MUTED, fontSize: '12px' }}>Sous-total</span>
                          <span style={{ color: TEXT, fontSize: '12px', fontWeight: 600 }}>{formatPrice(cartTotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span style={{ color: MUTED, fontSize: '12px' }}>Livraison ({selectedZone?.name})</span>
                          <span style={{ color: deliveryPrice === 0 ? '#22c55e' : TEXT, fontSize: '12px', fontWeight: 600 }}>
                            {deliveryPrice === 0 ? 'Gratuite' : formatPrice(deliveryPrice)}
                          </span>
                        </div>
                        {isGiftWrap && (
                          <div className="flex justify-between">
                            <span style={{ color: MUTED, fontSize: '12px' }}>Emballage cadeau</span>
                            <span style={{ color: TEXT, fontSize: '12px', fontWeight: 600 }}>+{formatPrice(giftWrapFee)}</span>
                          </div>
                        )}
                        {discountAmount > 0 && (
                          <div className="flex justify-between">
                            <span style={{ color: '#22c55e', fontSize: '12px' }}>Code promo ({promoCode})</span>
                            <span style={{ color: '#22c55e', fontSize: '12px', fontWeight: 700 }}>-{formatPrice(discountAmount)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* WhatsApp CTA */}
            <motion.button
              onClick={handleOrder}
              disabled={processing}
              whileTap={{ scale: 0.97 }}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl"
              style={{
                background: processing ? 'rgba(37,211,102,0.5)' : 'linear-gradient(135deg,#25D366,#128C7E)',
                color: '#fff', fontWeight: 800, fontSize: '15px',
                boxShadow: processing ? 'none' : '0 4px 20px rgba(37,211,102,0.35)',
                border: 'none', cursor: processing ? 'not-allowed' : 'pointer',
              }}
            >
              {processing
                ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Enregistrement…</>
                : <><MessageCircle size={18} /> Commander via WhatsApp</>}
            </motion.button>

            <p style={{ color: MUTED, fontSize: '11px', textAlign: 'center', marginTop: 10, lineHeight: 1.6 }}>
              Votre commande sera enregistrée et un message WhatsApp s'ouvrira pour la confirmer avec notre équipe.
            </p>
          </div>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden px-4 py-3 z-40"
        style={{ background: `${BG}F8`, backdropFilter: 'blur(20px)', borderTop: `1px solid ${BORDER}` }}>
        <div className="flex items-center gap-3 max-w-[430px] mx-auto">
          <div>
            <p style={{ color: MUTED, fontSize: '10px', fontWeight: 600 }}>TOTAL</p>
            <p style={{ color: GOLD, fontWeight: 800, fontSize: '17px' }}>{formatPrice(total)}</p>
          </div>
          <motion.button
            onClick={handleOrder} disabled={processing}
            whileTap={{ scale: 0.97 }} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl"
            style={{
              background: processing ? 'rgba(37,211,102,0.5)' : 'linear-gradient(135deg,#25D366,#128C7E)',
              color: '#fff', fontWeight: 700, fontSize: '14px',
              boxShadow: '0 4px 16px rgba(37,211,102,0.35)', border: 'none',
              cursor: processing ? 'not-allowed' : 'pointer',
            }}
          >
            {processing
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <><MessageCircle size={16} /> Commander via WhatsApp</>}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
