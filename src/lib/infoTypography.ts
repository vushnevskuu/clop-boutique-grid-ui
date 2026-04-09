/** Единая шкала типографики для страницы «О нас» (/info). Вертикальные отступы — кратны 8px. */
export const info = {
  article: "font-body text-foreground antialiased",
  /** Оглавление в начале страницы: отступ только снизу до основного контента */
  navTocContainer: "mb-8 md:mb-10",
  navLabel:
    "font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground",
  /** Ряд ссылок оглавления: одна линия, без подчёркивания; на узком экране — горизонтальный свайп */
  navTocRow:
    "mt-2 flex flex-row flex-nowrap items-center gap-x-3 overflow-x-auto py-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
  navTocLink:
    "shrink-0 cursor-pointer whitespace-nowrap rounded-sm text-[15px] font-medium text-muted-foreground no-underline transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:text-base",
  navTocSep: "shrink-0 select-none text-[15px] text-muted-foreground/35",
  /** Возврат в каталог и прочие вторичные переходы */
  navLink:
    "cursor-pointer rounded-sm text-[15px] font-medium text-muted-foreground no-underline transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:text-base",
  /** Внутритекстовые ссылки в политиках — с подчёркиванием */
  link: "font-medium text-foreground underline decoration-foreground/30 underline-offset-[3px] transition-colors hover:decoration-foreground",
  /** Ссылки в одну строку без подчёркивания (FAQ и т.п.) */
  inlineMutedLink:
    "font-medium text-muted-foreground no-underline transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  /** CTA в духе шапки, на токенах темы + клавиатура */
  socialCta:
    "inline-flex min-h-11 cursor-pointer items-center gap-2 border border-foreground/10 bg-secondary px-5 py-2.5 text-sm font-normal uppercase tracking-wide text-secondary-foreground transition-colors duration-200 hover:border-transparent hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  h2: "font-heading text-2xl font-semibold leading-tight tracking-tight text-foreground md:text-[1.75rem]",
  h3: "font-heading text-[0.9375rem] font-semibold leading-snug text-foreground md:text-base",
  lead: "text-sm leading-relaxed text-muted-foreground",
  body: "text-base leading-[1.65] text-foreground/90",
  bodyTight: "text-[15px] leading-[1.62] text-foreground/90 md:text-base md:leading-[1.65]",
  list: "mt-3 list-disc space-y-2 pl-[1.15rem] text-base leading-[1.65] text-foreground/88 marker:text-muted-foreground",
  orderedList:
    "mt-3 list-decimal space-y-2 pl-[1.15rem] text-base leading-[1.65] text-foreground/88 marker:text-muted-foreground",
  sectionMeta: "mt-3 max-w-prose text-sm leading-relaxed text-muted-foreground",
  /** Блок подзаголовков h3 внутри политик */
  sectionStack: "mt-8 space-y-10 md:space-y-12",
  /** Аккордеон юридических подразделов (как пункты FAQ) */
  legalDetails: "group border-b border-foreground/10 py-3.5 last:border-b-0 open:pb-5",
  legalSummary:
    "cursor-pointer list-none rounded-sm py-1 text-base font-medium text-foreground marker:content-none outline-none transition-colors hover:text-foreground/80 [&::-webkit-details-marker]:hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  borderTop: "border-t border-foreground/10",
  /** Крупные разделы (политики, условия): единые отступы от разделителя */
  sectionMajor: "border-t border-foreground/10 pt-12 pb-12 md:pt-16 md:pb-16",
  /** Отступ перед первым крупным юридическим блоком после FAQ */
  sectionMajorAfterBlock: "mt-8 md:mt-12",
  labelUpper:
    "font-heading mt-8 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground first:mt-0 md:mt-10",
} as const;
