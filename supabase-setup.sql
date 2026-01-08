-- Создание таблицы products
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  brand TEXT,
  price TEXT NOT NULL,
  size TEXT,
  image TEXT NOT NULL,
  hover_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы product_images для множественных изображений
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, image_order)
);

-- Создание таблицы size_charts для размерных таблиц
CREATE TABLE IF NOT EXISTS size_charts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size_label TEXT NOT NULL,
  chest TEXT,
  waist TEXT,
  length TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, size_label)
);

-- Создание индексов для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_order ON product_images(product_id, image_order);
CREATE INDEX IF NOT EXISTS idx_size_charts_product_id ON size_charts(product_id);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Включение Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE size_charts ENABLE ROW LEVEL SECURITY;

-- Политики для публичного чтения (все могут читать)
CREATE POLICY "Public read access" ON products FOR SELECT USING (true);
CREATE POLICY "Public read access" ON product_images FOR SELECT USING (true);
CREATE POLICY "Public read access" ON size_charts FOR SELECT USING (true);

-- Политики для записи (только авторизованные пользователи, можно настроить позже)
-- Пока оставляем открытым для разработки, потом можно добавить проверку auth.uid()
CREATE POLICY "Public insert access" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON products FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON products FOR DELETE USING (true);

CREATE POLICY "Public insert access" ON product_images FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON product_images FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON product_images FOR DELETE USING (true);

CREATE POLICY "Public insert access" ON size_charts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON size_charts FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON size_charts FOR DELETE USING (true);
