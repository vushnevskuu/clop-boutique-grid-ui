// Типы для данных товаров
export interface SizeRow {
  size: string;
  chest?: string;
  waist?: string;
  length?: string;
  [key: string]: string | undefined; // Для других размеров
}

export interface ProductData {
  id: string; // Имя папки используется как ID
  title: string; // Название папки
  description: string;
  sizes: SizeRow[];
  images: string[]; // Массив путей к изображениям, отсортированный по номеру
}

// Парсинг текстового файла описания
function parseDescriptionFile(content: string): { description: string; sizes: SizeRow[] } {
  const lines = content.split('\n').map(line => line.trim()).filter(line => line);
  
  let description = '';
  let sizes: SizeRow[] = [];
  let inSizesSection = false;
  let headers: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Проверяем, является ли строка заголовком таблицы размеров
    if (line.toLowerCase().includes('size') || line.match(/^\s*(size|размер)/i)) {
      inSizesSection = true;
      // Извлекаем заголовки из первой строки
      headers = line.split(/\s+/).map(h => h.toLowerCase());
      continue;
    }
    
    if (inSizesSection) {
      // Парсим строки размеров (табличные данные)
      const values = line.split(/\s+/).filter(v => v);
      if (values.length > 0) {
        const sizeRow: SizeRow = {};
        headers.forEach((header, index) => {
          if (values[index]) {
            sizeRow[header] = values[index];
          }
        });
        // Если первый столбец - размер, используем его как ключ 'size'
        if (values[0] && !sizeRow.size) {
          sizeRow.size = values[0];
        }
        if (Object.keys(sizeRow).length > 0) {
          sizes.push(sizeRow);
        }
      }
    } else {
      // Описание - все строки до таблицы размеров
      if (description) description += '\n';
      description += line;
    }
  }
  
  // Альтернативный парсинг: если размеры в формате "Size: XS, Chest: 86-90, ..."
  if (sizes.length === 0 && description.includes('Size:')) {
    const sizeMatches = description.match(/Size:\s*([^\n,]+)/gi);
    if (sizeMatches) {
      sizes = sizeMatches.map(match => {
        const size = match.replace(/Size:\s*/i, '').trim();
        return { size };
      });
    }
  }
  
  return { description: description.trim(), sizes };
}

// Загрузка товаров из папки cloth
export async function loadProducts(): Promise<ProductData[]> {
  try {
    // Используем fetch для получения списка товаров
    // Vite будет отдавать статические файлы из public/cloth
    const response = await fetch('/cloth/manifest.json');
    
    if (!response.ok) {
      // Если manifest.json нет, попробуем загрузить напрямую
      console.warn('manifest.json not found, using fallback');
      return [];
    }
    
    const manifest = await response.json();
    const products: ProductData[] = [];
    
    for (const productFolder of manifest.products) {
      const productPath = `/cloth/${productFolder}`;
      
      // Загружаем описание
      const descResponse = await fetch(`${productPath}/description.txt`);
      let description = '';
      let sizes: SizeRow[] = [];
      
      if (descResponse.ok) {
        const descContent = await descResponse.text();
        const parsed = parseDescriptionFile(descContent);
        description = parsed.description;
        sizes = parsed.sizes;
      }
      
      // Загружаем изображения (сортируем по номеру)
      const images: string[] = [];
      const imageManifest = manifest.images?.[productFolder] || [];
      
      // Сортируем изображения по номеру в имени файла
      imageManifest.sort((a: string, b: string) => {
        const numA = parseInt(a.match(/(\d+)/)?.[1] || '0');
        const numB = parseInt(b.match(/(\d+)/)?.[1] || '0');
        return numA - numB;
      });
      
      imageManifest.forEach((img: string) => {
        images.push(`${productPath}/${img}`);
      });
      
      products.push({
        id: productFolder,
        title: productFolder,
        description,
        sizes,
        images,
      });
    }
    
    return products;
  } catch (error) {
    console.error('Error loading products:', error);
    return [];
  }
}

// Синхронная версия для использования с import.meta.glob (на этапе сборки)
export function loadProductsSync(): ProductData[] {
  // Эта функция будет использоваться для импорта файлов на этапе сборки
  // Пока возвращаем пустой массив, будет реализована через import.meta.glob
  return [];
}
