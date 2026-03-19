import { useEffect, useState } from 'react';
import { Plus, Trash2, ToggleLeft, ToggleRight, Tag, Info } from 'lucide-react';
import { apiUrl } from '../../lib/api';

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
const S = {
  card:    { background: '#1E1A12', border: '1px solid #3A2E1E', borderRadius: '16px', padding: '20px' } as React.CSSProperties,
  label:   { color: '#9A8A74', fontSize: '11px', fontWeight: 700, fontFamily: FONT, marginBottom: '6px', display: 'block', letterSpacing: '0.5px' } as React.CSSProperties,
  input:   { background: '#2A2218', border: '1px solid #3A2E1E', color: '#F5EFE0', borderRadius: '10px', padding: '10px 12px', fontSize: '13px', fontFamily: FONT, width: '100%', outline: 'none' } as React.CSSProperties,
  btn:     { background: 'linear-gradient(135deg,#C9A227,#E8C84A)', color: '#fff', fontWeight: 700, fontSize: '13px', fontFamily: FONT, padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer' } as React.CSSProperties,
  btnGhost:{ background: 'transparent', border: '1px solid #3A2E1E', color: '#9A8A74', fontWeight: 600, fontSize: '12px', fontFamily: FONT, padding: '8px 14px', borderRadius: '8px', cursor: 'pointer' } as React.CSSProperties,
  h2:      { color: '#C9A227', fontSize: '14px', fontWeight: 700, fontFamily: FONT, marginBottom: '16px' } as React.CSSProperties,
  text:    { color: '#F5EFE0', fontSize: '13px', fontFamily: FONT } as React.CSSProperties,
  muted:   { color: '#9A8A74', fontSize: '11px', fontFamily: FONT } as React.CSSProperties,
};

export default function AdminSettings() {
  const [promos, setPromos]     = useState<PromoCode[]>([]);
  const [loading, setLoading]   = useState(true);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    code: '', discount: '10', maxUses: '', expiresAt: '',
  });
  const [formError, setFormError] = useState('');

  const loadPromos = async () => {
    try {
      const res = await fetch(apiUrl('/api/promos'));
      if (res.ok) setPromos(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPromos(); }, []);

  const handleCreate = async () => {
    if (!form.code.trim() || !form.discount) {
      setFormError('Code et remise requis.');
      return;
    }
    setCreating(true);
    setFormError('');
    try {
      const res = await fetch(apiUrl('/api/promos'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: form.code.toUpperCase().trim(),
          discount: Number(form.discount),
          maxUses: form.maxUses ? Number(form.maxUses) : undefined,
          expiresAt: form.expiresAt || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json() as { error?: string };
        setFormError(err.error ?? 'Erreur création');
        return;
      }
      setForm({ code: '', discount: '10', maxUses: '', expiresAt: '' });
      await loadPromos();
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (promo: PromoCode) => {
    await fetch(apiUrl(`/api/promos/${promo.id}/toggle`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !promo.isActive }),
    });
    await loadPromos();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce code promo ?')) return;
    await fetch(apiUrl(`/api/promos/${id}`), { method: 'DELETE' });
    setPromos(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="grid gap-6 max-w-[900px]">

      {/* ── Config info ── */}
      <div style={S.card}>
        <h2 style={S.h2}>⚙️ Configuration boutique</h2>
        <div className="flex items-start gap-2 p-3 rounded-xl" style={{ background: 'rgba(201,162,39,0.06)', border: '1px solid rgba(201,162,39,0.15)' }}>
          <Info size={14} color="#C9A227" className="mt-0.5 flex-shrink-0" />
          <p style={{ ...S.muted, lineHeight: 1.6 }}>
            Les paramètres suivants (numéro WhatsApp admin, seuil livraison gratuite) sont configurés via les variables d'environnement dans <code style={{ background: '#2A2218', padding: '1px 5px', borderRadius: '4px', color: '#C9A227' }}>backend/.env</code>.
            Modifiez <strong style={{ color: '#F5EFE0' }}>ADMIN_WHATSAPP_NUMBER</strong> et <strong style={{ color: '#F5EFE0' }}>VITE_WA_NUMBER</strong> dans votre fichier <code style={{ background: '#2A2218', padding: '1px 5px', borderRadius: '4px', color: '#C9A227' }}>.env</code> racine.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          {[
            { label: 'Seuil livraison gratuite', value: '50 000 FCFA (Abidjan Express)' },
            { label: 'Frais emballage cadeau',   value: '2 500 FCFA' },
            { label: 'Livraison Abidjan',        value: '3 000 FCFA' },
            { label: 'Livraison nationale',      value: '5 000 FCFA' },
          ].map(item => (
            <div key={item.label} className="rounded-xl p-3" style={{ background: '#2A2218' }}>
              <p style={S.muted}>{item.label}</p>
              <p style={{ ...S.text, fontWeight: 700, marginTop: '2px' }}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Codes promo ── */}
      <div style={S.card}>
        <h2 style={S.h2}><Tag size={14} style={{ display: 'inline', marginRight: '6px' }} />Codes promo</h2>

        {/* Form création */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div>
            <label style={S.label}>CODE *</label>
            <input
              style={S.input} placeholder="MARNOA20"
              value={form.code}
              onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
            />
          </div>
          <div>
            <label style={S.label}>REMISE % *</label>
            <input
              style={S.input} type="number" min="1" max="100" placeholder="10"
              value={form.discount}
              onChange={e => setForm(f => ({ ...f, discount: e.target.value }))}
            />
          </div>
          <div>
            <label style={S.label}>MAX UTILISATIONS</label>
            <input
              style={S.input} type="number" min="1" placeholder="illimité"
              value={form.maxUses}
              onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))}
            />
          </div>
          <div>
            <label style={S.label}>EXPIRATION</label>
            <input
              style={S.input} type="date"
              value={form.expiresAt}
              onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
            />
          </div>
        </div>

        {formError && (
          <p style={{ color: '#ef4444', fontSize: '11px', fontFamily: FONT, marginBottom: '8px' }}>{formError}</p>
        )}

        <button
          onClick={handleCreate}
          disabled={creating}
          style={{ ...S.btn, opacity: creating ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={14} />
          {creating ? 'Création…' : 'Créer le code'}
        </button>

        {/* Liste */}
        <div className="mt-5 rounded-xl overflow-hidden" style={{ border: '1px solid #3A2E1E' }}>
          <div className="grid px-4 py-2.5" style={{ gridTemplateColumns: '140px 80px 100px 100px 120px 1fr', background: '#2A2218', borderBottom: '1px solid #3A2E1E' }}>
            {['Code', 'Remise', 'Utilisations', 'Expiration', 'Statut', ''].map(h => (
              <span key={h} style={{ ...S.muted, fontWeight: 700, letterSpacing: '0.5px' }}>{h}</span>
            ))}
          </div>

          {loading ? (
            <div className="px-4 py-4" style={S.muted}>Chargement…</div>
          ) : promos.length === 0 ? (
            <div className="px-4 py-4" style={S.muted}>Aucun code promo. Créez le premier ci-dessus.</div>
          ) : (
            promos.map((promo, idx) => (
              <div
                key={promo.id}
                className="grid items-center px-4 py-3"
                style={{ gridTemplateColumns: '140px 80px 100px 100px 120px 1fr', background: idx % 2 ? '#1A1410' : '#1E1A12', borderBottom: '1px solid #2A2218' }}
              >
                <span style={{ color: '#C9A227', fontSize: '12px', fontWeight: 700, fontFamily: FONT }}>{promo.code}</span>
                <span style={{ color: '#F5EFE0', fontSize: '12px', fontWeight: 700, fontFamily: FONT }}>−{promo.discount}%</span>
                <span style={{ ...S.muted }}>
                  {promo.usedCount}{promo.maxUses != null ? ` / ${promo.maxUses}` : ''}
                </span>
                <span style={{ ...S.muted }}>
                  {promo.expiresAt ? new Date(promo.expiresAt).toLocaleDateString('fr-CI') : '∞'}
                </span>
                <span
                  className="px-2 py-1 rounded-lg inline-block text-center"
                  style={{ fontSize: '10px', fontWeight: 700, fontFamily: FONT, color: promo.isActive ? '#22c55e' : '#9A8A74', background: promo.isActive ? 'rgba(34,197,94,0.12)' : 'rgba(154,138,116,0.12)' }}
                >
                  {promo.isActive ? 'Actif' : 'Désactivé'}
                </span>
                <div className="flex items-center gap-2 justify-end">
                  <button
                    onClick={() => handleToggle(promo)}
                    title={promo.isActive ? 'Désactiver' : 'Activer'}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: promo.isActive ? '#22c55e' : '#9A8A74' }}
                  >
                    {promo.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                  </button>
                  <button
                    onClick={() => handleDelete(promo.id)}
                    title="Supprimer"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
