import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { ArrowLeft, Eye, EyeOff, Mail, Lock, User, Phone, Check, MessageCircle, KeyRound, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { IMAGES } from '../data/products';
import { MaisonMarnoaLogo } from '../components/MaisonMarnoaLogo';
import { toast } from 'sonner';
import { apiUrl } from '../lib/api';

const GOLD     = '#C9A227';
const CARD_BG  = '#FFFFFF';
const BORDER   = '#EDE5D0';
const TEXT     = '#1C1510';
const MUTED    = '#8A7564';
const BG       = '#FDFAF4';

type AuthMode  = 'login' | 'register';
type LoginMethod = 'email' | 'otp';

/** Simulate OTP send — in production, call your SMS/WhatsApp API here */
async function sendOTP(phone: string): Promise<void> {
  console.log(`[OTP] Sending code to ${phone}`); // Replace with real API call
  await new Promise(r => setTimeout(r, 1200));
}

export default function Login() {
  const navigate    = useNavigate();
  const [searchParams] = useSearchParams();
  const { login }   = useApp();

  const [mode, setMode]         = useState<AuthMode>(searchParams.get('mode') === 'register' ? 'register' : 'login');
  const [method, setMethod]     = useState<LoginMethod>('email');

  // Email/password form
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [agreed, setAgreed]     = useState(false);
  const [form, setForm]         = useState({ name: '', email: '', phone: '+225 ', password: '' });
  const [errors, setErrors]     = useState<Record<string, string>>({});

  // OTP flow
  const [otpPhone, setOtpPhone] = useState('+225 ');
  const [otpCode, setOtpCode]   = useState('');
  const [otpSent, setOtpSent]   = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError]     = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // ── Validation ──
  const validate = () => {
    const e: Record<string, string> = {};
    if (mode === 'register' && !form.name.trim())           e.name = 'Nom requis';
    if (!form.email.trim() || !form.email.includes('@'))    e.email = 'Email invalide';
    if (!form.password || form.password.length < 6)         e.password = 'Mot de passe trop court (min. 6 caractères)';
    if (mode === 'register' && !agreed)                      e.agreed = 'Acceptez les conditions';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Email submit ──
  const handleEmailSubmit = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      const endpoint = mode === 'register' ? '/api/auth/sign-up/email' : '/api/auth/sign-in/email';
      const payload = mode === 'register'
        ? {
            name: form.name.trim(),
            email: form.email.trim(),
            password: form.password,
            phone: form.phone.trim() || undefined,
          }
        : {
            email: form.email.trim(),
            password: form.password,
          };

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
          setErrors({ email: msg || 'Erreur d\'authentification.' });
        }
        return;
      }

      // Use the real user returned by Better Auth
      const user = (data.user ?? data) as { id?: string; name?: string; email?: string; phone?: string; role?: string };
      login({
        id: user.id ? String(user.id) : undefined,
        name: user.name || form.name || form.email.split('@')[0],
        email: user.email || form.email,
        phone: (user.phone as string | undefined) || form.phone || undefined,
        role: user.role === 'admin' ? 'admin' : 'client',
      });
      toast(mode === 'register' ? '🎉 Compte créé !' : '✅ Connexion réussie !', { duration: 2000 });
      navigate(searchParams.get('redirect') || '/profile');
    } catch {
      toast.error('Serveur inaccessible', { description: 'Vérifiez votre connexion et réessayez.' });
    } finally {
      setLoading(false);
    }
  };

  // ── OTP: send code ──
  const handleSendOTP = async () => {
    if (otpPhone.replace(/\s/g, '').length < 9) {
      setOtpError('Numéro invalide');
      return;
    }
    setOtpError('');
    setOtpLoading(true);
    await sendOTP(otpPhone);
    setOtpSent(true);
    setOtpLoading(false);
    toast('📱 Code envoyé !', { description: `OTP envoyé sur ${otpPhone}`, duration: 3000 });
    // Cooldown 30s
    setResendCooldown(30);
    const interval = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  // ── OTP: verify code ──
  const handleVerifyOTP = async () => {
    if (otpCode.length < 4) { setOtpError('Code invalide'); return; }
    setOtpLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    // In production: verify against your backend. Here we accept any 4+ digit code.
    if (otpCode === '0000') {
      setOtpError('Code incorrect. Réessayez.');
      setOtpLoading(false);
      return;
    }
    login({
      name: 'Client Maison Marnoa',
      phone: otpPhone,
      role: 'client',
    });
    toast('✅ Connexion réussie !', { duration: 2000 });
    navigate('/profile');
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
            style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', border: `1px solid rgba(0,0,0,0.08)` }}
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

        {/* ── Mode Toggle (Connexion / Inscription) ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="flex p-1 rounded-2xl mb-5"
          style={{ background: CARD_BG, border: `1px solid ${BORDER}`, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
        >
          {([{ id: 'login', label: 'Connexion' }, { id: 'register', label: 'Inscription' }] as const).map(tab => (
            <motion.button
              key={tab.id}
              onClick={() => { setMode(tab.id); setErrors({}); setOtpSent(false); }}
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

        {/* ── Login Method Toggle ── */}
        <div className="flex gap-2 mb-5">
          {([
            { id: 'email', label: '✉️ Email & Mot de passe', icon: Mail },
            { id: 'otp',   label: '📱 Code WhatsApp / SMS',  icon: MessageCircle },
          ] as const).map(m => (
            <motion.button
              key={m.id}
              onClick={() => { setMethod(m.id); setOtpSent(false); setOtpError(''); }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl"
              whileTap={{ scale: 0.95 }}
              style={{
                background: method === m.id ? 'rgba(201,162,39,0.1)' : 'transparent',
                border: `1.5px solid ${method === m.id ? GOLD : BORDER}`,
                color: method === m.id ? GOLD : MUTED,
                fontWeight: method === m.id ? 700 : 500,
                fontSize: '11px',
                transition: 'all 0.2s',
              }}
            >
              {m.label}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ══════════════════════════════════
               METHOD A: Email / Password
          ══════════════════════════════════ */}
          {method === 'email' && (
            <motion.div key="email" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.2 }}>
              <div className="flex flex-col gap-4 mb-6">
                {/* Name (register only) */}
                {mode === 'register' && (
                  <div>
                    <label style={{ color: MUTED, fontSize: '11px', fontWeight: 600, letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>Nom complet</label>
                    <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl" style={{ background: CARD_BG, border: `1px solid ${errors.name ? '#ef4444' : BORDER}` }}>
                      <User size={16} color={MUTED} />
                      <input type="text" placeholder="Jean-Marc Koffi" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="flex-1 bg-transparent outline-none" style={{ color: TEXT, fontFamily: 'Manrope, sans-serif', fontSize: '14px' }} />
                    </div>
                    {errors.name && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{errors.name}</p>}
                  </div>
                )}

                {/* Email */}
                <div>
                  <label style={{ color: MUTED, fontSize: '11px', fontWeight: 600, letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>Adresse e-mail</label>
                  <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl" style={{ background: CARD_BG, border: `1px solid ${errors.email ? '#ef4444' : BORDER}` }}>
                    <Mail size={16} color={MUTED} />
                    <input type="email" placeholder="jean@exemple.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="flex-1 bg-transparent outline-none" style={{ color: TEXT, fontFamily: 'Manrope, sans-serif', fontSize: '14px' }} />
                  </div>
                  {errors.email && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{errors.email}</p>}
                </div>

                {/* Phone (register only) */}
                {mode === 'register' && (
                  <div>
                    <label style={{ color: MUTED, fontSize: '11px', fontWeight: 600, letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>Téléphone</label>
                    <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
                      <Phone size={16} color={MUTED} />
                      <input type="tel" placeholder="+225 07 00 00 00 00" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="flex-1 bg-transparent outline-none" style={{ color: TEXT, fontFamily: 'Manrope, sans-serif', fontSize: '14px' }} />
                    </div>
                  </div>
                )}

                {/* Password */}
                <div>
                  <label style={{ color: MUTED, fontSize: '11px', fontWeight: 600, letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>Mot de passe</label>
                  <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl" style={{ background: CARD_BG, border: `1px solid ${errors.password ? '#ef4444' : BORDER}` }}>
                    <Lock size={16} color={MUTED} />
                    <input type={showPwd ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="flex-1 bg-transparent outline-none" style={{ color: TEXT, fontFamily: 'Manrope, sans-serif', fontSize: '14px' }} />
                    <button onClick={() => setShowPwd(!showPwd)}>{showPwd ? <EyeOff size={16} color={MUTED} /> : <Eye size={16} color={MUTED} />}</button>
                  </div>
                  {errors.password && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{errors.password}</p>}
                </div>
              </div>

              {mode === 'login' && (
                <button className="mb-6">
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

              <motion.button
                onClick={handleEmailSubmit}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl mb-5"
                whileTap={{ scale: 0.97 }}
                style={{ background: loading ? 'rgba(201,162,39,0.5)' : 'linear-gradient(135deg, #C9A227 0%, #E8C84A 50%, #C9A227 100%)', color: '#fff', fontWeight: 800, fontSize: '15px', boxShadow: loading ? 'none' : '0 4px 20px rgba(201,162,39,0.35)' }}
              >
                {loading ? (
                  <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> {mode === 'login' ? 'Connexion…' : 'Création…'}</>
                ) : (
                  mode === 'login' ? 'Se connecter' : 'Créer mon compte'
                )}
              </motion.button>
            </motion.div>
          )}

          {/* ══════════════════════════════════
               METHOD B: Passwordless OTP
          ══════════════════════════════════ */}
          {method === 'otp' && (
            <motion.div key="otp" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
              {/* Architecture note card */}
              <div className="flex items-start gap-3 px-4 py-3 rounded-2xl mb-5" style={{ background: 'rgba(201,162,39,0.06)', border: `1px solid rgba(201,162,39,0.2)` }}>
                <KeyRound size={14} color={GOLD} className="flex-shrink-0 mt-0.5" />
                <p style={{ color: MUTED, fontSize: '11px', lineHeight: 1.6 }}>
                  Recevez un <strong style={{ color: TEXT }}>code unique à 6 chiffres</strong> par SMS ou WhatsApp. Aucun mot de passe à mémoriser.
                </p>
              </div>

              {/* Step 1: phone input */}
              <AnimatePresence mode="wait">
                {!otpSent ? (
                  <motion.div key="otp-step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <label style={{ color: MUTED, fontSize: '11px', fontWeight: 600, letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
                      Numéro de téléphone
                    </label>
                    <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl mb-2" style={{ background: CARD_BG, border: `1px solid ${otpError ? '#ef4444' : BORDER}` }}>
                      <Phone size={16} color={MUTED} />
                      <input
                        type="tel" placeholder="+225 07 00 00 00 00"
                        value={otpPhone} onChange={e => { setOtpPhone(e.target.value); setOtpError(''); }}
                        className="flex-1 bg-transparent outline-none"
                        style={{ color: TEXT, fontFamily: 'Manrope, sans-serif', fontSize: '14px' }}
                      />
                    </div>
                    {otpError && <p style={{ color: '#ef4444', fontSize: '11px', marginBottom: '8px' }}>{otpError}</p>}

                    <div className="grid grid-cols-2 gap-2 mb-5">
                      <motion.button
                        onClick={handleSendOTP}
                        disabled={otpLoading}
                        className="flex items-center justify-center gap-2 py-3.5 rounded-2xl"
                        whileTap={{ scale: 0.96 }}
                        style={{ background: '#25D366', color: '#fff', fontWeight: 700, fontSize: '13px', boxShadow: '0 3px 12px rgba(37,211,102,0.3)' }}
                      >
                        {otpLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><MessageCircle size={16} /> WhatsApp</>}
                      </motion.button>
                      <motion.button
                        onClick={handleSendOTP}
                        disabled={otpLoading}
                        className="flex items-center justify-center gap-2 py-3.5 rounded-2xl"
                        whileTap={{ scale: 0.96 }}
                        style={{ background: CARD_BG, border: `1px solid ${BORDER}`, color: TEXT, fontWeight: 600, fontSize: '13px' }}
                      >
                        {otpLoading ? <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" /> : <>📱 SMS</>}
                      </motion.button>
                    </div>
                  </motion.div>
                ) : (
                  /* Step 2: code verification */
                  <motion.div key="otp-step2" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <p style={{ color: '#16a34a', fontSize: '12px', fontWeight: 600 }}>Code envoyé sur {otpPhone}</p>
                    </div>

                    <label style={{ color: MUTED, fontSize: '11px', fontWeight: 600, letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
                      Code de vérification
                    </label>
                    <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl mb-2" style={{ background: CARD_BG, border: `1px solid ${otpError ? '#ef4444' : BORDER}` }}>
                      <KeyRound size={16} color={MUTED} />
                      <input
                        type="text" inputMode="numeric" maxLength={6}
                        placeholder="123456"
                        value={otpCode} onChange={e => { setOtpCode(e.target.value.replace(/\D/g, '')); setOtpError(''); }}
                        className="flex-1 bg-transparent outline-none"
                        style={{ color: TEXT, fontFamily: 'Manrope, sans-serif', fontSize: '20px', letterSpacing: '6px', fontWeight: 700 }}
                        autoFocus
                      />
                    </div>
                    {otpError && <p style={{ color: '#ef4444', fontSize: '11px', marginBottom: '8px' }}>{otpError}</p>}

                    <motion.button
                      onClick={handleVerifyOTP}
                      disabled={otpLoading || otpCode.length < 4}
                      className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl mb-3"
                      whileTap={{ scale: 0.97 }}
                      style={{ background: otpCode.length >= 4 ? 'linear-gradient(135deg, #C9A227, #E8C84A)' : BORDER, color: '#fff', fontWeight: 800, fontSize: '15px', opacity: otpCode.length < 4 ? 0.5 : 1 }}
                    >
                      {otpLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Vérifier le code'}
                    </motion.button>

                    {/* Resend */}
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={resendCooldown === 0 ? handleSendOTP : undefined}
                        disabled={resendCooldown > 0}
                        className="flex items-center gap-1.5"
                        style={{ color: resendCooldown > 0 ? MUTED : GOLD, fontWeight: 600, fontSize: '12px' }}
                      >
                        <RefreshCw size={12} />
                        {resendCooldown > 0 ? `Renvoyer dans ${resendCooldown}s` : 'Renvoyer le code'}
                      </button>
                      <span style={{ color: BORDER }}>·</span>
                      <button onClick={() => { setOtpSent(false); setOtpCode(''); }} style={{ color: MUTED, fontSize: '12px' }}>
                        Changer de numéro
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-5 mt-2">
          <div className="flex-1 h-px" style={{ background: BORDER }} />
          <span style={{ color: MUTED, fontSize: '12px' }}>ou continuer avec</span>
          <div className="flex-1 h-px" style={{ background: BORDER }} />
        </div>

        {/* Social quick-login */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[{ label: '🌐 Google' }, { label: '📱 WhatsApp' }].map(s => (
            <motion.button
              key={s.label}
              className="py-3.5 rounded-2xl text-center"
              whileTap={{ scale: 0.96 }}
              style={{ background: CARD_BG, border: `1px solid ${BORDER}`, color: TEXT, fontWeight: 600, fontSize: '13px', fontFamily: 'Manrope, sans-serif', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
            >
              {s.label}
            </motion.button>
          ))}
        </div>

        <p style={{ color: '#B0A090', fontSize: '10px', textAlign: 'center' }}>
          © 2026 Maison Marnoa · Abidjan, Côte d'Ivoire
        </p>
      </div>
    </div>
  );
}
