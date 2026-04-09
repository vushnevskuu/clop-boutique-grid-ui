import { memo, useEffect } from "react";
import { ArrowLeft, Instagram } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import CatalogIntro from "@/components/CatalogIntro";
import SiteGeoFaq from "@/components/SiteGeoFaq";
import GeoInfoJsonLd from "@/components/GeoInfoJsonLd";
import { info } from "@/lib/infoTypography";

const scrollMt = "scroll-mt-[120px] md:scroll-mt-[132px]";

const Info = memo(() => {
  const location = useLocation();

  useEffect(() => {
    const hash = location.hash.replace(/^#/, "");
    if (!hash) return;
    const t = window.setTimeout(() => {
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
    return () => window.clearTimeout(t);
  }, [location.hash]);

  return (
    <div className="min-h-screen bg-background">
      <GeoInfoJsonLd />
      <Header />
      <main
        className={`mx-auto max-w-[65ch] px-4 pb-20 pt-[120px] sm:px-5 md:pt-[132px] md:pb-24 lg:px-6 ${info.article}`}
      >
        <article>
          <section id="o-nas" className={scrollMt} aria-labelledby="catalog-intro-heading">
            <CatalogIntro />

            <nav
              aria-label="Содержание страницы"
              className={`${scrollMt} ${info.navTocContainer}`}
              id="soderzhanie"
            >
              <p className={info.navLabel}>На этой странице</p>
              <div className={info.navTocRow}>
                <a href="#o-nas" className={info.navTocLink}>
                  О нас
                </a>
                <span className={info.navTocSep} aria-hidden>
                  ·
                </span>
                <a href="#faq" className={info.navTocLink}>
                  Частые вопросы
                </a>
                <span className={info.navTocSep} aria-hidden>
                  ·
                </span>
                <a href="#privacy" className={info.navTocLink}>
                  Политика конфиденциальности
                </a>
                <span className={info.navTocSep} aria-hidden>
                  ·
                </span>
                <a href="#returns" className={info.navTocLink}>
                  Условия продажи
                </a>
              </div>
            </nav>
            <aside
              aria-label="Instagram CLOP"
              className="mt-8 md:mt-10"
            >
              <div className="flex justify-center">
                <a
                  href="https://www.instagram.com/clo.p_market"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={info.socialCta}
                >
                  <Instagram className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                  Перейти в Instagram
                </a>
              </div>
            </aside>
          </section>

          <SiteGeoFaq />

          <section
            id="privacy"
            className={`${scrollMt} ${info.sectionMajorAfterBlock} ${info.sectionMajor} px-0`}
            aria-labelledby="privacy-heading"
          >
            <h2 id="privacy-heading" className={info.h2}>
              Политика конфиденциальности
            </h2>
            <p className={info.sectionMeta}>
              Действует для сайта каталога CLOP и связанных каналов связи (в том числе Telegram и Instagram).
              Последнее обновление:{" "}
              <time dateTime="2026-04-09">9 апреля 2026&nbsp;г.</time>.
            </p>

            <div className={info.sectionStack}>
              <section aria-labelledby="privacy-h1">
                <h3 id="privacy-h1" className={info.h3}>
                  1. Кто мы
                </h3>
                <p className={`${info.body} mt-3`}>
                  Витрина и продажи оформляются под брендом CLOP (винтаж и селективная одежда). Контент каталога и
                  способы связи указаны на сайте и в профиле{" "}
                  <a
                    href="https://www.instagram.com/clo.p_market"
                    className={info.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    @clo.p_market
                  </a>
                  .
                </p>
              </section>

              <section aria-labelledby="privacy-h2">
                <h3 id="privacy-h2" className={info.h3}>
                  2. Какие данные могут обрабатываться
                </h3>
                <ul className={info.list}>
                  <li>
                    <span className="font-semibold text-foreground">Данные, которые вы сами отправляете</span>
                    {" — "}
                    например, имя или ник в мессенджере, текст сообщения, фото, почта или телефон, если вы их указали при
                    общении о заказе.
                  </li>
                  <li>
                    <span className="font-semibold text-foreground">Технические данные при посещении сайта</span>
                    {" — "}
                    типичные для веба: IP-адрес (кратковременно у хостинга или CDN), тип браузера, дата и время запроса,
                    страница перехода. Точный набор зависит от настроек сервера и используемых сервисов.
                  </li>
                </ul>
              </section>

              <section aria-labelledby="privacy-h3">
                <h3 id="privacy-h3" className={info.h3}>
                  3. Цели обработки
                </h3>
                <ul className={info.list}>
                  <li>Ответы на вопросы и сопровождение заказа.</li>
                  <li>Информирование о статусе сделки, доставке и оплате в рамках переписки.</li>
                  <li>Обеспечение работоспособности и безопасности сайта.</li>
                  <li>Соблюдение требований закона, если это потребуется.</li>
                </ul>
              </section>

              <section aria-labelledby="privacy-h4">
                <h3 id="privacy-h4" className={info.h3}>
                  4. Где хранится переписка
                </h3>
                <p className={`${info.body} mt-3`}>
                  Сообщения в Telegram, Instagram и аналогичных сервисах обрабатываются по правилам соответствующих
                  платформ. Мы не продаём персональные данные третьим лицам и не используем их для рассылок без вашего
                  запроса.
                </p>
              </section>

              <section aria-labelledby="privacy-h5">
                <h3 id="privacy-h5" className={info.h3}>
                  5. Файлы cookie
                </h3>
                <p className={`${info.body} mt-3`}>
                  Сайт может использовать технически необходимые cookie (например, для стабильной работы интерфейса или
                  сессии, если такой механизм включён). Вы можете ограничить cookie в настройках браузера; часть функций
                  при этом может работать иначе.
                </p>
              </section>

              <section aria-labelledby="privacy-h6">
                <h3 id="privacy-h6" className={info.h3}>
                  6. Ваши права
                </h3>
                <p className={`${info.body} mt-3`}>
                  Вы можете запросить уточнение, обновление или удаление переданных вами данных в разумных пределах с
                  учётом необходимости хранения для исполнения договора и требований закона. Для запроса напишите в тот
                  канал связи, через который вы с нами общались (например, Telegram), или в Direct Instagram{" "}
                  <span className="whitespace-nowrap">@clo.p_market</span>.
                </p>
              </section>

              <section aria-labelledby="privacy-h7">
                <h3 id="privacy-h7" className={info.h3}>
                  7. Изменения
                </h3>
                <p className={`${info.body} mt-3`}>
                  Мы можем обновлять этот текст, чтобы отражать изменения в процессах или законе. Актуальная версия всегда
                  на этой странице; дата обновления указана в начале раздела.
                </p>
              </section>
            </div>
          </section>

          <section
            id="returns"
            className={`${scrollMt} ${info.sectionMajor} px-0`}
            aria-labelledby="returns-heading"
          >
            <h2 id="returns-heading" className={info.h2}>
              Условия продажи и возврата
            </h2>
            <p className={info.sectionMeta}>
              Винтаж и подержанные вещи CLOP. Логика близка к распространённой у curated resale модели{" "}
              <span className="font-semibold text-foreground">final sale</span>: после согласования в переписке и оплаты
              сделка окончательная. Последнее обновление:{" "}
              <time dateTime="2026-04-09">9 апреля 2026&nbsp;г.</time>.
            </p>

            <div className={info.sectionStack}>
              <section aria-labelledby="returns-h1">
                <h3 id="returns-h1" className={info.h3}>
                  1. Все продажи окончательные
                </h3>
                <p className={`${info.body} mt-3`}>
                  После того как вы согласовали с нами условия в переписке (как правило, в Telegram) и произвели оплату,
                  сделка считается совершённой.{" "}
                  <span className="font-semibold text-foreground">
                    Возврат вещи, обмен на другую позицию и возврат денежных средств не предусмотрены
                  </span>
                  , в том числе если вещь вам не подошла по посадке, оттенку на вашем экране, настроению или вы
                  передумали, при условии что товар соответствует согласованному и опубликованному в каталоге описанию,
                  фотографиям и замерам.
                </p>
              </section>

              <section aria-labelledby="returns-h2">
                <h3 id="returns-h2" className={info.h3}>
                  2. Описание, состояние, замеры
                </h3>
                <ul className={info.list}>
                  <li>
                    Мы стараемся максимально точно описывать вещь: состояние, дефекты, материал, эпоху или особенности
                    модели. Абсолютной безошибочности в деталях мы не гарантируем — при сомнениях{" "}
                    <span className="font-semibold text-foreground">напишите до оплаты</span>.
                  </li>
                  <li>
                    Это подержанные и винтажные вещи: возможны следы носки и возрастные особенности. Состояние отражено
                    в тексте и на фото в карточке товара.
                  </li>
                  <li>
                    Замеры в разложенном виде — ориентировочные; они помогают сравнить с вашей одеждой, но не заменяют
                    примерку в магазине.
                  </li>
                </ul>
              </section>

              <section aria-labelledby="returns-h3">
                <h3 id="returns-h3" className={info.h3}>
                  3. Как избежать сюрпризов
                </h3>
                <p className={`${info.body} mt-3`}>
                  Перед оплатой задайте вопросы в том же канале, где идёт сделка: размер, дефекты, доставку, способ оплаты.
                  Мы отвечаем до подтверждения заказа. Оплата после согласования означает, что вы принимаете вещь в том
                  виде, о котором договорились.
                </p>
              </section>

              <section aria-labelledby="returns-h4">
                <h3 id="returns-h4" className={info.h3}>
                  4. Применимое право
                </h3>
                <p className={`${info.body} mt-3`}>
                  Настоящие условия не умаляют прав потребителя в части, где они не могут быть ограничены по закону
                  Российской Федерации. Во всём остальном действует описанная выше модель{" "}
                  <span className="font-semibold text-foreground">продажи без возврата</span> после согласования и
                  оплаты.
                </p>
              </section>

              <section aria-labelledby="returns-h5">
                <h3 id="returns-h5" className={info.h3}>
                  5. Связь
                </h3>
                <p className={`${info.body} mt-3`}>
                  Вопросы по товару до покупки — через Telegram (кнопка в карточке) или Direct в Instagram{" "}
                  <span className="whitespace-nowrap">@clo.p_market</span>. После оплаты просьба о «возврате по желанию»
                  не рассматривается в рамках этой политики.
                </p>
              </section>
            </div>
          </section>
        </article>

        <p className="mt-12 flex justify-center border-t border-foreground/10 pt-10 md:mt-16 md:pt-12">
          <Link
            to="/"
            className={`${info.navLink} inline-flex items-center gap-2`}
          >
            <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
            В каталог
          </Link>
        </p>
      </main>
    </div>
  );
});

Info.displayName = "Info";

export default Info;
