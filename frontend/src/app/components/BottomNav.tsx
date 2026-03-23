import { useNavigate, useLocation } from 'react-router';
import { Home, Grid3x3, ShoppingBag, Heart, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp, useColors } from '../context/AppContext';

const MUTED = '#B0A090';

const tabs = [
  { path: '/', icon: Home, label: 'Accueil' },
  { path: '/collection', icon: Grid3x3, label: 'Collection' },
  { path: '/cart', icon: ShoppingBag, label: 'Panier' },
  { path: '/wishlist', icon: Heart, label: 'Favoris' },
  { path: '/profile', icon: User, label: 'Profil' },
];

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount, wishlist, isLoggedIn, currentUser } = useApp();
  const { CARD_BG, BORDER, GOLD } = useColors();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 border-t lg:hidden"
      style={{
        background: `${CARD_BG}F8`,
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        borderColor: BORDER,
        boxShadow: '0 -4px 24px rgba(0,0,0,0.06)',
      }}
    >
      <div className="flex items-center justify-around px-2 pt-3 pb-6">
        {tabs.map(({ path, icon: Icon, label }) => {
          const active = isActive(path);
          const showBadge = path === '/cart' && cartCount > 0;
          const showWishlistBadge = path === '/wishlist' && wishlist.length > 0;

          return (
            <motion.button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-col items-center gap-1 min-w-[52px] relative"
              style={{ outline: 'none', background: 'none', border: 'none', cursor: 'pointer' }}
              whileTap={{ scale: 0.88 }}
            >
              <div className="relative">
                {active && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute -inset-1.5 rounded-xl"
                    style={{ background: 'linear-gradient(135deg, rgba(201,162,39,0.12), rgba(232,200,74,0.08))' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                {path === '/profile' && isLoggedIn ? (
                  <div
                    className="flex items-center justify-center rounded-full overflow-hidden"
                    style={{
                      width: 22, height: 22,
                      background: 'linear-gradient(135deg,#2A2010,#1C1508)',
                      border: `1.5px solid ${active ? GOLD : 'rgba(201,162,39,0.4)'}`,
                      boxShadow: active ? `0 0 0 2px rgba(201,162,39,0.2)` : 'none',
                      position: 'relative',
                    }}
                  >
                    {currentUser?.image
                      ? <img src={currentUser.image} alt="avatar" className="w-full h-full object-cover" />
                      : <span style={{ color: GOLD, fontWeight: 800, fontSize: '9px', lineHeight: 1, fontFamily: 'Manrope, sans-serif', userSelect: 'none' }}>
                          {(currentUser?.name || '?').charAt(0).toUpperCase()}
                        </span>
                    }
                  </div>
                ) : (
                  <Icon
                    size={22}
                    strokeWidth={active ? 2.5 : 1.8}
                    style={{ color: active ? GOLD : MUTED, position: 'relative' }}
                  />
                )}
                <AnimatePresence>
                  {(showBadge || showWishlistBadge) && (
                    <motion.span
                      key="badge"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 flex items-center justify-center rounded-full text-[9px] px-1"
                      style={{
                        background: GOLD,
                        color: '#fff',
                        fontFamily: 'Manrope, sans-serif',
                        fontWeight: 700,
                      }}
                    >
                      {showBadge ? cartCount : wishlist.length}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <span
                style={{
                  fontFamily: 'Manrope, sans-serif',
                  fontWeight: active ? 700 : 500,
                  fontSize: '9px',
                  letterSpacing: '0.8px',
                  textTransform: 'uppercase',
                  color: active ? GOLD : MUTED,
                }}
              >
                {label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}