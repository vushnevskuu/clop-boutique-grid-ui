# Настройка Supabase для админ-панели

## Шаг 1: Создание таблиц в Supabase

1. Откройте ваш проект в Supabase
2. Перейдите в **SQL Editor** (в левом меню)
3. Скопируйте содержимое файла `supabase-setup.sql` и вставьте в редактор
4. Нажмите **Run** для выполнения SQL скрипта

## Шаг 2: Настройка Storage для изображений

1. Перейдите в **Storage** (в левом меню)
2. Нажмите **Create a new bucket**
3. Название: `product-images`
4. Выберите **Public bucket** (чтобы изображения были доступны публично)
5. Нажмите **Create bucket**

### Настройка политик доступа для Storage:

1. В разделе Storage выберите bucket `product-images`
2. Перейдите в **Policies**
3. Создайте политику для чтения (Public):
   - Policy name: `Public read access`
   - Allowed operation: `SELECT`
   - Policy definition: `true`
   - Click **Review** и **Save policy**

4. Создайте политику для записи (можно ограничить позже):
   - Policy name: `Public insert access`
   - Allowed operation: `INSERT`
   - Policy definition: `true`
   - Click **Review** и **Save policy**

## Шаг 3: Получение API ключей

1. Перейдите в **Settings** → **API**
2. Скопируйте:
   - **Project URL** (например: `https://xxxxx.supabase.co`)
   - **anon/public key** (длинная строка)

## Шаг 4: Настройка переменных окружения

1. Создайте файл `.env` в корне проекта (скопируйте из `.env.example` если есть)
2. Добавьте следующие строки:

```
VITE_SUPABASE_URL=https://ваш-проект.supabase.co
VITE_SUPABASE_ANON_KEY=ваш-anon-key
```

3. Перезапустите dev сервер (`npm run dev`)

## Шаг 5: Проверка работы

1. Откройте в браузере: `http://localhost:8080/admin`
2. Попробуйте добавить товар через админ-панель
3. Проверьте, что товары отображаются на главной странице

## Важные замечания

- **Безопасность**: В продакшене рекомендуется настроить Row Level Security (RLS) с проверкой авторизации
- **Аутентификация**: Можно добавить вход в админку через Supabase Auth
- **Ограничения**: Бесплатный план Supabase имеет лимиты на хранилище и запросы

## Миграция существующих данных

Если у вас уже есть товары в коде, можно их импортировать:

1. Откройте админ-панель
2. Добавьте товары вручную или используйте SQL:

```sql
INSERT INTO products (title, brand, price, size, image, hover_image)
VALUES 
  ('Leather jacket', 'Vintage', '$125', 'M', 'url1', 'url2'),
  -- добавьте остальные товары
```
