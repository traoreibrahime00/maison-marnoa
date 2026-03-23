import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Lock, Eye, EyeOff, Mail } from 'lucide-react';
import { MaisonMarnoaLogo } from '../../components/MaisonMarnoaLogo';
import { apiUrl } from '../../lib/api';

export default function AdminLogin() {
  const navigate  = useNavigate();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { setError('Email et mot de passe requis.'); return; }
    setLoading(true);
    setError('');

    try {
      // 1. Connexion via Better Auth
      const res = await fetch(apiUrl('/api/auth/sign-in/email'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (!res.ok) {
        setError('Email ou mot de passe incorrect.');
        return;
      }

      // 2. Vérifier que l'utilisateur a le rôle admin
      const sessionRes = await fetch(apiUrl('/api/auth/get-session'), {
        credentials: 'include',
      });
      const session = await sessionRes.json() as { user?: { role?: string } };

      if (session?.user?.role !== 'admin') {
        setError('Accès refusé. Vous n\'avez pas les droits administrateur.');
        // Déconnecter la session non-admin
        await fetch(apiUrl('/api/auth/sign-out'), { method: 'POST', credentials: 'include' });
        return;
      }

      navigate('/admin/dashboard');
    } catch {
      setError('Serveur inaccessible. Vérifiez que le backend est démarré.');
    } finally {
      setLoading(false);
    }
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
              width: 2, height: 2,
              background: '#C9A227', opacity: 0.2,
              top: `${(i * 17 + 5) % 100}%`, left: `${(i * 23 + 8) % 100}%`,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        <div className="rounded-3xl p-8" style={{ background: '#1E1A12', border: '1px solid #3A2E1E', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}>
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

          <div className="flex flex-col gap-4 mb-4">
            {/* Email */}
            <div>
              <label style={{ color: '#9A8A74', fontSize: '11px', fontWeight: 600, letterSpacing: '1px', display: 'block', marginBottom: '8px', fontFamily: 'Manrope, sans-serif', textTransform: 'uppercase' }}>
                Email
              </label>
              <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl"
                style={{ background: '#2A2218', border: `1.5px solid ${error ? '#ef4444' : '#3A2E1E'}` }}>
                <Mail size={14} color="#9A8A74" />
                <input
                  type="email"
                  placeholder="admin@maisonmarnoa.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  className="flex-1 bg-transparent outline-none"
                  style={{ color: '#F5EFE0', fontFamily: 'Manrope, sans-serif', fontSize: '14px' }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
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
            </div>
          </div>

          {error && (
            <p style={{ color: '#ef4444', fontSize: '12px', marginBottom: '12px', fontFamily: 'Manrope, sans-serif' }}>
              {error}
            </p>
          )}

          <motion.button
            onClick={handleLogin}
            disabled={loading || !email || !password}
            whileTap={{ scale: 0.97 }}
            className="w-full py-4 rounded-2xl flex items-center justify-center gap-2"
            style={{
              background: email && password ? 'linear-gradient(135deg,#C9A227,#E8C84A)' : '#3A2E1E',
              color: email && password ? '#fff' : '#9A8A74',
              fontWeight: 700, fontSize: '14px', fontFamily: 'Manrope, sans-serif',
              boxShadow: email && password ? '0 4px 16px rgba(201,162,39,0.3)' : 'none',
              cursor: email && password ? 'pointer' : 'not-allowed', border: 'none',
              transition: 'all 0.2s',
            }}
          >
            {loading
              ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : 'Accéder au back-office'}
          </motion.button>
        </div>

        <p className="text-center mt-6" style={{ color: '#5A4E3E', fontSize: '11px', fontFamily: 'Manrope, sans-serif' }}>
          © Maison Marnoa · Espace privé
        </p>
      </motion.div>
    </div>
  );
}
