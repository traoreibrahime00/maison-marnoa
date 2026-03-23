import { useEffect, useState } from 'react';
import { Plus, Trash2, ToggleLeft, ToggleRight, RefreshCw } from 'lucide-react';
import { apiUrl } from '../../lib/api';
import { toast } from 'sonner';
import { useColors } from '../../context/AppContext';

type PromoCode = {
  id: string;
  code: string;
  discount: number;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
};

const FONT = 'Manrope, sans-serif';

export default function AdminPromos() {
  const { BG, CARD_BG, BORDER, TEXT, MUTED, GOLD } = useColors();
  const S = {
    card:  { background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: '16px', padding: '20px' } as React.CSSProperties,
    label: { color: MUTED, fontSize: '11px', fontWeight: 700, fontFamily: FONT, marginBottom: '6px', display: 'block', letterSpacing: '0.5px', textTransform: 'uppercase' as const },
    input: { background: BG, border: `1px solid ${BORDER}`, color: TEXT, borderRadius: '10px', padding: '10px 12px', fontSize: '13px', fontFamily: FONT, width: '100%', outline: 'none' } as React.CSSProperties,
  };
  const [promos, setPromos]     = useState<PromoCode[]>([]);
  const [loading, setLoading]   = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm]         = useState({ code: '', discount: '10', maxUses: '', expiresAt: '' });
  const [formError, setFormError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/promos'), { credentials: 'include' });
      if (res.ok) setPromos(await res.json() as PromoCode[]);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.code.trim() || !form.discount) { setFormError('Code et remise requis.'); return; }
    setCreating(true); setFormError('');
    try {
      const res = await fetch(apiUrl('/api/promos'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          code: form.code.toUpperCase().trim(),
          discount: Number(form.discount),
          maxUses: form.maxUses ? Number(form.maxUses) : undefined,
          expiresAt: form.expiresAt || undefined,
        }),
      });
      if (!res.ok) { setFormError(((await res.json()) as { error?: string }).error ?? 'Erreur'); return; }
      toast('Code promo créé !');
      setForm({ code: '', discount: '10', maxUses: '', expiresAt: '' });
      await load();
    } finally { setCreating(false); }
  };

  const handleToggle = async (promo: PromoCode) => {
    await fetch(apiUrl(`/api/promos/${promo.id}/toggle`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ isActive: !promo.isActive }),
    });
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce code promo ?')) return;
    await fetch(apiUrl(`/api/promos/${id}`), { method: 'DELETE', credentials: 'include' });
    setPromos(prev => prev.filter(p => p.id !== id));
    toast('Code supprimé');
  };

  return (
    <div className="flex flex-col gap-5 max-w-[820px]">

      {/* Créer un code */}
      <div style={S.card}>
        <p style={{ color: GOLD, fontSize: '14px', fontWeight: 700, fontFamily: FONT, marginBottom: '16px' }}>
          Nouveau code promo
        </p>
        <div className="grid grid-cols-2 gap-3 mb-3 lg:grid-cols-4">
          <div>
            <label style={S.label}>Code *</label>
            <input style={S.input} placeholder="MARNOA20"
              value={form.code}
              onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
            />
          </div>
          <div>
            <label style={S.label}>Remise % *</label>
            <input style={S.input} type="number" min="1" max="100" placeholder="10"
              value={form.discount}
              onChange={e => setForm(f => ({ ...f, discount: e.target.value }))}
            />
          </div>
          <div>
            <label style={S.label}>Max utilisations</label>
            <input style={S.input} type="number" min="1" placeholder="illimité"
              value={form.maxUses}
              onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))}
            />
          </div>
          <div>
            <label style={S.label}>Expiration</label>
            <input style={S.input} type="date"
              value={form.expiresAt}
              onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
            />
          </div>
        </div>
        {formError && <p style={{ color: '#ef4444', fontSize: '11px', fontFamily: FONT, marginBottom: '8px' }}>{formError}</p>}
        <button
          onClick={handleCreate} disabled={creating}
          style={{ background: 'linear-gradient(135deg,#C9A227,#E8C84A)', color: '#fff', fontWeight: 700, fontSize: '13px', fontFamily: FONT, padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: creating ? 'not-allowed' : 'pointer', opacity: creating ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={14} /> {creating ? 'Création…' : 'Créer le code'}
        </button>
      </div>

      {/* Liste */}
      <div style={S.card}>
        <div className="flex items-center justify-between mb-4">
          <p style={{ color: GOLD, fontSize: '14px', fontWeight: 700, fontFamily: FONT }}>
            Codes actifs ({promos.length})
          </p>
          <button onClick={load} style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED }}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {loading ? (
          <p style={{ color: MUTED, fontSize: '12px', fontFamily: FONT }}>Chargement…</p>
        ) : promos.length === 0 ? (
          <p style={{ color: MUTED, fontSize: '12px', fontFamily: FONT }}>Aucun code promo. Créez-en un ci-dessus.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {promos.map(promo => (
              <div key={promo.id}
                className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl"
                style={{ background: BG, border: `1px solid ${BORDER}` }}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <span style={{ color: GOLD, fontSize: '13px', fontWeight: 800, fontFamily: FONT, letterSpacing: '1px', flexShrink: 0 }}>{promo.code}</span>
                  <span style={{ color: TEXT, fontSize: '13px', fontWeight: 700, fontFamily: FONT, flexShrink: 0 }}>−{promo.discount}%</span>
                  <span style={{ color: MUTED, fontSize: '11px', fontFamily: FONT }}>
                    {promo.usedCount}{promo.maxUses != null ? `/${promo.maxUses}` : ''} uses
                  </span>
                  {promo.expiresAt && (
                    <span style={{ color: MUTED, fontSize: '11px', fontFamily: FONT }}>
                      exp. {new Date(promo.expiresAt).toLocaleDateString('fr-CI')}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="px-2 py-1 rounded-lg" style={{ fontSize: '10px', fontWeight: 700, fontFamily: FONT, color: promo.isActive ? '#22c55e' : MUTED, background: promo.isActive ? 'rgba(34,197,94,0.12)' : 'rgba(154,138,116,0.12)' }}>
                    {promo.isActive ? 'Actif' : 'Inactif'}
                  </span>
                  <button onClick={() => handleToggle(promo)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: promo.isActive ? '#22c55e' : MUTED }}>
                    {promo.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                  </button>
                  <button onClick={() => handleDelete(promo.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
