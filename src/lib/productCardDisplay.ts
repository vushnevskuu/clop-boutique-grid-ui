/** Заголовок карточки в каталоге: имя папки → читаемая строка. */
export function formatProductCardTitle(folderId: string): string {
  return folderId.replace(/_/g, " ").trim();
}

/** Короткая строка для подписи на карточке (первый непустой абзац). */
export function productCardBlurb(description: string, maxLen = 110): string {
  const line = description
    .split(/\n/)
    .map((l) => l.trim())
    .find((l) => l.length > 0);
  if (!line) return "";
  if (line.length <= maxLen) return line;
  return `${line.slice(0, Math.max(0, maxLen - 1)).trim()}…`;
}
