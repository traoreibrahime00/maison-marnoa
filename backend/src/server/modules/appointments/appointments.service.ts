import { Prisma } from '@prisma/client';
import { appointmentsRepository } from './appointments.repository';
import type { AppointmentCreateInput } from './appointments.types';

export const appointmentsService = {
  async createOrGet(input: AppointmentCreateInput) {
    try {
      return await appointmentsRepository.create(input);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        // duplicate ref — return existing
        return appointmentsRepository.listByContact(input.customerPhone, input.customerEmail ?? '').then(r => r[0]);
      }
      throw err;
    }
  },

  listByContact(phone: string, email: string) {
    return appointmentsRepository.listByContact(phone, email);
  },

  listAll(limit?: number, offset?: number) {
    return appointmentsRepository.listAll(limit, offset);
  },

  updateStatus(ref: string, status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED') {
    return appointmentsRepository.updateStatus(ref, status);
  },

  getAvailability() {
    return appointmentsRepository.getAvailability();
  },

  async saveAvailability(config: Record<string, { open: boolean; slots: string[] }>) {
    return appointmentsRepository.saveAvailability(config);
  },

  async getAvailableSlotsForDate(date: string): Promise<string[]> {
    const config = await appointmentsRepository.getAvailability();
    const dow = String(new Date(date).getDay());
    const dayConfig = config[dow];
    if (!dayConfig || !dayConfig.open || dayConfig.slots.length === 0) return [];
    const booked = await appointmentsRepository.findBookedSlotsForDate(date);
    const bookedSet = new Set(booked.map(b => b.slot));
    return dayConfig.slots.filter(s => !bookedSet.has(s));
  },
};
