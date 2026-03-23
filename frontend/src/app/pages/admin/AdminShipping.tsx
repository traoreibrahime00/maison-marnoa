import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Pencil, Trash2, Check, X, ToggleLeft, ToggleRight, Truck, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { apiUrl } from '../../lib/api';
import { useColors } from '../../context/AppContext';

interface ShippingZone {
  id: string;
  name: string;
  zoneKey: string;
  description: string;
  icon: string;
  price: number;
  isFree: boolean;
  isActive: boolean;
  sortOrder: number;
}

interface ShippingSettings {
  freeThreshold: number;
  freeZone: string;
  codEnabled: boolean;
}

const emptyZone = (): Omit<ShippingZone, 'id' | 'createdAt' | 'updatedAt'> => ({
  name: '', zoneKey: '', description: '', icon: '🚚', price: 0, isFree: false, isActive: true, sortOrder: 0,
});

export default function AdminShipping() {
  const { BG, CARD_BG, BORDER, TEXT, MUTED, GOLD } = useColors();
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [settings, setSettings] = useState<ShippingSettings>({ freeThreshold: 50000, freeZone: 'abidjan', codEnabled: true });
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | 'new' | null>(null);
  const [form, setForm] = useState(emptyZone());
  const [saving, setSaving] = useState(false);
  const [editingSettings, setEditingSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState<ShippingSettings>({ freeThreshold: 50000, freeZone: 'abidjan', codEnabled: true });

  const fetchData = async () => {
    try {
      const res = await fetch(apiUrl('/api/admin/shipping'), { credentials: 'include' });
      const data = await res.json() as { zones: ShippingZone[] } & ShippingSettings;
      setZones(data.zones ?? []);
      const s = { freeThreshold: data.freeThreshold, freeZone: data.freeZone, codEnabled: data.codEnabled };
      setSettings(s);
      setSettingsForm(s);
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const startEdit = (zone: ShippingZone) => {
    setEditingId(zone.id);
    setForm({ name: zone.name, zoneKey: zone.zoneKey, description: zone.description, icon: zone.icon, price: zone.price, isFree: zone.isFree, isActive: zone.isActive, sortOrder: zone.sortOrder });
  };

  const startNew = () => {
    setEditingId('new');
    setForm(emptyZone());
  };

  const cancelEdit = () => { setEditingId(null); };

  const saveZone = async () => {
    if (!form.name || !form.zoneKey) { toast.error('Nom et clé requis'); return; }
    setSaving(true);
    try {
      const isNew = editingId === 'new';
      const url = isNew ? apiUrl('/api/admin/shipping/zones') : apiUrl(`/api/admin/shipping/zones/${editingId}`);
      const res = await fetch(url, {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success(isNew ? 'Zone créée' : 'Zone mise à jour');
      setEditingId(null);
      await fetchData();
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const deleteZone = async (id: string) => {
    if (!confirm('Supprimer cette zone ?')) return;
    try {
      await fetch(apiUrl(`/api/admin/shipping/zones/${id}`), { method: 'DELETE', credentials: 'include' });
      toast.success('Zone supprimée');
      await fetchData();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const toggleActive = async (zone: ShippingZone) => {
    await fetch(apiUrl(`/api/admin/shipping/zones/${zone.id}`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ isActive: !zone.isActive }),
    });
    await fetchData();
  };

  const toggleFree = async (zone: ShippingZone) => {
    await fetch(apiUrl(`/api/admin/shipping/zones/${zone.id}`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ isFree: !zone.isFree }),
    });
    await fetchData();
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch(apiUrl('/api/admin/shipping/settings'), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(settingsForm),
      });
      if (!res.ok) throw new Error();
      toast.success('Paramètres mis à jour');
      setEditingSettings(false);
      await fetchData();
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-yellow-600/30 border-t-yellow-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Manrope, sans-serif', color: TEXT }} className="p-6 max-w-3xl">

      {/* ── Paramètres globaux ── */}
      <div className="rounded-2xl mb-6 overflow-hidden" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${BORDER}` }}>
          <div className="flex items-center gap-2">
            <Settings size={16} color={GOLD} />
            <span style={{ fontWeight: 700, fontSize: '14px' }}>Paramètres de livraison</span>
          </div>
          {!editingSettings && (
            <motion.button
              onClick={() => setEditingSettings(true)}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
              style={{ background: 'rgba(201,162,39,0.1)', color: GOLD, fontSize: '12px', fontWeight: 600 }}
            >
              <Pencil size={12} /> Modifier
            </motion.button>
          )}
        </div>

        <div className="px-5 py-5 flex flex-col gap-5">
          {editingSettings ? (
            <>
              {/* Livraison gratuite */}
              <div className="rounded-xl p-4 flex flex-col gap-4" style={{ background: BG, border: `1px solid ${BORDER}` }}>
                <div className="flex items-start gap-3">
                  <span style={{ fontSize: '20px' }}>🎁</span>
                  <div className="flex-1">
                    <p style={{ color: TEXT, fontWeight: 700, fontSize: '13px', marginBottom: 2 }}>Livraison gratuite à partir de</p>
                    <p style={{ color: MUTED, fontSize: '11px', lineHeight: 1.6 }}>
                      Au-delà de ce montant d'achat, la livraison devient offerte sur la zone sélectionnée. Mettez <strong style={{ color: TEXT }}>0</strong> pour désactiver.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={{ color: MUTED, fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: 5 }}>Montant minimum (XOF)</label>
                    <input
                      type="number" min={0} step={1000}
                      value={settingsForm.freeThreshold}
                      onChange={e => setSettingsForm(f => ({ ...f, freeThreshold: Number(e.target.value) }))}
                      className="w-full px-4 py-2.5 rounded-xl outline-none"
                      style={{ background: CARD_BG, border: `1px solid ${BORDER}`, color: TEXT, fontSize: '14px', fontFamily: 'Manrope, sans-serif' }}
                    />
                    {settingsForm.freeThreshold === 0 && (
                      <p style={{ color: '#f59e0b', fontSize: '10px', marginTop: 4 }}>⚠ Livraison gratuite désactivée</p>
                    )}
                  </div>
                  <div>
                    <label style={{ color: MUTED, fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: 5 }}>Zone(s) concernée(s)</label>
                    <select
                      value={settingsForm.freeZone}
                      onChange={e => setSettingsForm(f => ({ ...f, freeZone: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl outline-none"
                      style={{ background: CARD_BG, border: `1px solid ${BORDER}`, color: TEXT, fontSize: '14px', fontFamily: 'Manrope, sans-serif' }}
                    >
                      <option value="all">Toutes les zones de livraison</option>
                      {zones.map(z => (
                        <option key={z.zoneKey} value={z.zoneKey}>{z.icon} {z.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Paiement à la livraison */}
              <div className="rounded-xl p-4" style={{ background: BG, border: `1px solid ${BORDER}` }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <span style={{ fontSize: '20px' }}>💵</span>
                    <div>
                      <p style={{ color: TEXT, fontWeight: 700, fontSize: '13px', marginBottom: 2 }}>Paiement à la livraison (COD)</p>
                      <p style={{ color: MUTED, fontSize: '11px', lineHeight: 1.6 }}>
                        Permet aux clients de payer en espèces ou mobile money au moment de la réception du colis.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSettingsForm(f => ({ ...f, codEnabled: !f.codEnabled }))}
                    style={{ color: settingsForm.codEnabled ? '#22c55e' : MUTED, flexShrink: 0, marginLeft: 12 }}
                  >
                    {settingsForm.codEnabled ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <motion.button onClick={saveSettings} disabled={saving} whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl"
                  style={{ background: 'linear-gradient(135deg,#C9A227,#E8C84A)', color: '#fff', fontWeight: 700, fontSize: '13px' }}>
                  {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check size={13} />}
                  Enregistrer
                </motion.button>
                <button onClick={() => { setEditingSettings(false); setSettingsForm(settings); }}
                  className="px-4 py-2 rounded-xl" style={{ border: `1px solid ${BORDER}`, color: MUTED, fontSize: '13px' }}>
                  Annuler
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              {/* Livraison gratuite card */}
              <div className="flex items-center gap-4 rounded-xl px-4 py-3" style={{ background: BG, border: `1px solid ${BORDER}` }}>
                <span style={{ fontSize: '22px' }}>🎁</span>
                <div className="flex-1">
                  <p style={{ color: MUTED, fontSize: '11px', fontWeight: 600, marginBottom: 2 }}>Livraison offerte dès</p>
                  <p style={{ color: TEXT, fontWeight: 800, fontSize: '16px' }}>
                    {settings.freeThreshold > 0 ? `${settings.freeThreshold.toLocaleString()} XOF` : <span style={{ color: MUTED, fontWeight: 400, fontSize: '13px' }}>Désactivée</span>}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: MUTED, fontSize: '11px', fontWeight: 600, marginBottom: 2 }}>Pour la zone</p>
                  <p style={{ color: GOLD, fontWeight: 700, fontSize: '13px' }}>
                    {settings.freeZone === 'all'
                      ? 'Toutes les zones'
                      : zones.find(z => z.zoneKey === settings.freeZone)
                        ? `${zones.find(z => z.zoneKey === settings.freeZone)!.icon} ${zones.find(z => z.zoneKey === settings.freeZone)!.name}`
                        : settings.freeZone}
                  </p>
                </div>
              </div>

              {/* COD card */}
              <div className="flex items-center gap-4 rounded-xl px-4 py-3" style={{ background: BG, border: `1px solid ${BORDER}` }}>
                <span style={{ fontSize: '22px' }}>💵</span>
                <div className="flex-1">
                  <p style={{ color: MUTED, fontSize: '11px', fontWeight: 600, marginBottom: 2 }}>Paiement à la livraison</p>
                  <p style={{ color: settings.codEnabled ? '#22c55e' : '#ef4444', fontWeight: 700, fontSize: '13px' }}>
                    {settings.codEnabled ? '✓ Activé — les clients peuvent payer à la réception' : '✗ Désactivé — paiement Wave uniquement'}
                  </p>
                </div>
                {settings.codEnabled ? <ToggleRight size={24} color="#22c55e" /> : <ToggleLeft size={24} color={MUTED} />}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Zones ── */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Truck size={16} color={GOLD} />
          <span style={{ fontWeight: 700, fontSize: '15px' }}>Zones de livraison</span>
        </div>
        <motion.button
          onClick={startNew}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
          style={{ background: 'linear-gradient(135deg,#C9A227,#E8C84A)', color: '#fff', fontWeight: 700, fontSize: '12px' }}
        >
          <Plus size={14} /> Ajouter une zone
        </motion.button>
      </div>

      <div className="flex flex-col gap-3">
        {/* New zone form */}
        <AnimatePresence>
          {editingId === 'new' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="rounded-2xl p-5"
              style={{ background: CARD_BG, border: `1.5px solid ${GOLD}` }}
            >
              <ZoneForm form={form} setForm={setForm} onSave={saveZone} onCancel={cancelEdit} saving={saving}
                bg={BG} border={BORDER} textColor={TEXT} muted={MUTED} gold={GOLD} />
            </motion.div>
          )}
        </AnimatePresence>

        {zones.map(zone => (
          <motion.div
            key={zone.id}
            layout
            className="rounded-2xl overflow-hidden"
            style={{ background: CARD_BG, border: `1px solid ${editingId === zone.id ? GOLD : BORDER}` }}
          >
            {editingId === zone.id ? (
              <div className="p-5">
                <ZoneForm form={form} setForm={setForm} onSave={saveZone} onCancel={cancelEdit} saving={saving}
                  bg={BG} border={BORDER} textColor={TEXT} muted={MUTED} gold={GOLD} />
              </div>
            ) : (
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <span style={{ fontSize: '22px' }}>{zone.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <p style={{ color: TEXT, fontWeight: 700, fontSize: '14px' }}>{zone.name}</p>
                      {!zone.isActive && (
                        <span className="px-2 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '10px', fontWeight: 700 }}>Inactif</span>
                      )}
                      {zone.isFree && (
                        <span className="px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', fontSize: '10px', fontWeight: 700 }}>Gratuit</span>
                      )}
                    </div>
                    <p style={{ color: MUTED, fontSize: '11px' }}>{zone.description} · clé : <code style={{ color: GOLD }}>{zone.zoneKey}</code></p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ color: zone.isFree ? '#22c55e' : GOLD, fontWeight: 800, fontSize: '14px', minWidth: 80, textAlign: 'right' }}>
                    {zone.isFree ? 'Gratuit' : `${zone.price.toLocaleString()} XOF`}
                  </span>
                  <button onClick={() => toggleActive(zone)} title={zone.isActive ? 'Désactiver' : 'Activer'}
                    style={{ color: zone.isActive ? '#22c55e' : MUTED }}>
                    {zone.isActive ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                  </button>
                  <button onClick={() => toggleFree(zone)} title={zone.isFree ? 'Mettre payant' : 'Rendre gratuit'}
                    className="px-2 py-1 rounded-lg text-xs font-bold"
                    style={{ background: zone.isFree ? 'rgba(34,197,94,0.1)' : 'rgba(201,162,39,0.08)', color: zone.isFree ? '#22c55e' : GOLD, fontSize: '10px' }}>
                    {zone.isFree ? '✓ Gratuit' : 'Rendre gratuit'}
                  </button>
                  <button onClick={() => startEdit(zone)} style={{ color: MUTED }} title="Modifier">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => deleteZone(zone.id)} style={{ color: '#ef4444' }} title="Supprimer">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ))}

        {zones.length === 0 && editingId !== 'new' && (
          <div className="text-center py-12 rounded-2xl" style={{ border: `1px dashed ${BORDER}` }}>
            <p style={{ color: MUTED, fontSize: '14px' }}>Aucune zone configurée</p>
            <p style={{ color: MUTED, fontSize: '12px', marginTop: 4 }}>Cliquez sur "Ajouter une zone" pour commencer</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ZoneForm({
  form, setForm, onSave, onCancel, saving,
  bg, border, textColor, muted, gold,
}: {
  form: ReturnType<typeof emptyZone>;
  setForm: React.Dispatch<React.SetStateAction<ReturnType<typeof emptyZone>>>;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  bg: string; border: string; textColor: string; muted: string; gold: string;
}) {
  const inputStyle = { background: bg, border: `1px solid ${border}`, color: textColor, fontSize: '13px', fontFamily: 'Manrope, sans-serif' };
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label style={{ color: muted, fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: 5 }}>Nom affiché *</label>
          <input type="text" placeholder="Abidjan Express" value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-xl outline-none" style={inputStyle} />
        </div>
        <div>
          <label style={{ color: muted, fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: 5 }}>Clé unique * <span style={{ fontWeight: 400 }}>(ex: abidjan)</span></label>
          <input type="text" placeholder="abidjan" value={form.zoneKey}
            onChange={e => setForm(f => ({ ...f, zoneKey: e.target.value.toLowerCase().replace(/\s+/g, '_') }))}
            className="w-full px-3 py-2.5 rounded-xl outline-none" style={inputStyle} />
        </div>
        <div>
          <label style={{ color: muted, fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: 5 }}>Description</label>
          <input type="text" placeholder="Livraison sous 24h" value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-xl outline-none" style={inputStyle} />
        </div>
        <div>
          <label style={{ color: muted, fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: 5 }}>Prix (XOF)</label>
          <input type="number" min={0} value={form.price}
            onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
            className="w-full px-3 py-2.5 rounded-xl outline-none" style={inputStyle} />
        </div>
        <div>
          <label style={{ color: muted, fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: 5 }}>Icône (emoji)</label>
          <input type="text" value={form.icon}
            onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-xl outline-none" style={inputStyle} />
        </div>
        <div>
          <label style={{ color: muted, fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: 5 }}>Ordre d'affichage</label>
          <input type="number" value={form.sortOrder}
            onChange={e => setForm(f => ({ ...f, sortOrder: Number(e.target.value) }))}
            className="w-full px-3 py-2.5 rounded-xl outline-none" style={inputStyle} />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
          <span style={{ color: textColor, fontSize: '13px' }}>Active</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.isFree} onChange={e => setForm(f => ({ ...f, isFree: e.target.checked }))} />
          <span style={{ color: textColor, fontSize: '13px' }}>Toujours gratuite</span>
        </label>
      </div>
      <div className="flex gap-2">
        <motion.button onClick={onSave} disabled={saving} whileTap={{ scale: 0.97 }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl"
          style={{ background: `linear-gradient(135deg,${gold},#E8C84A)`, color: '#fff', fontWeight: 700, fontSize: '13px' }}>
          {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check size={13} />}
          Enregistrer
        </motion.button>
        <button onClick={onCancel} className="flex items-center gap-1.5 px-4 py-2 rounded-xl"
          style={{ border: `1px solid ${border}`, color: muted, fontSize: '13px' }}>
          <X size={13} /> Annuler
        </button>
      </div>
    </div>
  );
}
