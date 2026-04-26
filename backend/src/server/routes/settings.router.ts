import { Router } from 'express';
import { asyncHandler } from '../common/express';
import { shippingService } from '../modules/shipping/shipping.service';

export const settingsRouter = Router();

const HERO_DEFAULTS = {
  mediaUrl:  '',
  mediaType: 'image',
  badge:     'Collection Exclusive',
  title1:    'Haute',
  title2:    'Joaillerie',
  subtitle:  "L'excellence joaillière au cœur d'Abidjan. Des créations soigneusement sélectionnées aux quatre coins du monde.",
  cta1:      'Explorer la collection',
  cta2:      'Showroom Abidjan',
};

const SHOWROOM_DEFAULTS = {
  bannerUrl: '',
  badge:     '✦ SHOWROOM ABIDJAN',
  title:     'Essayez en boutique',
  subtitle:  'Réservez votre rendez-vous',
};

settingsRouter.get(
  '/hero',
  asyncHandler(async (_req, res) => {
    const [mediaUrl, mediaType, badge, title1, title2, subtitle, cta1, cta2] = await Promise.all([
      shippingService.getSetting('hero_media_url',  HERO_DEFAULTS.mediaUrl),
      shippingService.getSetting('hero_media_type', HERO_DEFAULTS.mediaType),
      shippingService.getSetting('hero_badge',      HERO_DEFAULTS.badge),
      shippingService.getSetting('hero_title1',     HERO_DEFAULTS.title1),
      shippingService.getSetting('hero_title2',     HERO_DEFAULTS.title2),
      shippingService.getSetting('hero_subtitle',   HERO_DEFAULTS.subtitle),
      shippingService.getSetting('hero_cta1',       HERO_DEFAULTS.cta1),
      shippingService.getSetting('hero_cta2',       HERO_DEFAULTS.cta2),
    ]);
    res.json({ mediaUrl, mediaType, badge, title1, title2, subtitle, cta1, cta2 });
  })
);

settingsRouter.get(
  '/showroom',
  asyncHandler(async (_req, res) => {
    const [bannerUrl, badge, title, subtitle] = await Promise.all([
      shippingService.getSetting('showroom_banner_url', SHOWROOM_DEFAULTS.bannerUrl),
      shippingService.getSetting('showroom_badge',       SHOWROOM_DEFAULTS.badge),
      shippingService.getSetting('showroom_title',       SHOWROOM_DEFAULTS.title),
      shippingService.getSetting('showroom_subtitle',    SHOWROOM_DEFAULTS.subtitle),
    ]);
    res.json({ bannerUrl, badge, title, subtitle });
  })
);
