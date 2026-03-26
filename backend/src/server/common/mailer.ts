import nodemailer from 'nodemailer';
import { env } from './env';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
});

export async function sendMail(options: {
  to: string;
  subject: string;
  html: string;
}) {
  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
}

export function buildWelcomeEmail(name: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#FDFAF4;font-family:Manrope,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FDFAF4;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#FFFFFF;border-radius:20px;border:1px solid #EDE5D0;overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#C9A227,#E8C84A);padding:36px 40px;text-align:center;">
            <p style="margin:0;color:#fff;font-weight:900;font-size:13px;letter-spacing:3px;text-transform:uppercase;">✦ MAISON MARNOA</p>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:12px;">Haute Joaillerie · Abidjan</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 32px;">
            <h1 style="margin:0 0 16px;color:#1C1510;font-size:24px;font-weight:800;line-height:1.3;">
              Bienvenue, ${name} ✨
            </h1>
            <p style="margin:0 0 16px;color:#8A7564;font-size:14px;line-height:1.8;">
              Nous sommes ravis de vous accueillir dans l'univers <strong style="color:#C9A227;">Maison Marnoa</strong> — votre destination de référence pour la haute joaillerie à Abidjan.
            </p>
            <p style="margin:0 0 28px;color:#8A7564;font-size:14px;line-height:1.8;">
              Votre compte est maintenant actif. Explorez nos collections exclusives de bagues, colliers, bracelets et montres d'exception, et réservez votre visite au showroom.
            </p>

            <!-- Divider -->
            <div style="height:1px;background:#EDE5D0;margin-bottom:28px;"></div>

            <!-- Features -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
              <tr>
                <td style="padding:0 0 16px;">
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="width:36px;height:36px;background:rgba(201,162,39,0.1);border-radius:10px;text-align:center;vertical-align:middle;font-size:16px;">💎</td>
                      <td style="padding-left:12px;vertical-align:middle;">
                        <p style="margin:0;color:#1C1510;font-weight:700;font-size:13px;">Collections exclusives</p>
                        <p style="margin:2px 0 0;color:#8A7564;font-size:12px;">Bagues, colliers, bracelets, montres</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:0 0 16px;">
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="width:36px;height:36px;background:rgba(201,162,39,0.1);border-radius:10px;text-align:center;vertical-align:middle;font-size:16px;">🏪</td>
                      <td style="padding-left:12px;vertical-align:middle;">
                        <p style="margin:0;color:#1C1510;font-weight:700;font-size:13px;">Showroom Cocody</p>
                        <p style="margin:2px 0 0;color:#8A7564;font-size:12px;">Réservez votre rendez-vous privé</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td>
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="width:36px;height:36px;background:rgba(201,162,39,0.1);border-radius:10px;text-align:center;vertical-align:middle;font-size:16px;">🚚</td>
                      <td style="padding-left:12px;vertical-align:middle;">
                        <p style="margin:0;color:#1C1510;font-weight:700;font-size:13px;">Livraison partout en CI</p>
                        <p style="margin:2px 0 0;color:#8A7564;font-size:12px;">Abidjan express · Intérieur du pays</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- CTA -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center">
                  <a href="https://maisonmarnoa.com" style="display:inline-block;background:linear-gradient(135deg,#C9A227,#E8C84A);color:#fff;font-weight:800;font-size:15px;text-decoration:none;padding:16px 48px;border-radius:16px;box-shadow:0 4px 20px rgba(201,162,39,0.35);">
                    Découvrir la collection
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 40px 28px;border-top:1px solid #EDE5D0;text-align:center;">
            <p style="margin:0 0 4px;color:#B0A090;font-size:11px;line-height:1.6;">
              Vous recevez cet email car vous venez de créer un compte sur maisonmarnoa.com.
            </p>
            <p style="margin:0;color:#B0A090;font-size:10px;letter-spacing:1px;">
              © 2026 MAISON MARNOA · Abidjan, Côte d'Ivoire
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
  `.trim();
}

export function buildResetPasswordEmail(name: string, resetUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#FDFAF4;font-family:Manrope,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FDFAF4;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#FFFFFF;border-radius:20px;border:1px solid #EDE5D0;overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#C9A227,#E8C84A);padding:32px 40px;text-align:center;">
            <p style="margin:0;color:#fff;font-weight:900;font-size:13px;letter-spacing:3px;text-transform:uppercase;">✦ MAISON MARNOA</p>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:12px;">Haute Joaillerie · Abidjan</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 32px;">
            <h1 style="margin:0 0 12px;color:#1C1510;font-size:22px;font-weight:800;line-height:1.3;">
              Réinitialisation de votre mot de passe
            </h1>
            <p style="margin:0 0 8px;color:#8A7564;font-size:14px;line-height:1.7;">
              Bonjour ${name},
            </p>
            <p style="margin:0 0 28px;color:#8A7564;font-size:14px;line-height:1.7;">
              Nous avons reçu une demande de réinitialisation du mot de passe associé à votre compte. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.
            </p>

            <!-- CTA -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding-bottom:28px;">
                  <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#C9A227,#E8C84A);color:#fff;font-weight:800;font-size:15px;text-decoration:none;padding:16px 40px;border-radius:16px;box-shadow:0 4px 20px rgba(201,162,39,0.35);">
                    Réinitialiser mon mot de passe
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 8px;color:#B0A090;font-size:12px;line-height:1.6;">
              Ce lien est valable <strong>1 heure</strong>. Si vous n'avez pas fait cette demande, ignorez cet email — votre compte est en sécurité.
            </p>
            <p style="margin:0;color:#B0A090;font-size:11px;word-break:break-all;">
              Ou copiez ce lien dans votre navigateur :<br/>
              <a href="${resetUrl}" style="color:#C9A227;">${resetUrl}</a>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 40px 28px;border-top:1px solid #EDE5D0;text-align:center;">
            <p style="margin:0;color:#B0A090;font-size:10px;letter-spacing:1px;">
              © 2026 MAISON MARNOA · Abidjan, Côte d'Ivoire
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
  `.trim();
}
