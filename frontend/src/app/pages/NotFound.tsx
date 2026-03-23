import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowRight, Home, Search } from 'lucide-react';
import { useColors } from '../context/AppContext';

export default function NotFound() {
  const navigate = useNavigate();
  const { BG, CARD_BG, BORDER, TEXT, MUTED } = useColors();

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: BG, fontFamily: 'Manrope, sans-serif' }}
    >
      <div
        className="max-w-md w-full rounded-3xl p-8 text-center"
        style={{ background: CARD_BG, border: `1px solid ${BORDER}`, boxShadow: '0 12px 36px rgba(0,0,0,0.08)' }}
      >
        <div
          className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #FDF8E8, #FFF3C0)' }}
        >
          <Search size={22} color="#C9A227" />
        </div>

        <p style={{ color: '#C9A227', fontWeight: 700, fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '6px' }}>
          Erreur 404
        </p>
        <h1 style={{ color: TEXT, fontWeight: 800, fontSize: '26px', lineHeight: 1.2, marginBottom: '8px' }}>
          Page introuvable
        </h1>
        <p style={{ color: MUTED, fontSize: '13px', lineHeight: 1.7, marginBottom: '24px' }}>
          La page demandée n&apos;existe pas ou a été déplacée.
        </p>

        <div className="flex flex-col gap-3">
          <motion.button
            onClick={() => navigate('/')}
            whileTap={{ scale: 0.97 }}
            className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #C9A227, #E8C84A)', color: '#fff', fontWeight: 700, fontSize: '14px' }}
          >
            <Home size={16} />
            Retour à l&apos;accueil
          </motion.button>
          <motion.button
            onClick={() => navigate('/collection')}
            whileTap={{ scale: 0.97 }}
            className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2"
            style={{ background: 'transparent', border: `1px solid ${BORDER}`, color: TEXT, fontWeight: 600, fontSize: '14px' }}
          >
            Voir la collection
            <ArrowRight size={16} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
