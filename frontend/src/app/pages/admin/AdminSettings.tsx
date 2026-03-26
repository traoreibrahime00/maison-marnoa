import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Truck, Gift, Pencil, Check, X, Link, Image, Film, Upload, ExternalLink } from 'lucide-react';
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
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [urlDraft, setUrlDraft] = useState(value);
  const [typeDraft, setTypeDraft] = useState(mediaType);
  const [urlMode, setUrlMode] = useState(false);
  const cloudinaryReady = isCloudinaryConfigured();

  useEffect(() => { setUrlDraft(value); setTypeDraft(mediaType); }, [value, mediaType]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (fileRef.current) fileRef.current.value = '';
    if (!cloudinaryReady) { toast.error('Cloudinary non configuré'); return; }
    const isVideo = file.type.startsWith('video/');
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      await onSave(url, isVideo ? 'video' : 'image');
      toast('Média hero mis à jour');
    } catch {
      toast.error('Erreur upload');
    } finally {
      setUploading(false);
    }
  };

  const saveUrl = async () => {
    await onSave(urlDraft, typeDraft);
    setUrlMode(false);
    toast('Média hero mis à jour');
  };

  return (
    <div className="rounded-xl p-4" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
      <div className="flex items-center gap-2 mb-3">
        {mediaType === 'video' ? <Film size={13} color={GOLD} /> : <Image size={13} color={GOLD} />}
        <p style={{ color: MUTED, fontSize: '10px', fontWeight: 700, fontFamily: FONT, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
          Image ou vidéo de fond
        </p>
      </div>

      {/* Preview */}
      {value && (
        <div className="mb-3 rounded-xl overflow-hidden relative" style={{ height: '100px' }}>
          {mediaType === 'video' ? (
            <video src={value} muted className="w-full h-full object-cover" />
          ) : (
            <img src={value} alt="" className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.3)' }}>
            <span style={{ color: '#fff', fontSize: '9px', fontWeight: 700, fontFamily: FONT, letterSpacing: '1px', textTransform: 'uppercase' }}>
              {mediaType === 'video' ? '▶ Vidéo' : '🖼 Image'} active
            </span>
          </div>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {/* Upload button */}
        <input ref={fileRef} type="file" accept="image/*,video/*" onChange={handleFile} style={{ display: 'none' }} />
        <button
          onClick={() => fileRef.current?.click()} disabled={uploading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
          style={{ background: 'rgba(201,162,39,0.08)', border: `1px solid rgba(201,162,39,0.2)`, color: GOLD, fontSize: '11px', fontWeight: 700, fontFamily: FONT, cursor: uploading ? 'not-allowed' : 'pointer' }}>
          <Upload size={11} /> {uploading ? 'Upload…' : 'Uploader'}
        </button>

        {/* URL button */}
        <button
          onClick={() => setUrlMode(v => !v)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
          style={{ background: BG, border: `1px solid ${BORDER}`, color: MUTED, fontSize: '11px', fontWeight: 600, fontFamily: FONT, cursor: 'pointer' }}>
          <ExternalLink size={11} /> URL externe
        </button>

        {/* Type toggle */}
        <div className="flex rounded-xl overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
          {(['image', 'video'] as const).map(t => (
            <button key={t} onClick={() => setTypeDraft(t)}
              style={{ padding: '6px 12px', fontSize: '10px', fontWeight: 700, fontFamily: FONT, cursor: 'pointer', background: typeDraft === t ? 'rgba(201,162,39,0.15)' : 'transparent', color: typeDraft === t ? GOLD : MUTED, border: 'none' }}>
              {t === 'image' ? '🖼' : '▶'} {t}
            </button>
          ))}
        </div>
      </div>

      {urlMode && (
        <div className="flex gap-2 mt-3">
          <input
            value={urlDraft} onChange={e => setUrlDraft(e.target.value)}
            placeholder="https://res.cloudinary.com/…"
            style={{ flex: 1, background: BG, border: `1px solid ${GOLD}`, borderRadius: '8px', padding: '8px 12px', color: TEXT, fontSize: '12px', fontFamily: FONT, outline: 'none' }}
            onKeyDown={e => { if (e.key === 'Enter') saveUrl(); }}
          />
          <button onClick={saveUrl} style={{ background: GOLD, border: 'none', borderRadius: '8px', padding: '8px 14px', color: '#fff', fontWeight: 700, fontSize: '12px', cursor: 'pointer', fontFamily: FONT }}>
            OK
          </button>
          <button onClick={() => setUrlMode(false)} style={{ background: 'none', border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '8px 10px', color: MUTED, cursor: 'pointer' }}>
            <X size={13} />
          </button>
        </div>
      )}
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
    const res = await fetch(apiUrl('/api/admin/hero-settings'), {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      credentials: 'include', body: JSON.stringify(patch),
    });
    if (!res.ok) { toast.error('Erreur de sauvegarde'); return; }
    setHero(prev => ({ ...prev, ...patch }));
    toast('Hero mis à jour');
  };

  if (loading) {
    return <p style={{ color: MUTED, fontFamily: FONT, fontSize: '13px' }}>Chargement…</p>;
  }

  return (
    <div className="flex flex-col gap-5 max-w-[640px]">

      {/* ── Hero section ── */}
      <div className="rounded-2xl p-5" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
        <p style={{ color: GOLD, fontSize: '14px', fontWeight: 700, fontFamily: FONT, marginBottom: '4px' }}>
          Hero — Page d'accueil
        </p>
        <p style={{ color: MUTED, fontSize: '12px', fontFamily: FONT, marginBottom: '20px' }}>
          Personnalisez le visuel et les textes de la bannière principale.
        </p>
        <div className="flex flex-col gap-3">

          <HeroMediaField
            value={hero.mediaUrl}
            mediaType={hero.mediaType}
            onSave={(url, type) => saveHero({ mediaUrl: url, mediaType: type })}
          />

          <EditableField
            label="Badge (texte petite pastille)"
            icon={<span style={{ fontSize: '10px' }}>✦</span>}
            value={hero.badge}
            onSave={v => saveHero({ badge: v })}
          />
          <div className="grid grid-cols-2 gap-3">
            <EditableField
              label="Titre — ligne 1 (blanc)"
              icon={<span style={{ fontSize: '10px', color: TEXT }}>T</span>}
              value={hero.title1}
              onSave={v => saveHero({ title1: v })}
            />
            <EditableField
              label="Titre — ligne 2 (or)"
              icon={<span style={{ fontSize: '10px', color: GOLD }}>T</span>}
              value={hero.title2}
              onSave={v => saveHero({ title2: v })}
            />
          </div>
          <EditableField
            label="Sous-titre / Description"
            icon={<Pencil size={13} color={MUTED} />}
            value={hero.subtitle}
            onSave={v => saveHero({ subtitle: v })}
            multiline
          />
          <div className="grid grid-cols-2 gap-3">
            <EditableField
              label="Bouton principal"
              icon={<span style={{ fontSize: '10px' }}>→</span>}
              value={hero.cta1}
              onSave={v => saveHero({ cta1: v })}
            />
            <EditableField
              label="Bouton secondaire"
              icon={<span style={{ fontSize: '10px' }}>○</span>}
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
            style={{ background: 'rgba(201,162,39,0.08)', border: '1px solid rgba(201,162,39,0.2)', color: GOLD, fontSize: '11px', fontWeight: 700, fontFamily: FONT, cursor: 'pointer' }}>
            <Link size={11} /> Gérer dans Livraison
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
