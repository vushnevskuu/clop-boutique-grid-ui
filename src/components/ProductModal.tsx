import { memo, useState, useMemo, useCallback, useRef, useEffect } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Dialog, DialogPortal, DialogOverlay } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";
import { formatProductCardTitle } from "@/lib/productCardDisplay";
import GeoProductJsonLd from "@/components/GeoProductJsonLd";
import ImageWithFormatFallback from "@/components/ImageWithFormatFallback";
import { GEO_LAST_UPDATED } from "@/data/geoFaq";

const COLUMN_LABEL_RU: Record<string, string> = {
  size: "Размер",
  chest: "Грудь",
  waist: "Талия",
  hips: "Бёдра",
  length: "Длина",
  sleeve: "Рукав",
  shoulder: "Плечи",
  inseam: "Шаговый шов",
  rise: "Посадка",
  us: "US",
  eu: "EU",
  uk: "UK",
  it: "IT",
  fr: "FR",
  height: "Рост",
  width: "Ширина",
};

function columnLabelRu(key: string) {
  const k = key.toLowerCase().trim();
  if (COLUMN_LABEL_RU[k]) return COLUMN_LABEL_RU[k];
  const first = k.split(/[\s(]+/)[0];
  if (first && COLUMN_LABEL_RU[first]) return COLUMN_LABEL_RU[first];
  if (k.startsWith("shoulder")) return "Ширина плеч";
  if (k.startsWith("back length")) return "Длина спины";
  if (k.startsWith("front length")) return "Длина переда";
  if (k.startsWith("arm opening")) return "Пройма";
  if (k.startsWith("грудь")) return "Грудь";
  if (k.startsWith("талия")) return "Талия";
  if (k.startsWith("ширина плеч")) return "Ширина плеч";
  if (k.startsWith("длина спины")) return "Длина спины";
  if (k.startsWith("длина переда")) return "Длина переда";
  if (k.startsWith("пройма")) return "Пройма";
  return key;
}

export type ProductModalProps = {
  open: boolean;
  loading: boolean;
  product: Product | null;
  onOpenChange: (open: boolean) => void;
};

const ProductModal = memo(({ open, loading, product, onOpenChange }: ProductModalProps) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [hoverPreviewSrc, setHoverPreviewSrc] = useState<string | null>(null);
    const [logoWidth, setLogoWidth] = useState(120);
    const imageRefs = useRef<Map<number, HTMLDivElement>>(new Map());

    const productImages = useMemo(() => {
      if (!product) return [];
      if (product.images?.length) return product.images.map((src) => ({ src }));
      const images: { src: string }[] = [];
      if (product.image) images.push({ src: product.image });
      if (product.hoverImage) images.push({ src: product.hoverImage });
      return images;
    }, [product]);

    const handleImageClick = useCallback((src: string) => {
      setHoverPreviewSrc(null);
      setSelectedImage((prev) => (prev === src ? null : src));
    }, []);

    const handleCloseImageModal = useCallback(() => {
      setSelectedImage(null);
    }, []);

    const handleThumbnailClick = useCallback((index: number) => {
      const ref = imageRefs.current.get(index);
      ref?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, []);

    useEffect(() => {
      if (!open) {
        setSelectedImage(null);
        setHoverPreviewSrc(null);
      }
    }, [open]);

    useEffect(() => {
      setHoverPreviewSrc(null);
    }, [product?.id]);

    useEffect(() => {
      const logo = document.querySelector('header img[alt="Логотип CLOP"]') as HTMLImageElement | null;
      if (!logo) return;
      const update = () => {
        const w = logo.offsetWidth || logo.clientWidth;
        if (w > 0) setLogoWidth(w);
      };
      update();
      window.addEventListener("resize", update);
      return () => window.removeEventListener("resize", update);
    }, [open, product?.id]);

    const titleText = product ? formatProductCardTitle(product.title) : "Товар";

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogPortal>
          <DialogOverlay className="z-[100]" />
          <DialogPrimitive.Content
            className={cn(
              "fixed left-[50%] top-[50%] z-[100] grid w-[min(1600px,calc(100vw-12px))] max-h-[calc(100vh-12px)] translate-x-[-50%] translate-y-[-50%] gap-0 overflow-y-auto border border-border bg-background p-0 shadow-lg duration-200",
              "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
            )}
            onOpenAutoFocus={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => {
              if (selectedImage) {
                e.preventDefault();
                handleCloseImageModal();
              }
            }}
          >
            <DialogPrimitive.Title className="sr-only">{titleText}</DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">
              {product?.description?.slice(0, 200) ?? "Карточка товара в каталоге CLOP"}
            </DialogPrimitive.Description>

            <DialogPrimitive.Close
              className="absolute right-2 top-2 z-[5] rounded-sm bg-background/80 p-2 opacity-90 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              aria-label="Закрыть"
            >
              <X className="h-5 w-5" />
            </DialogPrimitive.Close>

            <div className="px-3 pb-8 pt-12 sm:px-4 md:px-8 md:pb-12 md:pt-14">
              {loading && (
                <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
                  Загрузка…
                </div>
              )}

              {!loading && !product && (
                <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-4 text-center">
                  <h2 className="font-heading text-lg font-semibold md:text-xl">Товар не найден</h2>
                  <DialogPrimitive.Close asChild>
                    <button type="button" className="btn-brutal px-4 py-2 text-sm">
                      Закрыть
                    </button>
                  </DialogPrimitive.Close>
                </div>
              )}

              {!loading && product && (
                <>
                  {open && <GeoProductJsonLd product={product} />}
                  <div className="flex flex-col gap-8 md:flex-row md:gap-10 lg:gap-12">
                    <div
                      className="relative flex flex-1 flex-col gap-4 md:sticky md:top-4 md:max-h-[min(80vh,calc(100vh-8rem))] md:flex-row md:overflow-y-auto"
                      style={{ alignSelf: "flex-start" }}
                      onMouseLeave={() => setHoverPreviewSrc(null)}
                    >
                      {/* Превью по hover: по центру колонки с фото, не шире/выше блока галереи */}
                      <div
                        className={cn(
                          "pointer-events-none absolute inset-0 z-[15] flex items-center justify-center bg-background/90 p-2 motion-safe:transition-opacity motion-safe:duration-200 md:p-4",
                          hoverPreviewSrc && !selectedImage ? "opacity-100" : "opacity-0"
                        )}
                        aria-hidden={!hoverPreviewSrc || !!selectedImage}
                      >
                        {hoverPreviewSrc && !selectedImage ? (
                          <ImageWithFormatFallback
                            src={hoverPreviewSrc}
                            alt=""
                            className="max-h-full max-w-full object-contain"
                            decoding="async"
                          />
                        ) : null}
                      </div>

                      <div className="hidden flex-shrink-0 md:block" style={{ width: `${logoWidth}px` }}>
                        <div className="flex flex-col gap-3">
                          {productImages.map((img, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleThumbnailClick(index);
                              }}
                              onMouseEnter={() => !selectedImage && img.src && setHoverPreviewSrc(img.src)}
                              className="aspect-square w-full overflow-hidden border-0 bg-transparent p-0 outline-none"
                            >
                              <ImageWithFormatFallback
                                src={img.src}
                                alt={`${product.title}, миниатюра ${index + 1}`}
                                className="h-full w-full object-contain"
                                loading="lazy"
                                decoding="async"
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="w-full flex-1">
                        <div className="flex flex-col">
                          {productImages.map((img, index) => (
                            <div
                              key={index}
                              ref={(el) => {
                                if (el) imageRefs.current.set(index, el);
                                else imageRefs.current.delete(index);
                              }}
                              className="w-full"
                            >
                              <ImageWithFormatFallback
                                src={img.src || ""}
                                alt={`${product.title} — фото ${index + 1}`}
                                className="h-auto w-full cursor-pointer object-contain"
                                loading="lazy"
                                decoding="async"
                                onClick={() => handleImageClick(img.src || "")}
                                onMouseEnter={() => !selectedImage && img.src && setHoverPreviewSrc(img.src)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="w-full flex-shrink-0 md:ml-2 md:w-[min(100%,560px)] lg:w-[600px]">
                      <div className="space-y-4 md:space-y-6">
                        <h2 className="break-words font-heading text-[clamp(1.25rem,3.5vw,2rem)] font-semibold uppercase leading-[1.15] tracking-tight md:text-[clamp(1.5rem,2.5vw,2rem)]">
                          {formatProductCardTitle(product.title)}
                        </h2>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Карточка обновлена:{" "}
                          <time dateTime={`${GEO_LAST_UPDATED}T12:00:00+03:00`}>
                            {new Date(`${GEO_LAST_UPDATED}T12:00:00+03:00`).toLocaleDateString("ru-RU", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </time>
                        </p>
                        {product.brand && (
                          <p className="break-words text-xs lowercase tracking-widest text-muted-foreground md:text-sm">
                            {product.brand}
                          </p>
                        )}

                        {product.description && (
                          <div className="m-0 mt-6 p-0 text-foreground md:mt-8">
                            <p className="prose-product break-words whitespace-pre-line text-foreground/90">
                              {product.description}
                            </p>
                          </div>
                        )}

                        {product.sizes && product.sizes.length > 0 && product.sizes[0] && (
                          <div className="m-0 mt-4 p-0 text-black md:mt-6">
                            <div className="-mx-3 overflow-x-auto px-3 md:mx-0 md:px-0">
                              <table
                                className="w-full min-w-[280px] text-[11px] md:text-sm"
                                style={{ borderCollapse: "collapse" }}
                              >
                                <thead>
                                  <tr>
                                    {Object.keys(product.sizes[0] || {}).map((key) => (
                                      <th
                                        key={key}
                                        className="whitespace-nowrap border border-[#f3f3f3] p-1.5 pb-2 text-left font-normal md:p-2"
                                      >
                                        {columnLabelRu(key)}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {product.sizes.map((sizeRow, idx) => (
                                    <tr key={idx}>
                                      {Object.entries(sizeRow || {}).map(([key, value]) => (
                                        <td
                                          key={key}
                                          className="whitespace-nowrap border border-[#f3f3f3] p-1.5 py-1 md:p-2"
                                        >
                                          {value || "—"}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {product.price && (
                          <p className="break-words text-base font-semibold tabular-nums tracking-tight md:text-lg">
                            Цена: {product.price}
                          </p>
                        )}

                        <div className="pt-4 md:pt-8">
                          <button
                            type="button"
                            onClick={() => {
                              const idEnc = encodeURIComponent(String(product.id));
                              const productUrl = `${window.location.origin}/?item=${idEnc}`;
                              const messageText = `Здравствуйте! Интересует этот товар: ${productUrl}`;
                              const telegramUrl = `https://t.me/hithisisi?text=${encodeURIComponent(messageText)}`;
                              window.open(telegramUrl, "_blank");
                            }}
                            className="min-h-[52px] w-full bg-black px-6 py-3.5 text-sm font-medium text-white motion-safe:transition-colors motion-safe:duration-200 hover:bg-neutral-900 md:px-8 md:text-base"
                          >
                            Написать в Telegram
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Внутри Content: клики не считаются «снаружи» диалога, не ломается hit-testing */}
            {selectedImage ? (
              <div
                className="fixed inset-0 z-[120] flex cursor-default items-center justify-center bg-black/90 p-4"
                role="presentation"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    handleCloseImageModal();
                  }
                }}
              >
                <button
                  type="button"
                  className="max-h-[min(85dvh,calc(100vh-2rem))] max-w-[min(96vw,calc(100vw-2rem))] cursor-pointer border-0 bg-transparent p-0"
                  onClick={handleCloseImageModal}
                  aria-label="Закрыть просмотр фото"
                >
                  <ImageWithFormatFallback
                    src={selectedImage}
                    alt="Просмотр фото"
                    className="pointer-events-none max-h-[min(85dvh,calc(100vh-2rem))] max-w-[min(96vw,calc(100vw-2rem))] object-contain select-none"
                    draggable={false}
                    decoding="async"
                  />
                </button>
              </div>
            ) : null}
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    );
});

ProductModal.displayName = "ProductModal";

export default ProductModal;
