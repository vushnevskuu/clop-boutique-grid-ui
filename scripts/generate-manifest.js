// Скрипт для генерации manifest.json из папки cloth
// Использование: npm run generate-manifest

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clothDir = path.join(__dirname, '..', 'cloth');
const publicClothDir = path.join(__dirname, '..', 'public', 'cloth');
const manifestPath = path.join(__dirname, '..', 'public', 'cloth', 'manifest.json');

// Определяем, какая папка существует
let workingDir = null;
if (fs.existsSync(clothDir)) {
  workingDir = clothDir;
} else if (fs.existsSync(publicClothDir)) {
  workingDir = publicClothDir;
} else {
  console.error('Папка cloth не найдена! Создайте папку cloth/ или public/cloth/');
  process.exit(1);
}

// Создаем папку public/cloth если её нет
const outputDir = path.dirname(manifestPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Копируем файлы из cloth в public/cloth если нужно
if (workingDir === clothDir && workingDir !== publicClothDir) {
  if (!fs.existsSync(publicClothDir)) {
    fs.mkdirSync(publicClothDir, { recursive: true });
  }
  
  // Копируем всю структуру
  function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
  
  copyDir(clothDir, publicClothDir);
  console.log(`Файлы скопированы из ${clothDir} в ${publicClothDir}`);
  workingDir = publicClothDir;
}

// Генерируем manifest.json
const manifest = {
  products: [],
  images: {},
};

try {
  const entries = fs.readdirSync(workingDir, { withFileTypes: true });
  
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const productFolder = entry.name;
      const productPath = path.join(workingDir, productFolder);
      
      // Получаем все файлы в папке товара
      const files = fs.readdirSync(productPath);
      
      // Фильтруем изображения и текстовый файл описания
      const imageFiles = files
        .filter(file => {
          const ext = path.extname(file).toLowerCase();
          return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
        })
        .sort((a, b) => {
          // Сортируем по номеру в имени файла
          const numA = parseInt(a.match(/(\d+)/)?.[1] || '0');
          const numB = parseInt(b.match(/(\d+)/)?.[1] || '0');
          return numA - numB;
        });
      
      // Проверяем наличие description.txt
      const hasDescription = files.some(file => 
        file.toLowerCase() === 'description.txt' || 
        file.toLowerCase().endsWith('.txt')
      );
      
      if (imageFiles.length > 0) {
        manifest.products.push(productFolder);
        manifest.images[productFolder] = imageFiles;
      }
    }
  }
  
  // Сохраняем manifest.json
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  
  console.log('✅ manifest.json успешно создан!');
  console.log(`📁 Найдено товаров: ${manifest.products.length}`);
  console.log(`📄 Путь: ${manifestPath}`);
  
  manifest.products.forEach(product => {
    const imageCount = manifest.images[product]?.length || 0;
    console.log(`  - ${product}: ${imageCount} фото`);
  });
  
} catch (error) {
  console.error('❌ Ошибка при генерации manifest.json:', error);
  process.exit(1);
}
