import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Package, ChevronRight, LogOut, Heart, Moon, Sun,
  Calendar, Settings, MapPin, ShoppingBag, Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp, useColors } from '../context/AppContext';
import { apiUrl } from '../lib/api';
import { formatPrice } from '../data/products';
import { toast } from 'sonner';
import { ORDER_STATUS_META, type OrderStatus } from '../utils/orderStatus';

/* ─── Types ────────────────────────────────────────────── */
type ApptStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

interface RecentAppointment {
  id: string;
  ref: string;
  serviceLabel: string;
  date: string;
  slot: string;
  status: ApptStatus;
  createdAt: string;
}

interface RecentOrder {
  id: string;
  orderRef: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  items: { productName: string; quantity: number }[];
}

const APPT_META: Record<ApptStatus, { label: string; color: string; bg: string }> = {
  PENDING:   { label: 'En attente', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  CONFIRMED: { label: 'Confirmé',   color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  CANCELLED: { label: 'Annulé',     color: '#ef4444', bg: 'rgba(239,68,68,0.1)'  },
  COMPLETED: { label: 'Terminé',    color: '#22c55e', bg: 'rgba(34,197,94,0.1)'  },
};

const STATUS_META = ORDER_STATUS_META;

/* ─── Avatar ───────────────────────────────────────────── */
function Avatar({ name, image, size = 80, gold }: { name?: string; image?: string; size?: number; gold: string }) {
  return (
    <div className="rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
      style={{ width: size, height: size, border: `2px solid ${gold}`, boxShadow: '0 4px 12px rgba(201,162,39,0.2)', background: 'linear-gradient(135deg,#2A2010,#1C1508)' }}>
      {image
        ? <img src={image} alt="avatar" className="w-full h-full object-cover" />
        : <span style={{ color: gold, fontWeight: 800, fontSize: size * 0.35, fontFamily: 'Manrope, sans-serif', lineHeight: 1, userSelect: 'none' }}>
            {(name || '?').charAt(0).toUpperCase()}
          </span>
      }
    </div>
  );
}

/* ─── Not logged in ─────────────────────────────────────── */
function NotLoggedIn() {
  const navigate = useNavigate();
  const { BG, CARD_BG, BORDER, TEXT, MUTED, GOLD } = useColors();
  const { darkMode, toggleDarkMode } = useApp();

  return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: 'Manrope, sans-serif' }}>
      <div className="sticky top-0 z-40 pt-12 px-5 pb-4 flex items-center justify-between"
        style={{ background: `${BG}F5`, backdropFilter: 'blur(20px)', borderBottom: `1px solid ${BORDER}` }}>
        <div>
          <p style={{ color: GOLD, fontWeight: 700, fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase' }}>✦ MON COMPTE</p>
          <h1 style={{ color: TEXT, fontWeight: 800, fontSize: '22px' }}>Profil</h1>
        </div>
        <motion.button onClick={toggleDarkMode} whileTap={{ scale: 0.88 }}
          className="w-10 h-10 flex items-center justify-center rounded-full"
          style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
          {darkMode ? <Sun size={16} color={GOLD} /> : <Moon size={16} color={MUTED} />}
        </motion.button>
      </div>

      <div className="flex flex-col items-center px-6 pt-16 pb-32 gap-5 max-w-md mx-auto">
        <div className="w-24 h-24 rounded-full flex items-center justify-center"
          style={{ background: CARD_BG, border: `2px solid ${GOLD}`, boxShadow: '0 4px 16px rgba(201,162,39,0.15)' }}>
          <ShoppingBag size={36} color={GOLD} />
        </div>
        <div className="text-center">
          <h2 style={{ color: TEXT, fontWeight: 700, fontSize: '22px', marginBottom: '8px' }}>Rejoignez Maison Marnoa</h2>
          <p style={{ color: MUTED, fontSize: '13px', lineHeight: 1.7 }}>
            Connectez-vous pour accéder à vos commandes, favoris et avantages membres.
          </p>
        </div>
        <motion.button onClick={() => navigate('/login')} className="w-full py-4 rounded-2xl" whileTap={{ scale: 0.97 }}
          style={{ background: 'linear-gradient(135deg,#C9A227,#E8C84A)', color: '#fff', fontWeight: 700, fontSize: '15px', boxShadow: '0 4px 16px rgba(201,162,39,0.3)' }}>
          Se connecter
        </motion.button>
        <motion.button onClick={() => navigate('/login?mode=register')} className="w-full py-3.5 rounded-2xl" whileTap={{ scale: 0.97 }}
          style={{ background: 'transparent', border: `1px solid ${BORDER}`, color: TEXT, fontWeight: 600, fontSize: '14px' }}>
          Créer un compte
        </motion.button>
        <button onClick={() => navigate('/admin')} style={{ color: MUTED, fontSize: '12px', background: 'none', border: 'none', cursor: 'pointer' }}>
          Espace Administration →
        </button>
      </div>
    </div>
  );
}

/* ─── Main ──────────────────────────────────────────────── */
export default function Profile() {
  const navigate = useNavigate();
  const { currentUser, isLoggedIn, logout, wishlist, darkMode, toggleDarkMode } = useApp();
  const { BG, CARD_BG, BORDER, TEXT, MUTED, GOLD } = useColors();

  const [orders, setOrders]               = useState<RecentOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [appointments, setAppointments]   = useState<RecentAppointment[]>([]);
  const [apptLoading, setApptLoading]     = useState(true);

  useEffect(() => {
    if (!isLoggedIn || (!currentUser?.email && !currentUser?.phone)) {
      setOrdersLoading(false);
      setApptLoading(false);
      return;
    }
    const params = new URLSearchParams({ limit: '3' });
    if (currentUser.email) params.set('email', currentUser.email);
    if (currentUser.phone) params.set('phone', currentUser.phone);

    fetch(apiUrl(`/api/orders?${params}`))
      .then(r => r.ok ? r.json() : [])
      .then((data: RecentOrder[]) => setOrders(data))
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));

    const apptParams = new URLSearchParams();
    if (currentUser.email) apptParams.set('email', currentUser.email);
    if (currentUser.phone) apptParams.set('phone', currentUser.phone);

    fetch(apiUrl(`/api/appointments?${apptParams}`))
      .then(r => r.ok ? r.json() : [])
      .then((data: RecentAppointment[]) => setAppointments(data.slice(0, 3)))
      .catch(() => setAppointments([]))
      .finally(() => setApptLoading(false));
  }, [isLoggedIn, currentUser?.email, currentUser?.phone]);

  const handleLogout = () => {
    logout();
    toast('À bientôt !', { duration: 2000 });
    navigate('/');
  };

  if (!isLoggedIn) return <NotLoggedIn />;

  return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: 'Manrope, sans-serif' }}>

      {/* Header — mobile only */}
      <div className="sticky top-0 z-40 pt-12 px-5 pb-4 flex items-center justify-between lg:hidden"
        style={{ background: `${BG}F5`, backdropFilter: 'blur(20px)', borderBottom: `1px solid ${BORDER}` }}>
        <div>
          <p style={{ color: GOLD, fontWeight: 700, fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase' }}>✦ MON COMPTE</p>
          <h1 style={{ color: TEXT, fontWeight: 800, fontSize: '22px' }}>Mon Profil</h1>
        </div>
        <motion.button onClick={toggleDarkMode} whileTap={{ scale: 0.88 }}
          className="w-10 h-10 flex items-center justify-center rounded-full"
          style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
          <AnimatePresence mode="wait">
            {darkMode
              ? <motion.div key="sun"  initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}><Sun  size={16} color={GOLD} /></motion.div>
              : <motion.div key="moon" initial={{ rotate:  90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate:-90, opacity: 0 }} transition={{ duration: 0.2 }}><Moon size={16} color={MUTED} /></motion.div>
            }
          </AnimatePresence>
        </motion.button>
      </div>

      <div className="px-4 py-5 lg:max-w-[640px] lg:mx-auto lg:px-0 lg:pt-10 lg:pb-12 pb-28 flex flex-col gap-5">

        {/* ── Hero card ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
          <div className="absolute top-0 right-0 w-36 h-36 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(201,162,39,0.12), transparent)', transform: 'translate(30%,-30%)' }} />

          {/* Avatar + name */}
          <div className="flex items-center gap-4 mb-5">
            <Avatar name={currentUser?.name} image={currentUser?.image} gold={GOLD} />
            <div className="min-w-0">
              <h2 className="truncate" style={{ color: TEXT, fontWeight: 700, fontSize: '18px' }}>
                {currentUser?.name}
              </h2>
              {currentUser?.email && (
                <p className="truncate" style={{ color: MUTED, fontSize: '12px', marginTop: '2px' }}>
                  {currentUser.email}
                </p>
              )}
              {currentUser?.phone && (
                <p style={{ color: MUTED, fontSize: '12px' }}>{currentUser.phone}</p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: ordersLoading ? '…' : String(orders.length), label: 'Commandes' },
              { value: String(wishlist.length), label: 'Favoris' },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-3 text-center"
                style={{ background: darkMode ? 'rgba(201,162,39,0.06)' : '#FDF8E8', border: `1px solid rgba(201,162,39,0.15)` }}>
                <p style={{ color: GOLD, fontWeight: 800, fontSize: '20px', lineHeight: 1 }}>{s.value}</p>
                <p style={{ color: MUTED, fontSize: '9px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', marginTop: '3px' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Dernières commandes ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center justify-between mb-3 px-1">
            <p style={{ color: GOLD, fontWeight: 700, fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase' }}>
              Dernières commandes
            </p>
            <button onClick={() => navigate('/orders')}
              style={{ color: GOLD, fontSize: '11px', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
              Tout voir →
            </button>
          </div>

          <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
            {ordersLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: `${BORDER}`, borderTopColor: GOLD }} />
              </div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center py-10 gap-3">
                <Package size={32} color={MUTED} />
                <p style={{ color: MUTED, fontSize: '13px' }}>Aucune commande pour l'instant</p>
                <button onClick={() => navigate('/collection')} style={{ color: GOLD, fontWeight: 600, fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Découvrir la collection →
                </button>
              </div>
            ) : (
              orders.map((order, i) => {
                const meta = STATUS_META[order.status] ?? STATUS_META.PENDING_WHATSAPP;
                return (
                  <motion.button key={order.id}
                    onClick={() => navigate('/order-confirmation', { state: { orderRef: order.orderRef } })}
                    className="w-full flex items-center justify-between px-4 py-3.5 text-left"
                    style={{ background: CARD_BG, borderBottom: i < orders.length - 1 ? `1px solid ${BORDER}` : 'none' }}
                    whileTap={{ scale: 0.99 }}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: meta.bg }}>
                        <Package size={14} color={meta.color} />
                      </div>
                      <div className="min-w-0">
                        <p style={{ color: TEXT, fontWeight: 600, fontSize: '13px' }}>#{order.orderRef}</p>
                        <p className="truncate" style={{ color: MUTED, fontSize: '11px' }}>
                          {order.items.map(it => it.productName).join(', ')}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-3">
                      <span style={{ color: GOLD, fontWeight: 700, fontSize: '13px' }}>{formatPrice(order.total)}</span>
                      <span style={{ color: meta.color, fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: meta.bg, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {meta.label}
                      </span>
                    </div>
                  </motion.button>
                );
              })
            )}
          </div>
        </motion.div>

        {/* ── Rendez-vous ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <div className="flex items-center justify-between mb-3 px-1">
            <p style={{ color: GOLD, fontWeight: 700, fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase' }}>
              Mes rendez-vous
            </p>
            <button onClick={() => navigate('/appointment')}
              style={{ color: GOLD, fontSize: '11px', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
              Nouveau →
            </button>
          </div>

          <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
            {apptLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: BORDER, borderTopColor: GOLD }} />
              </div>
            ) : appointments.length === 0 ? (
              <div className="flex flex-col items-center py-8 gap-2">
                <Calendar size={28} color={MUTED} />
                <p style={{ color: MUTED, fontSize: '13px' }}>Aucun rendez-vous</p>
                <button onClick={() => navigate('/appointment')} style={{ color: GOLD, fontWeight: 600, fontSize: '12px', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Réserver au showroom →
                </button>
              </div>
            ) : (
              appointments.map((appt, i) => {
                const meta = APPT_META[appt.status] ?? APPT_META.PENDING;
                return (
                  <div key={appt.id} className="flex items-center justify-between px-4 py-3.5"
                    style={{ background: CARD_BG, borderBottom: i < appointments.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: meta.bg }}>
                        <Calendar size={14} color={meta.color} />
                      </div>
                      <div className="min-w-0">
                        <p style={{ color: TEXT, fontWeight: 600, fontSize: '13px' }}>{appt.serviceLabel}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Clock size={10} color={MUTED} />
                          <p style={{ color: MUTED, fontSize: '11px' }}>{appt.date} · {appt.slot}</p>
                        </div>
                      </div>
                    </div>
                    <span style={{ color: meta.color, fontSize: '9px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: meta.bg, textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0, marginLeft: '8px' }}>
                      {meta.label}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>

        {/* ── Navigation rapide ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <p style={{ color: GOLD, fontWeight: 700, fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px', paddingLeft: '4px' }}>
            Navigation
          </p>
          <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
            {[
              { icon: Package,  label: 'Mes commandes',        sub: 'Historique et suivi', path: '/orders' },
              { icon: Heart,    label: 'Mes favoris',          sub: `${wishlist.length} pièce${wishlist.length !== 1 ? 's' : ''} sauvegardée${wishlist.length !== 1 ? 's' : ''}`, path: '/wishlist' },
              { icon: Calendar, label: 'Rendez-vous Showroom', sub: 'Réserver une visite',  path: '/appointment' },
              { icon: MapPin,   label: 'Suivre une commande',  sub: 'Historique complet',   path: '/orders' },
            ].map((item, i, arr) => (
              <motion.button key={item.path} onClick={() => navigate(item.path)}
                className="w-full flex items-center justify-between px-4 py-4 text-left"
                style={{ background: CARD_BG, borderBottom: i < arr.length - 1 ? `1px solid ${BORDER}` : 'none' }}
                whileTap={{ scale: 0.99 }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: darkMode ? 'rgba(201,162,39,0.08)' : '#FDF8E8' }}>
                    <item.icon size={15} color={GOLD} />
                  </div>
                  <div>
                    <p style={{ color: TEXT, fontWeight: 600, fontSize: '14px' }}>{item.label}</p>
                    <p style={{ color: MUTED, fontSize: '11px' }}>{item.sub}</p>
                  </div>
                </div>
                <ChevronRight size={15} color={MUTED} />
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* ── Admin ── (affiché seulement si admin) */}
        {currentUser?.role === 'admin' && (
          <motion.button onClick={() => navigate('/admin/dashboard')}
            className="w-full flex items-center justify-between px-4 py-4 rounded-2xl"
            style={{ background: 'rgba(201,162,39,0.06)', border: `1px solid rgba(201,162,39,0.2)` }}
            whileTap={{ scale: 0.98 }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(201,162,39,0.12)' }}>
                <Settings size={15} color={GOLD} />
              </div>
              <div>
                <p style={{ color: GOLD, fontWeight: 700, fontSize: '14px' }}>Espace Administration</p>
                <p style={{ color: MUTED, fontSize: '11px' }}>Produits, commandes, paramètres</p>
              </div>
            </div>
            <ChevronRight size={15} color={GOLD} />
          </motion.button>
        )}

        {/* ── Logout ── */}
        <motion.button onClick={handleLogout} whileTap={{ scale: 0.97 }}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl"
          style={{ background: 'transparent', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', fontWeight: 700, fontSize: '14px' }}>
          <LogOut size={16} /> Déconnexion
        </motion.button>

        <p style={{ color: MUTED, fontSize: '10px', textAlign: 'center', opacity: 0.5 }}>
          Maison Marnoa · Abidjan, Côte d'Ivoire
        </p>
      </div>
    </div>
  );
}
