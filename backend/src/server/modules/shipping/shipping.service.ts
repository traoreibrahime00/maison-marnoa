import { prisma } from '../../common/prisma';

export interface ShippingZoneInput {
  name: string;
  zoneKey: string;
  description?: string;
  icon?: string;
  price: number;
  isFree?: boolean;
  isActive?: boolean;
  sortOrder?: number;
}

export const shippingService = {
  getActiveZones() {
    return prisma.shippingZone.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  },

  getAllZones() {
    return prisma.shippingZone.findMany({ orderBy: { sortOrder: 'asc' } });
  },

  createZone(input: ShippingZoneInput) {
    return prisma.shippingZone.create({ data: input });
  },

  updateZone(id: string, input: Partial<ShippingZoneInput>) {
    return prisma.shippingZone.update({ where: { id }, data: input });
  },

  deleteZone(id: string) {
    return prisma.shippingZone.delete({ where: { id } });
  },

  async getSetting(key: string, fallback: string): Promise<string> {
    const row = await prisma.setting.findUnique({ where: { key } });
    return row?.value ?? fallback;
  },

  setSetting(key: string, value: string) {
    return prisma.setting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  },

  async getShippingSettings() {
    const [threshold, freeZone, codEnabled] = await Promise.all([
      shippingService.getSetting('shipping_free_threshold', '50000'),
      shippingService.getSetting('shipping_free_zone', 'abidjan'),
      shippingService.getSetting('shipping_cod_enabled', 'true'),
    ]);
    return {
      freeThreshold: Number(threshold) || 0,
      freeZone,
      codEnabled: codEnabled === 'true',
    };
  },
};
