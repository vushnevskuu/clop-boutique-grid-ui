import { useMemo } from "react";
import { GEO_FAQ_ITEMS, GEO_LAST_UPDATED, getPublicSiteUrl } from "@/data/geoFaq";

/** JSON-LD для страницы /info: WebPage + FAQPage (видимый FAQ на этой же странице). */
export default function GeoInfoJsonLd() {
  const siteUrl = getPublicSiteUrl();
  const pageUrl = `${siteUrl}/info`;

  const jsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": `${siteUrl}/#organization`,
          name: "CLOP",
          url: siteUrl,
          sameAs: ["https://www.instagram.com/clo.p_market"],
        },
        {
          "@type": "WebPage",
          "@id": `${pageUrl}#webpage`,
          url: pageUrl,
          name: "О нас CLOP — FAQ, конфиденциальность, условия продажи",
          description:
            "Вещи с историей без масс-маркета: частые вопросы, политика конфиденциальности и условия продажи без возврата после согласования и оплаты.",
          inLanguage: "ru-RU",
          dateModified: `${GEO_LAST_UPDATED}T12:00:00+03:00`,
          publisher: { "@id": `${siteUrl}/#organization` },
          mainEntity: { "@id": `${pageUrl}#faq` },
        },
        {
          "@type": "FAQPage",
          "@id": `${pageUrl}#faq`,
          mainEntity: GEO_FAQ_ITEMS.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
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
