import { useEffect, useState, type ImgHTMLAttributes } from "react";
import { isBrowserUnsupportedImageUrl, PRODUCT_IMAGE_PLACEHOLDER } from "@/lib/imageUrlSupport";

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src: string;
};

/**
 * Подмена HEIC/HEIF и fallback при ошибке загрузки (битый URL, неподдерживаемый тип).
 */
export default function ImageWithFormatFallback({ src, onError, ...rest }: Props) {
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    setLoadFailed(false);
  }, [src]);

  const resolvedSrc =
    loadFailed || isBrowserUnsupportedImageUrl(src) ? PRODUCT_IMAGE_PLACEHOLDER : src;

  return (
    <img
      {...rest}
      src={resolvedSrc}
      onError={(e) => {
        if (!loadFailed) setLoadFailed(true);
        onError?.(e);
      }}
    />
  );
}
