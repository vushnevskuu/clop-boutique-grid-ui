import { memo } from "react";
import { GEO_FAQ_ITEMS, GEO_LAST_UPDATED, GEO_CATALOG_POSITIONS } from "@/data/geoFaq";
import { info } from "@/lib/infoTypography";

/** FAQ на странице «О каталоге»; тексты совпадают с GEO (JSON-LD в GeoInfoJsonLd). */
const SiteGeoFaq = memo(() => {
  return (
    <section
      id="faq"
      className="scroll-mt-[120px] bg-transparent py-12 md:scroll-mt-[132px] md:py-16"
      aria-labelledby="geo-faq-heading"
    >
      <div className="w-full">
        <h2 id="geo-faq-heading" className={info.h2}>
          Частые вопросы о CLOP
        </h2>

        <p className={`${info.sectionMeta} mt-3`}>
          Кратко: в сетке —{" "}
          <span className="font-semibold text-foreground">{GEO_CATALOG_POSITIONS} позиций</span>, цена и текст — в
          карточке (по клику на фото). Уточнения — в Telegram перед покупкой.
        </p>

        <p className={`${info.body} mt-5 max-w-prose md:mt-6`}>
          <span className="font-semibold text-foreground">Коротко: </span>
          CLOP — витрина отобранного винтажа и селектива. Карточка товара отвечает на главные вопросы до переписки: цена,
          состояние, замеры. Дальше — человек в Telegram, а не автоматический чек-аут.
        </p>

        <h3 className={info.labelUpper}>Во что мы верим</h3>
        <ul className={info.list}>
          <li>Честное описание и замеры снижают сюрпризы: вы сравниваете вещь с тем, что уже носите.</li>
          <li>Сделка завязывается в диалоге: можно спросить про посадку и дефекты до оплаты.</li>
        </ul>

        <h3 className={info.labelUpper}>Как устроен каталог</h3>
        <ol className={info.orderedList}>
          <li>Главная — сетка фото; клик открывает карточку с ценой и текстом.</li>
          <li>В карточке — замеры (если есть), кнопка «Написать в Telegram» со ссылкой на эту позицию.</li>
        </ol>

        <div className="mt-10 space-y-0 border-t border-foreground/10 pt-8 md:mt-12">
          {GEO_FAQ_ITEMS.map((item) => (
            <details key={item.question} className={info.legalDetails}>
              <summary className={info.legalSummary}>{item.question}</summary>
              <p className={`${info.body} mt-3 max-w-prose pl-0`}>{item.answer}</p>
            </details>
          ))}
        </div>

        <p className={`${info.lead} mt-8 flex flex-nowrap items-center gap-x-3 overflow-x-auto whitespace-nowrap [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mt-10`}>
          <a href="#privacy" className={`${info.inlineMutedLink} shrink-0 text-sm md:text-[15px]`}>
            Политика конфиденциальности
          </a>
          <span className="shrink-0 text-muted-foreground/35" aria-hidden>
            ·
          </span>
          <a href="#returns" className={`${info.inlineMutedLink} shrink-0 text-sm md:text-[15px]`}>
            Условия продажи
          </a>
        </p>

        <p className={`${info.lead} mt-4 md:mt-5`}>
          Обновлено:{" "}
          <time dateTime={`${GEO_LAST_UPDATED}T12:00:00+03:00`}>
            {new Date(`${GEO_LAST_UPDATED}T12:00:00+03:00`).toLocaleDateString("ru-RU", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </time>
        </p>

        <p className={`${info.lead} mt-3 md:mt-4`}>
          Материалы каталога и описания:{" "}
          <a
            href="https://www.instagram.com/clo.p_market"
            className={`${info.inlineMutedLink} text-sm md:text-[15px]`}
            target="_blank"
            rel="author noopener noreferrer"
          >
            CLOP / ПОВТОР
          </a>
        </p>
      </div>
    </section>
  );
});

SiteGeoFaq.displayName = "SiteGeoFaq";

export default SiteGeoFaq;
