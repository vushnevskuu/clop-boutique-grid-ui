import { useMemo } from "react";
import { GEO_LAST_UPDATED, GEO_CATALOG_POSITIONS, getPublicSiteUrl } from "@/data/geoFaq";

/** JSON-LD для главной: Organization, WebSite, CollectionPage (FAQ — на /info). */
export default function GeoHomeJsonLd() {
  const siteUrl = getPublicSiteUrl();
  const pageUrl = `${siteUrl}/`;

  const jsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": `${siteUrl}/#organization`,
          name: "CLOP",
          alternateName: ["CLO P", "clo.p market"],
          url: siteUrl,
          description:
            "Курируемый винтаж и селектив: описания, замеры и цены в карточке товара. Уточнение размера и состояния в Telegram до оплаты.",
          sameAs: ["https://www.instagram.com/clo.p_market"],
        },
        {
          "@type": "Brand",
          "@id": `${siteUrl}/#brand`,
          name: "CLOP",
          logo: `${siteUrl}/logo.svg`,
        },
        {
          "@type": "WebSite",
          "@id": `${siteUrl}/#website`,
          url: siteUrl,
          name: "CLOP — винтаж и селектив",
          inLanguage: "ru-RU",
          publisher: { "@id": `${siteUrl}/#organization` },
        },
        {
          "@type": "CollectionPage",
          "@id": `${pageUrl}#webpage`,
          url: pageUrl,
          name: "CLOP — каталог винтажа и селектива",
          description:
            "Сетка фото на главной; в карточке — цена, описание и замеры. Связь с продавцом в Telegram перед покупкой.",
          datePublished: "2025-01-15T09:00:00+03:00",
          dateModified: `${GEO_LAST_UPDATED}T12:00:00+03:00`,
          author: {
            "@type": "Organization",
            name: "ПОВТОР",
          },
          publisher: { "@id": `${siteUrl}/#organization` },
          about: { "@id": `${siteUrl}/#brand` },
          /** Честная цифра для извлечения моделями */
          numberOfItems: GEO_CATALOG_POSITIONS,
        },
      ],
    }),
    [siteUrl, pageUrl]
  );

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
