import { Truck, Shield, MessageCircle, RefreshCw } from 'lucide-react';
import { useColors } from '../context/AppContext';

const ITEMS = [
  { icon: Truck,          label: 'Livraison 48h',       sub: 'Abidjan & national' },
  { icon: Shield,         label: 'Paiement sécurisé',   sub: 'Wave & WhatsApp' },
  { icon: MessageCircle,  label: 'Support WhatsApp',     sub: '7j/7 · Réponse rapide' },
  { icon: RefreshCw,      label: 'Retour 7 jours',       sub: 'Satisfait ou remboursé' },
];

export function ReassuranceBanner() {
  const { BORDER, MUTED, GOLD } = useColors();

  return (
    <div
      className="hidden lg:flex items-center justify-center"
      style={{ borderBottom: `1px solid ${BORDER}` }}
    >
      {ITEMS.map((item, i) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="flex items-center gap-2.5 flex-1 justify-center py-3"
            style={{ borderRight: i < ITEMS.length - 1 ? `1px solid ${BORDER}` : 'none' }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: `rgba(201,162,39,0.08)` }}
            >
              <Icon size={13} color={GOLD} />
            </div>
            <div>
              <p style={{ color: MUTED, fontSize: '11px', fontWeight: 700, lineHeight: 1.3 }}>{item.label}</p>
              <p style={{ color: MUTED, fontSize: '9px', fontWeight: 400, opacity: 0.7 }}>{item.sub}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Version mobile : bandeau horizontal scrollable */
export function ReassuranceBannerMobile() {
  const { BORDER, MUTED, GOLD, CARD_BG } = useColors();

  return (
    <div
      className="lg:hidden flex gap-3 px-4 py-3 overflow-x-auto"
      style={{ scrollbarWidth: 'none', borderBottom: `1px solid ${BORDER}` }}
    >
      {ITEMS.map(item => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="flex items-center gap-2 flex-shrink-0 px-3 py-2 rounded-full"
            style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}
          >
            <Icon size={11} color={GOLD} />
            <span style={{ color: MUTED, fontSize: '10px', fontWeight: 600, whiteSpace: 'nowrap' }}>
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
