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
        
        // Загружаем manifest.json из public/cloth/
        const manifestResponse = await fetch('/cloth/manifest.json');
        
        if (!manifestResponse.ok) {
          // Если manifest.json нет, возвращаем пустой массив
          console.warn('manifest.json not found in /cloth/, products will not be loaded');
          setProducts([]);
          setLoading(false);
          return;
        }
        
        const manifest = await manifestResponse.json();
        const loadedProducts: Product[] = [];
        
        // Обрабатываем каждый товар из manifest
        for (const productFolder of manifest.products || []) {
          // URL-кодируем имя папки для безопасной работы с пробелами и спецсимволами
          const encodedFolder = encodeURIComponent(productFolder).replace(/%20/g, ' ');
          const productPath = `/cloth/${encodedFolder}`;
          
          // Загружаем описание
          let description = '';
          let sizes: Product['sizes'] = [];
          
          try {
            // Пробуем оба варианта названия файла (description.txt и discription.txt)
            let descResponse = await fetch(`${productPath}/description.txt`);
            if (!descResponse.ok) {
              descResponse = await fetch(`${productPath}/discription.txt`);
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
          
          // Получаем изображения из manifest и правильно формируем пути
          const images: string[] = (manifest.images?.[productFolder] || [])
            .map((img: string) => {
              // URL-кодируем имя файла изображения
              const encodedImg = encodeURIComponent(img);
              return `${productPath}/${encodedImg}`;
            })
            .sort((a: string, b: string) => {
              // Сортируем по номеру в имени файла
              const numA = parseInt(a.match(/(\d+)/)?.[1] || '0');
              const numB = parseInt(b.match(/(\d+)/)?.[1] || '0');
              return numA - numB;
            });
          
          loadedProducts.push({
            id: productFolder,
            title: productFolder,
            description,
            sizes,
            images,
            image: images[0] || '',
            hoverImage: images[1] || images[0] || '',
          });
        }
        
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

// Парсинг текстового файла описания
function parseDescriptionFile(content: string): { description: string; sizes: Product['sizes'] } {
  const lines = content.split('\n').map(line => line.trim()).filter(line => line);
  
  let description = '';
  let sizes: Product['sizes'] = [];
  let inSizesSection = false;
  let headers: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Проверяем, является ли строка заголовком таблицы размеров
    const isHeaderRow = line.toLowerCase().includes('size') || 
                        line.match(/^\s*(size|размер)/i) ||
                        (line.includes('\t') && line.match(/size|chest|waist|length/i));
    
    if (isHeaderRow) {
      inSizesSection = true;
      // Извлекаем заголовки
      if (line.includes('\t')) {
        headers = line.split('\t').map(h => h.toLowerCase().trim()).filter(h => h);
      } else {
        headers = line.split(/\s{2,}/).map(h => h.toLowerCase().trim()).filter(h => h);
        if (headers.length < 2) {
          headers = line.split(/\s+/).map(h => h.toLowerCase().trim()).filter(h => h);
        }
      }
      continue;
    }
    
    if (inSizesSection && headers.length > 0) {
      // Парсим строки размеров
      let values: string[] = [];
      if (line.includes('\t')) {
        values = line.split('\t').map(v => v.trim()).filter(v => v);
      } else {
        values = line.split(/\s{2,}/).map(v => v.trim()).filter(v => v);
        if (values.length < 2 && line.match(/\d/)) {
          values = line.split(/\s+/).filter(v => v && !v.match(/^[A-Z]$/)); // Исключаем одиночные буквы
        }
      }
      
      if (values.length > 0) {
        const sizeRow: Product['sizes'][0] = {};
        headers.forEach((header, index) => {
          if (values[index] && header) {
            const normalizedHeader = header.toLowerCase();
            sizeRow[normalizedHeader] = values[index];
          }
        });
        // Если первый столбец - размер
        if (values[0] && !sizeRow.size) {
          sizeRow.size = values[0];
        }
        if (Object.keys(sizeRow).length > 0) {
          sizes.push(sizeRow);
        }
      }
    } else if (!inSizesSection) {
      // Описание - все строки до таблицы размеров
      if (description) description += '\n';
      description += line;
    }
  }
  
  // Альтернативный парсинг для формата "Size: XS, Chest: 86-90"
  if (sizes.length === 0 && description.match(/Size:/i)) {
    const sizeBlocks = description.split(/\n\s*\n/);
    sizeBlocks.forEach(block => {
      if (block.match(/Size:/i)) {
        const sizeMatch = block.match(/Size:\s*([^\n,]+)/i);
        const chestMatch = block.match(/Chest:\s*([^\n,]+)/i);
        const waistMatch = block.match(/Waist:\s*([^\n,]+)/i);
        const lengthMatch = block.match(/Length:\s*([^\n,]+)/i);
        
        if (sizeMatch) {
          sizes.push({
            size: sizeMatch[1].trim(),
            chest: chestMatch?.[1].trim(),
            waist: waistMatch?.[1].trim(),
            length: lengthMatch?.[1].trim(),
          });
        }
      }
    });
  }
  
  return { description: description.trim(), sizes };
}
