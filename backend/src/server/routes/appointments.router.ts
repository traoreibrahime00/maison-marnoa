import { Router } from 'express';
import { asyncHandler, requireAdmin } from '../common/express';
import { HttpError } from '../common/errors';
import { appointmentsService } from '../modules/appointments/appointments.service';
import { prisma } from '../common/prisma';
import { env } from '../common/env';

export const appointmentsRouter = Router();

// POST /api/appointments — create
appointmentsRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const b = req.body as Record<string, unknown>;
    if (!b.ref || !b.service || !b.serviceLabel || !b.date || !b.slot || !b.customerName || !b.customerPhone) {
      throw new HttpError(400, 'Missing required appointment fields');
    }
    const appt = await appointmentsService.createOrGet({
      ref: String(b.ref),
      service: String(b.service),
      serviceLabel: String(b.serviceLabel),
      date: String(b.date),
      slot: String(b.slot),
      customerName: String(b.customerName),
      customerPhone: String(b.customerPhone),
      customerEmail: b.customerEmail ? String(b.customerEmail) : undefined,
      notes: b.notes ? String(b.notes) : undefined,
    });

    // Log notification for admin (WhatsApp)
    if (env.ADMIN_WHATSAPP_NUMBER) {
      const msg = `Nouveau RDV - ${b.serviceLabel} le ${b.date} a ${b.slot} - ${b.customerName} (${b.customerPhone})`;
      const waUrl = `https://wa.me/${env.ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
      prisma.notificationLog.create({
        data: {
          channel: 'WHATSAPP',
          type: 'APPOINTMENT_CREATED',
          recipient: env.ADMIN_WHATSAPP_NUMBER,
          status: 'QUEUED',
          message: msg,
          meta: { ref: appt?.ref, waUrl },
        },
      }).catch(() => {}); // fire-and-forget
    }

    res.status(201).json(appt);
  })
);

// GET /api/appointments/availability?date=YYYY-MM-DD — available slots for a date (public)
appointmentsRouter.get(
  '/availability',
  asyncHandler(async (req, res) => {
    const date = String(req.query.date || '').trim();
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new HttpError(400, 'date query param required (YYYY-MM-DD)');
    }
    const slots = await appointmentsService.getAvailableSlotsForDate(date);
    res.json({ date, slots });
  })
);

// GET /api/appointments/settings — admin reads weekly config
appointmentsRouter.get(
  '/settings',
  asyncHandler(async (_req, res) => {
    const config = await appointmentsService.getAvailability();
    res.json(config);
  })
);

// PUT /api/appointments/settings — admin saves weekly config
appointmentsRouter.put(
  '/settings',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const config = req.body as Record<string, { open: boolean; slots: string[] }>;
    if (!config || typeof config !== 'object') throw new HttpError(400, 'Invalid config');
    await appointmentsService.saveAvailability(config);
    res.json({ ok: true });
  })
);

// GET /api/appointments — list by contact (public) or all (admin only)
appointmentsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const phone = String(req.query.phone || '').trim();
    const email = String(req.query.email || '').trim();
    if (phone || email) {
      const appts = await appointmentsService.listByContact(phone, email);
      return res.json(appts);
    }
    // Listing all appointments requires admin
    throw new HttpError(401, 'Unauthorized');
  })
);

// GET /api/appointments/all — admin list with pagination
appointmentsRouter.get(
  '/all',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const offset = Number(req.query.offset) || 0;
    const appts = await appointmentsService.listAll(limit, offset);
    res.json(appts);
  })
);

// PATCH /api/appointments/:ref/status — update status
appointmentsRouter.patch(
  '/:ref/status',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { ref } = req.params;
    const { status } = req.body as { status: string };
    const allowed = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];
    if (!allowed.includes(status)) throw new HttpError(400, 'Invalid status');
    const appt = await appointmentsService.updateStatus(ref, status as 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED');
    res.json(appt);
  })
);
