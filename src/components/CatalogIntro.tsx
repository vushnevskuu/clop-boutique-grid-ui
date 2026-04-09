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
        Винтаж и селектив, которые можно сравнить с своим гардеробом
      </h1>
      <p className={`${info.body} mt-5 max-w-prose md:mt-6`}>
        Мы отбираем вещи по бренду, состоянию и силуэту — от японского денима до редких кроёв. На главной только сетка
        фото: без лишнего текста. Цена, описание и замеры — в карточке по клику на фото.
      </p>
      <p className={`${info.lead} mt-3 max-w-prose md:mt-4`}>
        Перед оплатой напишите в Telegram: разберём размер по замерам, уточним дефекты и посадку — так вы покупаете
        осознанно.
      </p>
    </header>
  );
});

CatalogIntro.displayName = "CatalogIntro";

export default CatalogIntro;
