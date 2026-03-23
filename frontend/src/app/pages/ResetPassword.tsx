import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Eye, EyeOff, Lock, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MaisonMarnoaLogo } from '../components/MaisonMarnoaLogo';
import { IMAGES } from '../data/products';
import { toast } from 'sonner';
import { apiUrl } from '../lib/api';

const GOLD    = '#C9A227';
const CARD_BG = '#FFFFFF';
const BORDER  = '#EDE5D0';
const TEXT    = '#1C1510';
const MUTED   = '#8A7564';
const BG      = '#FDFAF4';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [showPwd, setShowPwd]       = useState(false);
  const [showPwd2, setShowPwd2]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [done, setDone]             = useState(false);
  const [password, setPassword]     = useState('');
  const [password2, setPassword2]   = useState('');
  const [error, setError]           = useState('');

  // If no token in URL → redirect to login
  useEffect(() => {
    if (!token) navigate('/login', { replace: true });
  }, [token, navigate]);

  const handleSubmit = async () => {
    setError('');
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (password !== password2) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/auth/reset-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as Record<string, string>;
        const msg = data.message || data.error || '';
        if (msg.toLowerCase().includes('expired') || msg.toLowerCase().includes('invalid')) {
          setError('Ce lien a expiré ou est invalide. Faites une nouvelle demande.');
        } else {
          setError(msg || 'Une erreur est survenue.');
        }
        return;
      }
      setDone(true);
      toast('Mot de passe mis à jour !', { duration: 3000 });
    } catch {
      toast.error('Serveur inaccessible', { description: 'Vérifiez votre connexion.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: 'Manrope, sans-serif' }}>
      {/* Hero */}
      <div className="relative" style={{ height: 'clamp(160px,22vw,260px)' }}>
        <img src={IMAGES.hero} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.72) 100%)' }} />
        <div className="absolute bottom-6 left-0 right-0 px-5 flex flex-col items-start gap-2">
          <MaisonMarnoaLogo variant="light" size="md" />
          <h1 style={{ color: '#fff', fontWeight: 800, fontSize: '22px', lineHeight: 1.2 }}>
            Nouveau mot de passe
          </h1>
        </div>
      </div>

      <div className="px-5 pt-8 pb-10 lg:max-w-[480px] lg:mx-auto">

        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-5 py-8 px-4 rounded-2xl text-center"
              style={{ background: 'rgba(34,197,94,0.05)', border: '1.5px solid rgba(34,197,94,0.2)' }}
            >
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 220, damping: 18, delay: 0.1 }}
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)', boxShadow: '0 8px 24px rgba(34,197,94,0.3)' }}
              >
                <Check size={28} color="#fff" />
              </motion.div>
              <div>
                <p style={{ color: TEXT, fontWeight: 800, fontSize: '18px', marginBottom: 8 }}>Mot de passe mis à jour !</p>
                <p style={{ color: MUTED, fontSize: '13px', lineHeight: 1.7 }}>
                  Votre mot de passe a été modifié avec succès. Vous pouvez maintenant vous connecter.
                </p>
              </div>
              <motion.button
                onClick={() => navigate('/login')}
                whileTap={{ scale: 0.97 }}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl"
                style={{ background: `linear-gradient(135deg,${GOLD},#E8C84A)`, color: '#fff', fontWeight: 800, fontSize: '15px', boxShadow: '0 4px 16px rgba(201,162,39,0.3)' }}
              >
                Se connecter
              </motion.button>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <p style={{ color: MUTED, fontSize: '13px', lineHeight: 1.7, marginBottom: 24 }}>
                Choisissez un nouveau mot de passe sécurisé (au moins 6 caractères).
              </p>

              {/* Error banner */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-start gap-3 px-4 py-3.5 rounded-2xl mb-5"
                    style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)' }}
                  >
                    <AlertCircle size={15} color="#ef4444" className="flex-shrink-0 mt-0.5" />
                    <p style={{ color: '#ef4444', fontSize: '12px', fontWeight: 600 }}>{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex flex-col gap-4 mb-8">
                {/* New password */}
                <div>
                  <label style={{ color: MUTED, fontSize: '11px', fontWeight: 600, letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>Nouveau mot de passe</label>
                  <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
                    <Lock size={16} color={MUTED} />
                    <input
                      type={showPwd ? 'text' : 'password'} placeholder="••••••••"
                      value={password} onChange={e => setPassword(e.target.value)}
                      className="flex-1 bg-transparent outline-none"
                      style={{ color: TEXT, fontFamily: 'Manrope, sans-serif', fontSize: '14px' }}
                      autoFocus
                    />
                    <button onClick={() => setShowPwd(!showPwd)}>
                      {showPwd ? <EyeOff size={16} color={MUTED} /> : <Eye size={16} color={MUTED} />}
                    </button>
                  </div>
                </div>

                {/* Confirm password */}
                <div>
                  <label style={{ color: MUTED, fontSize: '11px', fontWeight: 600, letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>Confirmer le mot de passe</label>
                  <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
                    <Lock size={16} color={MUTED} />
                    <input
                      type={showPwd2 ? 'text' : 'password'} placeholder="••••••••"
                      value={password2} onChange={e => setPassword2(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                      className="flex-1 bg-transparent outline-none"
                      style={{ color: TEXT, fontFamily: 'Manrope, sans-serif', fontSize: '14px' }}
                    />
                    <button onClick={() => setShowPwd2(!showPwd2)}>
                      {showPwd2 ? <EyeOff size={16} color={MUTED} /> : <Eye size={16} color={MUTED} />}
                    </button>
                  </div>
                </div>
              </div>

              <motion.button
                onClick={handleSubmit}
                disabled={loading}
                whileTap={{ scale: 0.97 }}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl mb-5"
                style={{
                  background: loading ? 'rgba(201,162,39,0.5)' : 'linear-gradient(135deg, #C9A227 0%, #E8C84A 50%, #C9A227 100%)',
                  color: '#fff', fontWeight: 800, fontSize: '15px',
                  boxShadow: loading ? 'none' : '0 4px 20px rgba(201,162,39,0.35)',
                }}
              >
                {loading
                  ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Enregistrement…</>
                  : 'Mettre à jour le mot de passe'
                }
              </motion.button>

              <p style={{ color: '#B0A090', fontSize: '10px', textAlign: 'center' }}>
                © 2026 Maison Marnoa · Abidjan, Côte d'Ivoire
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
