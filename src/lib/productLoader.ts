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

// Известные ключи измерений — только такие строки считаем размером, не описанием
const MEASUREMENT_KEYS = /^(chest|waist|shoulder|back length|front length|arm opening|size|размер|sleeve|length|hip|inseam)/i;

// Парсинг текстового файла описания
function parseDescriptionFile(content: string): { description: string; sizes: SizeRow[] } {
  const lines = content.split('\n').map(line => line.trim()).filter(line => line);
  
  let description = '';
  let sizes: SizeRow[] = [];
  let inSizesSection = false;
  let headers: string[] = [];
  let currentRow: { [key: string]: string } = {};
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Начало секции размеров: "size", "размер", "approximate measurements", "measurements (laid flat)"
    const isSizeSectionStart = 
      line.toLowerCase().includes('size') || 
      line.match(/^\s*(size|размер)/i) ||
      /approximate\s+measurements|measurements\s*\(laid\s+flat\)/i.test(line);
    
    if (isSizeSectionStart) {
      inSizesSection = true;
      // Если это заголовок таблицы через пробелы (старый формат) — сохраняем заголовки
      if (!line.match(/^.+:\s*.+$/)) {
        headers = line.split(/\s+/).map(h => h.toLowerCase());
      }
      continue;
    }
    
    if (inSizesSection) {
      // Формат "Ключ: значение" (например "Chest (pit to pit): 50–52 cm")
      const keyValueMatch = line.match(/^(.+?):\s*(.+)$/);
      if (keyValueMatch) {
        const key = keyValueMatch[1].trim();
        const value = keyValueMatch[2].trim();
        // Только строки, похожие на размеры, чтобы не затащить описание
        if (MEASUREMENT_KEYS.test(key) || /\d+\s*[–\-]\s*\d+\s*cm|~\d+/i.test(value)) {
          currentRow[key] = value;
          continue;
        }
      }
      
      // Старый формат: строка из нескольких значений через пробелы (табличные данные)
      const values = line.split(/\s+/).filter(v => v);
      if (values.length > 0 && headers.length > 0) {
        const sizeRow: { [key: string]: string } = {};
        headers.forEach((header, index) => {
          if (values[index]) {
            sizeRow[header] = values[index];
          }
        });
        if (values[0] && !sizeRow.size) {
          sizeRow.size = values[0];
        }
        if (sizeRow.size && Object.keys(sizeRow).length > 0) {
          sizes.push(sizeRow as SizeRow);
        }
      }
    } else {
      // Описание — всё до секции размеров
      if (description) description += '\n';
      description += line;
    }
  }
  
  // Если собрали одну строку размеров из формата "Ключ: значение"
  if (Object.keys(currentRow).length > 0) {
    sizes.push(currentRow as SizeRow);
  }
  
  // Альтернативный парсинг: "Size: XS, Chest: 86-90, ..."
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
