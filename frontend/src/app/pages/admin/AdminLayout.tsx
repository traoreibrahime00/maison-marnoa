import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router';
import { motion } from 'motion/react';
import { LayoutGrid, LogOut, Plus, Home, Package, ShoppingCart, BarChart3, Settings, CalendarDays, Truck, Tag, Sun, Moon } from 'lucide-react';
import { MaisonMarnoaLogo } from '../../components/MaisonMarnoaLogo';
import { apiUrl } from '../../lib/api';
import { useApp, useColors } from '../../context/AppContext';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [checking, setChecking] = useState(true);
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
    { path: '/admin/dashboard', icon: BarChart3,  label: 'Dashboard' },
    { path: '/admin/orders',       icon: ShoppingCart,  label: 'Commandes' },
    { path: '/admin/products',     icon: Package,       label: 'Produits' },
    { path: '/admin/appointments', icon: CalendarDays,  label: 'Showroom' },
    { path: '/admin/shipping',     icon: Truck,         label: 'Livraison' },
    { path: '/admin/promos',       icon: Tag,           label: 'Promos' },
    { path: '/admin/settings',     icon: Settings,      label: 'Paramètres' },
  ];

  const pageTitle =
    location.pathname.startsWith('/admin/dashboard') ? 'Dashboard'
    : location.pathname.startsWith('/admin/orders')       ? 'Gestion des commandes'
    : location.pathname.startsWith('/admin/appointments') ? 'Showroom & Rendez-vous'
    : location.pathname.startsWith('/admin/shipping')     ? 'Gestion de la livraison'
    : location.pathname.startsWith('/admin/promos')       ? 'Codes promo'
    : location.pathname.startsWith('/admin/settings')     ? 'Paramètres'
    : 'Gestion des produits';

  const showNewProductAction = location.pathname.startsWith('/admin/products');

  return (
    <div className="min-h-screen flex" style={{ background: BG, fontFamily: 'Manrope, sans-serif' }}>
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col" style={{ background: CARD_BG, borderRight: `1px solid ${BORDER}` }}>
        {/* Logo */}
        <div className="px-6 py-6 border-b" style={{ borderColor: BORDER }}>
          <MaisonMarnoaLogo variant={darkMode ? 'light' : 'dark'} size="sm" />
          <p style={{ color: GOLD, fontSize: '9px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginTop: '6px' }}>
            Back-office
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 flex flex-col gap-1">
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
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Top header */}
        <div className="sticky top-0 z-10 px-8 py-4 flex items-center justify-between"
          style={{ background: `${CARD_BG}F0`, backdropFilter: 'blur(16px)', borderBottom: `1px solid ${BORDER}` }}>
          <div className="flex items-center gap-2">
            <LayoutGrid size={16} color={GOLD} />
            <span style={{ color: TEXT, fontWeight: 700, fontSize: '15px' }}>{pageTitle}</span>
          </div>
          {showNewProductAction && (
            <Link to="/admin/products/new">
              <motion.div whileTap={{ scale: 0.96 }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer"
                style={{ background: 'linear-gradient(135deg,#C9A227,#E8C84A)', color: '#fff', fontWeight: 700, fontSize: '13px', boxShadow: '0 4px 12px rgba(201,162,39,0.3)' }}>
                <Plus size={14} />
                Nouveau produit
              </motion.div>
            </Link>
          )}
        </div>

        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
