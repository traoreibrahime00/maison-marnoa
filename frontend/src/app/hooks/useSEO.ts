import { useEffect } from 'react';

const SITE_NAME = 'Maison Marnoa';
const BASE_URL = 'https://maisonmarnoa.com';
export const DEFAULT_DESCRIPTION =
  "Notre marque est née d'un simple amour pour les bijoux. Une passion sincère qui nous inspire à créer des pièces élégantes, uniques et pleines de sens. Chaque bijou est pensé pour sublimer votre style et raconter une histoire — la vôtre.";

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  image?: string;
  jsonLd?: object | object[];
}

function setMeta(selector: string, attr: 'name' | 'property', key: string, value: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}

function setCanonical(href: string) {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }
  el.href = href;
}

export function useSEO({ title, description, canonical, image, jsonLd }: SEOProps = {}) {
  useEffect(() => {
    const fullTitle = title
      ? `${title} — ${SITE_NAME}`
      : `${SITE_NAME} — Haute Joaillerie à Abidjan`;
    const desc = description || DEFAULT_DESCRIPTION;
    const url = canonical ? `${BASE_URL}${canonical}` : BASE_URL;

    document.title = fullTitle;

    setMeta('meta', 'name', 'description', desc);
    setCanonical(url);
    setMeta('meta', 'property', 'og:title', fullTitle);
    setMeta('meta', 'property', 'og:description', desc);
    setMeta('meta', 'property', 'og:url', url);
    if (image) setMeta('meta', 'property', 'og:image', image);
    setMeta('meta', 'name', 'twitter:title', fullTitle);
    setMeta('meta', 'name', 'twitter:description', desc);
    if (image) setMeta('meta', 'name', 'twitter:image', image);

    // JSON-LD par page
    const existing = document.getElementById('page-jsonld');
    if (existing) existing.remove();

    if (jsonLd) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'page-jsonld';
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
      return () => { script.remove(); };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, canonical, image, JSON.stringify(jsonLd)]);
}
