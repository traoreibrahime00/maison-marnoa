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

const PROMISE_DEFAULTS = {
  imageUrl:    '',
  badge:       'Notre Promesse',
  title1:      'La Haute Joaillerie',
  title2:      'à votre portée',
  description: 'Maison Marnoa sélectionne rigoureusement les plus belles pièces auprès des meilleurs créateurs et maisons joaillières à travers le monde, pour vous les proposer à Abidjan.',
  stat1Label:  'Or 18K',
  stat1Sub:    'Certifié',
  stat2Label:  '100%',
  stat2Sub:    'Sélectionnés',
  stat3Label:  'Monde',
  stat3Sub:    'Origines',
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

settingsRouter.get(
  '/promise',
  asyncHandler(async (_req, res) => {
    const [
      imageUrl, badge, title1, title2, description,
      stat1Label, stat1Sub, stat2Label, stat2Sub, stat3Label, stat3Sub,
    ] = await Promise.all([
      shippingService.getSetting('promise_image_url',   PROMISE_DEFAULTS.imageUrl),
      shippingService.getSetting('promise_badge',       PROMISE_DEFAULTS.badge),
      shippingService.getSetting('promise_title1',      PROMISE_DEFAULTS.title1),
      shippingService.getSetting('promise_title2',      PROMISE_DEFAULTS.title2),
      shippingService.getSetting('promise_description', PROMISE_DEFAULTS.description),
      shippingService.getSetting('promise_stat1_label', PROMISE_DEFAULTS.stat1Label),
      shippingService.getSetting('promise_stat1_sub',   PROMISE_DEFAULTS.stat1Sub),
      shippingService.getSetting('promise_stat2_label', PROMISE_DEFAULTS.stat2Label),
      shippingService.getSetting('promise_stat2_sub',   PROMISE_DEFAULTS.stat2Sub),
      shippingService.getSetting('promise_stat3_label', PROMISE_DEFAULTS.stat3Label),
      shippingService.getSetting('promise_stat3_sub',   PROMISE_DEFAULTS.stat3Sub),
    ]);
    res.json({
      imageUrl, badge, title1, title2, description,
      stat1Label, stat1Sub, stat2Label, stat2Sub, stat3Label, stat3Sub,
    });
  })
);

settingsRouter.get(
  '/general',
  asyncHandler(async (_req, res) => {
    const [hidePrices, hideStock] = await Promise.all([
      shippingService.getSetting('hide_prices', 'false'),
      shippingService.getSetting('hide_stock', 'false'),
    ]);
    res.json({ hidePrices: hidePrices === 'true', hideStock: hideStock === 'true' });
  })
);
