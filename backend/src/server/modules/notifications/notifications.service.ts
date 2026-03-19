import { prisma } from '../../common/prisma';
import { env } from '../../common/env';

function buildWhatsAppUrl(phone: string, message: string): string {
  const clean = phone.replace(/\D/g, '');
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

export const notificationsService = {
  async logOrderCreated(orderRef: string, customerPhone: string): Promise<void> {
    const adminNumber = env.ADMIN_WHATSAPP_NUMBER || undefined;
    const message = [
      `🛍️ *NOUVELLE COMMANDE — Maison Marnoa*`,
      ``,
      `📋 Référence : *#${orderRef}*`,
      `📱 Client : ${customerPhone}`,
      ``,
      `👉 Ouvrir le dashboard admin pour traiter cette commande.`,
    ].join('\n');

    const waUrl = adminNumber ? buildWhatsAppUrl(adminNumber, message) : undefined;

    await prisma.notificationLog.create({
      data: {
        channel: 'WHATSAPP',
        type: 'ORDER_CREATED',
        recipient: adminNumber,
        status: adminNumber ? 'QUEUED' : 'SKIPPED',
        message,
        meta: {
          orderRef,
          customerPhone,
          waClickUrl: waUrl ?? null,
          provider: 'WHATSAPP_CLICK_TO_CHAT',
        },
      },
    });
  },

  async logPaymentSucceeded(orderRef: string, externalRef: string, transactionId?: string): Promise<void> {
    const adminNumber = env.ADMIN_WHATSAPP_NUMBER || undefined;
    const message = [
      `✅ *PAIEMENT CONFIRMÉ — Maison Marnoa*`,
      ``,
      `📋 Commande : *#${orderRef}*`,
      `💳 Réf. Wave : ${externalRef}`,
      ...(transactionId ? [`🔖 Transaction : ${transactionId}`] : []),
      ``,
      `👉 Commande à expédier dès confirmation.`,
    ].join('\n');

    const waUrl = adminNumber ? buildWhatsAppUrl(adminNumber, message) : undefined;

    await prisma.notificationLog.create({
      data: {
        channel: 'WHATSAPP',
        type: 'PAYMENT_SUCCEEDED',
        recipient: adminNumber,
        status: adminNumber ? 'QUEUED' : 'SKIPPED',
        message,
        meta: {
          orderRef,
          externalRef,
          transactionId: transactionId ?? null,
          waClickUrl: waUrl ?? null,
        },
      },
    });
  },

  async logOrderStatusChanged(
    orderRef: string,
    newStatus: string,
    customerPhone: string,
    customerName: string
  ): Promise<void> {
    const STATUS_MESSAGES: Record<string, string> = {
      CONFIRMED:  `✅ *Commande confirmée !*\n\nBonjour ${customerName}, votre commande *#${orderRef}* a été confirmée.\nNous reviendrons vers vous pour finaliser le paiement. Merci ! 🙏`,
      PAID:       `💳 *Paiement validé !*\n\nBonjour ${customerName}, votre paiement pour la commande *#${orderRef}* a bien été reçu.\nVotre bijou est en cours de préparation. ✨`,
      SHIPPED:    `🚚 *Votre commande est en route !*\n\nBonjour ${customerName}, votre commande *#${orderRef}* a été expédiée.\nVous serez contacté(e) lors de la livraison. À très bientôt ! 💎`,
      DELIVERED:  `🎁 *Livraison effectuée !*\n\nBonjour ${customerName}, nous espérons que votre bijou vous ravit.\nN'hésitez pas à partager votre avis. Merci de votre confiance — Maison Marnoa 🙏`,
      CANCELLED:  `❌ *Commande annulée*\n\nBonjour ${customerName}, votre commande *#${orderRef}* a été annulée.\nContactez-nous si vous avez des questions. — Maison Marnoa`,
    };

    const message = STATUS_MESSAGES[newStatus];
    if (!message) return;

    const waUrl = buildWhatsAppUrl(customerPhone, message);

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
          waClickUrl: waUrl,
          direction: 'TO_CLIENT',
        },
      },
    });
  },

  listRecent(limit = 20) {
    const safeLimit = Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 200) : 20;
    return prisma.notificationLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: safeLimit,
    });
  },
};
