import { useNavigate } from 'react-router';
import { MessageCircle, Package, Headphones, ArrowRight, Calendar, Clock, UserPlus } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { useColors } from '../context/AppContext';
import { openWhatsApp, WA_NUMBER } from '../utils/whatsapp';
import { IMAGES } from '../data/products';

export default function OrderConfirmation() {
  const navigate = useNavigate();
  const { lastOrderId, isLoggedIn } = useApp();
  const { BG, CARD_BG, BORDER, TEXT, MUTED, GOLD } = useColors();

  const orderId = lastOrderId || `MN-${Math.floor(10000 + Math.random() * 90000)}`;

  const reopenWhatsApp = () => {
    const msg = `👋 Bonjour Maison Marnoa,\n\nJe reviens concernant ma commande *#${orderId}*.\nPourriez-vous me confirmer sa prise en charge ? Merci 🙏`;
    openWhatsApp(msg);
  };

  return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: 'Manrope, sans-serif' }}>
      {/* Hero */}
      <div className="relative" style={{ height: 'clamp(180px,25vw,280px)' }}>
        <img src={IMAGES.hero} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.7) 100%)' }} />
        {/* WhatsApp icon floating */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 20 }}
          className="absolute inset-0 flex flex-col items-center justify-end pb-8"
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: '#25D366', boxShadow: '0 8px 32px rgba(37,211,102,0.5)' }}
          >
            <MessageCircle size={36} color="#fff" fill="#fff" />
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="rounded-t-3xl -mt-6 relative z-10"
        style={{ background: BG }}
      >
        <div className="px-5 pt-8 pb-10 lg:max-w-[720px] lg:mx-auto lg:px-0 lg:pt-10">

          {/* Title */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
              style={{ background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.3)' }}
            >
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span style={{ color: '#16a34a', fontWeight: 700, fontSize: '11px', letterSpacing: '1px' }}>
                COMMANDE TRANSMISE SUR WHATSAPP
              </span>
            </motion.div>
            <h1 style={{ color: TEXT, fontWeight: 800, fontSize: 'clamp(22px,4vw,32px)', lineHeight: 1.2, marginBottom: '12px' }}>
              Merci pour votre<br />confiance !
            </h1>
            <p style={{ color: MUTED, fontSize: '13px', lineHeight: 1.7, maxWidth: '460px', margin: '0 auto' }}>
              Votre récapitulatif de commande <strong style={{ color: TEXT }}>#{orderId}</strong> a été envoyé sur WhatsApp. Un conseiller Maison Marnoa vous contacte sous <strong style={{ color: TEXT }}>24h</strong> pour confirmer et finaliser le paiement.
            </p>
          </div>

          {/* Status card */}
          <div className="rounded-2xl mb-4 overflow-hidden" style={{ background: CARD_BG, border: `1px solid ${BORDER}`, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
            <div className="flex items-start justify-between p-5" style={{ borderBottom: `1px solid ${BORDER}` }}>
              <div>
                <p style={{ color: GOLD, fontWeight: 700, fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Commande
                </p>
                <h3 style={{ color: TEXT, fontWeight: 700, fontSize: '20px' }}>#{orderId}</h3>
              </div>
              <div className="px-3 py-1.5 rounded-lg flex items-center gap-1.5" style={{ background: 'linear-gradient(135deg, #FDF8E8, #FFF3C0)', border: `1px solid rgba(201,162,39,0.25)` }}>
                <Clock size={10} color={GOLD} />
                <p style={{ color: GOLD, fontWeight: 700, fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  En attente WhatsApp
                </p>
              </div>
            </div>

            {/* Tracking steps */}
            <div className="p-5">
              {[
                { icon: '📋', label: 'Commande créée', sub: 'Récapitulatif généré', done: true },
                { icon: '💬', label: 'WhatsApp envoyé', sub: 'Message transmis à notre équipe', done: true },
                { icon: '👤', label: 'Validation conseiller', sub: 'Confirmation sous 24h', done: false },
                { icon: '💳', label: 'Paiement & expédition', sub: 'Selon mode convenu avec conseiller', done: false },
              ].map((step, i, arr) => (
                <div key={step.label} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <motion.div
                      initial={step.done ? { scale: 0 } : {}}
                      animate={step.done ? { scale: 1 } : {}}
                      transition={{ delay: 0.5 + i * 0.12, type: 'spring' }}
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-base"
                      style={{
                        background: step.done ? 'linear-gradient(135deg, #25D366, #128C7E)' : CARD_BG,
                        border: `2px solid ${step.done ? '#25D366' : BORDER}`,
                      }}
                    >
                      {step.done ? (
                        <span style={{ fontSize: '14px' }}>{step.icon}</span>
                      ) : (
                        <span style={{ color: MUTED, fontSize: '12px' }}>{i + 1}</span>
                      )}
                    </motion.div>
                    {i < arr.length - 1 && (
                      <div className="w-px flex-1 my-1" style={{ background: step.done ? 'linear-gradient(to bottom, #25D366, rgba(37,211,102,0.2))' : BORDER, minHeight: '24px' }} />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p style={{ color: step.done ? TEXT : MUTED, fontWeight: step.done ? 600 : 400, fontSize: '13px' }}>{step.label}</p>
                    <p style={{ color: MUTED, fontSize: '11px', marginTop: '2px' }}>{step.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="rounded-2xl p-4" style={{ background: CARD_BG, border: `1px solid ${BORDER}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: 'linear-gradient(135deg, #FDF8E8, #FFF3C0)' }}>
                <Calendar size={16} color={GOLD} />
              </div>
              <p style={{ color: MUTED, fontWeight: 700, fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>Réponse conseiller</p>
              <p style={{ color: TEXT, fontWeight: 600, fontSize: '13px' }}>Sous 24h</p>
            </div>
            <div className="rounded-2xl p-4" style={{ background: CARD_BG, border: `1px solid ${BORDER}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: 'linear-gradient(135deg, #FDF8E8, #FFF3C0)' }}>
                <Headphones size={16} color={GOLD} />
              </div>
              <p style={{ color: MUTED, fontWeight: 700, fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>Support client</p>
              <p style={{ color: TEXT, fontWeight: 600, fontSize: '13px' }}>7j/7 · WhatsApp</p>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col gap-3 mb-6">
            {/* Reopen WhatsApp */}
            <motion.button
              onClick={reopenWhatsApp}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl"
              whileTap={{ scale: 0.97 }}
              style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)', color: '#fff', fontWeight: 700, fontSize: '14px', boxShadow: '0 4px 16px rgba(37,211,102,0.3)' }}
            >
              <MessageCircle size={18} /> Ouvrir WhatsApp
            </motion.button>

            {/* Create account prompt (only if not logged in) */}
            {!isLoggedIn && (
              <motion.button
                onClick={() => navigate('/login?mode=register')}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl"
                whileTap={{ scale: 0.97 }}
                style={{ background: 'linear-gradient(135deg, #C9A227 0%, #E8C84A 50%, #C9A227 100%)', color: '#fff', fontWeight: 700, fontSize: '14px', boxShadow: '0 4px 16px rgba(201,162,39,0.25)' }}
              >
                <UserPlus size={18} /> Créer mon compte & gagner des points 💎
              </motion.button>
            )}

            <motion.button
              onClick={() => navigate('/')}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl"
              whileTap={{ scale: 0.97 }}
              style={{ background: 'transparent', border: `1.5px solid ${BORDER}`, color: MUTED, fontSize: '13px', fontWeight: 600 }}
            >
              Retour à l'accueil <ArrowRight size={16} />
            </motion.button>
          </div>

          {/* Post-order loyalty promo */}
          {!isLoggedIn && (
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
              className="rounded-2xl p-4 mb-6"
              style={{ background: 'linear-gradient(135deg, #FDF8E8, #FFF3C0)', border: `1px solid rgba(201,162,39,0.25)` }}
            >
              <p style={{ color: GOLD, fontWeight: 700, fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '6px' }}>💎 Programme Privilège</p>
              <p style={{ color: TEXT, fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>Gagnez des points sur cette commande !</p>
              <p style={{ color: MUTED, fontSize: '12px', lineHeight: 1.6 }}>
                Créez un compte gratuit maintenant pour créditer les points de cette commande sur votre carte fidélité Marnoa.
              </p>
            </motion.div>
          )}

          {/* Brand footer */}
          <div className="text-center">
            <p style={{ color: GOLD, fontWeight: 800, fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase' }}>MAISON MARNOA</p>
            <p style={{ color: MUTED, fontSize: '10px', marginTop: '2px' }}>Haute Joaillerie · Abidjan</p>
            <div className="flex items-center justify-center gap-4 mt-3">
              {['Instagram', 'Facebook', 'WhatsApp'].map(s => (
                <span key={s} style={{ color: '#B0A090', fontSize: '10px' }}>{s}</span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}