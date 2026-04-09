# Medusa для каталога CLOP

[Medusa](https://github.com/medusajs/medusa) — headless commerce: **отдельный Node-бэкенд** с **готовой админкой** (товары, цены, валюты, изображения, API). Этот репозиторий витрины (`bold-boutique-grid-work`) умеет брать товары **либо из Medusa**, либо из статики `public/cloth/` + `manifest.json`.

## Где админка после запуска

После команды `npm run dev` в папке проекта Medusa (не в витрине):

| Что | URL |
|-----|-----|
| **Админка** | [http://localhost:9000/app](http://localhost:9000/app) |
| **Store API** | [http://localhost:9000](http://localhost:9000) |

### Локальный бэкенд на этой машине (если уже развёрнут)

- **Папка проекта:** `~/Projects/clop-medusa`
- **PostgreSQL / Redis:** через Homebrew (`brew services start postgresql@16` и `redis`)
- **Запуск:** `cd ~/Projects/clop-medusa && npm run dev`
- **Вход в админку:** пользователь создаётся командой `npx medusa user -e … -p …` в той же папке; актуальный логин/пароль храните у себя (не коммитьте в git).

Первый пользователь админки также может создаваться в мастере при установке `create-medusa-app` (см. [документацию](https://docs.medusajs.com/learn/installation)).

## Краткий чеклист «с нуля»

1. Установить **Docker Desktop** (macOS) **или** отдельно PostgreSQL 15+ и Redis — без БД Medusa не запустится.
2. В каталоге `bold-boutique-grid-work/medusa` выполнить: `docker compose up -d` (поднимет Postgres и Redis на `localhost`).
3. Рядом с витриной создать бэкенд:  
   `npx create-medusa-app@latest clop-medusa --db-url "postgres://medusa:medusa@localhost:5432/medusa" --no-browser`  
   (отвечайте на вопросы CLI; Next.js Storefront можно **не** ставить, если нужна только админка.)
4. `cd clop-medusa` → `npm run dev`.
5. Открыть **http://localhost:9000/app** и войти.

**Важно:** для `create-medusa-app` рекомендуют **Node 20–22 LTS**. На Node 25 возможны сбои; при ошибках используйте `nvm use 22`.

## Что вы получаете

- Админка Medusa (после установки): создание товаров, загрузка фото, варианты и цены, регионы (нужен **RUB**).
- Витрина: при заданных переменных окружения запрашивает [Store API](https://docs.medusajs.com/api/store); если Medusa недоступна — автоматически падает обратно на `manifest.json`.

## Требования

- Node.js 20+
- Docker (для PostgreSQL и Redis) **или** свои инстансы Postgres + Redis

## 1. Поднять БД и Redis

Из этой папки:

```bash
docker compose up -d
```

Строка подключения по умолчанию:

`postgres://medusa:medusa@localhost:5432/medusa`

## 2. Создать проект Medusa (официальный стартер)

Каталог `medusa/` в репозитории витрины **не содержит** сам Medusa — только Docker и эта инструкция. Бэкенд создаётся рядом, например в родительской папке:

```bash
cd ..
npx create-medusa-app@latest clop-medusa \
  --db-url "postgres://medusa:medusa@localhost:5432/medusa" \
  --no-browser
```

Дальше в документации Medusa: создайте пользователя админки, откройте админку (обычно порт **9000** для API и встроенный admin UI по инструкции CLI).

Актуальные шаги и порты смотрите в [документации create-medusa-app](https://docs.medusajs.com/resources/create-medusa-app).

## 3. CORS для витрины

В проекте `clop-medusa` в `medusa-config.ts` (блок `projectConfig.http`) укажите origins витрины, например:

- `storeCors`: `http://localhost:8080` (порт Vite из этого репозитория)
- `adminCors` / `authCors`: URL, с которого открываете админку

Либо через переменные окружения, если они уже заведены в шаблоне Medusa.

## 4. Регион и валюта

В админке создайте **регион** с валютой **RUB**. Витрина выбирает регион с `rub` или первый доступный.

### Фото товаров (важно для iPhone)

**HEIC/HEIF** с телефона в обычных браузерах (Chrome, Firefox и др.) **часто не отображаются** в `<img>` — в каталоге будет плейсхолдер. Загружайте в Medusa **JPEG, PNG или WebP** (на Mac: экспорт из «Фото», или снимайте в Настройки → Камера → «Наиболее совместимые»).

Цена в витрине берётся из **Medusa v2 Store API** (`calculated_price.calculated_amount`) в **рублях** (основные единицы), не в копейках. При необходимости точный текст цены можно задать в metadata `clop_price_label`.

## 5. Publishable API Key

В Medusa Admin: **Settings → Publishable API Keys** — создайте ключ для **Sales Channel**, в котором будут жить товары витрины.

## 6. Подключить витрину (этот репозиторий)

В корне витрины создайте `.env.local` (не коммитьте секреты):

**Вариант A — прямой URL (нужен CORS на Medusa):**

```env
VITE_MEDUSA_BACKEND_URL=http://localhost:9000
VITE_MEDUSA_PUBLISHABLE_KEY=pk_...
```

**Вариант B — через proxy Vite (dev):** в `vite.config.ts` уже настроен префикс `/medusa` → `http://localhost:9000`:

```env
VITE_MEDUSA_BACKEND_URL=/medusa
VITE_MEDUSA_PUBLISHABLE_KEY=pk_...
```

Перезапустите `npm run dev`.

## Метаданные товара для CLOP (опционально)

В карточке товара в админке Medusa, поле **Metadata**:

| Ключ | Назначение |
|------|------------|
| `clop_price_label` | Текст цены на витрине, напр. `35 000 ₽` (иначе цена из варианта) |
| `clop_sizes` | JSON-массив строк замеров, напр. `[{"Chest":"54 cm","Length":"72 cm"}]` |
| `clop_order` | Число — порядок сортировки на главной (меньше = раньше) |
| `clop_hidden` | `true` — скрыть товар с витрины |

Описание из Medusa (`description` / `subtitle`) показывается как текст в модалке товара.

## Статический режим без Medusa

Не задавайте `VITE_MEDUSA_*` — витрина использует только `public/cloth/manifest.json` и папки товаров. Цены правьте в `manifest.json` → поле `prices` (при `npm run generate-manifest` существующие цены **сохраняются**).

## Деплой витрины на Vercel + Medusa в проде

**Важно:** Vercel хостит только **фронт** (этот репозиторий). **Medusa** (API + админка `/app`) нужно поднять **отдельно** на VPS, Railway, Render, Fly.io и т.д. с **PostgreSQL** и **Redis**. Сайт на `*.vercel.app` **не сможет** ходить к `http://localhost:9000` на вашем Mac.

### 1. Репозиторий и Vercel

1. Залейте витрину в GitHub и подключите репозиторий в [Vercel](https://vercel.com) (Framework Preset обычно подхватывает Vite; в корне есть `vercel.json`).
2. В **Project → Settings → Environment Variables** (Production, при необходимости Preview):

   | Переменная | Значение |
   |------------|----------|
   | `VITE_MEDUSA_BACKEND_URL` | Публичный URL Medusa, например `https://api.ваш-домен.com` (**без** `/app`) |
   | `VITE_MEDUSA_PUBLISHABLE_KEY` | Publishable key из **продакшен**-Medusa (Settings → Publishable API Keys) |

3. Сохраните и сделайте **Redeploy** (переменные `VITE_*` встраиваются на этапе **сборки**).

На проде **не используйте** `VITE_MEDUSA_BACKEND_URL=/medusa` — префикс `/medusa` работает только в **dev** через proxy в `vite.config.ts`.

### 2. CORS на продакшен-Medusa

В `.env` сервера Medusa в переменные `STORE_CORS`, `ADMIN_CORS`, `AUTH_CORS` добавьте через запятую:

- URL витрины: `https://ваш-проект.vercel.app` и кастомный домен, если подключите.
- URL, с которого открываете админку (часто тот же API-домен, например `https://api.ваш-домен.com`).

Шаблон: `~/Projects/clop-medusa/.env.production.example` (файл в репозитории `clop-medusa`, не в витрине).

### 3. Где добавлять товары после деплоя

- **Прод:** открываете **`https://<ваш-medusa>/app`** в браузере — это админка **боевого** инстанса. Товары сразу доступны витрине на Vercel (после публикации и привязки к нужному Sales Channel).
- **Локально:** как раньше, `http://localhost:9000/app` — только если поднимаете Medusa у себя для разработки.

### 4. CI (опционально)

В репозитории витрины: `.github/workflows/build-storefront.yml` — проверка `npm run build` на push/PR (деплой по-прежнему через Vercel).

## Полезные ссылки

- Репозиторий: [github.com/medusajs/medusa](https://github.com/medusajs/medusa)
- Документация: [docs.medusajs.com](https://docs.medusajs.com)
