import { useNavigate, useLocation } from 'react-router';
import { Search, ShoppingBag, Heart, User, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'motion/react';
import { useState } from 'react';
import { useApp, useColors } from '../context/AppContext';
import { MaisonMarnoaLogo } from './MaisonMarnoaLogo';

const NAV_LEFT  = [
  { path: '/', label: 'Accueil' },
  { path: '/collection', label: 'Collection' },
];

const NAV_RIGHT = [
  { path: '/appointment', label: 'Showroom' },
];

export function DesktopHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount, wishlist, darkMode, toggleDarkMode, isLoggedIn, currentUser } = useApp();
  const { BG, CARD_BG, BORDER, MUTED, GOLD } = useColors();
  const [scrolled, setScrolled] = useState(false);
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (v) => {
    setScrolled(v > 30);
  });

  const isActive = (p: string) =>
    p === '/' ? location.pathname === '/' : location.pathname.startsWith(p);

  const NavLink = ({ path, label }: { path: string; label: string }) => {
    const active = isActive(path);
    return (
      <button
        onClick={() => navigate(path)}
        className="relative py-1"
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: active ? GOLD : MUTED,
          fontWeight: active ? 700 : 500,
          fontSize: scrolled ? '12px' : '13px',
          letterSpacing: '0.5px',
          fontFamily: 'Manrope, sans-serif',
          whiteSpace: 'nowrap',
          transition: 'font-size 0.3s ease, color 0.2s',
        }}
      >
        {label}
        {active && (
          <motion.div
            layoutId="desktop-underline"
            className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
            style={{ background: `linear-gradient(90deg, ${GOLD}, #E8C84A)` }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          />
        )}
      </button>
    );
  };

  const iconItems = [
    { icon: Search,      path: '/search',   badge: 0,              label: 'Recherche' },
    { icon: Heart,       path: '/wishlist',  badge: wishlist.length, label: 'Favoris' },
    { icon: ShoppingBag, path: '/cart',      badge: cartCount,      label: 'Panier' },
  ];

  return (
    <motion.header
      className="hidden lg:grid sticky top-0 z-50 w-full px-10 xl:px-16"
      animate={{
        height: scrolled ? 52 : 64,
        backgroundColor: scrolled
          ? (darkMode ? 'rgba(18,15,10,0.97)' : 'rgba(240,232,208,0.97)')
          : (darkMode ? 'rgba(18,15,10,0.92)' : 'rgba(240,232,208,0.92)'),
        boxShadow: scrolled
          ? '0 2px 20px rgba(0,0,0,0.12)'
          : '0 0 0 rgba(0,0,0,0)',
      }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        gridTemplateColumns: '1fr auto 1fr',
        backdropFilter: 'blur(24px)',
        borderBottom: `1px solid ${BORDER}`,
        fontFamily: 'Manrope, sans-serif',
        alignItems: 'center',
      }}
    >
      {/* Left nav */}
      <nav className="flex items-center gap-8">
        {NAV_LEFT.map(({ path, label }) => (
          <NavLink key={path} path={path} label={label} />
        ))}
      </nav>

      {/* Centre — Logo */}
      <motion.button
        onClick={() => navigate('/')}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 24px' }}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.03 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        <MaisonMarnoaLogo variant="dark" size={scrolled ? 'sm' : 'sm'} />
      </motion.button>

      {/* Right: nav + icons */}
      <div className="flex items-center justify-end gap-6">
        {NAV_RIGHT.map(({ path, label }) => (
          <NavLink key={path} path={path} label={label} />
        ))}

        <div className="flex items-center gap-2">
          {iconItems.map(({ icon: Icon, path, badge, label }) => (
            <div
              key={path}
              className="relative"
              onMouseEnter={() => setHoveredIcon(path)}
              onMouseLeave={() => setHoveredIcon(null)}
            >
              <motion.button
                onClick={() => navigate(path)}
                whileTap={{ scale: 0.88 }}
                whileHover={{ scale: 1.08 }}
                transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                className="relative flex items-center justify-center rounded-full"
                style={{
                  width: scrolled ? '34px' : '36px',
                  height: scrolled ? '34px' : '36px',
                  background: isActive(path) ? 'rgba(201,162,39,0.12)' : CARD_BG,
                  border: `1px solid ${isActive(path) ? 'rgba(201,162,39,0.35)' : BORDER}`,
                  cursor: 'pointer',
                  boxShadow: isActive(path) ? '0 0 12px rgba(201,162,39,0.18)' : '0 1px 4px rgba(0,0,0,0.06)',
                  transition: 'width 0.3s, height 0.3s',
                }}
              >
                <Icon size={15} color={isActive(path) ? GOLD : MUTED} />
                <AnimatePresence>
                  {badge > 0 && (
                    <motion.span
                      key="b"
                      initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full flex items-center justify-center text-[8px] px-0.5"
                      style={{ background: GOLD, color: '#fff', fontWeight: 700 }}
                    >
                      {badge}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Tooltip */}
              <AnimatePresence>
                {hoveredIcon === path && (
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.9 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1 rounded-lg whitespace-nowrap pointer-events-none z-50"
                    style={{
                      background: darkMode ? '#231E15' : '#1C1510',
                      color: '#F5EFE0',
                      fontSize: '11px',
                      fontWeight: 600,
                      fontFamily: 'Manrope, sans-serif',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    }}
                  >
                    {label}
                    <div
                      style={{
                        position: 'absolute',
                        top: -4,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 8,
                        height: 8,
                        background: darkMode ? '#231E15' : '#1C1510',
                        clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          {/* Profile / Account icon */}
          <div
            className="relative"
            onMouseEnter={() => setHoveredIcon('/profile')}
            onMouseLeave={() => setHoveredIcon(null)}
          >
            <motion.button
              onClick={() => navigate('/profile')}
              whileTap={{ scale: 0.88 }}
              whileHover={{ scale: 1.08 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18 }}
              className="relative flex items-center justify-center rounded-full overflow-hidden"
              style={{
                width: scrolled ? '34px' : '36px',
                height: scrolled ? '34px' : '36px',
                background: isLoggedIn
                  ? 'linear-gradient(135deg,#2A2010,#1C1508)'
                  : (isActive('/profile') ? 'rgba(201,162,39,0.12)' : CARD_BG),
                border: `1px solid ${isLoggedIn ? 'rgba(201,162,39,0.5)' : (isActive('/profile') ? 'rgba(201,162,39,0.35)' : BORDER)}`,
                cursor: 'pointer',
                boxShadow: isLoggedIn
                  ? '0 0 0 2px rgba(201,162,39,0.2)'
                  : (isActive('/profile') ? '0 0 12px rgba(201,162,39,0.18)' : '0 1px 4px rgba(0,0,0,0.06)'),
                transition: 'width 0.3s, height 0.3s',
              }}
            >
              {isLoggedIn ? (
                currentUser?.image
                  ? <img src={currentUser.image} alt="avatar" className="w-full h-full object-cover" />
                  : <span style={{ color: GOLD, fontWeight: 800, fontSize: '13px', lineHeight: 1, fontFamily: 'Manrope, sans-serif', userSelect: 'none' }}>
                      {(currentUser?.name || '?').charAt(0).toUpperCase()}
                    </span>
              ) : (
                <User size={15} color={isActive('/profile') ? GOLD : MUTED} />
              )}
            </motion.button>

            <AnimatePresence>
              {hoveredIcon === '/profile' && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.9 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1 rounded-lg whitespace-nowrap pointer-events-none z-50"
                  style={{
                    background: darkMode ? '#231E15' : '#1C1510',
                    color: '#F5EFE0',
                    fontSize: '11px',
                    fontWeight: 600,
                    fontFamily: 'Manrope, sans-serif',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  }}
                >
                  {isLoggedIn ? (currentUser?.name?.split(' ')[0] || 'Profil') : 'Profil'}
                  <div style={{ position: 'absolute', top: -4, left: '50%', transform: 'translateX(-50%)', width: 8, height: 8, background: darkMode ? '#231E15' : '#1C1510', clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            onClick={toggleDarkMode}
            whileTap={{ scale: 0.88 }}
            whileHover={{ scale: 1.08 }}
            transition={{ type: 'spring', stiffness: 400, damping: 18 }}
            className="flex items-center justify-center rounded-full ml-1"
            style={{
              width: scrolled ? '34px' : '36px',
              height: scrolled ? '34px' : '36px',
              background: CARD_BG,
              border: `1px solid ${BORDER}`,
              cursor: 'pointer',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              transition: 'width 0.3s, height 0.3s',
            }}
          >
            <AnimatePresence mode="wait">
              {darkMode
                ? <motion.div key="sun"  initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}><Sun  size={15} color={GOLD} /></motion.div>
                : <motion.div key="moon" initial={{ rotate: 90,  opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}><Moon size={15} color={MUTED} /></motion.div>
              }
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}
