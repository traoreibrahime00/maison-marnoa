import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Prisma } from '@prisma/client';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './auth/auth';
import { env } from './common/env';
import { HttpError } from './common/errors';
import { requireAdmin } from './common/express';
import { adminRouter } from './routes/admin.router';
import { appointmentsRouter } from './routes/appointments.router';
import { analyticsRouter } from './routes/analytics.router';
import { ordersRouter } from './routes/orders.router';
import { paymentsRouter } from './routes/payments.router';
import { productsRouter } from './routes/products.router';
import { promosRouter } from './routes/promos.router';
import { receiptsRouter } from './routes/receipts.router';
import { shippingRouter } from './routes/shipping.router';
import { settingsRouter } from './routes/settings.router';

export const app = express();

// Trust nginx reverse proxy
app.set('trust proxy', 1);

app.disable('x-powered-by');
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// Allow both www and non-www
const allowedOrigins = [
  env.FRONTEND_URL,
  env.FRONTEND_URL.replace('https://', 'https://www.'),
  env.FRONTEND_URL.replace('https://www.', 'https://'),
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // En production, rejeter les requêtes sans Origin (hors health check)
      if (!origin) {
        if (env.NODE_ENV === 'production') {
          callback(new Error('Origin header required'));
          return;
        }
        // Dev : autoriser sans Origin (Postman, curl, etc.)
        callback(null, true);
        return;
      }
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`Origin not allowed by CORS: ${origin}`));
    },
    credentials: true,
  })
);

// Rate limit on login: 8 attempts per 15 minutes per IP
const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de tentatives. Réessayez dans 15 minutes.' },
  skipSuccessfulRequests: true,
});

// Rate limit for sensitive lookup endpoints: 20 req / 5 min per IP
const lookupRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de tentatives. Réessayez dans 5 minutes.' },
});

// Rate limit on order creation: 10 commandes / 10 min par IP (anti-spam)
const orderCreateRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de commandes. Réessayez dans 10 minutes.' },
});

// Rate limit on appointment creation: 5 RDV / 10 min par IP
const appointmentCreateRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de demandes de RDV. Réessayez dans 10 minutes.' },
});

const authHandler = toNodeHandler(auth);
app.post('/api/auth/sign-in/email', loginRateLimit);
app.all(/^\/api\/auth(?:\/.*)?$/, (req, res) => {
  void authHandler(req, res);
});

app.use(express.json({ limit: '15mb' }));

app.get('/api/health', (_req, res) => {
  res.status(200).json({ ok: true, service: 'maison-marnoa-backend' });
});

app.get('/api/orders/lookup', lookupRateLimit);
app.post('/api/promos/validate', lookupRateLimit);
app.post('/api/orders/checkout', orderCreateRateLimit);
app.post('/api/orders', orderCreateRateLimit);
app.post('/api/appointments', appointmentCreateRateLimit);

app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/receipts', receiptsRouter);
app.use('/api/promos', promosRouter);
app.use('/api/admin', requireAdmin, adminRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/track', analyticsRouter);
app.use('/api/shipping', shippingRouter);
app.use('/api/settings', settingsRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error instanceof HttpError) {
    res.status(error.statusCode).json({ error: error.message, details: error.details });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Resource not found' });
      return;
    }
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'Resource already exists' });
      return;
    }
    // Ne jamais exposer les détails Prisma en prod
    console.error('[PrismaError]', error.code, error.message);
    res.status(400).json({ error: 'Invalid request' });
    return;
  }

  if (env.NODE_ENV === 'production') {
    console.error('[ExpressError]', error instanceof Error ? error.message : 'Unknown error');
  } else {
    console.error('[ExpressError]', error);
  }
  res.status(500).json({ error: 'Internal Server Error' });
});
