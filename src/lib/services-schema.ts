import type { Lang } from '../types';

/** Un peldaño del catálogo, tal y como vive en `services.ladder.items`. */
export interface ServiceLadderItem {
  step: string;
  id: string;
  name: string;
  tagline: string;
}

interface BuildServicesSchemaOptions {
  lang: Lang;
  pageUrl: string;
  items: ServiceLadderItem[];
}

/**
 * Los precios se declaran aquí y no se parsean del copy: el copy lleva formato
 * humano ("1.200 €", "Desde 1.800 €") y cambia de idioma, mientras que el
 * schema necesita un número limpio. La clave es `step` porque es lo único
 * idéntico entre es.json y en.json — los `id` están traducidos.
 */
const PRICING_BY_STEP: Record<
  string,
  { price?: string; minPrice?: string; perMonth?: boolean }
> = {
  '01': { price: '290' },
  '02': { minPrice: '1200' },
  '03': { minPrice: '1800' },
  '04': { minPrice: '149', perMonth: true },
};

const CURRENCY = 'EUR';

/** Código UN/CEFACT de «mes», para los servicios facturados mensualmente. */
const UNIT_CODE_MONTH = 'MON';

function buildOffer(item: ServiceLadderItem, provider: object) {
  const pricing = PRICING_BY_STEP[item.step];

  const priceFields = pricing?.price
    ? { price: pricing.price, priceCurrency: CURRENCY }
    : {
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          priceCurrency: CURRENCY,
          minPrice: pricing?.minPrice,
          ...(pricing?.perMonth ? { unitCode: UNIT_CODE_MONTH } : {}),
        },
      };

  return {
    '@type': 'Offer',
    name: item.name,
    description: item.tagline,
    ...priceFields,
    itemOffered: {
      '@type': 'Service',
      name: item.name,
      description: item.tagline,
      serviceType: 'Web accessibility',
      provider,
    },
  };
}

export function buildServicesSchema({
  lang,
  pageUrl,
  items,
}: BuildServicesSchemaOptions) {
  const provider = {
    '@type': 'Person',
    name: 'Javier Piedra',
    url: 'https://jpiedra.com',
  };

  return {
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    name: lang === 'es' ? 'Servicios de accesibilidad web' : 'Web accessibility services',
    url: pageUrl,
    inLanguage: lang,
    provider,
    areaServed: {
      '@type': 'Country',
      name: lang === 'es' ? 'España' : 'Spain',
    },
    itemListElement: items.map((item) => buildOffer(item, provider)),
  };
}
