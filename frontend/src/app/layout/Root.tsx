import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import { Toaster } from 'sonner';
import { BottomNav } from '../components/BottomNav';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { SplashScreen } from '../components/SplashScreen';
import { DesktopHeader } from '../components/DesktopHeader';
import { ReassuranceBanner } from '../components/ReassuranceBanner';
import { useApp } from '../context/AppContext';
import { usePageTracking } from '../lib/analytics';
import { motion, AnimatePresence } from 'motion/react';

const HIDE_NAV_PATHS = ['/checkout', '/order-confirmation', '/login'];
const HIDE_WA_PATHS  = ['/checkout', '/login', '/cart'];

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  enter:   { opacity: 1, y: 0, transition: { duration: 0.32, ease: 'easeOut' as const } },
  exit:    { opacity: 0, y: -6, transition: { duration: 0.2,  ease: 'easeIn'  as const } },
};

export default function Root() {
  const location = useLocation();
  const { darkMode } = useApp();
  const [showSplash, setShowSplash] = useState(() => !sessionStorage.getItem('mn_splash_shown'));
  usePageTracking();

  // Scroll to top on every route change
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [location.pathname]);

  const hideNav = HIDE_NAV_PATHS.some(p => location.pathname.startsWith(p));
  const hideWA  = HIDE_WA_PATHS.some(p => location.pathname.startsWith(p));

  return (
    <div
      className="min-h-screen"
      style={{
        background: darkMode ? '#120F0A' : '#F0E8D0',
        fontFamily: 'Manrope, sans-serif',
        transition: 'background 0.3s ease',
      }}
    >
      <SplashScreen visible={showSplash} onDone={() => {
        setShowSplash(false);
        sessionStorage.setItem('mn_splash_shown', '1');
      }} />

      {!hideNav && <DesktopHeader />}
      {!hideNav && <ReassuranceBanner />}

      <div
        className="w-full max-w-[430px] lg:max-w-none mx-auto flex flex-col min-h-screen overflow-x-hidden"
        style={{
          background: darkMode ? '#1A1410' : '#FDFAF4',
          transition: 'background 0.3s ease',
        }}
      >
        <Toaster
          position="top-center"
          offset={12}
          gap={8}
          richColors
          closeButton
          toastOptions={{
            duration: 2500,
            style: {
              fontFamily: 'Manrope, sans-serif',
              background: darkMode ? '#231E15' : '#FFFFFF',
              color: darkMode ? '#F5EFE0' : '#1C1510',
              border: `1px solid ${darkMode ? '#3A2F1E' : '#EDE5D0'}`,
              borderRadius: '14px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.13)',
              fontSize: '13px',
              fontWeight: 600,
              padding: '12px 16px',
              maxWidth: '340px',
            },
          }}
        />

        <div className="flex-1">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="enter"
              exit="exit"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>

        {!hideNav && <BottomNav />}
        {!hideWA && <WhatsAppButton />}
      </div>
    </div>
  );
}