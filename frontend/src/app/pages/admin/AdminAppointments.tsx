import { useEffect, useState, useCallback } from 'react';
import { Calendar, Clock, Check, X, RefreshCw, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { apiUrl } from '../../lib/api';
import { toast } from 'sonner';
import { useColors } from '../../context/AppContext';

const FONT = 'Manrope, sans-serif';

const DAY_NAMES: Record<string, string> = {
  '0': 'Dimanche', '1': 'Lundi', '2': 'Mardi', '3': 'Mercredi',
  '4': 'Jeudi', '5': 'Vendredi', '6': 'Samedi',
};
const ALL_SLOTS = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

type DayConfig = { open: boolean; slots: string[] };
type AvailConfig = Record<string, DayConfig>;

type Appt = {
  id: string; ref: string; serviceLabel: string;
  date: string; slot: string; status: string;
  customerName: string; customerPhone: string; customerEmail?: string;
  createdAt: string;
};

const STATUS_COLORS: Record<string, { color: string; bg: string; label: string }> = {
  PENDING:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  label: 'En attente' },
  CONFIRMED: { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  label: 'Confirmé'   },
  CANCELLED: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   label: 'Annulé'     },
  COMPLETED: { color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   label: 'Terminé'    },
};

export default function AdminAppointments() {
  const { BG, CARD_BG, BORDER, TEXT, MUTED, GOLD } = useColors();
  const S = {
    card:   { background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: '16px', padding: '20px' } as React.CSSProperties,
    h2:     { color: GOLD, fontSize: '14px', fontWeight: 700, fontFamily: FONT, marginBottom: '16px' } as React.CSSProperties,
    label:  { color: MUTED, fontSize: '11px', fontWeight: 700, fontFamily: FONT, letterSpacing: '0.5px' } as React.CSSProperties,
    text:   { color: TEXT, fontSize: '13px', fontFamily: FONT } as React.CSSProperties,
    muted:  { color: MUTED, fontSize: '11px', fontFamily: FONT } as React.CSSProperties,
    btn:    { background: `linear-gradient(135deg,${GOLD},#E8C84A)`, color: '#fff', fontWeight: 700, fontSize: '13px', fontFamily: FONT, padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer' } as React.CSSProperties,
  };
  const [tab, setTab] = useState<'availability' | 'appointments'>('appointments');

  // ── Availability state ──
  const [config, setConfig] = useState<AvailConfig>({});
  const [configLoading, setConfigLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ── Appointments state ──
  const [appts, setAppts] = useState<Appt[]>([]);
  const [apptLoading, setApptLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadConfig = useCallback(async () => {
    setConfigLoading(true);
    try {
      const r = await fetch(apiUrl('/api/appointments/settings'));
      if (r.ok) setConfig(await r.json() as AvailConfig);
    } finally { setConfigLoading(false); }
  }, []);

  const loadAppts = useCallback(async () => {
    setApptLoading(true);
    try {
      const r = await fetch(apiUrl('/api/appointments'));
      if (r.ok) setAppts(await r.json() as Appt[]);
    } finally { setApptLoading(false); }
  }, []);

  useEffect(() => { loadConfig(); loadAppts(); }, [loadConfig, loadAppts]);

  const toggleDay = (dow: string) => {
    setConfig(c => ({ ...c, [dow]: { ...c[dow], open: !c[dow]?.open } }));
  };

  const toggleSlot = (dow: string, slot: string) => {
    setConfig(c => {
      const current = c[dow]?.slots ?? [];
      const slots = current.includes(slot) ? current.filter(s => s !== slot) : [...current, slot].sort();
      return { ...c, [dow]: { ...c[dow], slots } };
    });
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      const r = await fetch(apiUrl('/api/appointments/settings'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (r.ok) toast('Disponibilités sauvegardées', { duration: 2000 });
      else toast('Erreur sauvegarde', { duration: 2000 });
    } finally { setSaving(false); }
  };

  const handleStatusChange = async (ref: string, status: string) => {
    setUpdatingId(ref);
    try {
      const r = await fetch(apiUrl(`/api/appointments/${ref}/status`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (r.ok) {
        setAppts(prev => prev.map(a => a.ref === ref ? { ...a, status } : a));
        toast(`Statut mis à jour : ${STATUS_COLORS[status]?.label}`, { duration: 2000 });
      }
    } finally { setUpdatingId(null); }
  };

  return (
    <div className="flex flex-col gap-6 max-w-[960px]">

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'appointments', label: 'Rendez-vous', icon: Calendar },
          { id: 'availability', label: 'Disponibilités', icon: Clock },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id as typeof tab)}
            style={{
              background: tab === id ? `linear-gradient(135deg,${GOLD},#E8C84A)` : CARD_BG,
              color: tab === id ? '#fff' : MUTED,
              border: `1px solid ${tab === id ? GOLD : BORDER}`,
              fontWeight: 700, fontSize: '13px', fontFamily: FONT,
              padding: '8px 18px', borderRadius: '10px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
        <button
          onClick={() => { loadAppts(); loadConfig(); }}
          title="Rafraîchir"
          style={{ background: 'none', border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '8px 12px', cursor: 'pointer', color: MUTED, marginLeft: 'auto' }}
        >
          <RefreshCw size={14} />
        </button>
      </div>

      <AnimatePresence mode="wait">

        {/* ── TAB: Appointments ── */}
        {tab === 'appointments' && (
          <motion.div key="appts" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={S.card}>
            <h2 style={S.h2}><Calendar size={14} style={{ display: 'inline', marginRight: 6 }} />Tous les rendez-vous</h2>

            {apptLoading ? (
              <p style={S.muted}>Chargement…</p>
            ) : appts.length === 0 ? (
              <p style={S.muted}>Aucun rendez-vous pour l'instant.</p>
            ) : (
              <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
                {/* Header */}
                <div className="grid px-4 py-2.5" style={{ gridTemplateColumns: '100px 1fr 1fr 100px 130px 120px', background: BG, borderBottom: `1px solid ${BORDER}` }}>
                  {['Réf', 'Client', 'Prestation', 'Date', 'Créneau', 'Statut'].map(h => (
                    <span key={h} style={{ ...S.muted, fontWeight: 700, letterSpacing: '0.5px', fontSize: '10px', textTransform: 'uppercase' }}>{h}</span>
                  ))}
                </div>
                {appts.map((appt, idx) => {
                  const meta = STATUS_COLORS[appt.status] ?? STATUS_COLORS.PENDING;
                  return (
                    <div key={appt.id} className="grid items-center px-4 py-3 gap-2"
                      style={{ gridTemplateColumns: '100px 1fr 1fr 100px 130px 120px', background: idx % 2 ? BG : CARD_BG, borderBottom: `1px solid ${BORDER}` }}>
                      <span style={{ color: GOLD, fontSize: '11px', fontWeight: 700, fontFamily: FONT }}>{appt.ref}</span>
                      <div>
                        <p style={{ ...S.text, fontSize: '12px', fontWeight: 600 }}>{appt.customerName}</p>
                        <p style={{ ...S.muted, fontSize: '10px' }}>{appt.customerPhone}</p>
                      </div>
                      <span style={{ ...S.text, fontSize: '12px' }}>{appt.serviceLabel}</span>
                      <span style={{ ...S.muted }}>{appt.date}</span>
                      <span style={{ ...S.text, fontSize: '12px' }}>{appt.slot}</span>
                      <div className="relative">
                        <StatusDropdown
                          current={appt.status}
                          loading={updatingId === appt.ref}
                          onChange={(s) => handleStatusChange(appt.ref, s)}
                          meta={meta}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* ── TAB: Availability ── */}
        {tab === 'availability' && (
          <motion.div key="avail" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={S.card}>
            <div className="flex items-center justify-between mb-4">
              <h2 style={{ ...S.h2, marginBottom: 0 }}><Clock size={14} style={{ display: 'inline', marginRight: 6 }} />Disponibilités hebdomadaires</h2>
              <button onClick={handleSaveConfig} disabled={saving} style={{ ...S.btn, opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px' }}>
                {saving ? <RefreshCw size={13} className="animate-spin" /> : <Check size={13} />}
                Sauvegarder
              </button>
            </div>
            <p style={{ ...S.muted, marginBottom: '20px', lineHeight: 1.6 }}>
              Définissez les créneaux disponibles pour chaque jour. Les créneaux déjà réservés ne seront pas affectés.
            </p>

            {configLoading ? (
              <p style={S.muted}>Chargement…</p>
            ) : (
              <div className="flex flex-col gap-4">
                {Object.entries(DAY_NAMES).map(([dow, dayName]) => {
                  const day = config[dow] ?? { open: false, slots: [] };
                  const isWeekend = dow === '0' || dow === '6';
                  return (
                    <div key={dow} className="rounded-xl p-4" style={{ background: BG, border: `1px solid ${day.open ? 'rgba(201,162,39,0.2)' : BORDER}` }}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span style={{ color: day.open ? TEXT : MUTED, fontWeight: 700, fontSize: '13px', fontFamily: FONT, minWidth: '80px' }}>
                            {dayName}
                          </span>
                          {isWeekend && <span style={{ color: MUTED, fontSize: '10px', fontFamily: FONT }}>Weekend</span>}
                        </div>
                        {/* Open/closed toggle */}
                        <button
                          onClick={() => toggleDay(dow)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                          style={{ background: day.open ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.1)', border: `1px solid ${day.open ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.25)'}`, cursor: 'pointer' }}
                        >
                          <span style={{ color: day.open ? '#22c55e' : '#ef4444', fontSize: '11px', fontWeight: 700, fontFamily: FONT }}>
                            {day.open ? 'Ouvert' : 'Fermé'}
                          </span>
                          {day.open ? <Check size={11} color="#22c55e" /> : <X size={11} color="#ef4444" />}
                        </button>
                      </div>

                      {day.open && (
                        <div className="flex flex-wrap gap-2">
                          {ALL_SLOTS.map(slot => {
                            const active = day.slots.includes(slot);
                            return (
                              <motion.button
                                key={slot}
                                onClick={() => toggleSlot(dow, slot)}
                                whileTap={{ scale: 0.92 }}
                                style={{
                                  background: active ? `linear-gradient(135deg,${GOLD},#E8C84A)` : BG,
                                  color: active ? '#fff' : MUTED,
                                  border: `1px solid ${active ? GOLD : BORDER}`,
                                  fontWeight: active ? 700 : 500,
                                  fontSize: '12px', fontFamily: FONT,
                                  padding: '6px 14px', borderRadius: '8px',
                                  cursor: 'pointer', transition: 'all 0.15s',
                                }}
                              >
                                {slot}
                              </motion.button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

function StatusDropdown({ current, loading, onChange, meta }: {
  current: string;
  loading: boolean;
  onChange: (s: string) => void;
  meta: { color: string; bg: string; label: string };
}) {
  const { BG, BORDER, TEXT } = useColors();
  const [open, setOpen] = useState(false);
  const statuses = Object.entries(STATUS_COLORS);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        disabled={loading}
        className="flex items-center gap-1.5 px-2 py-1 rounded-lg w-full"
        style={{ background: meta.bg, border: `1px solid ${meta.color}30`, cursor: 'pointer', fontFamily: FONT }}
      >
        {loading
          ? <RefreshCw size={10} className="animate-spin" color={meta.color} />
          : <span style={{ color: meta.color, fontSize: '10px', fontWeight: 700, letterSpacing: '0.3px' }}>{meta.label}</span>
        }
        <ChevronDown size={9} color={meta.color} style={{ marginLeft: 'auto' }} />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.96 }}
              transition={{ duration: 0.12 }}
              className="absolute right-0 top-full mt-1 rounded-xl overflow-hidden z-20"
              style={{ background: BG, border: `1px solid ${BORDER}`, boxShadow: '0 8px 24px rgba(0,0,0,0.4)', minWidth: '120px' }}
            >
              {statuses.map(([status, sm]) => (
                <button
                  key={status}
                  onClick={() => { onChange(status); setOpen(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-left"
                  style={{ background: status === current ? sm.bg : 'transparent', cursor: 'pointer', fontFamily: FONT }}
                >
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: sm.color }} />
                  <span style={{ color: TEXT, fontSize: '11px', fontWeight: status === current ? 700 : 500 }}>{sm.label}</span>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
