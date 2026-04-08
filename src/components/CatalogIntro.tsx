import { memo } from "react";
import { info } from "@/lib/infoTypography";

/** Вводный блок «О нас» на /info. */
const CatalogIntro = memo(() => {
  return (
    <header className="pb-0">
      <p className={info.navLabel}>О нас</p>
      <h1
        id="catalog-intro-heading"
        className="font-heading mt-4 max-w-[min(100%,42rem)] text-[clamp(1.625rem,4.5vw,2.25rem)] font-semibold leading-[1.15] tracking-tight text-foreground md:mt-5"
      >
        Вещи с историей — без шума масс-маркета
      </h1>
      <p className={`${info.body} mt-5 max-w-prose md:mt-6`}>
        Подбираем винтаж и селектив: японский деним, редкие кроя и повседневные находки в одном месте. На главной —
        только сетка фото; цена, описание и замеры — в карточке по нажатию на фото.
      </p>
      <p className={`${info.lead} mt-3 max-w-prose md:mt-4`}>
        Напишите в Telegram перед покупкой — подскажем по размеру, состоянию и посадке.
      </p>
    </header>
  );
});

CatalogIntro.displayName = "CatalogIntro";

export default CatalogIntro;
