import { Router } from 'express';
import { HttpError } from '../common/errors';
import { asyncHandler } from '../common/express';
import { receiptsService } from '../modules/receipts/receipts.service';

export const receiptsRouter = Router();

function formatFcfa(amount: number): string {
  return `${new Intl.NumberFormat('fr-CI').format(amount)} FCFA`;
}

function buildReceiptHtml(receipt: Awaited<ReturnType<typeof receiptsService.findByOrderRef>>): string {
  if (!receipt) return '';

  const issueDate = new Date(receipt.issuedAt).toLocaleString('fr-CI');
  const paidDate = receipt.paidAt ? new Date(receipt.paidAt).toLocaleString('fr-CI') : 'Non payé';

  const rows = receipt.order.items
    .map(
      item => `
      <tr>
        <td>${item.productName}</td>
        <td>${item.quantity}</td>
        <td>${formatFcfa(item.unitPrice)}</td>
        <td>${formatFcfa(item.lineTotal)}</td>
      </tr>`
    )
    .join('');

  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Reçu ${receipt.receiptNumber}</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 24px; color: #1b1208; }
      h1 { margin: 0 0 8px; }
      .muted { color: #6e5a45; }
      .card { border: 1px solid #e8dcc6; border-radius: 12px; padding: 16px; margin: 16px 0; }
      table { width: 100%; border-collapse: collapse; margin-top: 8px; }
      th, td { border-bottom: 1px solid #efe6d5; padding: 8px; text-align: left; font-size: 14px; }
      th { background: #fbf5ea; }
      .total { font-weight: 700; }
    </style>
  </head>
  <body>
    <h1>Maison Marnoa</h1>
    <div class="muted">Reçu ${receipt.receiptNumber}</div>

    <div class="card">
      <div><strong>Commande:</strong> ${receipt.order.orderRef}</div>
      <div><strong>Client:</strong> ${receipt.order.customerName}</div>
      <div><strong>Téléphone:</strong> ${receipt.order.customerPhone}</div>
      <div><strong>Email:</strong> ${receipt.order.customerEmail || '-'}</div>
      <div><strong>Émis le:</strong> ${issueDate}</div>
      <div><strong>Payé le:</strong> ${paidDate}</div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Produit</th>
          <th>Qté</th>
          <th>Prix unitaire</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <div class="card">
      <div><strong>Sous-total:</strong> ${formatFcfa(receipt.order.subtotal)}</div>
      <div><strong>Livraison:</strong> ${formatFcfa(receipt.order.deliveryPrice)}</div>
      <div><strong>Cadeau:</strong> ${formatFcfa(receipt.order.giftWrapFee)}</div>
      <div class="total"><strong>Total:</strong> ${formatFcfa(receipt.amount)}</div>
    </div>
  </body>
</html>`;
}

receiptsRouter.get(
  '/:orderRef',
  asyncHandler(async (req, res) => {
    const orderRef = String(req.params.orderRef || '').trim();
    if (!orderRef) throw new HttpError(400, 'Missing order reference');

    const receipt = await receiptsService.findByOrderRef(orderRef);
    if (!receipt) throw new HttpError(404, 'Receipt not found');

    res.status(200).json(receipt);
  })
);

receiptsRouter.get(
  '/:orderRef/html',
  asyncHandler(async (req, res) => {
    const orderRef = String(req.params.orderRef || '').trim();
    if (!orderRef) throw new HttpError(400, 'Missing order reference');

    const receipt = await receiptsService.findByOrderRef(orderRef);
    if (!receipt) throw new HttpError(404, 'Receipt not found');

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(buildReceiptHtml(receipt));
  })
);

receiptsRouter.post(
  '/:orderRef/send',
  asyncHandler(async (req, res) => {
    const orderRef = String(req.params.orderRef || '').trim();
    if (!orderRef) throw new HttpError(400, 'Missing order reference');

    const receipt = await receiptsService.findByOrderRef(orderRef);
    if (!receipt) throw new HttpError(404, 'Receipt not found');

    await receiptsService.markSent(orderRef);

    res.status(200).json({
      success: true,
      sentTo: receipt.customerEmail || null,
      message: receipt.customerEmail ? 'Receipt marked as sent (email provider to connect)' : 'Receipt marked as sent',
    });
  })
);
