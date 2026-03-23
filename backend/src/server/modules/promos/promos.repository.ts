import { prisma } from '../../common/prisma';
import type { PromoCreateInput } from './promos.types';

export const promosRepository = {
  findByCode(code: string) {
    return prisma.promoCode.findUnique({ where: { code: code.toUpperCase() } });
  },

  list() {
    return prisma.promoCode.findMany({ orderBy: { createdAt: 'desc' } });
  },

  create(data: PromoCreateInput) {
    return prisma.promoCode.create({
      data: {
        code: data.code.toUpperCase().trim(),
        discount: data.discount,
        maxUses: data.maxUses ?? null,
        expiresAt: data.expiresAt ?? null,
      },
    });
  },

  incrementUsed(code: string) {
    return prisma.promoCode.update({
      where: { code: code.toUpperCase() },
      data: { usedCount: { increment: 1 } },
    });
  },

  toggle(id: string, isActive: boolean) {
    return prisma.promoCode.update({ where: { id }, data: { isActive } });
  },

  remove(id: string) {
    return prisma.promoCode.delete({ where: { id } });
  },
};
