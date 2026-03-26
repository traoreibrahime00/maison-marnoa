import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { env } from '../common/env';
import { prisma } from '../common/prisma';
import { sendMail, buildResetPasswordEmail, buildWelcomeEmail } from '../common/mailer';

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
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await sendMail({
        to: user.email,
        subject: 'Réinitialisation de votre mot de passe — Maison Marnoa',
        html: buildResetPasswordEmail(user.name || user.email, url),
      });
    },
  },
  user: {
    modelName: 'User',
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: 'client',
        input: false, // never trust client-supplied role
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
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          sendMail({
            to: user.email,
            subject: 'Bienvenue chez Maison Marnoa ✦',
            html: buildWelcomeEmail(user.name || user.email),
          }).catch(() => {});
        },
      },
    },
  },
});
