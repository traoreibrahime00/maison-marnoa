import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutGrid, LogOut, Plus, Home, Package, ShoppingCart, BarChart3, Settings, CalendarDays, Truck, Tag, Sun, Moon, Menu, X, Users } from 'lucide-react';
import { MaisonMarnoaLogo } from '../../components/MaisonMarnoaLogo';
import { apiUrl } from '../../lib/api';
import { useApp, useColors } from '../../context/AppContext';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { darkMode, toggleDarkMode } = useApp();
  const { BG, CARD_BG, BORDER, TEXT, MUTED, GOLD } = useColors();

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const res = await fetch(apiUrl('/api/auth/get-session'), { credentials: 'include' });
        const data = await res.json() as { user?: { role?: string } };
        if (data?.user?.role !== 'admin') {
          navigate('/admin', { replace: true });
        }
      } catch {
        navigate('/admin', { replace: true });
      } finally {
        setChecking(false);
      }
    };
    verifyAdmin();
  }, [navigate]);

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false); }, [location.pathname]);

  const logout = async () => {
    await fetch(apiUrl('/api/auth/sign-out'), { method: 'POST', credentials: 'include' }).catch(() => {});
    navigate('/admin');
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: BG }}>
        <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: BORDER, borderTopColor: GOLD }} />
      </div>
    );
  }

  const nav = [
    { path: '/admin/dashboard',  icon: BarChart3,    label: 'Dashboard' },
    { path: '/admin/analytics',  icon: Users,        label: 'Audience' },
    { path: '/admin/orders',     icon: ShoppingCart, label: 'Commandes' },
    { path: '/admin/products',   icon: Package,      label: 'Produits' },
    { path: '/admin/appointments', icon: CalendarDays, label: 'Showroom' },
    { path: '/admin/shipping',   icon: Truck,        label: 'Livraison' },
    { path: '/admin/promos',     icon: Tag,          label: 'Promos' },
    { path: '/admin/settings',   icon: Settings,     label: 'Paramètres' },
  ];

  const pageTitle =
    location.pathname.startsWith('/admin/dashboard')      ? 'Dashboard'
    : location.pathname.startsWith('/admin/analytics')    ? 'Audience'
    : location.pathname.startsWith('/admin/orders')       ? 'Commandes'
    : location.pathname.startsWith('/admin/appointments') ? 'Showroom'
    : location.pathname.startsWith('/admin/shipping')     ? 'Livraison'
    : location.pathname.startsWith('/admin/promos')       ? 'Promos'
    : location.pathname.startsWith('/admin/settings')     ? 'Paramètres'
    : 'Produits';

  const showNewProductAction = location.pathname.startsWith('/admin/products');

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-6 py-6 border-b" style={{ borderColor: BORDER }}>
        <MaisonMarnoaLogo variant="auto" size="sm" />
        <p style={{ color: GOLD, fontSize: '9px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginTop: '6px' }}>
          Back-office
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 flex flex-col gap-1 overflow-y-auto">
        {nav.map(({ path, icon: Icon, label }) => {
          const active = location.pathname.startsWith(path);
          return (
            <Link key={path} to={path}>
              <motion.div
                whileHover={{ x: 4 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{
                  background: active ? 'rgba(201,162,39,0.12)' : 'transparent',
                  border: `1px solid ${active ? 'rgba(201,162,39,0.25)' : 'transparent'}`,
                  color: active ? GOLD : MUTED,
                  cursor: 'pointer',
                }}
              >
                <Icon size={16} />
                <span style={{ fontSize: '13px', fontWeight: active ? 700 : 500 }}>{label}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="px-4 py-6 border-t flex flex-col gap-2" style={{ borderColor: BORDER }}>
        <Link to="/" target="_blank">
          <motion.div whileHover={{ x: 4 }} className="flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer"
            style={{ color: MUTED }}>
            <Home size={14} />
            <span style={{ fontSize: '12px' }}>Voir le site</span>
          </motion.div>
        </Link>
        <motion.button onClick={toggleDarkMode} whileHover={{ x: 4 }}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl w-full text-left"
          style={{ color: MUTED, background: 'none', border: 'none', cursor: 'pointer' }}>
          {darkMode ? <Sun size={14} /> : <Moon size={14} />}
          <span style={{ fontSize: '12px' }}>{darkMode ? 'Mode clair' : 'Mode sombre'}</span>
        </motion.button>
        <motion.button onClick={logout} whileHover={{ x: 4 }}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl w-full text-left"
          style={{ color: MUTED, background: 'none', border: 'none', cursor: 'pointer' }}>
          <LogOut size={14} />
          <span style={{ fontSize: '12px' }}>Déconnexion</span>
        </motion.button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex" style={{ background: BG, fontFamily: 'Manrope, sans-serif' }}>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 flex-col"
        style={{ background: CARD_BG, borderRight: `1px solid ${BORDER}` }}>
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 lg:hidden"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
              onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-72 z-50 lg:hidden flex flex-col"
              style={{ background: CARD_BG, borderRight: `1px solid ${BORDER}` }}
            >
              {/* Close button */}
              <button
                onClick={() => setDrawerOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-xl"
                style={{ background: BG, border: `1px solid ${BORDER}`, color: MUTED, cursor: 'pointer' }}
              >
                <X size={14} />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 overflow-auto min-w-0">
        {/* Top header */}
        <div className="sticky top-0 z-10 px-4 lg:px-8 py-4 flex items-center justify-between gap-3"
          style={{ background: `${CARD_BG}F0`, backdropFilter: 'blur(16px)', borderBottom: `1px solid ${BORDER}` }}>

          {/* Mobile hamburger */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0"
            style={{ background: BG, border: `1px solid ${BORDER}`, color: MUTED, cursor: 'pointer' }}
          >
            <Menu size={16} />
          </button>

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <LayoutGrid size={16} color={GOLD} className="hidden lg:block flex-shrink-0" />
            <span style={{ color: TEXT, fontWeight: 700, fontSize: '15px' }} className="truncate">{pageTitle}</span>
          </div>

          {showNewProductAction && (
            <Link to="/admin/products/new">
              <motion.div whileTap={{ scale: 0.96 }}
                className="flex items-center gap-2 px-3 lg:px-4 py-2 rounded-xl cursor-pointer flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#C9A227,#E8C84A)', color: '#fff', fontWeight: 700, fontSize: '13px', boxShadow: '0 4px 12px rgba(201,162,39,0.3)' }}>
                <Plus size={14} />
                <span className="hidden sm:inline">Nouveau produit</span>
                <span className="sm:hidden">Nouveau</span>
              </motion.div>
            </Link>
          )}
        </div>

        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
