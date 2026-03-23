import { prisma } from '../../common/prisma';
import { env } from '../../common/env';

// ── WhatsApp helpers ────────────────────────────────────────────────────────

function buildWaClickUrl(phone: string, message: string): string {
  const clean = phone.replace(/\D/g, '');
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

/**
 * Send a WhatsApp message via CallMeBot (free, no business account needed).
 * Activation: send "I allow callmebot to send me messages" to +34 644 65 21 91 on WhatsApp
 * Docs: https://www.callmebot.com/blog/free-api-whatsapp-messages/
 */
async function sendViaCallMeBot(to: string, message: string): Promise<'SENT' | 'FAILED'> {
  if (!env.CALLMEBOT_APIKEY) return 'FAILED';

  const phone = to.replace(/\D/g, '');
  if (!phone) return 'FAILED';

  try {
    const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(message)}&apikey=${env.CALLMEBOT_APIKEY}`;
    const res = await fetch(url);
    return res.ok ? 'SENT' : 'FAILED';
  } catch {
    return 'FAILED';
  }
}

// ── Notification log + send ─────────────────────────────────────────────────

async function notifyAdmin(
  type: string,
  message: string,
  meta: Record<string, unknown> = {}
): Promise<void> {
  const adminNumber = env.ADMIN_WHATSAPP_NUMBER;
  const waClickUrl = adminNumber ? buildWaClickUrl(adminNumber, message) : null;

  // Try real send via CallMeBot
  const status = adminNumber
    ? await sendViaCallMeBot(adminNumber, message)
    : 'SKIPPED';

  await prisma.notificationLog.create({
    data: {
      channel: 'WHATSAPP',
      type,
      recipient: adminNumber || null,
      status,
      message,
      meta: { ...meta, waClickUrl, provider: 'CALLMEBOT' },
    },
  });
}

// ── Public service ──────────────────────────────────────────────────────────

export const notificationsService = {

  async logOrderCreated(
    orderRef: string,
    customerPhone: string,
    customerName?: string,
    total?: number
  ): Promise<void> {
    const message = [
      `🛍️ *NOUVELLE COMMANDE — Maison Marnoa*`,
      ``,
      `📋 Référence : *#${orderRef}*`,
      ...(customerName ? [`👤 Client : ${customerName}`] : []),
      `📱 Téléphone : ${customerPhone}`,
      ...(total ? [`💰 Total : ${total.toLocaleString('fr-FR')} FCFA`] : []),
      ``,
      `👉 Validez la commande dans le dashboard admin.`,
    ].join('\n');

    await notifyAdmin('ORDER_CREATED', message, { orderRef, customerPhone, customerName, total });
  },

  async logPaymentSucceeded(
    orderRef: string,
    externalRef: string,
    transactionId?: string
  ): Promise<void> {
    const message = [
      `✅ *PAIEMENT CONFIRMÉ — Maison Marnoa*`,
      ``,
      `📋 Commande : *#${orderRef}*`,
      `💳 Réf. Wave : ${externalRef}`,
      ...(transactionId ? [`🔖 Transaction : ${transactionId}`] : []),
      ``,
      `👉 Commande à expédier dès que possible.`,
    ].join('\n');

    await notifyAdmin('PAYMENT_SUCCEEDED', message, { orderRef, externalRef, transactionId });
  },

  async logOrderStatusChanged(
    orderRef: string,
    newStatus: string,
    customerPhone: string,
    customerName: string
  ): Promise<void> {
    const STATUS_MESSAGES: Record<string, string> = {
      CONFIRMED: `✅ *Commande confirmée !*\n\nBonjour ${customerName}, votre commande *#${orderRef}* a été confirmée.\nNous reviendrons vers vous pour finaliser le paiement. Merci ! 🙏`,
      PAID:      `💳 *Paiement validé !*\n\nBonjour ${customerName}, votre paiement pour la commande *#${orderRef}* a bien été reçu.\nVotre bijou est en cours de préparation. ✨`,
      SHIPPED:   `🚚 *Votre commande est en route !*\n\nBonjour ${customerName}, votre commande *#${orderRef}* a été expédiée.\nVous serez contacté(e) lors de la livraison. À très bientôt ! 💎`,
      DELIVERED: `🎁 *Livraison effectuée !*\n\nBonjour ${customerName}, nous espérons que votre bijou vous ravit.\nMerci de votre confiance — Maison Marnoa 🙏`,
      CANCELLED: `❌ *Commande annulée*\n\nBonjour ${customerName}, votre commande *#${orderRef}* a été annulée.\nContactez-nous si vous avez des questions. — Maison Marnoa`,
    };

    const message = STATUS_MESSAGES[newStatus];
    if (!message) return;

    // This one goes TO the client — admin clicks the waClickUrl to send manually
    const waClickUrl = buildWaClickUrl(customerPhone, message);

    await prisma.notificationLog.create({
      data: {
        channel: 'WHATSAPP',
        type: `ORDER_STATUS_${newStatus}`,
        recipient: customerPhone,
        status: 'QUEUED',
        message,
        meta: {
          orderRef,
          newStatus,
          customerPhone,
          waClickUrl,
          direction: 'TO_CLIENT',
          note: 'Admin clicks waClickUrl to send manually via WhatsApp',
        },
      },
    });
  },

  async logAppointmentCreated(
    ref: string,
    customerName: string,
    slot: string
  ): Promise<void> {
    const message = [
      `📅 *NOUVEAU RENDEZ-VOUS — Maison Marnoa*`,
      ``,
      `👤 Client : ${customerName}`,
      `🕐 Créneau : ${slot}`,
      `📋 Référence : *${ref}*`,
      ``,
      `👉 Confirmez ce rendez-vous dans le dashboard.`,
    ].join('\n');

    await notifyAdmin('APPOINTMENT_CREATED', message, { ref, customerName, slot });
  },

  listRecent(limit = 20) {
    const safeLimit = Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 200) : 20;
    return prisma.notificationLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: safeLimit,
    });
  },
};
