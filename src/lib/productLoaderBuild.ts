// Build-time загрузка товаров через import.meta.glob
// Этот файл используется для генерации списка товаров на этапе сборки

export interface SizeRow {
  size: string;
  chest?: string;
  waist?: string;
  length?: string;
  [key: string]: string | undefined;
}

export interface ProductData {
  id: string;
  title: string;
  description: string;
  sizes: SizeRow[];
  images: string[];
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
      // Извлекаем заголовки из первой строки (разделенные табуляцией или пробелами)
      headers = line.split(/\t|\s{2,}/).map(h => h.toLowerCase().trim()).filter(h => h);
      // Если не получилось, пробуем разделить по пробелам
      if (headers.length < 2) {
        headers = line.split(/\s+/).map(h => h.toLowerCase().trim()).filter(h => h);
      }
      continue;
    }
    
    if (inSizesSection && headers.length > 0) {
      // Парсим строки размеров
      let values: string[] = [];
      // Пробуем разделить по табуляции
      if (line.includes('\t')) {
        values = line.split('\t').map(v => v.trim()).filter(v => v);
      } else {
        // Разделяем по двум и более пробелам
        values = line.split(/\s{2,}/).map(v => v.trim()).filter(v => v);
        // Если не получилось, пробуем по одному пробелу, но только если есть числа
        if (values.length < 2 && line.match(/\d/)) {
          values = line.split(/\s+/).filter(v => v);
        }
      }
      
      if (values.length > 0) {
        const sizeRow: { [key: string]: string } = {};
        headers.forEach((header, index) => {
          if (values[index] && header) {
            // Нормализуем имя заголовка
            const normalizedHeader = header.replace(/[^a-z0-9]/gi, '').toLowerCase();
            sizeRow[normalizedHeader] = values[index];
            // Сохраняем оригинальное имя тоже
            if (normalizedHeader !== header) {
              sizeRow[header] = values[index];
            }
          }
        });
        // Если первый столбец - размер
        if (values[0] && !sizeRow.size) {
          sizeRow.size = values[0];
        }
        if (Object.keys(sizeRow).length > 0 && sizeRow.size) {
          sizes.push(sizeRow as SizeRow);
        }
      }
    } else {
      // Описание - все строки до таблицы размеров
      if (description) description += '\n';
      description += line;
    }
  }
  
  // Альтернативный парсинг для формата "Size: XS, Chest: 86-90"
  if (sizes.length === 0 && description.match(/Size:\s*/i)) {
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

// Загрузка товаров через import.meta.glob (на этапе сборки)
export function loadProductsFromGlob(): ProductData[] {
  // Используем glob для импорта всех изображений и текстовых файлов
  // Структура: cloth/название-папки/1.jpg, 2.jpg, ..., description.txt
  
  // Пробуем загрузить через glob (если файлы в src/assets/cloth)
  // Или используем публичные файлы (если в public/cloth)
  
  // Для public/cloth используем пути вида /cloth/...
  // Для этого нужно будет создать manifest.json или использовать другой подход
  
  // Пока возвращаем пустой массив - будет заполнено при наличии файлов
  return [];
}
