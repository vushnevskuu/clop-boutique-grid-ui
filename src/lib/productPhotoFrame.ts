/**
 * Нативный кадр фото в каталоге: 1399 × 1999 px (соотношение 1399:1999, дробь несократима).
 * Рамка задаёт высоту от ширины; внутри — только absolute + object-cover/object-center.
 */
export const PRODUCT_PHOTO_NATIVE_WIDTH = 1399;
export const PRODUCT_PHOTO_NATIVE_HEIGHT = 1999;

/** Внутренний контейнер: h-0 + padding-bottom = точная пропорция 1999/1399 от ширины */
export const productPhotoFrameInnerClass =
  "relative h-0 w-full min-w-0 shrink-0 overflow-hidden pb-[calc(100%*1999/1399)]";
