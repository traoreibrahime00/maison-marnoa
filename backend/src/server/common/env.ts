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
};
