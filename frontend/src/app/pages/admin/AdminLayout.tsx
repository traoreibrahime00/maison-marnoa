import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router';
import { motion } from 'motion/react';
import { LayoutGrid, LogOut, Plus, Home, Package, ShoppingCart, CreditCard, BarChart3, Settings } from 'lucide-react';
import { MaisonMarnoaLogo } from '../../components/MaisonMarnoaLogo';

const ADMIN_KEY = 'mn_admin_session';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (localStorage.getItem(ADMIN_KEY) !== 'true') {
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem(ADMIN_KEY);
    navigate('/admin');
  };

  const nav = [
    { path: '/admin/dashboard', icon: BarChart3,  label: 'Dashboard' },
    { path: '/admin/orders',    icon: ShoppingCart, label: 'Commandes' },
    { path: '/admin/payments',  icon: CreditCard,   label: 'Paiements' },
    { path: '/admin/products',  icon: Package,      label: 'Produits' },
    { path: '/admin/settings',  icon: Settings,     label: 'Paramètres' },
  ];

  const pageTitle =
    location.pathname.startsWith('/admin/dashboard') ? 'Dashboard'
    : location.pathname.startsWith('/admin/orders')   ? 'Gestion des commandes'
    : location.pathname.startsWith('/admin/payments') ? 'Gestion des paiements'
    : location.pathname.startsWith('/admin/settings') ? 'Paramètres'
    : 'Gestion des produits';

  const showNewProductAction = location.pathname.startsWith('/admin/products');

  return (
    <div className="min-h-screen flex" style={{ background: '#120F0A', fontFamily: 'Manrope, sans-serif' }}>
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col" style={{ background: '#1A1410', borderRight: '1px solid #3A2E1E' }}>
        {/* Logo */}
        <div className="px-6 py-6 border-b" style={{ borderColor: '#3A2E1E' }}>
          <MaisonMarnoaLogo variant="light" size="sm" />
          <p style={{ color: '#C9A227', fontSize: '9px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginTop: '6px' }}>
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
                    color: active ? '#C9A227' : '#9A8A74',
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
        <div className="px-4 py-6 border-t flex flex-col gap-2" style={{ borderColor: '#3A2E1E' }}>
          <Link to="/" target="_blank">
            <motion.div whileHover={{ x: 4 }} className="flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer"
              style={{ color: '#9A8A74' }}>
              <Home size={14} />
              <span style={{ fontSize: '12px' }}>Voir le site</span>
            </motion.div>
          </Link>
          <motion.button onClick={logout} whileHover={{ x: 4 }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl w-full text-left"
            style={{ color: '#9A8A74', background: 'none', border: 'none', cursor: 'pointer' }}>
            <LogOut size={14} />
            <span style={{ fontSize: '12px' }}>Déconnexion</span>
          </motion.button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Top header */}
        <div className="sticky top-0 z-10 px-8 py-4 flex items-center justify-between"
          style={{ background: 'rgba(18,15,10,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #3A2E1E' }}>
          <div className="flex items-center gap-2">
            <LayoutGrid size={16} color="#C9A227" />
            <span style={{ color: '#F5EFE0', fontWeight: 700, fontSize: '15px' }}>{pageTitle}</span>
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
