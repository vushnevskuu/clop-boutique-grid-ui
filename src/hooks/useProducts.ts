import { useState, useEffect } from 'react';
import type { ProductData } from '@/lib/productLoader';

// Упрощенная загрузка товаров из public/cloth/
// Товары будут загружаться через fetch из manifest.json

export interface Product {
  id: string;
  title: string;
  description: string;
  sizes: Array<{
    size: string;
    chest?: string;
    waist?: string;
    length?: string;
    [key: string]: string | undefined;
  }>;
  images: string[]; // Массив URL изображений
  // Для совместимости со старым кодом
  image?: string;
  hoverImage?: string;
  brand?: string;
  price?: string;
  size?: string;
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        
        // Загружаем manifest.json с кэшированием
        const manifestResponse = await fetch('/cloth/manifest.json', {
          cache: 'force-cache', // Используем кэш браузера
        });
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/479bd6ea-c80d-4e3a-82d4-f5e5e0ef2b1b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useProducts.ts:40',message:'Manifest fetch result',data:{ok:manifestResponse.ok,status:manifestResponse.status,url:manifestResponse.url},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        
        if (!manifestResponse.ok) {
          // Если manifest.json нет, возвращаем пустой массив
          console.warn('manifest.json not found in /cloth/, products will not be loaded');
          setProducts([]);
          setLoading(false);
          return;
        }
        
        const manifest = await manifestResponse.json();
        const loadedProducts: Product[] = [];
        
        // Загружаем описания параллельно для ускорения
        const productPromises = (manifest.products || []).map(async (productFolder: string) => {
          // Формируем путь к папке товара с кодированием пробелов для URL
          const encodedFolder = encodeURIComponent(productFolder);
          const productPath = `/cloth/${encodedFolder}`;
          const productPathRaw = `/cloth/${productFolder}`; // Для внутреннего использования
          
          // Загружаем описание
          let description = '';
          let sizes: Product['sizes'] = [];
          
          try {
            const encodedFolder = encodeURIComponent(productFolder);
            const productPath = `/cloth/${encodedFolder}`;
            
            let descResponse = await fetch(`${productPath}/description.txt`, { cache: 'force-cache' });
            if (!descResponse.ok) {
              descResponse = await fetch(`${productPath}/discription.txt`, { cache: 'force-cache' });
            }
            if (descResponse.ok) {
              const descContent = await descResponse.text();
              const parsed = parseDescriptionFile(descContent);
              description = parsed.description;
              sizes = parsed.sizes;
            }
          } catch (err) {
            console.warn(`Failed to load description for ${productFolder}:`, err);
          }
          
          // images — для страницы товара (с фоном: 1.webp, 2.webp, …)
          const images: string[] = (manifest.images?.[productFolder] || [])
            .map((img: string) => `/cloth/${productFolder}/${img}`)
            .sort((a: string, b: string) => {
              const numA = parseInt(a.match(/(\d+)/)?.[1] || '0');
              const numB = parseInt(b.match(/(\d+)/)?.[1] || '0');
              return numA - numB;
            });
          // gridImages — для карточек в сетке (1–2 без фона, если есть *-nobg.webp)
          const gridImages: string[] = (manifest.gridImages?.[productFolder] || manifest.images?.[productFolder] || [])
            .map((img: string) => `/cloth/${productFolder}/${img}`);
          
          const priceByProduct: Record<string, string> = {
            'Le_grande_blue': '$350',
            'Jackrose_made_in_Japan': '$150',
            'Jackrose_blue_made_in_Japan': '$150',
            'Chimala': '$100',
            'Diet_butcher_slim_skin': '$100',
            'Love_boat_jacket': '$50',
            'Leather_engineer_boots': '$80',
          };
          
          return {
            id: productFolder,
            title: productFolder,
            description,
            sizes,
            images,
            image: gridImages[0] || images[0] || '',
            hoverImage: gridImages[1] || gridImages[0] || images[1] || images[0] || '',
            price: priceByProduct[productFolder] ?? '$100',
          };
        });
        
        // Ждём загрузки всех товаров параллельно
        const products = await Promise.all(productPromises);
        loadedProducts.push(...products);
        
        setProducts(loadedProducts);
        setError(null);
      } catch (err) {
        console.error('Error loading products:', err);
        setError(err instanceof Error ? err : new Error('Failed to load products'));
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    
    loadProducts();
  }, []);
  
  return { products, loading, error };
}

// Строка считается началом блока размеров (описание до неё, размеры — после)
const SIZE_SECTION_START = /approximate\s+measurements|measurements\s*\(laid\s+flat\)|^\s*(size|размер)\s*$/i;

// Строка "Ключ: значение" считается размером только если ключ — известное измерение
const MEASUREMENT_KEY = /^(chest|waist|shoulder\s*width|back\s*length|front\s*length|arm\s*opening|size|размер)/i;

// Значение похоже на размер (числа, см), а не на текст описания
const LOOKS_LIKE_MEASUREMENT = /^[\d\s–\-~]+cm$|^\d+\s*[–\-]\s*\d+(\s*cm)?$/i;

// Парсинг текстового файла описания (только из description.txt — описание и таблица размеров)
function parseDescriptionFile(content: string): { description: string; sizes: Product['sizes'] } {
  // Не убираем пустые строки — они задают абзацы в описании
  const lines = content.split('\n').map(line => line.trim());
  
  let description = '';
  let sizes: Product['sizes'] = [];
  let inSizesSection = false;
  const measurementRow: { [key: string]: string } = {};
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Начало блока размеров: "Approximate measurements (laid flat):" или "Size" / "Размер"
    if (line.length > 0 && SIZE_SECTION_START.test(line)) {
      inSizesSection = true;
      continue;
    }
    
    if (inSizesSection) {
      // Формат одной строки: "Chest (pit to pit): 50–52 cm"
      const keyValue = line.match(/^(.+?):\s*(.+)$/);
      if (keyValue) {
        const key = keyValue[1].trim();
        const value = keyValue[2].trim();
        const isMeasurementKey = MEASUREMENT_KEY.test(key);
        const isMeasurementValue = LOOKS_LIKE_MEASUREMENT.test(value) || /^\d+[–\-]\d+\s*cm/.test(value);
        if (isMeasurementKey && isMeasurementValue) {
          measurementRow[key] = value;
          continue;
        }
      }
      // Любая другая строка в блоке размеров не подходит — не добавляем в sizes
    } else {
      // Описание: сохраняем пустые строки как переносы (абзацы)
      if (description) description += '\n';
      description += line;
    }
  }
  
  if (Object.keys(measurementRow).length > 0) {
    sizes.push(measurementRow);
  }
  
  return { description: description.trim(), sizes };
}
