import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Calendar, Clock, MapPin, User, Phone, Check, Diamond, Sparkles, Pen, Wrench } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useColors } from '../context/AppContext';
import { toast } from 'sonner';
import {
  buildAppointmentMessage, openWhatsApp, saveAppointmentToDb,
  type AppointmentPayload,
} from '../utils/whatsapp';

const SLOTS = ['10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
const SERVICES = [
  { id: 'conseil',   Icon: Diamond,   serviceIcon: '💎', label: 'Conseil personnalisé',     desc: 'Un expert vous guide dans votre choix' },
  { id: 'creation',  Icon: Sparkles,  serviceIcon: '✨', label: 'Création sur mesure',       desc: 'Concevez votre bijou unique' },
  { id: 'gravure',   Icon: Pen,       serviceIcon: '🖊️', label: 'Gravure & personnalisation', desc: 'Ajoutez votre touche personnelle' },
  { id: 'entretien', Icon: Wrench,    serviceIcon: '🔧', label: 'Entretien & nettoyage',     desc: 'Ravivez l\'éclat de vos bijoux' },
];

function getDaysArray() {
  const days = [];
  const now = new Date();
  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
  for (let i = 1; i <= 14; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    // Skip Sundays
    if (d.getDay() === 0) continue;
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

export default function Appointment() {
  const navigate = useNavigate();
  const { BG, CARD_BG, BORDER, TEXT, MUTED, GOLD } = useColors();
  const [step, setStep] = useState<'service' | 'datetime' | 'form' | 'confirmed'>('service');
  const [selectedService, setSelectedService] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [form, setForm] = useState({ name: '', phone: '' });
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  const days = getDaysArray();

  const handleConfirm = () => {
    const newErrors: typeof errors = {};
    if (!form.name.trim()) newErrors.name = 'Nom requis';
    if (form.phone.length < 8) newErrors.phone = 'Téléphone requis';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const service = SERVICES.find(s => s.id === selectedService);
    const dayData  = days.find(d => d.full === selectedDay);

    const appointmentId = `RDV-${Math.floor(10000 + Math.random() * 90000)}`;
    const apptPayload: AppointmentPayload = {
      appointmentId,
      serviceLabel: service?.label ?? '',
      serviceIcon:  service?.serviceIcon  ?? '',
      dayLabel: `${dayData?.day} ${dayData?.date} ${dayData?.month}`,
      slot: selectedSlot,
      customer: { name: form.name, phone: form.phone },
    };

    // ── Sauvegarde "DB" pré-redirection ──
    saveAppointmentToDb({
      appointmentId,
      status: 'pending_whatsapp',
      createdAt: new Date().toISOString(),
      payload: apptPayload,
    });

    const message = buildAppointmentMessage(apptPayload);

    setStep('confirmed');
    toast('✅ Rendez-vous confirmé !', { description: 'Ouverture de WhatsApp…', duration: 3000 });

    setTimeout(() => openWhatsApp(message), 600);
  };

  const selectedDayData = days.find(d => d.full === selectedDay);
  const selectedServiceData = SERVICES.find(s => s.id === selectedService);

  return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: 'Manrope, sans-serif' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="sticky top-0 z-40 pt-12 lg:hidden px-5 pb-4 flex items-center gap-4" style={{ background: `${BG}F5`, backdropFilter: 'blur(20px)', borderBottom: `1px solid ${BORDER}` }}>
        <motion.button onClick={() => step === 'service' ? navigate(-1) : setStep(step === 'datetime' ? 'service' : step === 'form' ? 'datetime' : 'service')} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: CARD_BG, border: `1px solid ${BORDER}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }} whileTap={{ scale: 0.88 }}>
          <ArrowLeft size={18} color={TEXT} />
        </motion.button>
        <div>
          <p style={{ color: GOLD, fontWeight: 700, fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '1px' }}>✦ SHOWROOM ABIDJAN</p>
          <h1 style={{ color: TEXT, fontWeight: 800, fontSize: '18px' }}>Prendre rendez-vous</h1>
        </div>
      </motion.div>

      <div className="px-5 py-4 pb-28 lg:pb-8 lg:max-w-[900px] lg:mx-auto lg:px-10 xl:px-0 lg:py-8">
        {/* Desktop title */}
        <div className="hidden lg:block mb-8">
          <p style={{ color: GOLD, fontWeight: 700, fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '4px' }}>✦ SHOWROOM ABIDJAN</p>
          <h1 style={{ color: TEXT, fontWeight: 800, fontSize: '32px' }}>Réserver un Rendez-vous</h1>
        </div>

        <AnimatePresence mode="wait">
          {/* ======= STEP 1: Service ======= */}
          {step === 'service' && (
            <motion.div key="service" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }} className="px-4 py-6">
              {/* Hero */}
              <div className="relative rounded-2xl overflow-hidden mb-6" style={{ height: 140 }}>
                <img src="https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=800&q=80" alt="Showroom" className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 100%)' }} />
                <div className="absolute inset-0 flex flex-col justify-end p-5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <MapPin size={11} color="rgba(255,255,255,0.8)" />
                    <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '10px' }}>Cocody, Abidjan · Lun–Sam 9h–18h</span>
                  </div>
                  <p style={{ color: '#fff', fontWeight: 700, fontSize: '16px' }}>Maison Marnoa — Showroom</p>
                </div>
              </div>

              <p style={{ color: TEXT, fontWeight: 700, fontSize: '17px', marginBottom: '6px' }}>Choisissez votre prestation</p>
              <p style={{ color: MUTED, fontSize: '12px', marginBottom: '20px' }}>Nos experts vous accueillent dans un espace dédié au luxe et à la personnalisation.</p>

              <div className="flex flex-col gap-3">
                {SERVICES.map(service => {
                  const active = selectedService === service.id;
                  return (
                    <motion.button
                      key={service.id}
                      onClick={() => { setSelectedService(service.id); setTimeout(() => setStep('datetime'), 200); }}
                      className="flex items-center justify-between p-4 rounded-2xl text-left"
                      whileTap={{ scale: 0.98 }}
                      whileHover={{ y: -2 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      style={{ background: active ? 'rgba(201,162,39,0.08)' : CARD_BG, border: `1.5px solid ${active ? GOLD : BORDER}`, boxShadow: active ? '0 6px 20px rgba(201,162,39,0.18)' : '0 1px 6px rgba(0,0,0,0.04)' }}
                    >
                      <div className="flex items-center gap-4">
                        <motion.div
                          animate={{ background: active ? 'linear-gradient(135deg,#C9A227,#E8C84A)' : 'rgba(201,162,39,0.08)' }}
                          transition={{ duration: 0.25 }}
                          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ border: `1px solid ${active ? 'transparent' : 'rgba(201,162,39,0.2)'}` }}
                        >
                          <service.Icon size={18} color={active ? '#fff' : GOLD} />
                        </motion.div>
                        <div>
                          <p style={{ color: TEXT, fontWeight: 700, fontSize: '14px', marginBottom: '2px' }}>{service.label}</p>
                          <p style={{ color: MUTED, fontSize: '11px' }}>{service.desc}</p>
                        </div>
                      </div>
                      {active && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}>
                          <Check size={16} color={GOLD} />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ======= STEP 2: Date & Time ======= */}
          {step === 'datetime' && (
            <motion.div key="datetime" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }} className="px-4 py-6">
              {/* Selected service recap */}
              <div className="flex items-center gap-3 p-4 rounded-2xl mb-6" style={{ background: 'linear-gradient(135deg, #FDF8E8, #FFF3C0)', border: `1px solid rgba(201,162,39,0.2)` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#C9A227,#E8C84A)' }}>
                  {selectedServiceData && <selectedServiceData.Icon size={18} color="#fff" />}
                </div>
                <div>
                  <p style={{ color: TEXT, fontWeight: 700, fontSize: '13px' }}>{selectedServiceData?.label}</p>
                  <p style={{ color: MUTED, fontSize: '11px' }}>Durée estimée : 45 min</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <Calendar size={15} color={GOLD} />
                <p style={{ color: TEXT, fontWeight: 700, fontSize: '16px' }}>Choisissez une date</p>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 mb-6" style={{ scrollbarWidth: 'none' }}>
                {days.map(d => {
                  const active = selectedDay === d.full;
                  return (
                    <motion.button key={d.full} onClick={() => setSelectedDay(d.full)} className="flex-shrink-0 flex flex-col items-center gap-0.5 px-3 py-3 rounded-2xl" whileTap={{ scale: 0.92 }} style={{ background: active ? 'linear-gradient(135deg, #C9A227, #E8C84A)' : CARD_BG, border: `1.5px solid ${active ? GOLD : BORDER}`, minWidth: '52px', boxShadow: active ? '0 4px 12px rgba(201,162,39,0.3)' : '0 1px 4px rgba(0,0,0,0.04)', transition: 'all 0.2s' }}>
                      <span style={{ color: active ? 'rgba(255,255,255,0.8)' : MUTED, fontSize: '9px', fontWeight: 600, textTransform: 'uppercase' }}>{d.day}</span>
                      <span style={{ color: active ? '#fff' : TEXT, fontWeight: 800, fontSize: '18px', lineHeight: 1 }}>{d.date}</span>
                      <span style={{ color: active ? 'rgba(255,255,255,0.8)' : MUTED, fontSize: '9px' }}>{d.month}</span>
                    </motion.button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 mb-4">
                <Clock size={15} color={GOLD} />
                <p style={{ color: TEXT, fontWeight: 700, fontSize: '16px' }}>Choisissez un créneau</p>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-8">
                {SLOTS.map(slot => {
                  const active = selectedSlot === slot;
                  return (
                    <motion.button key={slot} onClick={() => setSelectedSlot(slot)} className="py-3 rounded-xl" whileTap={{ scale: 0.92 }} style={{ background: active ? 'linear-gradient(135deg, #C9A227, #E8C84A)' : CARD_BG, border: `1.5px solid ${active ? GOLD : BORDER}`, color: active ? '#fff' : TEXT, fontWeight: active ? 700 : 500, fontSize: '14px', boxShadow: active ? '0 4px 12px rgba(201,162,39,0.3)' : '0 1px 4px rgba(0,0,0,0.04)', transition: 'all 0.2s' }}>
                      {slot}
                    </motion.button>
                  );
                })}
              </div>

              <motion.button onClick={() => { if (selectedDay && selectedSlot) setStep('form'); }} className="w-full py-4 rounded-2xl" whileTap={{ scale: 0.97 }} style={{ background: selectedDay && selectedSlot ? 'linear-gradient(135deg, #C9A227, #E8C84A)' : BORDER, color: '#fff', fontWeight: 700, fontSize: '15px', opacity: selectedDay && selectedSlot ? 1 : 0.5, transition: 'all 0.2s' }}>
                Continuer →
              </motion.button>
            </motion.div>
          )}

          {/* ======= STEP 3: Form ======= */}
          {step === 'form' && (
            <motion.div key="form" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }} className="px-4 py-6">
              {/* Recap */}
              <div className="p-4 rounded-2xl mb-6" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
                <p style={{ color: GOLD, fontWeight: 700, fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>Votre réservation</p>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(201,162,39,0.1)' }}>
                      {selectedServiceData && <selectedServiceData.Icon size={13} color={GOLD} />}
                    </div>
                    <span style={{ color: TEXT, fontSize: '13px', fontWeight: 600 }}>{selectedServiceData?.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={13} color={MUTED} />
                    <span style={{ color: MUTED, fontSize: '12px' }}>
                      {selectedDayData?.day} {selectedDayData?.date} {selectedDayData?.month} à {selectedSlot}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={13} color={MUTED} />
                    <span style={{ color: MUTED, fontSize: '12px' }}>Showroom Maison Marnoa · Cocody, Abidjan</span>
                  </div>
                </div>
              </div>

              <p style={{ color: TEXT, fontWeight: 700, fontSize: '16px', marginBottom: '16px' }}>Vos coordonnées</p>
              <div className="flex flex-col gap-4 mb-6">
                <div>
                  <label style={{ color: MUTED, fontSize: '11px', fontWeight: 600, letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>Nom complet</label>
                  <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl" style={{ background: CARD_BG, border: `1px solid ${errors.name ? '#ef4444' : BORDER}` }}>
                    <User size={15} color={MUTED} />
                    <input type="text" placeholder="Jean-Marc Koffi" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="flex-1 bg-transparent outline-none" style={{ color: TEXT, fontFamily: 'Manrope, sans-serif', fontSize: '14px' }} />
                  </div>
                  {errors.name && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{errors.name}</p>}
                </div>
                <div>
                  <label style={{ color: MUTED, fontSize: '11px', fontWeight: 600, letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>Téléphone</label>
                  <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl" style={{ background: CARD_BG, border: `1px solid ${errors.phone ? '#ef4444' : BORDER}` }}>
                    <Phone size={15} color={MUTED} />
                    <input type="tel" placeholder="+225 07 00 00 00 00" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="flex-1 bg-transparent outline-none" style={{ color: TEXT, fontFamily: 'Manrope, sans-serif', fontSize: '14px' }} />
                  </div>
                  {errors.phone && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{errors.phone}</p>}
                </div>
              </div>

              <motion.button onClick={handleConfirm} className="w-full py-4 rounded-2xl mb-3" whileTap={{ scale: 0.97 }} style={{ background: 'linear-gradient(135deg, #C9A227 0%, #E8C84A 50%, #C9A227 100%)', color: '#fff', fontWeight: 700, fontSize: '15px', boxShadow: '0 4px 16px rgba(201,162,39,0.3)' }}>
                Confirmer &amp; envoyer sur WhatsApp 📲
              </motion.button>
              <p style={{ color: MUTED, fontSize: '10px', textAlign: 'center' }}>Vous serez redirigé vers WhatsApp pour finaliser avec notre équipe.</p>
            </motion.div>
          )}

          {/* ======= STEP 4: Confirmed ======= */}
          {step === 'confirmed' && (
            <motion.div key="confirmed" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="px-4 py-10 flex flex-col items-center text-center gap-6">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.2 }} className="w-24 h-24 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #C9A227, #E8C84A)', boxShadow: '0 8px 32px rgba(201,162,39,0.4)' }}>
                <Check size={40} color="#fff" />
              </motion.div>

              <div>
                <p style={{ color: GOLD, fontWeight: 700, fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px' }}>✦ RÉSERVATION CONFIRMÉE</p>
                <h2 style={{ color: TEXT, fontWeight: 800, fontSize: '26px', lineHeight: 1.2, marginBottom: '12px' }}>À bientôt chez<br />Maison Marnoa !</h2>
                <p style={{ color: MUTED, fontSize: '13px', lineHeight: 1.7, maxWidth: '280px' }}>Votre rendez-vous a été réservé. Un SMS de confirmation vous sera envoyé dans les prochaines minutes.</p>
              </div>

              {/* Booking details */}
              <div className="w-full p-5 rounded-2xl" style={{ background: CARD_BG, border: `1px solid ${BORDER}`, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
                <p style={{ color: GOLD, fontWeight: 700, fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>Détails de votre RDV</p>
                {[
                   { icon: selectedServiceData ? <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'rgba(201,162,39,0.1)' }}><selectedServiceData.Icon size={12} color={GOLD} /></div> : null, label: selectedServiceData?.label ?? '' },
                  { icon: <Calendar size={15} color={MUTED} />, label: `${selectedDayData?.day} ${selectedDayData?.date} ${selectedDayData?.month} · ${selectedSlot}` },
                  { icon: <MapPin size={15} color={MUTED} />, label: 'Showroom Marnoa · Cocody, Abidjan' },
                  { icon: <User size={15} color={MUTED} />, label: form.name },
                  { icon: <Phone size={15} color={MUTED} />, label: form.phone },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 mb-3">
                    {item.icon}
                    <span style={{ color: TEXT, fontSize: '13px', fontWeight: 500 }}>{item.label}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3 w-full">
                <motion.button
                  onClick={() => {
                    const service = SERVICES.find(s => s.id === selectedService);
                    const dayData  = days.find(d => d.full === selectedDay);
                    const message  = [
                      `👋 Bonjour Maison Marnoa,`,
                      ``,
                      `Je souhaite confirmer mon rendez-vous :`,
                      ``,
                      `✦ Prestation : ${service?.label}`,
                      `📅 Date : ${dayData?.day} ${dayData?.date} ${dayData?.month} à ${selectedSlot}`,
                      `📍 Lieu : Showroom Maison Marnoa · Cocody, Abidjan`,
                      ``,
                      `👤 Nom : ${form.name}`,
                      `📱 Téléphone : ${form.phone}`,
                      ``,
                      `Merci ! 🙏`,
                    ].join('\n');
                    const whatsappNumber = '2250700000000';
                    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
                  }}
                  className="w-full py-4 rounded-2xl flex items-center justify-center gap-2"
                  whileTap={{ scale: 0.97 }}
                  style={{ background: '#25D366', color: '#fff', fontWeight: 700, fontSize: '14px', boxShadow: '0 4px 16px rgba(37,211,102,0.35)' }}
                >
                  <span style={{ fontSize: '18px' }}>💬</span> Ouvrir WhatsApp
                </motion.button>
                <motion.button onClick={() => navigate('/')} className="w-full py-4 rounded-2xl" whileTap={{ scale: 0.97 }} style={{ background: 'linear-gradient(135deg, #C9A227 0%, #E8C84A 50%, #C9A227 100%)', color: '#fff', fontWeight: 700, fontSize: '14px', boxShadow: '0 4px 16px rgba(201,162,39,0.3)' }}>
                  Retour à l'accueil
                </motion.button>
                <motion.button onClick={() => navigate('/collection')} className="w-full py-4 rounded-2xl" whileTap={{ scale: 0.97 }} style={{ background: 'transparent', border: `1px solid ${BORDER}`, color: MUTED, fontSize: '13px', fontWeight: 600 }}>
                  Explorer la collection
                </motion.button>
              </div>

              <div className="flex items-center gap-2">
                <Diamond size={12} color={GOLD} />
                <p style={{ color: MUTED, fontSize: '11px' }}>MAISON MARNOA · Haute Joaillerie</p>
                <Diamond size={12} color={GOLD} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}