import { useState, useCallback, useRef, memo, useEffect } from "react";
import ImageWithFormatFallback from "@/components/ImageWithFormatFallback";
import { cn } from "@/lib/utils";

interface ProductTileProps {
  id: string | number;
  image: string;
  hoverImage?: string;
  priority?: boolean;
  onOpen: (id: string | number) => void;
}

const ProductTile = memo(({ id, image, hoverImage, priority = false, onOpen }: ProductTileProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const tileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority || !tileRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: "80px" }
    );
    observer.observe(tileRef.current);
    return () => observer.disconnect();
  }, [priority]);

  const go = useCallback(() => {
    onOpen(id);
  }, [id, onOpen]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        go();
      }
    },
    [go]
  );

  return (
    <div
      ref={tileRef}
      role="button"
      tabIndex={0}
      className="relative w-full cursor-pointer select-none border border-[#f3f3f3] bg-white outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
      onClick={go}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Единый эталон 4:5 для всех карточек; hover — только смена opacity, без смены размера */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-white">
        {isInView ? (
          <>
            <ImageWithFormatFallback
              src={image}
              alt=""
              className={cn(
                "pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-300",
                isHovered && hoverImage ? "opacity-0" : "opacity-100"
              )}
              loading={priority ? "eager" : "lazy"}
              decoding="async"
              fetchPriority={priority ? "high" : "low"}
              draggable={false}
            />
            {hoverImage ? (
              <ImageWithFormatFallback
                src={hoverImage}
                alt=""
                className={cn(
                  "pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-300",
                  isHovered ? "opacity-100" : "opacity-0"
                )}
                loading="lazy"
                decoding="async"
                draggable={false}
              />
            ) : null}
          </>
        ) : (
          <div className="absolute inset-0 animate-pulse bg-muted" />
        )}
      </div>
    </div>
  );
});

ProductTile.displayName = "ProductTile";

export default ProductTile;
