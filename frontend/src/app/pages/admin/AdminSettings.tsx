import { useEffect, useState } from 'react';
import { MessageCircle, Truck, Gift, Pencil, Check, X, Link } from 'lucide-react';
import { apiUrl } from '../../lib/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { useColors } from '../../context/AppContext';

const FONT = 'Manrope, sans-serif';

type GeneralSettings = { waNumber: string; giftWrapFee: number };
type ShippingInfo    = { freeThreshold: number; freeZone: string };

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
  label, icon, value, suffix = '', type = 'text', onSave,
}: {
  label: string; icon: React.ReactNode; value: string; suffix?: string; type?: string;
  onSave: (val: string) => Promise<void>;
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
        <div className="flex items-center gap-2">
          <input
            style={{ flex: 1, background: 'transparent', border: `1px solid ${GOLD}`, color: TEXT, borderRadius: '8px', padding: '8px 12px', fontSize: '13px', fontFamily: FONT, outline: 'none' }}
            type={type}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            autoFocus
            onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel(); }}
          />
          {suffix && <span style={{ color: MUTED, fontSize: '12px', fontFamily: FONT, flexShrink: 0 }}>{suffix}</span>}
          <button onClick={save} disabled={saving} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#22c55e' }}>
            {saving ? '…' : <Check size={16} />}
          </button>
          <button onClick={cancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <p style={{ color: TEXT, fontSize: '13px', fontWeight: 700, fontFamily: FONT }}>
            {value}{suffix}
          </p>
          <button onClick={() => { setDraft(value); setEditing(true); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED }}>
            <Pencil size={13} />
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
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(apiUrl('/api/admin/general-settings'), { credentials: 'include' }).then(r => r.json()),
      fetch(apiUrl('/api/shipping/zones')).then(r => r.json()),
    ]).then(([gen, ship]: [GeneralSettings, { freeThreshold: number; freeZone: string }]) => {
      setSettings(gen);
      setShipping({ freeThreshold: ship.freeThreshold, freeZone: ship.freeZone });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const save = async (key: keyof GeneralSettings, rawVal: string) => {
    const body = key === 'giftWrapFee'
      ? { giftWrapFee: Number(rawVal) }
      : { waNumber: rawVal.replace(/\D/g, '') };

    const res = await fetch(apiUrl('/api/admin/general-settings'), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
    if (!res.ok) { toast.error('Erreur de sauvegarde'); return; }
    const updated = await res.json() as GeneralSettings;
    setSettings(updated);
    toast('Paramètre mis à jour');
  };

  if (loading) {
    return <p style={{ color: MUTED, fontFamily: FONT, fontSize: '13px' }}>Chargement…</p>;
  }

  return (
    <div className="flex flex-col gap-5 max-w-[640px]">

      {/* Editable settings */}
      <div className="rounded-2xl p-5" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
        <p style={{ color: GOLD, fontSize: '14px', fontWeight: 700, fontFamily: FONT, marginBottom: '4px' }}>
          Paramètres modifiables
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

      {/* Info-only: shipping */}
      <div className="rounded-2xl p-5" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
        <div className="flex items-center justify-between mb-4">
          <p style={{ color: GOLD, fontSize: '14px', fontWeight: 700, fontFamily: FONT }}>
            Livraison
          </p>
          <button
            onClick={() => navigate('/admin/shipping')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
            style={{ background: 'rgba(201,162,39,0.08)', border: '1px solid rgba(201,162,39,0.2)', color: GOLD, fontSize: '11px', fontWeight: 700, fontFamily: FONT, cursor: 'pointer' }}
          >
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
              {shipping && shipping.freeThreshold > 0
                ? `${shipping.freeThreshold.toLocaleString('fr-CI')} FCFA`
                : 'Désactivé'}
            </p>
            {shipping && shipping.freeZone && shipping.freeThreshold > 0 && (
              <p style={{ color: MUTED, fontSize: '10px', fontFamily: FONT, marginTop: '3px' }}>Zone : {shipping.freeZone}</p>
            )}
          </div>
          <div className="rounded-xl p-4" style={{ background: BG, border: `1px solid ${BORDER}` }}>
            <div className="flex items-center gap-2 mb-2">
              <Truck size={13} color={GOLD} />
              <p style={{ color: MUTED, fontSize: '10px', fontWeight: 700, fontFamily: FONT, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Zones actives</p>
            </div>
            <p style={{ color: TEXT, fontSize: '13px', fontWeight: 700, fontFamily: FONT }}>
              Voir dans Livraison
            </p>
            <p style={{ color: MUTED, fontSize: '10px', fontFamily: FONT, marginTop: '3px' }}>Prix et disponibilité</p>
          </div>
        </div>
      </div>

    </div>
  );
}
