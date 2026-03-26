import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { ArrowLeft, Eye, EyeOff, Mail, Lock, User, Phone, Check, AlertCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp, useColors } from '../context/AppContext';
import { IMAGES } from '../data/products';
import { MaisonMarnoaLogo } from '../components/MaisonMarnoaLogo';
import { toast } from 'sonner';
import { apiUrl } from '../lib/api';

const GOLD = '#C9A227';

type AuthMode = 'login' | 'register' | 'forgot';

export default function Login() {
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isLoggedIn } = useApp();
  const { BG, CARD_BG, BORDER, TEXT, MUTED } = useColors();

  // Redirect already logged-in users
  useEffect(() => {
    if (isLoggedIn) navigate(searchParams.get('redirect') || '/', { replace: true });
  }, [isLoggedIn, navigate, searchParams]);

  const [mode, setMode]         = useState<AuthMode>(searchParams.get('mode') === 'register' ? 'register' : 'login');
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [agreed, setAgreed]     = useState(false);
  const [form, setForm]         = useState({ name: '', email: '', password: '', phone: '' });
  const [errors, setErrors]     = useState<Record<string, string>>({});
  const [resetSent, setResetSent] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (mode === 'register' && !form.name.trim())        e.name = 'Nom requis';
    if (!form.email.trim() || !form.email.includes('@')) e.email = 'Email invalide';
    if (!form.password || form.password.length < 6)      e.password = 'Mot de passe trop court (min. 6 caractères)';
    if (mode === 'register' && form.phone.replace(/\s/g, '').length < 9) e.phone = 'Numéro de téléphone requis';
    if (mode === 'register' && !agreed)                  e.agreed = 'Acceptez les conditions';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      const endpoint = mode === 'register' ? '/api/auth/sign-up/email' : '/api/auth/sign-in/email';
      const payload = mode === 'register'
        ? { name: form.name.trim(), email: form.email.trim(), password: form.password, phone: form.phone.trim() }
        : { email: form.email.trim(), password: form.password };

      const res = await fetch(apiUrl(endpoint), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({})) as Record<string, unknown>;

      if (!res.ok) {
        const msg = (data.message as string) || (data.error as string) || '';
        if (res.status === 422 || msg.toLowerCase().includes('exist')) {
          setErrors({ email: 'Un compte existe déjà avec cet email.' });
        } else if (res.status === 401 || msg.toLowerCase().includes('password') || msg.toLowerCase().includes('invalid')) {
          setErrors({ password: 'Email ou mot de passe incorrect.' });
        } else {
          setErrors({ email: msg || "Erreur d'authentification." });
        }
        return;
      }

      const user = (data.user ?? data) as { id?: string; name?: string; email?: string; role?: string };
      login({
        id: user.id ? String(user.id) : undefined,
        name: user.name || form.name || form.email.split('@')[0],
        email: user.email || form.email,
        role: user.role === 'admin' ? 'admin' : 'client',
      });
      toast(mode === 'register' ? 'Compte créé !' : 'Connexion réussie !', { duration: 2000 });
      navigate(searchParams.get('redirect') || '/');
    } catch {
      toast.error('Serveur inaccessible', { description: 'Vérifiez votre connexion et réessayez.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const redirect = searchParams.get('redirect') || '/';
      const callbackURL = `${window.location.origin}${redirect}`;
      const res = await fetch(apiUrl('/api/auth/sign-in/social'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ provider: 'google', callbackURL }),
      });
      const data = await res.json().catch(() => ({})) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        toast.error('Connexion Google impossible', { description: data.error || 'Vérifiez la configuration OAuth.' });
        return;
      }
      window.location.href = data.url;
    } catch {
      toast.error('Serveur inaccessible', { description: 'Vérifiez votre connexion et réessayez.' });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleForgot = async () => {
    if (!form.email.trim() || !form.email.includes('@')) {
      setErrors({ email: 'Entrez votre adresse e-mail pour recevoir le lien.' });
      return;
    }
    setLoading(true);
    try {
      await fetch(apiUrl('/api/auth/request-password-reset'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email.trim(), redirectTo: `${window.location.origin}/reset-password` }),
      });
      // Always show success to avoid email enumeration
      setResetSent(true);
      setErrors({});
    } catch {
      toast.error('Serveur inaccessible', { description: 'Vérifiez votre connexion.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: 'Manrope, sans-serif' }}>
      {/* Hero */}
      <div className="relative" style={{ height: 'clamp(200px,28vw,320px)' }}>
        <img src={IMAGES.hero} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.72) 100%)' }} />
        <div className="absolute top-0 left-0 right-0 pt-12 px-5 flex items-center gap-3">
          <motion.button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', border: '1px solid rgba(0,0,0,0.08)' }}
            whileTap={{ scale: 0.88 }}
          >
            <ArrowLeft size={18} color={TEXT} />
          </motion.button>
        </div>
        <div className="absolute bottom-6 left-0 right-0 px-5 flex flex-col items-start gap-2">
          <MaisonMarnoaLogo variant="light" size="md" />
          <h1 style={{ color: '#fff', fontWeight: 800, fontSize: '22px', lineHeight: 1.2 }}>
            {mode === 'login' ? 'Bon retour' : 'Rejoignez-nous'}
          </h1>
        </div>
      </div>

      <div className="px-5 pt-6 pb-10 lg:max-w-[480px] lg:mx-auto">

        {/* Mode toggle — only shown for login/register */}
        {mode !== 'forgot' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="flex p-1 rounded-2xl mb-6"
            style={{ background: CARD_BG, border: `1px solid ${BORDER}`, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
          >
            {([{ id: 'login', label: 'Connexion' }, { id: 'register', label: 'Inscription' }] as const).map(tab => (
              <motion.button
                key={tab.id}
                onClick={() => { setMode(tab.id); setErrors({}); setResetSent(false); setForm({ name: '', email: '', password: '', phone: '' }); }}
                className="flex-1 py-3 rounded-xl"
                whileTap={{ scale: 0.97 }}
                style={{
                  background: mode === tab.id ? 'linear-gradient(135deg, #C9A227, #E8C84A)' : 'transparent',
                  color: mode === tab.id ? '#fff' : MUTED,
                  fontWeight: mode === tab.id ? 700 : 500,
                  fontSize: '14px',
                  boxShadow: mode === tab.id ? '0 4px 12px rgba(201,162,39,0.25)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                {tab.label}
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* ── FORGOT PASSWORD PANEL ── */}
        <AnimatePresence mode="wait">
          {mode === 'forgot' ? (
            <motion.div
              key="forgot"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="flex flex-col"
            >
              {/* Back link */}
              <button
                onClick={() => { setMode('login'); setErrors({}); setResetSent(false); }}
                className="flex items-center gap-1.5 mb-6 self-start"
                style={{ color: MUTED, fontSize: '13px', fontWeight: 600 }}
              >
                <ArrowLeft size={14} /> Retour à la connexion
              </button>

              <h2 style={{ color: TEXT, fontWeight: 800, fontSize: '20px', marginBottom: 8 }}>Mot de passe oublié ?</h2>
              <p style={{ color: MUTED, fontSize: '13px', lineHeight: 1.7, marginBottom: 24 }}>
                Entrez votre adresse e-mail et nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </p>

              {/* Error */}
              <AnimatePresence>
                {Object.keys(errors).length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-start gap-3 px-4 py-3.5 rounded-2xl mb-4"
                    style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)' }}
                  >
                    <AlertCircle size={15} color="#ef4444" className="flex-shrink-0 mt-0.5" />
                    <p style={{ color: '#ef4444', fontSize: '12px', fontWeight: 600 }}>{Object.values(errors)[0]}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {resetSent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-4 py-6 px-4 rounded-2xl"
                  style={{ background: 'rgba(34,197,94,0.05)', border: '1.5px solid rgba(34,197,94,0.2)' }}
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)' }}>
                    <Mail size={22} color="#fff" />
                  </div>
                  <div className="text-center">
                    <p style={{ color: TEXT, fontWeight: 700, fontSize: '15px', marginBottom: 6 }}>Email envoyé !</p>
                    <p style={{ color: MUTED, fontSize: '13px', lineHeight: 1.7 }}>
                      Si un compte existe avec <strong>{form.email}</strong>, vous recevrez un lien de réinitialisation dans quelques instants.
                    </p>
                    <p style={{ color: MUTED, fontSize: '12px', marginTop: 8 }}>
                      Vérifiez aussi vos spams.
                    </p>
                  </div>
                  <button
                    onClick={() => { setMode('login'); setResetSent(false); setErrors({}); }}
                    className="flex items-center gap-1.5"
                    style={{ color: GOLD, fontWeight: 700, fontSize: '13px' }}
                  >
                    Retour à la connexion <ArrowRight size={13} />
                  </button>
                </motion.div>
              ) : (
                <>
                  <div className="mb-6">
                    <label style={{ color: MUTED, fontSize: '11px', fontWeight: 600, letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>Adresse e-mail</label>
                    <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl" style={{ background: CARD_BG, border: `1px solid ${errors.email ? '#ef4444' : BORDER}` }}>
                      <Mail size={16} color={MUTED} />
                      <input
                        type="email" placeholder="jean@exemple.com"
                        value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && handleForgot()}
                        autoFocus
                        className="flex-1 bg-transparent outline-none"
                        style={{ color: TEXT, fontFamily: 'Manrope, sans-serif', fontSize: '14px' }}
                      />
                    </div>
                  </div>

                  <motion.button
                    onClick={handleForgot}
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
                      ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Envoi…</>
                      : <><Mail size={16} /> Envoyer le lien</>
                    }
                  </motion.button>
                </>
              )}
            </motion.div>
          ) : (
            <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Google */}
              <motion.button
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 mb-4"
                whileTap={{ scale: 0.96 }}
                style={{ background: CARD_BG, border: `1px solid ${BORDER}`, color: TEXT, fontWeight: 600, fontSize: '14px', fontFamily: 'Manrope, sans-serif', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', opacity: googleLoading ? 0.7 : 1 }}
              >
                {googleLoading ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                )}
                {googleLoading ? 'Redirection…' : 'Continuer avec Google'}
              </motion.button>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px" style={{ background: BORDER }} />
                <span style={{ color: MUTED, fontSize: '12px' }}>ou avec votre email</span>
                <div className="flex-1 h-px" style={{ background: BORDER }} />
              </div>

              {/* Error summary banner */}
              <AnimatePresence>
                {Object.keys(errors).length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-start gap-3 px-4 py-3.5 rounded-2xl mb-4"
                    style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)' }}
                  >
                    <AlertCircle size={15} color="#ef4444" className="flex-shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1">
                      {Object.values(errors).map((msg, i) => (
                        <p key={i} style={{ color: '#ef4444', fontSize: '12px', fontWeight: 600 }}>{msg}</p>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form fields */}
              <div className="flex flex-col gap-4 mb-6">
                {/* Name (register only) */}
                {mode === 'register' && (
                  <div>
                    <label style={{ color: MUTED, fontSize: '11px', fontWeight: 600, letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>Nom complet</label>
                    <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl" style={{ background: CARD_BG, border: `1px solid ${errors.name ? '#ef4444' : BORDER}` }}>
                      <User size={16} color={MUTED} />
                      <input
                        type="text" placeholder="Jean-Marc Koffi" autoComplete="name"
                        value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        className="flex-1 bg-transparent outline-none"
                        style={{ color: TEXT, fontFamily: 'Manrope, sans-serif', fontSize: '14px' }}
                      />
                    </div>
                    {errors.name && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{errors.name}</p>}
                  </div>
                )}

                {/* Email */}
                <div>
                  <label style={{ color: MUTED, fontSize: '11px', fontWeight: 600, letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>Adresse e-mail</label>
                  <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl" style={{ background: CARD_BG, border: `1px solid ${errors.email ? '#ef4444' : BORDER}` }}>
                    <Mail size={16} color={MUTED} />
                    <input
                      type="email" placeholder="jean@exemple.com" autoComplete="email"
                      value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className="flex-1 bg-transparent outline-none"
                      style={{ color: TEXT, fontFamily: 'Manrope, sans-serif', fontSize: '14px' }}
                    />
                  </div>
                  {errors.email && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{errors.email}</p>}
                </div>

                {/* Phone (register only, required) */}
                {mode === 'register' && (
                  <div>
                    <label style={{ color: MUTED, fontSize: '11px', fontWeight: 600, letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>Numéro de téléphone</label>
                    <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl" style={{ background: CARD_BG, border: `1px solid ${errors.phone ? '#ef4444' : BORDER}` }}>
                      <Phone size={16} color={MUTED} />
                      <input
                        type="tel" placeholder="+225 07 00 00 00 00" autoComplete="tel"
                        value={form.phone} onChange={e => { setForm(f => ({ ...f, phone: e.target.value })); setErrors(p => ({ ...p, phone: undefined })); }}
                        className="flex-1 bg-transparent outline-none"
                        style={{ color: TEXT, fontFamily: 'Manrope, sans-serif', fontSize: '14px' }}
                      />
                    </div>
                    {errors.phone && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{errors.phone}</p>}
                  </div>
                )}

                {/* Password */}
                <div>
                  <label style={{ color: MUTED, fontSize: '11px', fontWeight: 600, letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>Mot de passe</label>
                  <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl" style={{ background: CARD_BG, border: `1px solid ${errors.password ? '#ef4444' : BORDER}` }}>
                    <Lock size={16} color={MUTED} />
                    <input
                      type={showPwd ? 'text' : 'password'} placeholder="••••••••"
                      autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                      value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                      className="flex-1 bg-transparent outline-none"
                      style={{ color: TEXT, fontFamily: 'Manrope, sans-serif', fontSize: '14px' }}
                    />
                    <button onClick={() => setShowPwd(!showPwd)}>
                      {showPwd ? <EyeOff size={16} color={MUTED} /> : <Eye size={16} color={MUTED} />}
                    </button>
                  </div>
                  {errors.password && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{errors.password}</p>}
                </div>
              </div>

              {mode === 'login' && (
                <button
                  onClick={() => { setMode('forgot'); setErrors({}); }}
                  className="mb-6"
                >
                  <span style={{ color: GOLD, fontWeight: 600, fontSize: '13px' }}>Mot de passe oublié ?</span>
                </button>
              )}

              {mode === 'register' && (
                <div className="flex items-start gap-3 mb-6">
                  <motion.button
                    onClick={() => setAgreed(!agreed)}
                    className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: agreed ? GOLD : 'transparent', border: `2px solid ${agreed ? GOLD : errors.agreed ? '#ef4444' : BORDER}` }}
                    whileTap={{ scale: 0.85 }}
                  >
                    {agreed && <Check size={11} color="#fff" />}
                  </motion.button>
                  <p style={{ color: MUTED, fontSize: '12px', lineHeight: 1.6 }}>
                    J'accepte les <span style={{ color: GOLD, fontWeight: 600 }}>Conditions Générales</span> et la <span style={{ color: GOLD, fontWeight: 600 }}>Politique de confidentialité</span> de Maison Marnoa.
                  </p>
                </div>
              )}

              {/* Submit */}
              <motion.button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl mb-5"
                whileTap={{ scale: 0.97 }}
                style={{
                  background: loading ? 'rgba(201,162,39,0.5)' : 'linear-gradient(135deg, #C9A227 0%, #E8C84A 50%, #C9A227 100%)',
                  color: '#fff', fontWeight: 800, fontSize: '15px',
                  boxShadow: loading ? 'none' : '0 4px 20px rgba(201,162,39,0.35)',
                }}
              >
                {loading ? (
                  <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> {mode === 'login' ? 'Connexion…' : 'Création…'}</>
                ) : (
                  mode === 'login' ? 'Se connecter' : 'Créer mon compte'
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <p style={{ color: '#B0A090', fontSize: '10px', textAlign: 'center' }}>
          © 2026 Maison Marnoa · Abidjan, Côte d'Ivoire
        </p>
      </div>
    </div>
  );
}
