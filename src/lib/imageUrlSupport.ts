/** Плейсхолдер, если формат не поддерживается в браузере или загрузка не удалась. */
export const PRODUCT_IMAGE_PLACEHOLDER = "/placeholder.svg";

/**
 * HEIC/HEIF с iPhone в обычном img в Chrome/Firefox и многих окружениях не отображаются.
 * Medusa отдаёт URL как есть — лучше грузить JPEG/PNG/WebP в админке.
 */
export function isBrowserUnsupportedImageUrl(url: string): boolean {
  if (!url.trim()) return true;
  const path = url.split("?")[0].split("#")[0].toLowerCase();
  return path.endsWith(".heic") || path.endsWith(".heif");
}
