import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft, Calendar, Clock, MapPin, User, Phone, Check,
  Diamond, Sparkles, Pen, Wrench, Mail, CalendarPlus, ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp, useColors } from '../context/AppContext';
import { toast } from 'sonner';
import {
  saveAppointmentToDb,
  buildAppointmentMessage,
  openWhatsApp,
  type AppointmentPayload,
} from '../utils/whatsapp';
import { apiUrl } from '../lib/api';

const FALLBACK_SLOTS = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

const SERVICES = [
  { id: 'conseil',   Icon: Diamond,  serviceIcon: '💎', label: 'Conseil personnalisé',      desc: 'Un expert vous guide dans votre choix', duration: '45 min' },
  { id: 'creation',  Icon: Sparkles, serviceIcon: '✨', label: 'Création sur mesure',        desc: 'Concevez votre bijou unique',           duration: '60 min' },
  { id: 'gravure',   Icon: Pen,      serviceIcon: '🖊️', label: 'Gravure & personnalisation', desc: 'Ajoutez votre touche personnelle',      duration: '30 min' },
  { id: 'entretien', Icon: Wrench,   serviceIcon: '🔧', label: 'Entretien & nettoyage',      desc: "Ravivez l'éclat de vos bijoux",         duration: '30 min' },
];

function getDaysArray() {
  const days = [];
  const now = new Date();
  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
  for (let i = 1; i <= 14; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    if (d.getDay() === 0) continue; // no Sundays
    days.push({
      date: d.getDate(),
      day: dayNames[d.getDay()],
      month: monthNames[d.getMonth()],
      full: d.toISOString().split('T')[0],
    });
    if (days.length >= 10) break;
  }
  return days;
}

/** Build a Google Calendar add link */
function googleCalendarUrl(title: string, date: string, slot: string, description: string) {
  // date = "2025-01-15", slot = "10:00"
  const [y, m, d] = date.split('-');
  const [h, min] = slot.split(':');
  const start = `${y}${m}${d}T${h}${min}00`;
  // +1h
  const endH = String(Number(h) + 1).padStart(2, '0');
  const end = `${y}${m}${d}T${endH}${min}00`;
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${start}/${end}`,
    details: description,
    location: 'Showroom Maison Marnoa, Cocody, Abidjan',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Build a .ics file content and trigger download */
function downloadIcs(title: string, date: string, slot: string, description: string) {
  const [y, m, d] = date.split('-');
  const [h, min] = slot.split(':');
  const start = `${y}${m}${d}T${h}${min}00`;
  const endH = String(Number(h) + 1).padStart(2, '0');
  const end = `${y}${m}${d}T${endH}${min}00`;
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Maison Marnoa//FR',
    'BEGIN:VEVENT',
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    'LOCATION:Showroom Maison Marnoa\\, Cocody\\, Abidjan',
    `UID:${Date.now()}@maisonmarnoa.com`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  const blob = new Blob([ics], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'rdv-maison-marnoa.ics';
  a.click();
  URL.revokeObjectURL(url);
}

export default function Appointment() {
  const navigate = useNavigate();
  const { currentUser, isLoggedIn } = useApp();
  const { BG, CARD_BG, BORDER, TEXT, MUTED, GOLD } = useColors();

  const [step, setStep] = useState<'service' | 'datetime' | 'form' | 'confirmed'>('service');
  const [selectedService, setSelectedService] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [form, setForm] = useState({
    name: isLoggedIn ? (currentUser?.name ?? '') : '',
    phone: isLoggedIn ? (currentUser?.phone ?? '') : '',
    email: isLoggedIn ? (currentUser?.email ?? '') : '',
  });
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [loading, setLoading] = useState(false);
  const [appointmentRef, setAppointmentRef] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>(FALLBACK_SLOTS);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Fetch available slots when a date is selected
  useEffect(() => {
    if (!selectedDay) return;
    setSlotsLoading(true);
    setSelectedSlot('');
    fetch(apiUrl(`/api/appointments/availability?date=${selectedDay}`))
      .then(r => r.ok ? r.json() as Promise<{ slots: string[] }> : null)
      .then(data => setAvailableSlots(data?.slots?.length ? data.slots : FALLBACK_SLOTS))
      .catch(() => setAvailableSlots(FALLBACK_SLOTS))
      .finally(() => setSlotsLoading(false));
  }, [selectedDay]);

  const days = getDaysArray();

  const goBack = () => {
    if (step === 'service') navigate(-1);
    else if (step === 'datetime') setStep('service');
    else if (step === 'form') setStep('datetime');
  };

  const handleConfirm = async () => {
    const newErrors: typeof errors = {};
    if (!form.name.trim()) newErrors.name = 'Nom requis';
    if (form.phone.length < 8) newErrors.phone = 'Téléphone requis';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);

    const service = SERVICES.find(s => s.id === selectedService)!;
    const dayData = days.find(d => d.full === selectedDay)!;
    const ref = `RDV-${Date.now().toString(36).toUpperCase()}`;
    setAppointmentRef(ref);

    const apptPayload: AppointmentPayload = {
      appointmentId: ref,
      serviceLabel: service.label,
      serviceIcon: service.serviceIcon,
      dayLabel: `${dayData.day} ${dayData.date} ${dayData.month}`,
      slot: selectedSlot,
      customer: { name: form.name, phone: form.phone, email: form.email || undefined },
    };

    // Save to DB
    await saveAppointmentToDb({
      appointmentId: ref,
      status: 'pending_whatsapp',
      createdAt: new Date().toISOString(),
      payload: apptPayload,
    });

    // Open WhatsApp with appointment message
    openWhatsApp(buildAppointmentMessage(apptPayload));

    setLoading(false);
    setStep('confirmed');
    toast('Rendez-vous enregistré !', { duration: 2500 });
  };

  const selectedDayData = days.find(d => d.full === selectedDay);
  const selectedServiceData = SERVICES.find(s => s.id === selectedService);

  const calTitle = `RDV Maison Marnoa — ${selectedServiceData?.label ?? ''}`;
  const calDesc = `Rendez-vous Maison Marnoa\\nPrestation : ${selectedServiceData?.label ?? ''}\\nClient : ${form.name}\\nTél : ${form.phone}\\nRéf : ${appointmentRef}`;

  const stepLabels = ['Service', 'Date & Heure', 'Vos infos'];
  const stepIndex = step === 'service' ? 0 : step === 'datetime' ? 1 : step === 'form' ? 2 : 3;

  return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: 'Manrope, sans-serif' }}>

      {/* Mobile header */}
      {step !== 'confirmed' && (
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-40 pt-12 lg:hidden px-5 pb-4 flex items-center gap-4"
          style={{ background: `${BG}F5`, backdropFilter: 'blur(20px)', borderBottom: `1px solid ${BORDER}` }}
        >
          <motion.button onClick={goBack} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }} whileTap={{ scale: 0.88 }}>
            <ArrowLeft size={18} color={TEXT} />
          </motion.button>
          <div className="flex-1">
            <p style={{ color: GOLD, fontWeight: 700, fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase' }}>SHOWROOM · ABIDJAN</p>
            <h1 style={{ color: TEXT, fontWeight: 800, fontSize: '18px' }}>Réserver un rendez-vous</h1>
          </div>
        </motion.div>
      )}

      <div className="px-5 py-4 pb-28 lg:pb-12 lg:max-w-[600px] lg:mx-auto lg:px-0 lg:py-10">

        {/* Desktop title */}
        {step !== 'confirmed' && (
          <div className="hidden lg:block mb-8">
            <p style={{ color: GOLD, fontWeight: 700, fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '4px' }}>✦ SHOWROOM ABIDJAN</p>
            <h1 style={{ color: TEXT, fontWeight: 800, fontSize: '28px' }}>Réserver un rendez-vous</h1>
          </div>
        )}

        {/* Step progress */}
        {step !== 'confirmed' && (
          <div className="flex items-center gap-2 mb-6">
            {stepLabels.map((label, i) => (
              <div key={label} className="flex items-center gap-2 flex-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: i < stepIndex ? GOLD : i === stepIndex ? GOLD : BORDER, transition: 'background 0.3s' }}>
                    {i < stepIndex
                      ? <Check size={10} color="#fff" />
                      : <span style={{ color: i === stepIndex ? '#fff' : MUTED, fontSize: '9px', fontWeight: 700 }}>{i + 1}</span>
                    }
                  </div>
                  <span style={{ color: i === stepIndex ? TEXT : MUTED, fontSize: '10px', fontWeight: i === stepIndex ? 700 : 500, whiteSpace: 'nowrap' }}>
                    {label}
                  </span>
                </div>
                {i < stepLabels.length - 1 && (
                  <div className="flex-1 h-px" style={{ background: i < stepIndex ? GOLD : BORDER, transition: 'background 0.3s', minWidth: '12px' }} />
                )}
              </div>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">

          {/* ── STEP 1: Service ── */}
          {step === 'service' && (
            <motion.div key="service" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
              <div className="relative rounded-2xl overflow-hidden mb-6" style={{ height: 130 }}>
                <img src="https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=800&q=80" alt="Showroom" className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,rgba(0,0,0,0.55) 0%,rgba(0,0,0,0.15) 100%)' }} />
                <div className="absolute inset-0 flex flex-col justify-end p-4">
                  <div className="flex items-center gap-1.5 mb-1">
                    <MapPin size={10} color="rgba(255,255,255,0.75)" />
                    <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '10px' }}>Cocody, Abidjan · Lun–Sam 9h–18h</span>
                  </div>
                  <p style={{ color: '#fff', fontWeight: 700, fontSize: '15px' }}>Maison Marnoa — Showroom</p>
                </div>
              </div>

              <p style={{ color: TEXT, fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>Choisissez votre prestation</p>
              <p style={{ color: MUTED, fontSize: '12px', marginBottom: '16px' }}>Nos experts vous accueillent dans un espace dédié.</p>

              <div className="flex flex-col gap-3">
                {SERVICES.map(service => {
                  const active = selectedService === service.id;
                  return (
                    <motion.button
                      key={service.id}
                      onClick={() => { setSelectedService(service.id); setTimeout(() => setStep('datetime'), 180); }}
                      className="flex items-center justify-between p-4 rounded-2xl text-left w-full"
                      whileTap={{ scale: 0.98 }}
                      style={{
                        background: active ? 'rgba(201,162,39,0.08)' : CARD_BG,
                        border: `1.5px solid ${active ? GOLD : BORDER}`,
                        boxShadow: active ? '0 4px 16px rgba(201,162,39,0.15)' : '0 1px 4px rgba(0,0,0,0.04)',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: active ? 'linear-gradient(135deg,#C9A227,#E8C84A)' : 'rgba(201,162,39,0.08)', border: `1px solid ${active ? 'transparent' : 'rgba(201,162,39,0.2)'}` }}>
                          <service.Icon size={17} color={active ? '#fff' : GOLD} />
                        </div>
                        <div>
                          <p style={{ color: TEXT, fontWeight: 700, fontSize: '13px', marginBottom: '2px' }}>{service.label}</p>
                          <p style={{ color: MUTED, fontSize: '11px' }}>{service.desc} · <span style={{ color: GOLD }}>{service.duration}</span></p>
                        </div>
                      </div>
                      {active && <Check size={15} color={GOLD} />}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: Date & Time ── */}
          {step === 'datetime' && (
            <motion.div key="datetime" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
              {/* Service recap */}
              <div className="flex items-center gap-3 p-3 rounded-xl mb-6" style={{ background: 'rgba(201,162,39,0.06)', border: `1px solid rgba(201,162,39,0.15)` }}>
                {selectedServiceData && <selectedServiceData.Icon size={14} color={GOLD} />}
                <span style={{ color: TEXT, fontWeight: 600, fontSize: '13px' }}>{selectedServiceData?.label}</span>
                <span style={{ color: MUTED, fontSize: '11px', marginLeft: 'auto' }}>{selectedServiceData?.duration}</span>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <Calendar size={14} color={GOLD} />
                <p style={{ color: TEXT, fontWeight: 700, fontSize: '15px' }}>Date</p>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 mb-5" style={{ scrollbarWidth: 'none' }}>
                {days.map(d => {
                  const active = selectedDay === d.full;
                  return (
                    <motion.button key={d.full} onClick={() => setSelectedDay(d.full)}
                      className="flex-shrink-0 flex flex-col items-center gap-0.5 px-3 py-2.5 rounded-xl"
                      whileTap={{ scale: 0.92 }}
                      style={{ background: active ? 'linear-gradient(135deg,#C9A227,#E8C84A)' : CARD_BG, border: `1.5px solid ${active ? GOLD : BORDER}`, minWidth: '50px', boxShadow: active ? '0 3px 10px rgba(201,162,39,0.28)' : 'none' }}>
                      <span style={{ color: active ? 'rgba(255,255,255,0.8)' : MUTED, fontSize: '9px', fontWeight: 600, textTransform: 'uppercase' }}>{d.day}</span>
                      <span style={{ color: active ? '#fff' : TEXT, fontWeight: 800, fontSize: '17px', lineHeight: 1 }}>{d.date}</span>
                      <span style={{ color: active ? 'rgba(255,255,255,0.8)' : MUTED, fontSize: '9px' }}>{d.month}</span>
                    </motion.button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 mb-3">
                <Clock size={14} color={GOLD} />
                <p style={{ color: TEXT, fontWeight: 700, fontSize: '15px' }}>Créneau</p>
                {slotsLoading && <div className="w-3.5 h-3.5 border-2 rounded-full animate-spin ml-1" style={{ borderColor: BORDER, borderTopColor: GOLD }} />}
                {selectedDay && !slotsLoading && availableSlots.length > 0 && (
                  <span style={{ color: MUTED, fontSize: '10px', marginLeft: 'auto' }}>Tap pour continuer</span>
                )}
              </div>
              {!selectedDay ? (
                <p style={{ color: MUTED, fontSize: '12px', marginBottom: '24px' }}>Choisissez d'abord une date</p>
              ) : availableSlots.length === 0 ? (
                <div className="rounded-xl p-4 mb-6 text-center" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <p style={{ color: '#ef4444', fontSize: '13px', fontWeight: 600 }}>Aucun créneau disponible ce jour</p>
                  <p style={{ color: MUTED, fontSize: '11px', marginTop: '4px' }}>Choisissez une autre date</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2 mb-6">
                  {availableSlots.map(slot => {
                    const active = selectedSlot === slot;
                    return (
                      <motion.button key={slot} onClick={() => { setSelectedSlot(slot); setTimeout(() => setStep('form'), 200); }}
                        className="py-3 rounded-xl"
                        whileTap={{ scale: 0.92 }}
                        style={{ background: active ? 'linear-gradient(135deg,#C9A227,#E8C84A)' : CARD_BG, border: `1.5px solid ${active ? GOLD : BORDER}`, color: active ? '#fff' : TEXT, fontWeight: active ? 700 : 500, fontSize: '13px', boxShadow: active ? '0 3px 10px rgba(201,162,39,0.28)' : 'none' }}>
                        {slot}
                      </motion.button>
                    );
                  })}
                </div>
              )}

            </motion.div>
          )}

          {/* ── STEP 3: Form ── */}
          {step === 'form' && (
            <motion.div key="form" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
              {/* Recap card */}
              <div className="p-4 rounded-2xl mb-5" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
                <p style={{ color: GOLD, fontWeight: 700, fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Votre réservation</p>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    {selectedServiceData && <selectedServiceData.Icon size={13} color={GOLD} />}
                    <span style={{ color: TEXT, fontWeight: 600, fontSize: '13px' }}>{selectedServiceData?.label}</span>
                    <span style={{ color: MUTED, fontSize: '11px', marginLeft: 'auto' }}>{selectedServiceData?.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={12} color={MUTED} />
                    <span style={{ color: MUTED, fontSize: '12px' }}>
                      {selectedDayData?.day} {selectedDayData?.date} {selectedDayData?.month} à {selectedSlot}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={12} color={MUTED} />
                    <span style={{ color: MUTED, fontSize: '12px' }}>Showroom Marnoa · Cocody, Abidjan</span>
                  </div>
                </div>
              </div>

              <p style={{ color: TEXT, fontWeight: 700, fontSize: '15px', marginBottom: '14px' }}>Vos coordonnées</p>
              <div className="flex flex-col gap-3 mb-5">
                <div>
                  <label style={{ color: MUTED, fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Nom complet *</label>
                  <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl" style={{ background: CARD_BG, border: `1px solid ${errors.name ? '#ef4444' : BORDER}` }}>
                    <User size={14} color={MUTED} />
                    <input type="text" placeholder="Aminata Koné" value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="flex-1 bg-transparent outline-none"
                      style={{ color: TEXT, fontFamily: 'Manrope, sans-serif', fontSize: '14px' }} />
                  </div>
                  {errors.name && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{errors.name}</p>}
                </div>
                <div>
                  <label style={{ color: MUTED, fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Téléphone *</label>
                  <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl" style={{ background: CARD_BG, border: `1px solid ${errors.phone ? '#ef4444' : BORDER}` }}>
                    <Phone size={14} color={MUTED} />
                    <input type="tel" placeholder="+225 07 00 00 00 00" value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      className="flex-1 bg-transparent outline-none"
                      style={{ color: TEXT, fontFamily: 'Manrope, sans-serif', fontSize: '14px' }} />
                  </div>
                  {errors.phone && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{errors.phone}</p>}
                </div>
                <div>
                  <label style={{ color: MUTED, fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Email (optionnel)</label>
                  <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
                    <Mail size={14} color={MUTED} />
                    <input type="email" placeholder="aminata@email.com" value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className="flex-1 bg-transparent outline-none"
                      style={{ color: TEXT, fontFamily: 'Manrope, sans-serif', fontSize: '14px' }} />
                  </div>
                </div>
              </div>

              <motion.button
                onClick={handleConfirm}
                disabled={loading}
                className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 mb-2"
                whileTap={{ scale: 0.97 }}
                style={{ background: 'linear-gradient(135deg,#25D366,#128C7E)', color: '#fff', fontWeight: 700, fontSize: '15px', boxShadow: '0 4px 16px rgba(37,211,102,0.3)', opacity: loading ? 0.8 : 1, border: 'none' }}
              >
                {loading
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><svg width="18" height="18" viewBox="0 0 32 32" fill="none"><path d="M16 2C8.268 2 2 8.268 2 16c0 2.478.668 4.8 1.832 6.8L2 30l7.388-1.808A13.924 13.924 0 0016 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm7.28 19.12c-.308.864-1.52 1.576-2.492 1.788-.664.14-1.528.252-4.436-.952-3.72-1.532-6.12-5.308-6.308-5.552-.18-.244-1.508-2.004-1.508-3.824 0-1.82.952-2.712 1.292-3.076.308-.332.82-.484 1.312-.484.158 0 .3.008.428.016.38.016.572.036.82.64.308.752 1.056 2.572 1.148 2.76.092.188.184.436.056.68-.12.252-.228.364-.416.58-.188.216-.368.38-.556.612-.172.204-.364.42-.148.8.216.372.96 1.584 2.06 2.568 1.416 1.256 2.58 1.648 2.996 1.828.32.136.7.1.924-.14.284-.3.636-.8.992-1.296.256-.356.58-.4.92-.276.348.116 2.204 1.04 2.584 1.228.38.188.632.28.724.44.092.16.092.924-.216 1.788z" fill="white"/></svg> Réserver via WhatsApp</>
                }
              </motion.button>
              <p style={{ color: MUTED, fontSize: '10px', textAlign: 'center' }}>
                WhatsApp s'ouvrira pour confirmer avec notre équipe
              </p>
            </motion.div>
          )}

          {/* ── STEP 4: Confirmed ── */}
          {step === 'confirmed' && (
            <motion.div key="confirmed" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="py-8 flex flex-col items-center text-center gap-5">

              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.15 }}
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#25D366,#128C7E)', boxShadow: '0 8px 28px rgba(37,211,102,0.38)' }}
              >
                <Check size={36} color="#fff" />
              </motion.div>

              <div>
                <p style={{ color: '#25D366', fontWeight: 700, fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '6px' }}>✦ RENDEZ-VOUS ENREGISTRÉ</p>
                <h2 style={{ color: TEXT, fontWeight: 800, fontSize: '24px', lineHeight: 1.2, marginBottom: '8px' }}>À bientôt chez<br />Maison Marnoa !</h2>
                <p style={{ color: MUTED, fontSize: '12px', lineHeight: 1.7, maxWidth: '280px' }}>Le message WhatsApp s'est ouvert. Notre équipe va confirmer votre créneau rapidement.</p>
              </div>

              {/* RDV details */}
              <div className="w-full p-4 rounded-2xl text-left" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
                <p style={{ color: GOLD, fontWeight: 700, fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Détails · {appointmentRef}</p>
                <div className="flex flex-col gap-2.5">
                  {[
                    { icon: selectedServiceData ? <selectedServiceData.Icon size={13} color={GOLD} /> : null, text: selectedServiceData?.label },
                    { icon: <Calendar size={13} color={MUTED} />, text: `${selectedDayData?.day} ${selectedDayData?.date} ${selectedDayData?.month} · ${selectedSlot}` },
                    { icon: <MapPin size={13} color={MUTED} />, text: 'Showroom Marnoa · Cocody, Abidjan' },
                    { icon: <User size={13} color={MUTED} />, text: form.name },
                    { icon: <Phone size={13} color={MUTED} />, text: form.phone },
                  ].map((row, i) => row.text && (
                    <div key={i} className="flex items-center gap-2.5">
                      {row.icon}
                      <span style={{ color: TEXT, fontSize: '13px' }}>{row.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calendar buttons */}
              <div className="w-full flex flex-col gap-2">
                <p style={{ color: MUTED, fontSize: '11px', fontWeight: 600, textAlign: 'left' }}>
                  <CalendarPlus size={12} style={{ display: 'inline', marginRight: 4 }} />
                  Ajouter à votre calendrier
                </p>
                <div className="flex gap-2">
                  <motion.a
                    href={googleCalendarUrl(calTitle, selectedDay, selectedSlot, calDesc)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl"
                    whileTap={{ scale: 0.95 }}
                    style={{ background: CARD_BG, border: `1px solid ${BORDER}`, color: TEXT, fontWeight: 600, fontSize: '12px', textDecoration: 'none' }}
                  >
                    <ExternalLink size={13} color={GOLD} /> Google Calendar
                  </motion.a>
                  <motion.button
                    onClick={() => downloadIcs(calTitle, selectedDay, selectedSlot, calDesc)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl"
                    whileTap={{ scale: 0.95 }}
                    style={{ background: CARD_BG, border: `1px solid ${BORDER}`, color: TEXT, fontWeight: 600, fontSize: '12px' }}
                  >
                    <CalendarPlus size={13} color={GOLD} /> Apple / Autre
                  </motion.button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 w-full">
                <motion.button
                  onClick={() => {
                    const service = SERVICES.find(s => s.id === selectedService)!;
                    const dayData = days.find(d => d.full === selectedDay)!;
                    openWhatsApp(buildAppointmentMessage({
                      appointmentId: appointmentRef,
                      serviceLabel: service.label,
                      serviceIcon: service.serviceIcon,
                      dayLabel: `${dayData.day} ${dayData.date} ${dayData.month}`,
                      slot: selectedSlot,
                      customer: { name: form.name, phone: form.phone, email: form.email || undefined },
                    }));
                  }}
                  className="w-full py-4 rounded-2xl flex items-center justify-center gap-2"
                  whileTap={{ scale: 0.97 }}
                  style={{ background: 'linear-gradient(135deg,#25D366,#128C7E)', color: '#fff', fontWeight: 700, fontSize: '14px', boxShadow: '0 4px 14px rgba(37,211,102,0.28)', border: 'none' }}
                >
                  <svg width="16" height="16" viewBox="0 0 32 32" fill="none"><path d="M16 2C8.268 2 2 8.268 2 16c0 2.478.668 4.8 1.832 6.8L2 30l7.388-1.808A13.924 13.924 0 0016 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm7.28 19.12c-.308.864-1.52 1.576-2.492 1.788-.664.14-1.528.252-4.436-.952-3.72-1.532-6.12-5.308-6.308-5.552-.18-.244-1.508-2.004-1.508-3.824 0-1.82.952-2.712 1.292-3.076.308-.332.82-.484 1.312-.484.158 0 .3.008.428.016.38.016.572.036.82.64.308.752 1.056 2.572 1.148 2.76.092.188.184.436.056.68-.12.252-.228.364-.416.58-.188.216-.368.38-.556.612-.172.204-.364.42-.148.8.216.372.96 1.584 2.06 2.568 1.416 1.256 2.58 1.648 2.996 1.828.32.136.7.1.924-.14.284-.3.636-.8.992-1.296.256-.356.58-.4.92-.276.348.116 2.204 1.04 2.584 1.228.38.188.632.28.724.44.092.16.092.924-.216 1.788z" fill="white"/></svg>
                  Suivre mon RDV sur WhatsApp
                </motion.button>
                {isLoggedIn && (
                  <motion.button onClick={() => navigate('/profile')} className="w-full py-3.5 rounded-2xl" whileTap={{ scale: 0.97 }}
                    style={{ background: `linear-gradient(135deg,#C9A227,#E8C84A)`, color: '#fff', fontWeight: 700, fontSize: '14px', boxShadow: '0 4px 14px rgba(201,162,39,0.28)', border: 'none' }}>
                    Voir mes rendez-vous
                  </motion.button>
                )}
                <motion.button onClick={() => navigate('/')} className="w-full py-3.5 rounded-2xl" whileTap={{ scale: 0.97 }}
                  style={{ background: 'transparent', border: `1px solid ${BORDER}`, color: MUTED, fontSize: '13px', fontWeight: 600 }}>
                  Retour à l'accueil
                </motion.button>
              </div>

              <div className="flex items-center gap-2">
                <Diamond size={10} color={GOLD} />
                <p style={{ color: MUTED, fontSize: '10px' }}>Maison Marnoa · Haute Joaillerie</p>
                <Diamond size={10} color={GOLD} />
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
