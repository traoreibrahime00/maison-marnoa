import { useEffect, useState } from 'react';
import { formatPrice } from '../../data/products';
import { apiUrl } from '../../lib/api';
import { useColors } from '../../context/AppContext';

type PaymentRow = {
  id: string;
  method: 'WHATSAPP' | 'WAVE';
  status: string;
  amount: number;
  currency: string;
  externalRef: string;
  transactionId?: string | null;
  createdAt: string;
  order?: {
    orderRef: string;
    customerName: string;
    customerPhone: string;
    status?: string;
  };
};

export default function AdminPayments() {
  const { BG, CARD_BG, BORDER, TEXT, MUTED } = useColors();
  const [rows, setRows] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/admin/payments?limit=120'));
      if (!res.ok) throw new Error('Failed to fetch payments');
      const data = (await res.json()) as PaymentRow[];
      setRows(data);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const markSuccess = async (externalRef: string) => {
    const res = await fetch(apiUrl('/api/payments/wave/webhook'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        externalRef,
        status: 'SUCCESS',
        transactionId: `TX-${Date.now()}`,
      }),
    });

    if (!res.ok) return;
    await load();
  };

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
      <div className="grid grid-cols-[1fr_120px_110px_140px_140px_170px_130px] px-4 py-3" style={{ background: CARD_BG, borderBottom: `1px solid ${BORDER}` }}>
        {['Commande', 'Méthode', 'Statut', 'Montant', 'Référence', 'Date', 'Action'].map(h => (
          <span key={h} style={{ color: MUTED, fontSize: '11px', fontWeight: 700, fontFamily: 'Manrope, sans-serif' }}>{h}</span>
        ))}
      </div>

      {loading ? (
        <div className="px-4 py-6" style={{ color: MUTED, fontFamily: 'Manrope, sans-serif' }}>Chargement des paiements…</div>
      ) : rows.length === 0 ? (
        <div className="px-4 py-6" style={{ color: MUTED, fontFamily: 'Manrope, sans-serif' }}>Aucun paiement.</div>
      ) : (
        rows.map((payment, idx) => (
          <div
            key={payment.id}
            className="grid grid-cols-[1fr_120px_110px_140px_140px_170px_130px] px-4 py-3 items-center"
            style={{ background: idx % 2 ? BG : CARD_BG, borderBottom: `1px solid ${BORDER}` }}
          >
            <div>
              <p style={{ color: TEXT, fontSize: '12px', fontWeight: 700, fontFamily: 'Manrope, sans-serif' }}>{payment.order?.orderRef || '-'}</p>
              <p style={{ color: MUTED, fontSize: '10px', fontFamily: 'Manrope, sans-serif' }}>{payment.order?.customerName || '-'}</p>
            </div>
            <span style={{ color: MUTED, fontSize: '11px', fontFamily: 'Manrope, sans-serif' }}>{payment.method}</span>
            <span style={{ color: payment.status === 'SUCCESS' ? '#22c55e' : MUTED, fontSize: '11px', fontWeight: 700, fontFamily: 'Manrope, sans-serif' }}>{payment.status}</span>
            <span style={{ color: TEXT, fontSize: '12px', fontWeight: 700, fontFamily: 'Manrope, sans-serif' }}>{formatPrice(payment.amount)}</span>
            <span style={{ color: MUTED, fontSize: '10px', fontFamily: 'Manrope, sans-serif' }}>{payment.externalRef}</span>
            <span style={{ color: MUTED, fontSize: '11px', fontFamily: 'Manrope, sans-serif' }}>{new Date(payment.createdAt).toLocaleString('fr-CI')}</span>
            <div>
              {payment.method === 'WAVE' && payment.status !== 'SUCCESS' ? (
                <button
                  onClick={() => markSuccess(payment.externalRef)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '8px',
                    border: '1px solid #2563EB',
                    background: 'rgba(37,99,235,0.14)',
                    color: '#60A5FA',
                    fontSize: '10px',
                    fontWeight: 700,
                    fontFamily: 'Manrope, sans-serif',
                    cursor: 'pointer',
                  }}
                >
                  Marquer payé
                </button>
              ) : (
                <span style={{ color: MUTED, fontSize: '10px', fontFamily: 'Manrope, sans-serif' }}>—</span>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
