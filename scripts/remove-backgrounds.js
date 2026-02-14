/**
 * Убирает фон у первых двух фото (1.webp, 2.webp) у всех товаров в cloth/.
 * Результат перезаписывает те же файлы в формате WebP с прозрачностью.
 * Использование: npm run remove-backgrounds
 *
 * Первый запуск скачивает модель (~40 MB для small), это может занять время.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clothDir = path.join(__dirname, "..", "cloth");

// Оригиналы 1.webp, 2.webp остаются с фоном (для страницы товара). Результат сохраняем как *-nobg.webp для карточек в сетке.
const FILES_TO_PROCESS = [
  { src: "1.webp", out: "1-nobg.webp" },
  { src: "2.webp", out: "2-nobg.webp" },
];

async function main() {
  if (!fs.existsSync(clothDir)) {
    console.error("Папка cloth/ не найдена.");
    process.exit(1);
  }

  const { removeBackground } = await import("@imgly/background-removal-node");

  const entries = fs.readdirSync(clothDir, { withFileTypes: true });
  const productFolders = entries.filter((e) => e.isDirectory()).map((e) => e.name);

  if (productFolders.length === 0) {
    console.log("В cloth/ нет папок товаров.");
    return;
  }

  const config = {
    model: "small",
    output: { format: "image/webp", quality: 0.9 },
    debug: false,
  };

  let processed = 0;
  let skipped = 0;

  for (const folder of productFolders) {
    const productPath = path.join(clothDir, folder);

    for (const { src, out } of FILES_TO_PROCESS) {
      const srcPath = path.join(productPath, src);
      const outPath = path.join(productPath, out);
      if (!fs.existsSync(srcPath)) {
        skipped++;
        continue;
      }

      try {
        console.log(`Обработка: ${folder}/${src} → ${out} ...`);
        const blob = await removeBackground(srcPath, config);
        const buffer = Buffer.from(await blob.arrayBuffer());
        fs.writeFileSync(outPath, buffer);
        console.log(`  ✓ ${folder}/${out}`);
        processed++;
      } catch (err) {
        console.error(`  ✗ ${folder}/${src}:`, err.message);
      }
    }
  }

  console.log(`\nГотово. Обработано: ${processed}, пропущено (нет файла): ${skipped}.`);
  console.log("Запустите npm run generate-manifest и скопируйте cloth в public/cloth при необходимости.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
