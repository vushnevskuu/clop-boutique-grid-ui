import { useMemo } from "react";
import type { Product } from "@/types/product";
import { getPublicSiteUrl } from "@/data/geoFaq";
import { formatProductCardTitle } from "@/lib/productCardDisplay";

interface GeoProductJsonLdProps {
  product: Product;
}

/** Из строки вида «35 000 ₽» — число для schema.org (RUB, без копеек). */
function parseOfferPrice(priceLabel: string): string | undefined {
  const n = priceLabel.replace(/\s/g, "").replace(/[^0-9.]/g, "");
  return n.length > 0 ? n : undefined;
}

export default function GeoProductJsonLd({ product }: GeoProductJsonLdProps) {
  const siteUrl = getPublicSiteUrl();
  const idEnc = encodeURIComponent(String(product.id));
  const pageUrl = `${siteUrl}/?item=${idEnc}`;
  const title = formatProductCardTitle(product.title);
  const images = (product.images?.length ? product.images : [product.image].filter(Boolean)) as string[];
  const absImages = images.map((src) => (src.startsWith("http") ? src : `${siteUrl}${src}`));
  const priceStr = product.price ? parseOfferPrice(product.price) : undefined;

  const jsonLd = useMemo(() => {
    const node: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: title,
      description: product.description || `Вещь из каталога CLOP: ${title}.`,
      sku: String(product.id),
      brand: product.brand
        ? { "@type": "Brand", name: product.brand }
        : { "@type": "Brand", name: "CLOP" },
    };
    if (absImages.length) node.image = absImages;
    if (priceStr) {
      node.offers = {
        "@type": "Offer",
        url: pageUrl,
        priceCurrency: "RUB",
        price: priceStr,
        availability: "https://schema.org/InStock",
        seller: {
          "@type": "Organization",
          name: "CLOP",
          url: siteUrl,
        },
      };
    }
    return node;
  }, [title, product.description, product.brand, product.id, absImages, priceStr, pageUrl, siteUrl]);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
