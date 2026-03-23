import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { Prisma } from '@prisma/client';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './auth/auth';
import { env } from './common/env';
import { HttpError } from './common/errors';
import { adminRouter } from './routes/admin.router';
import { appointmentsRouter } from './routes/appointments.router';
import { analyticsRouter } from './routes/analytics.router';
import { ordersRouter } from './routes/orders.router';
import { paymentsRouter } from './routes/payments.router';
import { productsRouter } from './routes/products.router';
import { promosRouter } from './routes/promos.router';
import { receiptsRouter } from './routes/receipts.router';
import { shippingRouter } from './routes/shipping.router';

export const app = express();

app.disable('x-powered-by');

const allowedOrigins = [env.FRONTEND_URL].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
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

const authHandler = toNodeHandler(auth);
app.post('/api/auth/sign-in/email', loginRateLimit);
app.all(/^\/api\/auth(?:\/.*)?$/, (req, res) => {
  void authHandler(req, res);
});

app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => {
  res.status(200).json({ ok: true, service: 'maison-marnoa-backend' });
});

app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/receipts', receiptsRouter);
app.use('/api/promos', promosRouter);
app.use('/api/admin', adminRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/track', analyticsRouter);
app.use('/api/shipping', shippingRouter);

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
    res.status(400).json({ error: error.message, code: error.code });
    return;
  }

  console.error('[ExpressError]', error);
  res.status(500).json({ error: 'Internal Server Error' });
});
