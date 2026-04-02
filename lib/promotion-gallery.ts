import type { PromotionItem } from "./site-config";

/** Immagini di atmosfera (public/) per riempire colonne laterali. */
const COLLAGE_FALLBACK_IMAGES = [
  "/FOTO_3.webp",
  "/FOTO_4.webp",
  "/FOTO_5.webp",
  "/FOTO_1.webp",
  "/f2.jpg",
  "/f3.jpg",
  "/f4.jpg",
  "/f5.jpg",
  "/f6.jpg"
];

/** URLs unicas: immagine principale + eventuali extra dalla galleria. */
export function promotionGalleryUrls(promo: PromotionItem): string[] {
  const main = promo.image?.trim() ?? "";
  const extras = (promo.images ?? []).map((u) => u.trim()).filter(Boolean);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const u of [main, ...extras]) {
    if (!u || seen.has(u)) continue;
    seen.add(u);
    out.push(u);
  }
  return out;
}

/**
 * Almeno 3 sorgenti per un vero collage: mantiene l'ordine (promo prima), poi fallback senza duplicati.
 */
export function expandCollageSources(urls: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const u of urls) {
    if (!u || seen.has(u)) continue;
    seen.add(u);
    out.push(u);
  }
  for (const f of COLLAGE_FALLBACK_IMAGES) {
    if (out.length >= 3) break;
    if (!seen.has(f)) {
      seen.add(f);
      out.push(f);
    }
  }
  return out.slice(0, 3);
}

/** Quattro URL: due a sinistra (stack) e due a destra (stack), centro = testo. */
export function expandQuadSources(urls: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const u of urls) {
    if (!u || seen.has(u)) continue;
    seen.add(u);
    out.push(u);
  }
  for (const f of COLLAGE_FALLBACK_IMAGES) {
    if (out.length >= 4) break;
    if (!seen.has(f)) {
      seen.add(f);
      out.push(f);
    }
  }
  const quad = out.slice(0, 4);
  const pad = quad[0] ?? "/FOTO_2.webp";
  while (quad.length < 4) quad.push(pad);
  return quad;
}

export function promotionQuadUrls(promo: PromotionItem): string[] {
  return expandQuadSources(promotionGalleryUrls(promo));
}
