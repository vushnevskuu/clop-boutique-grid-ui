import Medusa from "@medusajs/js-sdk";
import type { Product } from "@/types/product";

/** Medusa Store API: минимальные поля для маппинга (типы API гибкие между версиями). */
type MedusaImage = { url?: string | null };
type MedusaCalculatedPrice = {
  calculated_amount?: number | string | null;
  currency_code?: string | null;
};
type MedusaVariant = {
  calculated_price?: MedusaCalculatedPrice | null;
};
type MedusaStoreProduct = {
  id: string;
  title: string;
  handle: string;
  description?: string | null;
  subtitle?: string | null;
  images?: MedusaImage[] | null;
  metadata?: Record<string, unknown> | null;
  variants?: MedusaVariant[] | null;
};

function parseSizesFromMetadata(metadata: Record<string, unknown> | null | undefined): Product["sizes"] {
  if (!metadata) return [];
  const raw = metadata.clop_sizes;
  if (typeof raw !== "string" || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((row): row is Record<string, string> => row !== null && typeof row === "object");
  } catch {
    return [];
  }
}

function formatPriceFromCalculated(cp: MedusaCalculatedPrice | null | undefined, fallback: string): string {
  if (!cp || cp.calculated_amount == null) return fallback;
  const raw = cp.calculated_amount;
  const n = typeof raw === "string" ? Number(raw) : Number(raw);
  if (!Number.isFinite(n)) return fallback;
  const code = (cp.currency_code ?? "rub").toUpperCase();
  const currency = code === "RUR" ? "RUB" : code;
  try {
    const major = n / 100;
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: currency === "RUB" ? "RUB" : currency,
      maximumFractionDigits: 0,
    }).format(major);
  } catch {
    return fallback;
  }
}

function derivePrice(p: MedusaStoreProduct, fallback: string): string {
  const meta = p.metadata ?? {};
  if (typeof meta.clop_price_label === "string" && meta.clop_price_label.trim()) {
    return meta.clop_price_label.trim();
  }
  const v = p.variants?.[0];
  return formatPriceFromCalculated(v?.calculated_price ?? null, fallback);
}

export function mapMedusaStoreProductToProduct(p: MedusaStoreProduct, fallbackPrice: string): Product {
  const urls = (p.images ?? [])
    .map((i) => i.url)
    .filter((u): u is string => typeof u === "string" && u.length > 0);

  const description = [p.description, p.subtitle].filter(Boolean).join("\n\n").trim();

  return {
    id: p.handle || p.id,
    title: p.title,
    description,
    sizes: parseSizesFromMetadata(p.metadata),
    images: urls,
    image: urls[0] ?? "",
    hoverImage: urls[1] ?? urls[0] ?? "",
    price: derivePrice(p, fallbackPrice),
  };
}

export function isMedusaConfigured(): boolean {
  const url = import.meta.env.VITE_MEDUSA_BACKEND_URL;
  const pk = import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY;
  return typeof url === "string" && url.length > 0 && typeof pk === "string" && pk.length > 0;
}

const DEFAULT_FALLBACK_PRICE = "10 000 ₽";

/**
 * Загрузка опубликованных товаров из Medusa Store API.
 * В админке: регион с RUB, sales channel, publishable key для витрины.
 */
export async function loadProductsFromMedusa(): Promise<Product[]> {
  const baseUrl = import.meta.env.VITE_MEDUSA_BACKEND_URL as string;
  const publishableKey = import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY as string;

  const medusa = new Medusa({
    baseUrl: baseUrl.replace(/\/$/, ""),
    publishableKey,
  });

  const { regions } = await medusa.store.region.list({ limit: 50 });
  const regionId =
    regions.find((r) => (r.currency_code ?? "").toLowerCase() === "rub")?.id ?? regions[0]?.id;

  if (!regionId) {
    throw new Error(
      "Medusa: не найден регион. Создайте регион с валютой RUB в админке (Settings → Regions).",
    );
  }

  const { products } = await medusa.store.product.list({
    region_id: regionId,
    limit: 100,
    fields: "*variants.calculated_price,+variants.calculated_price,*images",
  });

  let list = (products ?? []) as MedusaStoreProduct[];

  list = list.filter((p) => {
    const hidden = p.metadata?.clop_hidden;
    return hidden !== true && hidden !== "true" && hidden !== "1";
  });

  list.sort((a, b) => {
    const ao = Number(a.metadata?.clop_order ?? 999);
    const bo = Number(b.metadata?.clop_order ?? 999);
    const na = Number.isFinite(ao) ? ao : 999;
    const nb = Number.isFinite(bo) ? bo : 999;
    if (na !== nb) return na - nb;
    return (a.title ?? "").localeCompare(b.title ?? "", "ru");
  });

  return list.map((p) => mapMedusaStoreProductToProduct(p, DEFAULT_FALLBACK_PRICE));
}
