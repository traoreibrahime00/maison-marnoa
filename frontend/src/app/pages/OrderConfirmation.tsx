import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import {
  Check, Clock, Package, Truck, ShoppingBag, ArrowRight,
  MessageCircle, RefreshCw, KeyRound, Copy,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useApp, useColors } from '../context/AppContext';
import { apiUrl } from '../lib/api';
import { openWhatsApp } from '../utils/whatsapp';
import { ORDER_STATUS_META } from '../utils/orderStatus';
import { toast } from 'sonner';

const GOLD = '#C9A227';
const STATUS_META = ORDER_STATUS_META;

type NavState = {
  orderRef?: string;
  accountCreated?: boolean;
  tempPassword?: string;
};

type OrderData = { ref: string; status: string; total: number; customerName: string; createdAt: string };

export default function OrderConfirmation() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { lastOrderId, isLoggedIn } = useApp();
  const { BG, CARD_BG, BORDER, TEXT, MUTED } = useColors();

  const navState = (location.state ?? {}) as NavState;
  const { accountCreated, tempPassword } = navState;

  const orderId = navState.orderRef || lastOrderId || '';

  // Redirect if no order to show
  useEffect(() => {
    if (!orderId) navigate('/', { replace: true });
  }, [orderId, navigate]);

  const [order, setOrder]           = useState<OrderData | null>(null);
  const [orderLoading, setOrderLoading] = useState(false);

  const fetchOrder = async (ref: string) => {
    if (!ref) return;
    setOrderLoading(true);
    try {
      const res = await fetch(apiUrl(`/api/orders/${encodeURIComponent(ref)}`));
      if (res.ok) setOrder(await res.json() as OrderData);
    } catch {}
    finally { setOrderLoading(false); }
  };

  useEffect(() => { if (orderId) fetchOrder(orderId); }, [orderId]);

  const status = order?.status ?? 'PENDING_WHATSAPP';
  const meta   = STATUS_META[status] ?? STATUS_META.PENDING_WHATSAPP;

  const STEPS = [
    { icon: Check,    label: 'Commande enregistrée',   sub: `Réf. ${orderId || '—'}`,                               done: true },
    { icon: MessageCircle, label: 'Message WhatsApp envoyé', sub: 'Notre équipe va confirmer votre commande',        done: true },
    { icon: Package,  label: 'Commande confirmée',     sub: status === 'CONFIRMED' || ['PAID','SHIPPED','DELIVERED'].includes(status) ? 'Confirmée par notre équipe' : 'En attente de confirmation', done: ['CONFIRMED','PAID','SHIPPED','DELIVERED'].includes(status) },
    { icon: Truck,    label: 'Livraison',               sub: status === 'DELIVERED' ? 'Livrée !' : 'En cours de livraison',  done: ['SHIPPED','DELIVERED'].includes(status) },
  ];

  const handleReopen = () => {
    const msg = `Bonjour Maison Marnoa, je souhaite suivre ma commande *#${orderId}*.`;
    openWhatsApp(msg);
  };

  return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: 'Manrope, sans-serif', paddingBottom: 48 }}>

      {/* Top success banner */}
      <motion.div
        initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        className="w-full pt-14 pb-8 px-5 flex flex-col items-center text-center"
        style={{ background: 'linear-gradient(180deg, rgba(37,211,102,0.06) 0%, transparent 100%)' }}
      >
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 18, delay: 0.15 }}
          className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
          style={{ background: 'linear-gradient(135deg,#25D366,#128C7E)', boxShadow: '0 8px 32px rgba(37,211,102,0.32)' }}
        >
          <Check size={36} color="#fff" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          style={{ color: '#25D366', fontWeight: 700, fontSize: '10px', letterSpacing: '2.5px', textTransform: 'uppercase', marginBottom: 6 }}
        >
          ✦ COMMANDE ENVOYÉE
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          style={{ color: TEXT, fontWeight: 800, fontSize: 'clamp(22px,5vw,30px)', lineHeight: 1.2, marginBottom: 8 }}
        >
          Votre commande est enregistrée !
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          style={{ color: MUTED, fontSize: '13px', lineHeight: 1.7, maxWidth: 340 }}
        >
          Le message WhatsApp s'est ouvert. Notre équipe va confirmer votre commande rapidement.
        </motion.p>
      </motion.div>

      <div className="px-4 lg:max-w-[640px] lg:mx-auto lg:px-0 flex flex-col gap-4">

        {/* Temp password if account created */}
        {accountCreated && tempPassword && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-4 flex flex-col gap-3"
            style={{ background: 'rgba(34,197,94,0.05)', border: '1.5px solid rgba(34,197,94,0.2)' }}
          >
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#22c55e' }}>
                <Check size={11} color="#fff" />
              </div>
              <p style={{ color: '#22c55e', fontWeight: 700, fontSize: '12px' }}>Compte créé automatiquement</p>
            </div>
            <p style={{ color: MUTED, fontSize: '11px', lineHeight: 1.6 }}>
              Notez votre mot de passe temporaire pour suivre vos commandes plus tard.
            </p>
            <div className="rounded-xl px-4 py-3 flex items-center justify-between gap-3"
              style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
              <div className="flex items-center gap-2">
                <KeyRound size={12} color={MUTED} />
                <span style={{ color: TEXT, fontSize: '13px', fontWeight: 800, letterSpacing: '2px' }}>{tempPassword}</span>
              </div>
              <button
                onClick={() => { navigator.clipboard.writeText(tempPassword); toast('Mot de passe copié !'); }}
                className="flex items-center gap-1 px-2 py-1 rounded-lg"
                style={{ background: 'rgba(201,162,39,0.1)', color: GOLD, fontSize: '10px', fontWeight: 700 }}
              >
                <Copy size={9} /> Copier
              </button>
            </div>
          </motion.div>
        )}

        {/* Order ref + status */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="rounded-2xl p-5 flex items-center justify-between"
          style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}
        >
          <div>
            <p style={{ color: MUTED, fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 4 }}>Référence commande</p>
            <p style={{ color: TEXT, fontWeight: 800, fontSize: '22px' }}>#{orderId || '—'}</p>
            {order?.customerName && (
              <p style={{ color: MUTED, fontSize: '12px', marginTop: 2 }}>{order.customerName}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: meta.bg }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: meta.color }} />
              <span style={{ color: meta.color, fontWeight: 700, fontSize: '11px' }}>{meta.label}</span>
            </div>
            {orderLoading && <RefreshCw size={12} color={MUTED} className="animate-spin" />}
          </div>
        </motion.div>

        {/* Tracking steps */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="rounded-2xl p-5"
          style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}
        >
          <p style={{ color: GOLD, fontWeight: 700, fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 16 }}>Suivi commande</p>
          {STEPS.map((step, i) => (
            <div key={step.label} className="flex gap-3">
              <div className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.55 + i * 0.1, type: 'spring' }}
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: step.done ? 'linear-gradient(135deg,#C9A227,#E8C84A)' : CARD_BG,
                    border: `2px solid ${step.done ? GOLD : BORDER}`,
                  }}
                >
                  {step.done
                    ? <Check size={14} color="#fff" />
                    : <step.icon size={13} color={MUTED} />}
                </motion.div>
                {i < STEPS.length - 1 && (
                  <div className="w-px flex-1 my-1"
                    style={{ background: step.done ? `linear-gradient(to bottom,${GOLD},rgba(201,162,39,0.15))` : BORDER, minHeight: 20 }} />
                )}
              </div>
              <div className="flex-1 pb-4">
                <p style={{ color: step.done ? TEXT : MUTED, fontWeight: step.done ? 700 : 400, fontSize: '13px' }}>{step.label}</p>
                <p style={{ color: MUTED, fontSize: '11px', marginTop: 2 }}>{step.sub}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Info tiles */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          className="grid grid-cols-2 gap-3"
        >
          {[
            { icon: Clock,   title: 'Délai de livraison', value: '2 – 5 jours ouvrés' },
            { icon: Package, title: 'Emballage premium',  value: 'Coffret cadeau inclus' },
          ].map(({ icon: Icon, title, value }) => (
            <div key={title} className="rounded-2xl p-4" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(201,162,39,0.08)' }}>
                <Icon size={15} color={GOLD} />
              </div>
              <p style={{ color: MUTED, fontSize: '10px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 3 }}>{title}</p>
              <p style={{ color: TEXT, fontWeight: 600, fontSize: '12px' }}>{value}</p>
            </div>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="flex flex-col gap-3"
        >
          <motion.button
            onClick={handleReopen} whileTap={{ scale: 0.97 }}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl"
            style={{ background: 'linear-gradient(135deg,#25D366,#128C7E)', color: '#fff', fontWeight: 700, fontSize: '14px', boxShadow: '0 4px 16px rgba(37,211,102,0.28)', border: 'none' }}
          >
            <MessageCircle size={17} /> Suivre ma commande sur WhatsApp
          </motion.button>

          <motion.button
            onClick={() => navigate(isLoggedIn ? '/profile' : '/')}
            whileTap={{ scale: 0.97 }}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl"
            style={{ background: `linear-gradient(135deg,${GOLD},#E8C84A)`, color: '#fff', fontWeight: 700, fontSize: '14px', boxShadow: '0 4px 16px rgba(201,162,39,0.28)', border: 'none' }}
          >
            <ShoppingBag size={17} /> {isLoggedIn ? 'Voir mes commandes' : 'Continuer mes achats'} <ArrowRight size={16} />
          </motion.button>
        </motion.div>

        <div className="text-center py-4">
          <p style={{ color: GOLD, fontWeight: 800, fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase' }}>MAISON MARNOA</p>
          <p style={{ color: MUTED, fontSize: '10px', marginTop: 2 }}>Haute Joaillerie · Abidjan</p>
        </div>
      </div>
    </div>
  );
}
