import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { MaisonMarnoaLogo } from '../../components/MaisonMarnoaLogo';

const ADMIN_PASSWORD = 'marnoa2025';
const ADMIN_KEY = 'mn_admin_session';

export function useAdminAuth() {
  return localStorage.getItem(ADMIN_KEY) === 'true';
}

export default function AdminLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem(ADMIN_KEY, 'true');
      navigate('/admin/products');
    } else {
      setError('Mot de passe incorrect.');
      setPassword('');
    }
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'linear-gradient(135deg, #120F0A 0%, #1E1710 50%, #120F0A 100%)' }}
    >
      {/* Background sparkles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="absolute rounded-full"
            style={{
              width: Math.random() * 3 + 1, height: Math.random() * 3 + 1,
              background: '#C9A227', opacity: Math.random() * 0.4 + 0.1,
              top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        {/* Card */}
        <div className="rounded-3xl p-8" style={{ background: '#1E1A12', border: '1px solid #3A2E1E', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}>
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <MaisonMarnoaLogo variant="light" size="sm" />
          </div>

          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'linear-gradient(135deg,#C9A227,#E8C84A)', boxShadow: '0 8px 24px rgba(201,162,39,0.35)' }}>
              <Lock size={22} color="#fff" />
            </div>
            <h1 style={{ color: '#F5EFE0', fontWeight: 800, fontSize: '22px', fontFamily: 'Manrope, sans-serif', marginBottom: '4px' }}>
              Administration
            </h1>
            <p style={{ color: '#9A8A74', fontSize: '13px', fontFamily: 'Manrope, sans-serif' }}>
              Accès réservé à l'équipe Marnoa
            </p>
          </div>

          {/* Password field */}
          <div className="mb-4">
            <label style={{ color: '#9A8A74', fontSize: '11px', fontWeight: 600, letterSpacing: '1px', display: 'block', marginBottom: '8px', fontFamily: 'Manrope, sans-serif', textTransform: 'uppercase' }}>
              Mot de passe
            </label>
            <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl"
              style={{ background: '#2A2218', border: `1.5px solid ${error ? '#ef4444' : '#3A2E1E'}` }}>
              <Lock size={14} color="#9A8A74" />
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••••"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className="flex-1 bg-transparent outline-none"
                style={{ color: '#F5EFE0', fontFamily: 'Manrope, sans-serif', fontSize: '14px' }}
              />
              <button onClick={() => setShowPw(v => !v)} style={{ color: '#9A8A74', background: 'none', border: 'none', cursor: 'pointer' }}>
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {error && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', fontFamily: 'Manrope, sans-serif' }}>{error}</p>}
          </div>

          <motion.button
            onClick={handleLogin}
            disabled={loading || !password}
            whileTap={{ scale: 0.97 }}
            className="w-full py-4 rounded-2xl flex items-center justify-center gap-2"
            style={{
              background: password ? 'linear-gradient(135deg,#C9A227,#E8C84A)' : '#3A2E1E',
              color: password ? '#fff' : '#9A8A74',
              fontWeight: 700, fontSize: '14px', fontFamily: 'Manrope, sans-serif',
              boxShadow: password ? '0 4px 16px rgba(201,162,39,0.3)' : 'none',
              cursor: password ? 'pointer' : 'not-allowed', border: 'none',
              transition: 'all 0.2s',
            }}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : 'Accéder au back-office'}
          </motion.button>
        </div>

        <p className="text-center mt-6" style={{ color: '#5A4E3E', fontSize: '11px', fontFamily: 'Manrope, sans-serif' }}>
          © Maison Marnoa · Espace privé
        </p>
      </motion.div>
    </div>
  );
}
