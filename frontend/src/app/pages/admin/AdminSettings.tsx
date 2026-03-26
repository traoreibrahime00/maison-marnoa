import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Truck, Gift, Pencil, Check, X, Link, Upload, Film, Image as ImageIcon } from 'lucide-react';
import { apiUrl } from '../../lib/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { useColors } from '../../context/AppContext';
import { uploadToCloudinary, isCloudinaryConfigured } from '../../lib/cloudinary';

const FONT = 'Manrope, sans-serif';

type GeneralSettings = { waNumber: string; giftWrapFee: number };
type ShippingInfo    = { freeThreshold: number; freeZone: string };
type HeroSettings = {
  mediaUrl: string; mediaType: string;
  badge: string; title1: string; title2: string;
  subtitle: string; cta1: string; cta2: string;
};

const HERO_DEFAULTS: HeroSettings = {
  mediaUrl: '', mediaType: 'image',
  badge: 'Collection Exclusive', title1: 'Haute', title2: 'Joaillerie',
  subtitle: "L'excellence joaillière au cœur d'Abidjan. Des créations soigneusement sélectionnées aux quatre coins du monde.",
  cta1: 'Explorer la collection', cta2: 'Showroom Abidjan',
};

function formatPhone(raw: string) {
  const digits = raw.replace(/\D/g, '');
  if (digits.length >= 11) {
    const country = digits.slice(0, 3);
    const rest = digits.slice(3);
    const parts = rest.match(/.{1,2}/g) ?? [rest];
    return `+${country} ${parts.join(' ')}`;
  }
  return `+${digits}`;
}

function EditableField({
  label, icon, value, suffix = '', type = 'text', onSave, multiline = false,
}: {
  label: string; icon: React.ReactNode; value: string; suffix?: string; type?: string;
  onSave: (val: string) => Promise<void>; multiline?: boolean;
}) {
  const { CARD_BG, BORDER, TEXT, MUTED, GOLD } = useColors();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(value);
  const [saving, setSaving]   = useState(false);

  useEffect(() => { if (!editing) setDraft(value); }, [value, editing]);

  const save = async () => {
    setSaving(true);
    try { await onSave(draft); setEditing(false); } finally { setSaving(false); }
  };

  const cancel = () => { setDraft(value); setEditing(false); };

  return (
    <div className="rounded-xl p-4" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <p style={{ color: MUTED, fontSize: '10px', fontWeight: 700, fontFamily: FONT, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{label}</p>
      </div>
      {editing ? (
        <div className="flex items-start gap-2">
          {multiline ? (
            <textarea
              style={{ flex: 1, background: 'transparent', border: `1px solid ${GOLD}`, color: TEXT, borderRadius: '8px', padding: '8px 12px', fontSize: '13px', fontFamily: FONT, outline: 'none', resize: 'vertical', minHeight: '72px' }}
              value={draft} onChange={e => setDraft(e.target.value)} autoFocus
            />
          ) : (
            <input
              style={{ flex: 1, background: 'transparent', border: `1px solid ${GOLD}`, color: TEXT, borderRadius: '8px', padding: '8px 12px', fontSize: '13px', fontFamily: FONT, outline: 'none' }}
              type={type} value={draft} onChange={e => setDraft(e.target.value)} autoFocus
              onKeyDown={e => { if (e.key === 'Enter' && !multiline) save(); if (e.key === 'Escape') cancel(); }}
            />
          )}
          {suffix && <span style={{ color: MUTED, fontSize: '12px', fontFamily: FONT, flexShrink: 0, paddingTop: '10px' }}>{suffix}</span>}
          <div className="flex flex-col gap-1 pt-1">
            <button onClick={save} disabled={saving} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#22c55e' }}>
              {saving ? '…' : <Check size={16} />}
            </button>
            <button onClick={cancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
              <X size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-2">
          <p style={{ color: value ? TEXT : MUTED, fontSize: '13px', fontWeight: value ? 700 : 400, fontFamily: FONT, flex: 1, wordBreak: 'break-all' }}>
            {value || '—'}{suffix}
          </p>
          <button onClick={() => { setDraft(value); setEditing(true); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED, flexShrink: 0 }}>
            <Pencil size={13} />
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Hero media uploader ─────────────────────────────────── */
function HeroMediaField({ value, mediaType, onSave }: {
  value: string; mediaType: string;
  onSave: (url: string, type: string) => Promise<void>;
}) {
  const { CARD_BG, BG, BORDER, TEXT, MUTED, GOLD } = useColors();
  const fileRef  = useRef<HTMLInputElement>(null);
  const urlRef   = useRef<HTMLInputElement>(null);
  const [uploading, setUploading]     = useState(false);
  const [showUrlForm, setShowUrlForm] = useState(false);
  const [urlDraft, setUrlDraft]       = useState('');
  const [typeDraft, setTypeDraft]     = useState<'image' | 'video'>('image');
  const [saving, setSaving]           = useState(false);
  const [saved, setSaved]             = useState(false);
  const cloudinaryReady = isCloudinaryConfigured();

  /* File upload — auto-save, no validation click needed */
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (fileRef.current) fileRef.current.value = '';
    if (!cloudinaryReady) { toast.error('Cloudinary non configuré'); return; }
    const isVideo = file.type.startsWith('video/');
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file, undefined, 'maison-marnoa/hero');
      await onSave(url, isVideo ? 'video' : 'image');
      toast.success('Média mis à jour');
    } catch {
      toast.error('Erreur upload');
    } finally {
      setUploading(false);
    }
  };

  const openUrlForm = () => {
    setUrlDraft(value);
    setTypeDraft(mediaType === 'video' ? 'video' : 'image');
    setSaved(false);
    setShowUrlForm(true);
    setTimeout(() => urlRef.current?.focus(), 50);
  };

  /* URL auto-save — triggered by Enter or blur */
  const commitUrl = async (url = urlDraft) => {
    const trimmed = url.trim();
    if (!trimmed || trimmed === value) return;
    setSaving(true);
    try {
      await onSave(trimmed, typeDraft);
      setSaved(true);
      setTimeout(() => { setSaved(false); setShowUrlForm(false); }, 800);
    } catch {
      toast.error('Erreur de sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  /* Type selector auto-save when URL is already set */
  const handleTypeChange = async (t: 'image' | 'video') => {
    setTypeDraft(t);
    const trimmed = urlDraft.trim();
    if (!trimmed) return;
    setSaving(true);
    try { await onSave(trimmed, t); } catch { /* noop */ } finally { setSaving(false); }
  };

  const isVideo = mediaType === 'video';

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>

      {/* ── Preview ── */}
      {value ? (
        <div className="relative" style={{ height: '200px', background: '#000' }}>
          {isVideo ? (
            <video key={value} src={value} autoPlay muted loop playsInline className="w-full h-full object-cover" />
          ) : (
            <img key={value} src={value} alt="Hero preview" className="w-full h-full object-cover" />
          )}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}>
            {isVideo ? <Film size={11} color="#fff" /> : <ImageIcon size={11} color="#fff" />}
            <span style={{ color: '#fff', fontSize: '10px', fontWeight: 700, fontFamily: FONT, letterSpacing: '0.5px' }}>
              {isVideo ? 'Vidéo active' : 'Image active'}
            </span>
          </div>
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
              <div className="flex flex-col items-center gap-2">
                <div style={{ width: 28, height: 28, border: `3px solid rgba(201,162,39,0.3)`, borderTop: `3px solid ${GOLD}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <span style={{ color: '#fff', fontSize: '11px', fontFamily: FONT, fontWeight: 600 }}>Envoi en cours…</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          className="flex flex-col items-center justify-center gap-3 cursor-pointer"
          style={{ height: '160px', background: BG, transition: 'background 0.2s' }}
          onClick={() => fileRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-2">
            <Upload size={24} color={MUTED} strokeWidth={1.5} />
            <p style={{ color: MUTED, fontSize: '12px', fontFamily: FONT }}>Cliquez pour uploader un fichier</p>
          </div>
        </div>
      )}

      {/* ── Actions ── */}
      <div className="p-4" style={{ background: CARD_BG }}>
        <p style={{ color: MUTED, fontSize: '10px', fontWeight: 700, fontFamily: FONT, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '12px' }}>
          Image ou vidéo de fond
        </p>

        <div className="flex gap-2 flex-wrap">
          <input ref={fileRef} type="file" accept="image/*,video/*" onChange={handleFile} style={{ display: 'none' }} />
          <button
            onClick={() => fileRef.current?.click()} disabled={uploading}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 14px', borderRadius: '10px', cursor: uploading ? 'not-allowed' : 'pointer',
              background: 'rgba(201,162,39,0.1)', border: `1px solid rgba(201,162,39,0.25)`,
              color: GOLD, fontSize: '12px', fontWeight: 700, fontFamily: FONT,
              opacity: uploading ? 0.6 : 1,
            }}>
            <Upload size={12} />
            {uploading ? 'Upload…' : 'Uploader un fichier'}
          </button>

          <button
            onClick={showUrlForm ? () => setShowUrlForm(false) : openUrlForm}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 14px', borderRadius: '10px', cursor: 'pointer',
              background: showUrlForm ? 'rgba(201,162,39,0.08)' : BG,
              border: `1px solid ${showUrlForm ? 'rgba(201,162,39,0.3)' : BORDER}`,
              color: showUrlForm ? GOLD : MUTED, fontSize: '12px', fontWeight: 600, fontFamily: FONT,
            }}>
            <Link size={12} />
            Saisir une URL
          </button>
        </div>

        {/* ── URL form — auto-save on Enter or blur ── */}
        {showUrlForm && (
          <div className="mt-3 flex flex-col gap-2">
            <div className="relative">
              <input
                ref={urlRef}
                value={urlDraft}
                onChange={e => setUrlDraft(e.target.value)}
                placeholder="https://res.cloudinary.com/…"
                onKeyDown={e => {
                  if (e.key === 'Enter') commitUrl();
                  if (e.key === 'Escape') setShowUrlForm(false);
                }}
                onBlur={() => commitUrl()}
                style={{
                  width: '100%', background: BG,
                  border: `1px solid ${saved ? '#22c55e' : GOLD}`,
                  borderRadius: '8px', padding: '9px 36px 9px 12px',
                  color: TEXT, fontSize: '12px', fontFamily: FONT, outline: 'none',
                  boxSizing: 'border-box', transition: 'border-color 0.2s',
                }}
              />
              {/* Status icon inside input */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2" style={{ pointerEvents: 'none' }}>
                {saving && (
                  <div style={{ width: 12, height: 12, border: `2px solid rgba(201,162,39,0.3)`, borderTop: `2px solid ${GOLD}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                )}
                {saved && !saving && <Check size={13} color="#22c55e" />}
              </div>
            </div>

            {/* Type selector — auto-save on change */}
            <div className="flex rounded-lg overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
              {(['image', 'video'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => handleTypeChange(t)}
                  style={{
                    flex: 1, padding: '7px 0', fontSize: '11px', fontWeight: 700,
                    fontFamily: FONT, cursor: 'pointer', border: 'none',
                    background: typeDraft === t ? 'rgba(201,162,39,0.15)' : 'transparent',
                    color: typeDraft === t ? GOLD : MUTED,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                    transition: 'all 0.15s',
                  }}>
                  {t === 'image' ? <><ImageIcon size={11} /> Image</> : <><Film size={11} /> Vidéo</>}
                </button>
              ))}
            </div>

            <p style={{ color: MUTED, fontSize: '10px', fontFamily: FONT }}>
              Appuyez sur <kbd style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '4px', padding: '1px 5px', fontSize: '10px', fontFamily: 'monospace' }}>Entrée</kbd> ou cliquez ailleurs pour sauvegarder automatiquement.
            </p>
          </div>
        )}

        <p style={{ color: MUTED, fontSize: '10px', fontFamily: FONT, marginTop: '10px', lineHeight: 1.5 }}>
          Formats acceptés : JPG, PNG, WebP, MP4, MOV — le type est détecté automatiquement lors de l'upload de fichier.
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function AdminSettings() {
  const navigate = useNavigate();
  const { BG, CARD_BG, BORDER, TEXT, MUTED, GOLD } = useColors();
  const [settings, setSettings] = useState<GeneralSettings | null>(null);
  const [shipping, setShipping] = useState<ShippingInfo | null>(null);
  const [hero, setHero]         = useState<HeroSettings>(HERO_DEFAULTS);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(apiUrl('/api/admin/general-settings'), { credentials: 'include' }).then(r => r.json()),
      fetch(apiUrl('/api/shipping/zones')).then(r => r.json()),
      fetch(apiUrl('/api/settings/hero')).then(r => r.json()),
    ]).then(([gen, ship, h]: [GeneralSettings, { freeThreshold: number; freeZone: string }, HeroSettings]) => {
      setSettings(gen);
      setShipping({ freeThreshold: ship.freeThreshold, freeZone: ship.freeZone });
      setHero(h);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const save = async (key: keyof GeneralSettings, rawVal: string) => {
    const body = key === 'giftWrapFee'
      ? { giftWrapFee: Number(rawVal) }
      : { waNumber: rawVal.replace(/\D/g, '') };
    const res = await fetch(apiUrl('/api/admin/general-settings'), {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      credentials: 'include', body: JSON.stringify(body),
    });
    if (!res.ok) { toast.error('Erreur de sauvegarde'); return; }
    const updated = await res.json() as GeneralSettings;
    setSettings(updated);
    toast('Paramètre mis à jour');
  };

  const saveHero = async (patch: Partial<HeroSettings>) => {
    // Mise à jour immédiate — le preview s'actualise sans attendre le backend
    setHero(prev => ({ ...prev, ...patch }));
    const res = await fetch(apiUrl('/api/admin/hero-settings'), {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      credentials: 'include', body: JSON.stringify(patch),
    });
    if (!res.ok) { toast.error('Erreur de sauvegarde'); }
  };

  if (loading) {
    return <p style={{ color: MUTED, fontFamily: FONT, fontSize: '13px' }}>Chargement…</p>;
  }

  return (
    <div className="flex flex-col gap-5 max-w-[640px]">

      {/* ── Hero section ── */}
      <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
        <div className="px-5 pt-5 pb-4" style={{ background: CARD_BG }}>
          <p style={{ color: GOLD, fontSize: '14px', fontWeight: 700, fontFamily: FONT, marginBottom: '2px' }}>
            Hero — Page d'accueil
          </p>
          <p style={{ color: MUTED, fontSize: '12px', fontFamily: FONT }}>
            Personnalisez le visuel et les textes de la bannière principale.
          </p>
        </div>

        {/* Media field — full width, flush */}
        <HeroMediaField
          value={hero.mediaUrl}
          mediaType={hero.mediaType}
          onSave={(url, type) => saveHero({ mediaUrl: url, mediaType: type })}
        />

        <div className="p-5 flex flex-col gap-3" style={{ background: CARD_BG }}>

          {/* Hero text preview */}
          <div className="rounded-xl p-4 flex flex-col gap-1.5"
            style={{ background: 'linear-gradient(135deg,#0a0a0a,#1a1a1a)', border: `1px solid rgba(201,162,39,0.15)` }}>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '9px', fontWeight: 700, fontFamily: FONT, letterSpacing: '2px', textTransform: 'uppercase' }}>
              ✦ {hero.badge || 'Badge'}
            </span>
            <p style={{ fontFamily: FONT, fontWeight: 800, fontSize: '22px', lineHeight: 1.1, color: '#fff' }}>
              {hero.title1 || 'Titre 1'}{' '}
              <span style={{ background: 'linear-gradient(135deg,#FFE17A,#C9A227)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {hero.title2 || 'Titre 2'}
              </span>
            </p>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '11px', fontFamily: FONT, lineHeight: 1.5, maxWidth: '380px' }}>
              {hero.subtitle}
            </p>
            <div className="flex gap-2 mt-1 flex-wrap">
              {hero.cta1 && (
                <span style={{ padding: '5px 12px', borderRadius: '999px', background: 'linear-gradient(135deg,#C9A227,#E8C84A)', color: '#fff', fontSize: '10px', fontWeight: 700, fontFamily: FONT }}>
                  {hero.cta1}
                </span>
              )}
              {hero.cta2 && (
                <span style={{ padding: '5px 12px', borderRadius: '999px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', fontSize: '10px', fontWeight: 600, fontFamily: FONT }}>
                  {hero.cta2}
                </span>
              )}
            </div>
          </div>

          <EditableField
            label="Badge"
            icon={<span style={{ fontSize: '10px', color: GOLD }}>✦</span>}
            value={hero.badge}
            onSave={v => saveHero({ badge: v })}
          />
          <div className="grid grid-cols-2 gap-3">
            <EditableField
              label="Titre ligne 1 (blanc)"
              icon={<span style={{ fontSize: '10px', color: TEXT, fontWeight: 800 }}>T</span>}
              value={hero.title1}
              onSave={v => saveHero({ title1: v })}
            />
            <EditableField
              label="Titre ligne 2 (or)"
              icon={<span style={{ fontSize: '10px', color: GOLD, fontWeight: 800 }}>T</span>}
              value={hero.title2}
              onSave={v => saveHero({ title2: v })}
            />
          </div>
          <EditableField
            label="Sous-titre"
            icon={<Pencil size={13} color={MUTED} />}
            value={hero.subtitle}
            onSave={v => saveHero({ subtitle: v })}
            multiline
          />
          <div className="grid grid-cols-2 gap-3">
            <EditableField
              label="Bouton principal"
              icon={<span style={{ fontSize: '10px', color: GOLD }}>→</span>}
              value={hero.cta1}
              onSave={v => saveHero({ cta1: v })}
            />
            <EditableField
              label="Bouton secondaire"
              icon={<span style={{ fontSize: '10px', color: MUTED }}>○</span>}
              value={hero.cta2}
              onSave={v => saveHero({ cta2: v })}
            />
          </div>
        </div>
      </div>

      {/* ── General settings ── */}
      <div className="rounded-2xl p-5" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
        <p style={{ color: GOLD, fontSize: '14px', fontWeight: 700, fontFamily: FONT, marginBottom: '4px' }}>
          Paramètres généraux
        </p>
        <p style={{ color: MUTED, fontSize: '12px', fontFamily: FONT, marginBottom: '20px' }}>
          Cliquez sur le crayon pour modifier une valeur.
        </p>
        <div className="flex flex-col gap-3">
          <EditableField
            label="Numéro WhatsApp commandes"
            icon={<MessageCircle size={13} color={GOLD} />}
            value={settings ? formatPhone(settings.waNumber) : '—'}
            onSave={val => save('waNumber', val)}
          />
          <EditableField
            label="Frais emballage cadeau"
            icon={<Gift size={13} color={GOLD} />}
            value={settings ? String(settings.giftWrapFee) : '2500'}
            suffix=" FCFA"
            type="number"
            onSave={val => save('giftWrapFee', val)}
          />
        </div>
      </div>

      {/* ── Shipping info ── */}
      <div className="rounded-2xl p-5" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
        <div className="flex items-center justify-between mb-4">
          <p style={{ color: GOLD, fontSize: '14px', fontWeight: 700, fontFamily: FONT }}>Livraison</p>
          <button
            onClick={() => navigate('/admin/shipping')}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 12px', borderRadius: '10px', cursor: 'pointer',
              background: 'rgba(201,162,39,0.08)', border: '1px solid rgba(201,162,39,0.2)',
              color: GOLD, fontSize: '11px', fontWeight: 700, fontFamily: FONT,
            }}>
            <Truck size={11} /> Gérer dans Livraison
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl p-4" style={{ background: BG, border: `1px solid ${BORDER}` }}>
            <div className="flex items-center gap-2 mb-2">
              <Truck size={13} color={GOLD} />
              <p style={{ color: MUTED, fontSize: '10px', fontWeight: 700, fontFamily: FONT, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Seuil livraison gratuite</p>
            </div>
            <p style={{ color: TEXT, fontSize: '13px', fontWeight: 700, fontFamily: FONT }}>
              {shipping && shipping.freeThreshold > 0 ? `${shipping.freeThreshold.toLocaleString('fr-CI')} FCFA` : 'Désactivé'}
            </p>
            {shipping?.freeZone && shipping.freeThreshold > 0 && (
              <p style={{ color: MUTED, fontSize: '10px', fontFamily: FONT, marginTop: '3px' }}>Zone : {shipping.freeZone}</p>
            )}
          </div>
          <div className="rounded-xl p-4" style={{ background: BG, border: `1px solid ${BORDER}` }}>
            <div className="flex items-center gap-2 mb-2">
              <Truck size={13} color={GOLD} />
              <p style={{ color: MUTED, fontSize: '10px', fontWeight: 700, fontFamily: FONT, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Zones actives</p>
            </div>
            <p style={{ color: TEXT, fontSize: '13px', fontWeight: 700, fontFamily: FONT }}>Voir dans Livraison</p>
            <p style={{ color: MUTED, fontSize: '10px', fontFamily: FONT, marginTop: '3px' }}>Prix et disponibilité</p>
          </div>
        </div>
      </div>

    </div>
  );
}
