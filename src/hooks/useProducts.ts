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
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/479bd6ea-c80d-4e3a-82d4-f5e5e0ef2b1b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useProducts.ts:37',message:'Starting to load products',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        
        // Загружаем manifest.json из public/cloth/
        const manifestResponse = await fetch('/cloth/manifest.json');
        
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
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/479bd6ea-c80d-4e3a-82d4-f5e5e0ef2b1b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useProducts.ts:52',message:'Manifest parsed',data:{productsCount:manifest.products?.length||0,products:manifest.products},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        const loadedProducts: Product[] = [];
        
        // Обрабатываем каждый товар из manifest
        for (const productFolder of manifest.products || []) {
          // Формируем путь к папке товара с кодированием пробелов для URL
          const encodedFolder = encodeURIComponent(productFolder);
          const productPath = `/cloth/${encodedFolder}`;
          const productPathRaw = `/cloth/${productFolder}`; // Для внутреннего использования
          
          // Загружаем описание
          let description = '';
          let sizes: Product['sizes'] = [];
          
          try {
            // Пробуем оба варианта названия файла (description.txt и discription.txt)
            // Используем закодированный путь для fetch
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/479bd6ea-c80d-4e3a-82d4-f5e5e0ef2b1b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useProducts.ts:65',message:'Fetching description',data:{productFolder,productPath:`${productPath}/description.txt`},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
            let descResponse = await fetch(`${productPath}/description.txt`);
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/479bd6ea-c80d-4e3a-82d4-f5e5e0ef2b1b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useProducts.ts:67',message:'Description fetch result',data:{ok:descResponse.ok,status:descResponse.status,url:descResponse.url,productFolder},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
            if (!descResponse.ok) {
              descResponse = await fetch(`${productPath}/discription.txt`);
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/479bd6ea-c80d-4e3a-82d4-f5e5e0ef2b1b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useProducts.ts:69',message:'Alternative description fetch',data:{ok:descResponse.ok,status:descResponse.status,url:descResponse.url},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
              // #endregion
            }
            if (descResponse.ok) {
              const descContent = await descResponse.text();
              const parsed = parseDescriptionFile(descContent);
              description = parsed.description;
              sizes = parsed.sizes;
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/479bd6ea-c80d-4e3a-82d4-f5e5e0ef2b1b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useProducts.ts:73',message:'Description loaded successfully',data:{descriptionLength:description.length,sizesCount:sizes.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
              // #endregion
            }
          } catch (err) {
            console.warn(`Failed to load description for ${productFolder}:`, err);
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/479bd6ea-c80d-4e3a-82d4-f5e5e0ef2b1b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useProducts.ts:76',message:'Description fetch error',data:{error:String(err),productFolder},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
          }
          
          // Получаем изображения из manifest и формируем пути
          // НЕ кодируем пути здесь - браузер сам кодирует при запросе
          // Это важно для корректной работы в production
          const images: string[] = (manifest.images?.[productFolder] || [])
            .map((img: string) => {
              // Формируем путь с пробелами - браузер сам закодирует при запросе
              return `/cloth/${productFolder}/${img}`;
            })
            .sort((a: string, b: string) => {
              // Сортируем по номеру в имени файла
              const numA = parseInt(a.match(/(\d+)/)?.[1] || '0');
              const numB = parseInt(b.match(/(\d+)/)?.[1] || '0');
              return numA - numB;
            });
          
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/479bd6ea-c80d-4e3a-82d4-f5e5e0ef2b1b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useProducts.ts:86',message:'Images paths generated',data:{productFolder,imagesCount:images.length,images:images},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
          
          const priceByProduct: Record<string, string> = {
            'Le_grande_blue': '$350',
            'Jackrose_made_in_Japan': '$150',
            'Jackrose_blue_made_in_Japan': '$150',
            'Chimala': '$100',
            'Diet_butcher_slim_skin': '$100',
            'Love_boat_jacket': '$50',
            'Leather_engineer_boots': '$80',
          };
          loadedProducts.push({
            id: productFolder,
            title: productFolder,
            description,
            sizes,
            images,
            image: images[0] || '',
            hoverImage: images[1] || images[0] || '',
            price: priceByProduct[productFolder] ?? '$100',
          });
        }
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/479bd6ea-c80d-4e3a-82d4-f5e5e0ef2b1b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useProducts.ts:105',message:'Products loaded successfully',data:{productsCount:loadedProducts.length,products:loadedProducts.map(p=>({id:p.id,title:p.title,image:p.image,imagesCount:p.images?.length||0}))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        
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
