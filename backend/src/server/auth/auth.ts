import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { env } from '../common/env';
import { prisma } from '../common/prisma';

const trustedOrigins = (process.env.BETTER_AUTH_TRUSTED_ORIGINS || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

if (!trustedOrigins.includes(env.FRONTEND_URL)) {
  trustedOrigins.push(env.FRONTEND_URL);
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || `${env.BACKEND_URL}/api/auth`,
  emailAndPassword: {
    enabled: true,
  },
  user: {
    modelName: 'User',
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: 'client',
        input: true,
      },
      phone: {
        type: 'string',
        required: false,
        input: true,
      },
    },
  },
  session: {
    modelName: 'Session',
  },
  account: {
    modelName: 'Account',
  },
  verification: {
    modelName: 'Verification',
  },
  trustedOrigins,
});
