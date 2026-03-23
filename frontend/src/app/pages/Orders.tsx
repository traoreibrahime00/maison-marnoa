import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Package, RefreshCw } from 'lucide-react';
import { useApp, useColors } from '../context/AppContext';
import { formatPrice } from '../data/products';
import { apiUrl } from '../lib/api';

type OrderStatus = 'PENDING_WHATSAPP' | 'CONFIRMED' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

interface OrderItemDto {
  id: string;
  productName: string;
  quantity: number;
  lineTotal: number;
}

interface OrderDto {
  id: string;
  orderRef: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  items: OrderItemDto[];
  receipt?: {
    receiptNumber: string;
    paidAt?: string | null;
  } | null;
}

const STATUS_META: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  PENDING_WHATSAPP: { label: 'En attente WhatsApp', color: '#16a34a', bg: 'rgba(22,163,74,0.12)' },
  CONFIRMED: { label: 'Confirmée', color: '#2563eb', bg: 'rgba(37,99,235,0.12)' },
  PAID: { label: 'Payée', color: '#0891b2', bg: 'rgba(8,145,178,0.12)' },
  SHIPPED: { label: 'Expédiée', color: '#7c3aed', bg: 'rgba(124,58,237,0.12)' },
  DELIVERED: { label: 'Livrée', color: '#16a34a', bg: 'rgba(22,163,74,0.12)' },
  CANCELLED: { label: 'Annulée', color: '#dc2626', bg: 'rgba(220,38,38,0.12)' },
};

export default function Orders() {
  const navigate = useNavigate();
  const { currentUser, isLoggedIn } = useApp();
  const { BG, CARD_BG, BORDER, TEXT, MUTED, GOLD } = useColors();

  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const hasIdentity = Boolean(currentUser?.phone || currentUser?.email);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (currentUser?.phone) params.set('phone', currentUser.phone);
    if (currentUser?.email) params.set('email', currentUser.email);
    params.set('limit', '20');
    return params.toString();
  }, [currentUser?.phone, currentUser?.email]);

  useEffect(() => {
    let cancelled = false;

    async function loadOrders() {
      if (!isLoggedIn || !hasIdentity || !query) {
        setOrders([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const res = await fetch(apiUrl(`/api/orders?${query}`));
        if (!res.ok) throw new Error('Unable to fetch orders');
        const data = (await res.json()) as OrderDto[];
        if (!cancelled) setOrders(data);
      } catch {
        if (!cancelled) setError('Impossible de charger vos commandes pour le moment.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadOrders();
    return () => {
      cancelled = true;
    };
  }, [hasIdentity, isLoggedIn, query]);

  if (!isLoggedIn) {
    return (
      <div style={{ background: BG, minHeight: '100vh', fontFamily: 'Manrope, sans-serif' }} className="px-5 py-20">
        <div className="max-w-xl mx-auto text-center">
          <h1 style={{ color: TEXT, fontWeight: 800, fontSize: '24px', marginBottom: '10px' }}>Historique commandes</h1>
          <p style={{ color: MUTED, fontSize: '13px', lineHeight: 1.7, marginBottom: '18px' }}>
            Connectez-vous pour suivre vos commandes, paiements et livraisons.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 rounded-2xl"
            style={{ background: 'linear-gradient(135deg, #C9A227, #E8C84A)', color: '#fff', fontWeight: 700, fontSize: '14px' }}
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: 'Manrope, sans-serif' }}>
      <div className="px-5 pt-12 pb-4 flex items-center gap-3 sticky top-0 z-20" style={{ background: `${BG}F5`, backdropFilter: 'blur(20px)', borderBottom: `1px solid ${BORDER}` }}>
        <motion.button
          onClick={() => navigate('/profile')}
          whileTap={{ scale: 0.88 }}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}
        >
          <ArrowLeft size={18} color={TEXT} />
        </motion.button>
        <div className="flex-1">
          <p style={{ color: GOLD, fontWeight: 700, fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase' }}>Espace Client</p>
          <h1 style={{ color: TEXT, fontWeight: 800, fontSize: '20px' }}>Mes commandes</h1>
        </div>
      </div>

      <div className="px-4 py-4 pb-24 max-w-3xl mx-auto">
        <button
          onClick={() => window.location.reload()}
          className="mb-4 px-4 py-2 rounded-xl inline-flex items-center gap-2"
          style={{ background: CARD_BG, border: `1px solid ${BORDER}`, color: MUTED, fontSize: '12px', fontWeight: 600 }}
        >
          <RefreshCw size={13} />
          Rafraichir
        </button>

        {loading ? (
          <div className="rounded-2xl p-5" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
            <p style={{ color: MUTED, fontSize: '13px' }}>Chargement des commandes…</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl p-5" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
            <p style={{ color: '#dc2626', fontSize: '13px' }}>{error}</p>
          </div>
        ) : !hasIdentity ? (
          <div className="rounded-2xl p-6 text-center" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
            <p style={{ color: TEXT, fontWeight: 700, fontSize: '15px', marginBottom: '6px' }}>Profil incomplet</p>
            <p style={{ color: MUTED, fontSize: '12px' }}>
              Ajoutez votre téléphone ou email dans votre profil pour consulter l&apos;historique.
            </p>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl p-6 text-center" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
            <Package size={32} color={MUTED} className="mx-auto mb-3" />
            <p style={{ color: TEXT, fontWeight: 700, fontSize: '15px', marginBottom: '6px' }}>Aucune commande trouvée</p>
            <p style={{ color: MUTED, fontSize: '12px' }}>Passez votre première commande pour la voir ici.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {orders.map(order => {
              const status = STATUS_META[order.status] || STATUS_META.PENDING_WHATSAPP;
              const dateLabel = new Date(order.createdAt).toLocaleDateString('fr-CI', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              });

              return (
                <motion.div
                  key={order.id}
                  className="rounded-2xl p-4 cursor-pointer"
                  style={{ background: CARD_BG, border: `1px solid ${BORDER}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                  onClick={() => navigate('/order-confirmation', { state: { orderRef: order.orderRef } })}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p style={{ color: GOLD, fontWeight: 700, fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                        {order.orderRef}
                      </p>
                      <p style={{ color: MUTED, fontSize: '11px', marginTop: '2px' }}>{dateLabel}</p>
                    </div>
                    <span
                      className="px-2.5 py-1 rounded-full"
                      style={{ background: status.bg, color: status.color, fontWeight: 700, fontSize: '10px', whiteSpace: 'nowrap' }}
                    >
                      {status.label}
                    </span>
                  </div>

                  <div className="mb-3">
                    {order.items.slice(0, 3).map(item => (
                      <p key={item.id} style={{ color: TEXT, fontSize: '12px', lineHeight: 1.6 }}>
                        {item.quantity}× {item.productName}
                      </p>
                    ))}
                    {order.items.length > 3 && (
                      <p style={{ color: MUTED, fontSize: '11px', marginTop: '2px' }}>+ {order.items.length - 3} article(s)</p>
                    )}
                  </div>

                  <div className="pt-3 flex items-center justify-between" style={{ borderTop: `1px solid ${BORDER}` }}>
                    <div className="flex items-center gap-2">
                      <span style={{ color: MUTED, fontSize: '12px' }}>{order.items.length} article(s)</span>
                      {order.receipt && (
                        <button
                          onClick={() => window.open(apiUrl(`/api/receipts/${order.orderRef}/html`), '_blank')}
                          className="px-2 py-1 rounded-md"
                          style={{ background: 'rgba(201,162,39,0.12)', color: GOLD, fontSize: '10px', fontWeight: 700 }}
                        >
                          Reçu
                        </button>
                      )}
                    </div>
                    <span style={{ color: GOLD, fontWeight: 800, fontSize: '15px' }}>{formatPrice(order.total)}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
