import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import logoImg from '../../assets/95142fd9e55c098717be21006672d1b38112448f.png';

interface SplashScreenProps {
  visible: boolean;
  onDone: () => void;
}

/**
 * Splash screen — total visible duration ≈ 1.3 s + 0.5 s fade = 1.8 s UX max.
 * All animation delays/durations are compressed ×2.5 vs the original.
 */
export function SplashScreen({ visible, onDone }: SplashScreenProps) {
  useEffect(() => {
    if (visible) {
      const t = setTimeout(onDone, 1300);
      return () => clearTimeout(t);
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            background: '#0E0B08',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Ambient radial glow */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(ellipse 55% 38% at 50% 44%, rgba(201,162,39,0.14) 0%, transparent 100%)',
              pointerEvents: 'none',
            }}
          />

          {/* ── Content ── */}
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 24,
            }}
          >
            {/* Diamond SVG — compressed timing */}
            <svg
              width="88"
              height="96"
              viewBox="0 0 100 110"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ overflow: 'visible' }}
            >
              {/* Glow pulse */}
              <motion.ellipse
                cx="50" cy="60" rx="50" ry="54"
                fill="none"
                stroke="rgba(201,162,39,0.22)"
                strokeWidth="0.8"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: [0.7, 1.35, 1.35], opacity: [0, 0.7, 0] }}
                transition={{ delay: 0.6, duration: 0.5, ease: 'easeOut' }}
                style={{ transformOrigin: '50px 60px' }}
              />

              {/* Fill */}
              <motion.path
                d="M 28,22 L 72,22 L 96,50 L 50,100 L 4,50 Z"
                fill="rgba(201,162,39,0.055)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.44, duration: 0.3 }}
              />

              {/* Outer diamond */}
              <motion.path
                d="M 28,22 L 72,22 L 96,50 L 50,100 L 4,50 Z"
                stroke="#C9A227"
                strokeWidth="1.1"
                strokeLinejoin="round"
                fill="none"
                initial={{ pathLength: 0, opacity: 1 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ delay: 0.08, duration: 0.44, ease: [0.76, 0, 0.24, 1] }}
              />

              {/* Girdle */}
              <motion.path
                d="M 4,50 L 96,50"
                stroke="#C9A227" strokeWidth="0.65" opacity="0.55" fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.55 }}
                transition={{ delay: 0.44, duration: 0.18, ease: [0.76, 0, 0.24, 1] }}
              />

              {/* Left crown */}
              <motion.path
                d="M 28,22 L 50,50"
                stroke="#C9A227" strokeWidth="0.65" opacity="0.45" fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.45 }}
                transition={{ delay: 0.49, duration: 0.15, ease: [0.76, 0, 0.24, 1] }}
              />

              {/* Right crown */}
              <motion.path
                d="M 72,22 L 50,50"
                stroke="#C9A227" strokeWidth="0.65" opacity="0.45" fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.45 }}
                transition={{ delay: 0.52, duration: 0.15, ease: [0.76, 0, 0.24, 1] }}
              />

              {/* Pavilion center */}
              <motion.path
                d="M 50,50 L 50,100"
                stroke="#C9A227" strokeWidth="0.65" opacity="0.4" fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.4 }}
                transition={{ delay: 0.55, duration: 0.15, ease: [0.76, 0, 0.24, 1] }}
              />

              {/* Culet */}
              <motion.circle
                cx="50" cy="100" r="2" fill="#E8C84A"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 0.62, duration: 0.15 }}
              />

              {/* Corner dots */}
              {[{ cx: 28, cy: 22 }, { cx: 72, cy: 22 }, { cx: 4, cy: 50 }, { cx: 96, cy: 50 }].map(
                (p, i) => (
                  <motion.circle
                    key={i} cx={p.cx} cy={p.cy} r="1.4" fill="#C9A227"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.8 }}
                    transition={{ delay: 0.62 + i * 0.025, duration: 0.12 }}
                  />
                )
              )}
            </svg>

            {/* Logo */}
            <div style={{ overflow: 'hidden', paddingBottom: 2 }}>
              <motion.img
                src={logoImg}
                alt="Maison Marnoa"
                draggable={false}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.74, duration: 0.38, ease: [0.76, 0, 0.24, 1] }}
                style={{
                  height: 48,
                  width: 'auto',
                  filter: 'brightness(0) invert(1)',
                  userSelect: 'none',
                  display: 'block',
                }}
              />
            </div>

            {/* Gold divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: -8 }}>
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ delay: 0.88, duration: 0.22, ease: [0.76, 0, 0.24, 1] }}
                style={{ width: 44, height: 1, background: 'linear-gradient(90deg, transparent, #C9A227)', transformOrigin: 'right center' }}
              />
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.98, duration: 0.14, type: 'spring', stiffness: 380, damping: 18 }}
                style={{ width: 5, height: 5, background: '#C9A227', rotate: 45, flexShrink: 0 }}
              />
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ delay: 0.88, duration: 0.22, ease: [0.76, 0, 0.24, 1] }}
                style={{ width: 44, height: 1, background: 'linear-gradient(90deg, #C9A227, transparent)', transformOrigin: 'left center' }}
              />
            </div>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.28, ease: 'easeOut' }}
              style={{
                fontFamily: 'Manrope, sans-serif',
                fontWeight: 300,
                fontSize: 10,
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: 'rgba(245,235,200,0.38)',
                margin: 0,
                marginTop: -8,
              }}
            >
              L'excellence joaillière, à Abidjan
            </motion.p>
          </div>

          {/* Progress line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.06, duration: 1.2, ease: 'linear' }}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 1.5,
              background:
                'linear-gradient(90deg, transparent 0%, #C9A227 25%, #FFE17A 55%, #C9A227 80%, transparent 100%)',
              transformOrigin: 'left center',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}