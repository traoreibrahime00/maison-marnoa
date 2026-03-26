import { prisma } from '../../common/prisma';
import type { ProductInput, ProductPatchInput } from './products.types';

export const productsRepository = {
  list() {
    return prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
  },

  findById(id: string) {
    return prisma.product.findUnique({ where: { id } });
  },

  upsert(data: ProductInput) {
    return prisma.product.upsert({
      where: { id: data.id },
      update: data,
      create: data,
    });
  },

  updateById(id: string, data: ProductPatchInput) {
    return prisma.product.update({
      where: { id },
      data,
    });
  },

  deleteById(id: string) {
    return prisma.product.delete({ where: { id } });
  },
};
