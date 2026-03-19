import { promosRepository } from './promos.repository';
import type { PromoCreateInput, PromoValidateResult } from './promos.types';

export const promosService = {
  listAll() {
    return promosRepository.list();
  },

  async validate(code: string): Promise<PromoValidateResult> {
    if (!code?.trim()) {
      return { valid: false, discount: 0, error: 'Code vide' };
    }

    const promo = await promosRepository.findByCode(code);

    if (!promo) {
      return { valid: false, discount: 0, error: 'Code promo invalide' };
    }
    if (!promo.isActive) {
      return { valid: false, discount: 0, error: 'Code promo désactivé' };
    }
    if (promo.expiresAt && promo.expiresAt < new Date()) {
      return { valid: false, discount: 0, error: 'Code promo expiré' };
    }
    if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
      return { valid: false, discount: 0, error: 'Code promo épuisé' };
    }

    return { valid: true, discount: promo.discount };
  },

  create(data: PromoCreateInput) {
    return promosRepository.create(data);
  },

  toggle(id: string, isActive: boolean) {
    return promosRepository.toggle(id, isActive);
  },

  remove(id: string) {
    return promosRepository.remove(id);
  },

  incrementUsed(code: string) {
    return promosRepository.incrementUsed(code);
  },
};
