import { prisma } from '../../common/prisma';
import type { AppointmentCreateInput } from './appointments.types';

function defaultAvailability(): Record<string, { open: boolean; slots: string[] }> {
  const defaultSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
  return {
    '1': { open: true,  slots: defaultSlots },
    '2': { open: true,  slots: defaultSlots },
    '3': { open: true,  slots: defaultSlots },
    '4': { open: true,  slots: defaultSlots },
    '5': { open: true,  slots: defaultSlots },
    '6': { open: true,  slots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
    '0': { open: false, slots: [] },
  };
}

export const appointmentsRepository = {
  create(data: AppointmentCreateInput) {
    return prisma.appointment.create({ data });
  },

  listByContact(phone: string, email: string) {
    return prisma.appointment.findMany({
      where: {
        OR: [
          phone ? { customerPhone: phone } : undefined,
          email ? { customerEmail: email } : undefined,
        ].filter(Boolean) as object[],
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  },

  listAll(limit = 50, offset = 0) {
    return prisma.appointment.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  },

  updateStatus(ref: string, status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED') {
    return prisma.appointment.update({
      where: { ref },
      data: { status },
    });
  },

  // ── Availability settings ──
  async getAvailability(): Promise<Record<string, { open: boolean; slots: string[] }>> {
    const row = await prisma.setting.findUnique({ where: { key: 'availability' } });
    if (!row) return defaultAvailability();
    try { return JSON.parse(row.value) as Record<string, { open: boolean; slots: string[] }>; }
    catch { return defaultAvailability(); }
  },

  async saveAvailability(config: Record<string, { open: boolean; slots: string[] }>) {
    return prisma.setting.upsert({
      where: { key: 'availability' },
      update: { value: JSON.stringify(config) },
      create: { key: 'availability', value: JSON.stringify(config) },
    });
  },

  findBookedSlotsForDate(date: string) {
    return prisma.appointment.findMany({
      where: { date, status: { not: 'CANCELLED' } },
      select: { slot: true },
    });
  },
};
