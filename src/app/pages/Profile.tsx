import { useNavigate } from 'react-router';
import {
  User, Package, MapPin, CreditCard, Settings, ChevronRight,
  LogOut, Star, Heart, Bell, Shield, HelpCircle, Edit2, Moon, Sun,
  Calendar, Diamond,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp, useColors } from '../context/AppContext';
import { IMAGES } from '../data/products';
import { toast } from 'sonner';

function PointsBar({ points }: { points: number }) {
  const { GOLD, BORDER, CARD_BG, TEXT, MUTED } = useColors();
  const MAX = 5000;
  const pct = Math.min((points / MAX) * 100, 100);
  let tier = 'Argent';
  let nextTier = 'Or';
  let nextThreshold = 2000;
  if (points >= 5000) { tier = 'Diamant'; nextTier = 'Diamant'; nextThreshold = 5000; }
  else if (points >= 2000) { tier = 'Or'; nextTier = 'Diamant'; nextThreshold = 5000; }

  return (
    <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${BORDER}` }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Diamond size={12} color={GOLD} />
          <span style={{ color: GOLD, fontWeight: 700, fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase' }}>{tier}</span>
        </div>
        <span style={{ color: MUTED, fontSize: '10px' }}>{points} / {nextThreshold} pts → {nextTier}</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: BORDER }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #B8860B, #E8C84A)' }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
        />
      </div>
      <p style={{ color: MUTED, fontSize: '10px', marginTop: '4px' }}>
        {points >= 5000 ? '🏆 Niveau maximum atteint !' : `${nextThreshold - points} pts pour atteindre ${nextTier}`}
      </p>
    </div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const { isLoggedIn, login, logout, wishlist, loyaltyPoints, darkMode, toggleDarkMode } = useApp();
  const { BG, CARD_BG, BORDER, TEXT, MUTED, GOLD } = useColors();

  const MENU_SECTIONS = [
    {
      title: 'Espace Client',
      items: [
        { icon: User, label: 'Informations Personnelles', sub: 'Gérer vos données et préférences', path: null },
        { icon: Package, label: 'Historique des Commandes', sub: 'Suivre et revoir vos achats passés', path: null },
        { icon: MapPin, label: 'Adresses Enregistrées', sub: 'Modifier vos adresses de livraison', path: null },
        { icon: CreditCard, label: 'Moyens de Paiement', sub: 'Cartes bancaires et portefeuilles', path: null },
      ],
    },
    {
      title: 'Préférences',
      items: [
        { icon: Bell, label: 'Notifications', sub: 'Offres et nouvelles collections', path: null },
        { icon: Heart, label: 'Liste de favoris', sub: 'Vos pièces sauvegardées', path: '/wishlist' },
        { icon: Calendar, label: 'Rendez-vous Showroom', sub: 'Réserver une visite en boutique', path: '/appointment' },
        { icon: Shield, label: 'Sécurité & Confidentialité', sub: 'Mot de passe, données personnelles', path: null },
      ],
    },
    {
      title: 'Assistance & Administration',
      items: [
        { icon: HelpCircle, label: 'FAQ & Aide', sub: 'Toutes vos questions', path: null },
        { icon: Star, label: 'Évaluer l\'application', sub: 'Donnez-nous votre avis', path: null },
        { icon: Settings, label: 'Espace Administration', sub: 'Gérer les produits (Réservé)', path: '/admin' },
      ],
    },
  ];

  if (!isLoggedIn) {
    return (
      <div style={{ background: BG, minHeight: '100vh', fontFamily: 'Manrope, sans-serif' }}>
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="sticky top-0 z-40 pt-12 px-5 pb-4 flex items-center justify-between">
          <div>
            <p style={{ color: GOLD, fontWeight: 700, fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '2px' }}>✦ MON COMPTE</p>
            <h1 style={{ color: TEXT, fontWeight: 800, fontSize: '22px' }}>Profil</h1>
          </div>
          {/* Dark mode toggle */}
          <motion.button onClick={toggleDarkMode} className="w-10 h-10 flex items-center justify-center rounded-full" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }} whileTap={{ scale: 0.88 }}>
            {darkMode ? <Sun size={16} color={GOLD} /> : <Moon size={16} color={MUTED} />}
          </motion.button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col items-center px-6 pt-16 pb-32 gap-6">
          <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ background: CARD_BG, border: `2px solid ${GOLD}`, boxShadow: '0 4px 16px rgba(201,162,39,0.15)' }}>
            <User size={40} color={MUTED} />
          </div>
          <div className="text-center">
            <h2 style={{ color: TEXT, fontWeight: 700, fontSize: '22px', marginBottom: '8px' }}>Rejoignez Maison Marnoa</h2>
            <p style={{ color: MUTED, fontSize: '13px', lineHeight: 1.7 }}>Connectez-vous pour accéder à vos commandes, favoris et avantages exclusifs membres.</p>
          </div>
          <div className="w-full flex flex-col gap-2">
            {[
              { icon: '✦', label: 'Accès aux offres exclusives membres' },
              { icon: '📦', label: 'Suivi de vos commandes en temps réel' },
              { icon: '💎', label: 'Programme Points Privilège (1 pt = 1 000 FCFA)' },
              { icon: '🔔', label: 'Alertes baisse de prix sur vos favoris' },
            ].map((b, i) => (
              <motion.div key={b.label} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.08 }} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'linear-gradient(135deg, #FDF8E8, #FFF8E0)', border: `1px solid rgba(201,162,39,0.2)` }}>
                <span style={{ fontSize: '16px' }}>{b.icon}</span>
                <span style={{ color: TEXT, fontSize: '13px' }}>{b.label}</span>
              </motion.div>
            ))}
          </div>
          <motion.button onClick={() => navigate('/login')} className="w-full py-4 rounded-2xl" whileTap={{ scale: 0.97 }} style={{ background: 'linear-gradient(135deg, #C9A227 0%, #E8C84A 50%, #C9A227 100%)', color: '#fff', fontWeight: 700, fontSize: '15px', boxShadow: '0 4px 16px rgba(201,162,39,0.3)' }}>
            Se connecter
          </motion.button>
          <motion.button onClick={() => navigate('/login?mode=register')} className="w-full py-4 rounded-2xl mb-4" whileTap={{ scale: 0.97 }} style={{ background: 'transparent', border: `1px solid ${BORDER}`, color: TEXT, fontWeight: 600, fontSize: '14px' }}>
            Créer un compte
          </motion.button>
          
          <motion.button onClick={() => navigate('/admin')} className="w-full py-3 flex items-center justify-center gap-2 rounded-2xl" whileTap={{ scale: 0.97 }} style={{ background: CARD_BG, border: `1px dashed ${BORDER}`, color: MUTED, fontWeight: 600, fontSize: '13px' }}>
            <Settings size={14} /> Espace Administration
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: 'Manrope, sans-serif' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="sticky top-0 lg:top-16 z-40 pt-12 lg:pt-4 px-5 pb-4 flex items-center justify-between" style={{ background: `${BG}F5`, backdropFilter: 'blur(20px)', borderBottom: `1px solid ${BORDER}` }}>
        <div>
          <p style={{ color: GOLD, fontWeight: 700, fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '2px' }}>✦ MON COMPTE</p>
          <h1 style={{ color: TEXT, fontWeight: 800, fontSize: '22px' }}>Mon Profil</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Dark mode toggle */}
          <motion.button onClick={() => { toggleDarkMode(); toast(darkMode ? '☀️ Mode clair activé' : '🌙 Mode sombre activé', { duration: 1500 }); }} className="w-10 h-10 flex items-center justify-center rounded-full" style={{ background: CARD_BG, border: `1px solid ${BORDER}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }} whileTap={{ scale: 0.88 }}>
            <AnimatePresence mode="wait">
              {darkMode ? (
                <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Sun size={16} color={GOLD} />
                </motion.div>
              ) : (
                <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Moon size={16} color={MUTED} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
          <motion.button className="w-10 h-10 flex items-center justify-center rounded-full" style={{ background: CARD_BG, border: `1px solid ${BORDER}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }} whileTap={{ scale: 0.88 }}>
            <Settings size={16} color={MUTED} />
          </motion.button>
        </div>
      </motion.div>

      <div className="px-4 py-4 lg:max-w-[900px] lg:mx-auto lg:px-10 xl:px-0 lg:py-8 pb-28 lg:pb-8">
        {/* Profile Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl p-5 mb-5 relative overflow-hidden" style={{ background: CARD_BG, border: `1px solid ${BORDER}`, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #C9A227, transparent)', transform: 'translate(30%, -30%)' }} />
          <div className="flex items-center gap-4 mb-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden" style={{ border: `2px solid ${GOLD}`, boxShadow: '0 4px 12px rgba(201,162,39,0.2)' }}>
                <img src={IMAGES.profile} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: GOLD, border: `2px solid ${BG}`, boxShadow: '0 2px 6px rgba(201,162,39,0.3)' }}>
                <Edit2 size={10} color="#fff" />
              </div>
            </div>
            <div>
              <h2 style={{ color: TEXT, fontWeight: 700, fontSize: '18px', marginBottom: '2px' }}>Mme. Sophie Marnoa</h2>
              <div className="flex items-center gap-1.5 mb-1">
                <Star size={11} fill={GOLD} color={GOLD} />
                <span style={{ color: GOLD, fontWeight: 700, fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase' }}>Membre Prestige</span>
              </div>
              <p style={{ color: MUTED, fontSize: '11px' }}>sophie.m@maisonmarnoa.com</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            {[{ value: '12', label: 'Commandes' }, { value: loyaltyPoints.toLocaleString('fr-FR'), label: 'Points' }, { value: `${wishlist.length}`, label: 'Favoris' }].map(stat => (
              <div key={stat.label} className="rounded-xl p-3 text-center" style={{ background: 'linear-gradient(135deg, #FDF8E8, #FFF3C0)', border: `1px solid rgba(201,162,39,0.2)` }}>
                <p style={{ color: GOLD, fontWeight: 800, fontSize: '18px', lineHeight: 1 }}>{stat.value}</p>
                <p style={{ color: MUTED, fontWeight: 600, fontSize: '9px', letterSpacing: '0.5px', textTransform: 'uppercase', marginTop: '2px' }}>{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Points Progress */}
          <PointsBar points={loyaltyPoints} />
        </motion.div>

        {/* Menu Sections */}
        {MENU_SECTIONS.map((section, sIdx) => (
          <motion.div key={section.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + sIdx * 0.1 }} className="mb-5">
            <p style={{ color: GOLD, fontWeight: 700, fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px', paddingLeft: '4px' }}>{section.title}</p>
            <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${BORDER}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              {section.items.map((item, i) => (
                <motion.button key={item.label} onClick={() => item.path && navigate(item.path)} className="w-full flex items-center justify-between px-4 py-4 text-left" style={{ background: CARD_BG, borderBottom: i < section.items.length - 1 ? `1px solid ${BORDER}` : 'none' }} whileTap={{ scale: 0.99, background: 'rgba(201,162,39,0.03)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FDF8E8, #FFF3C0)' }}>
                      <item.icon size={16} color={GOLD} />
                    </div>
                    <div>
                      <p style={{ color: TEXT, fontWeight: 600, fontSize: '14px' }}>{item.label}</p>
                      <p style={{ color: MUTED, fontSize: '11px' }}>{item.sub}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} color={MUTED} />
                </motion.button>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Logout */}
        <motion.button onClick={() => { logout(); toast('À bientôt !', { duration: 2000 }); }} className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl mb-2" whileTap={{ scale: 0.97 }} style={{ background: 'transparent', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontWeight: 700, fontSize: '14px' }}>
          <LogOut size={16} />Déconnexion
        </motion.button>

        <p style={{ color: '#B0A090', fontSize: '10px', textAlign: 'center', marginTop: '8px' }}>Version 2.0.0 · © 2026 Maison Marnoa</p>
      </div>
    </div>
  );
}