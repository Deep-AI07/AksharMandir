/**
 * Image Utilities for Akshar Mandir
 * Provides robust extraction, fallback handling, and error recovery for all Mandir images.
 */

export const DEFAULT_MANDIR_IMAGE = '/images/mandirs/mandir_royal_sheesham.jpg';
export const DEFAULT_HERO_IMAGE = '/images/mandirs/mandir_hero_banner.jpg';

export const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  traditional: '/images/mandirs/mandir_royal_sheesham.jpg',
  modern: '/images/mandirs/mandir_aura_modern.jpg',
  'home-mandirs': '/images/mandirs/mandir_devi_sanctum.jpg',
  'temple-style': '/images/mandirs/mandir_grand_haveli.jpg',
  designer: '/images/mandirs/mandir_lotus_brass.jpg',
  compact: '/images/mandirs/mandir_wall_shrine.jpg',
};

const UNRELATED_IMAGE_MAP: Record<string, string> = {
  '1600585154340': '/images/mandirs/mandir_royal_sheesham.jpg',
  '1616486338812': '/images/mandirs/mandir_aura_modern.jpg',
  '1513694203232': '/images/mandirs/mandir_devi_sanctum.jpg',
  '1600585152220': '/images/mandirs/mandir_grand_haveli.jpg',
  '1618221195710': '/images/mandirs/mandir_lotus_brass.jpg',
  '1615529182904': '/images/mandirs/mandir_wall_shrine.jpg',
  '1544717305': '/images/mandirs/mandir_royal_sheesham.jpg',
  '1609766857041': '/images/mandirs/mandir_detail_bells.jpg',
  '1567157577867': '/images/mandirs/mandir_sanctum_aarti.jpg',
  '1583847268964': '/images/mandirs/mandir_white_marble.jpg',
  '1600210492486': '/images/mandirs/mandir_detail_bells.jpg',
  '1600565193348': '/images/mandirs/mandir_gilded_gopuram.jpg',
};

export function normalizeMandirImageUrl(url: string): string {
  if (!url || typeof url !== 'string') return DEFAULT_MANDIR_IMAGE;
  const clean = url.trim();
  for (const [key, replacement] of Object.entries(UNRELATED_IMAGE_MAP)) {
    if (clean.includes(key)) {
      return replacement;
    }
  }
  return clean;
}

/**
 * Safely extracts an image URL from either:
 * - A Product object (p.images)
 * - An array of image URLs or image objects ({ url: string })
 * - A single string or image object
 */
export function getProductImageUrl(
  source: any,
  index: number = 0,
  fallback: string = DEFAULT_MANDIR_IMAGE
): string {
  if (!source) return fallback;

  // If source is a string URL
  if (typeof source === 'string' && source.trim().length > 0 && source !== '[object Object]') {
    return normalizeMandirImageUrl(source);
  }

  // If source is a product object with images array
  let imagesArray: any[] = [];
  if (Array.isArray(source.images)) {
    imagesArray = source.images;
  } else if (Array.isArray(source)) {
    imagesArray = source;
  } else if (source.url && typeof source.url === 'string') {
    return normalizeMandirImageUrl(source.url);
  } else if (source.image && typeof source.image === 'string') {
    return normalizeMandirImageUrl(source.image);
  }

  if (imagesArray.length === 0) {
    return fallback;
  }

  const target = imagesArray[index] ?? imagesArray[0];
  if (!target) return fallback;

  if (typeof target === 'string' && target.trim().length > 0 && target !== '[object Object]') {
    return normalizeMandirImageUrl(target);
  }

  if (typeof target === 'object' && target !== null && typeof target.url === 'string') {
    return normalizeMandirImageUrl(target.url);
  }

  return fallback;
}

/**
 * Safely gets all image URLs as strings from a product or array
 */
export function getAllProductImages(
  source: any,
  fallback: string = DEFAULT_MANDIR_IMAGE
): string[] {
  if (!source) return [fallback];

  let rawList: any[] = [];
  if (Array.isArray(source.images)) {
    rawList = source.images;
  } else if (Array.isArray(source)) {
    rawList = source;
  } else if (typeof source === 'string') {
    return [source];
  }

  const result: string[] = [];
  for (const item of rawList) {
    if (typeof item === 'string' && item.trim().length > 0 && item !== '[object Object]') {
      result.push(item.trim());
    } else if (typeof item === 'object' && item !== null && typeof item.url === 'string') {
      result.push(item.url.trim());
    }
  }

  return result.length > 0 ? result : [fallback];
}

/**
 * Safely gets category image
 */
export function getCategoryImageUrl(category: any): string {
  if (!category) return DEFAULT_MANDIR_IMAGE;
  if (typeof category === 'string') return normalizeMandirImageUrl(category);
  if (category.image && typeof category.image === 'string' && category.image !== '[object Object]') {
    return normalizeMandirImageUrl(category.image);
  }
  const slug = category.slug || '';
  return CATEGORY_FALLBACK_IMAGES[slug] || DEFAULT_MANDIR_IMAGE;
}

/**
 * Image onError handler to prevent broken image icons by replacing with fallback
 */
export function handleImageError(
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  fallback: string = DEFAULT_MANDIR_IMAGE
): void {
  const target = event.currentTarget;
  if (target.src !== fallback) {
    target.src = fallback;
  }
}
