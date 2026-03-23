import path from 'path';
import dotenv from 'dotenv';

const backendEnvPath = path.resolve(process.cwd(), 'backend/.env');
const rootEnvPath = path.resolve(process.cwd(), '.env');

dotenv.config({ path: backendEnvPath, quiet: true });
dotenv.config({ path: rootEnvPath, override: false, quiet: true });

dotenv.config({ quiet: true });

function parsePort(raw: string | undefined, fallback: number): number {
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parsePort(process.env.PORT, 3000),
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  BACKEND_URL: process.env.BACKEND_URL || `http://localhost:${parsePort(process.env.PORT, 3000)}`,
  ADMIN_WHATSAPP_NUMBER: process.env.ADMIN_WHATSAPP_NUMBER || '',
  CALLMEBOT_APIKEY: process.env.CALLMEBOT_APIKEY || '',
  WAVE_API_KEY: process.env.WAVE_API_KEY || '',
  WAVE_MERCHANT_URL: process.env.WAVE_MERCHANT_URL || '',   // ex: https://pay.wave.com/m/M_ci_xxx/c/ci/
  WAVE_SUCCESS_URL: process.env.WAVE_SUCCESS_URL || 'http://localhost:5173/order-confirmation',
  WAVE_ERROR_URL: process.env.WAVE_ERROR_URL || 'http://localhost:5173/checkout',
  // Google OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  // SMTP (MailHog in dev)
  SMTP_HOST: process.env.SMTP_HOST || 'localhost',
  SMTP_PORT: parsePort(process.env.SMTP_PORT, 1025),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_FROM: process.env.SMTP_FROM || 'Maison Marnoa <noreply@maisonmarnoa.com>',
};
