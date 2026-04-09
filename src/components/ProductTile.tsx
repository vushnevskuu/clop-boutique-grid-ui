import { useState, useCallback, useRef, memo, useEffect } from "react";
import ImageWithFormatFallback from "@/components/ImageWithFormatFallback";

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

  const displayImage = isHovered && hoverImage ? hoverImage : image;

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
      {isInView ? (
        <ImageWithFormatFallback
          src={displayImage}
          alt=""
          className="block h-auto w-full object-contain transition-opacity duration-300"
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "low"}
          draggable={false}
        />
      ) : (
        <div className="flex min-h-[min(60vw,320px)] w-full items-center justify-center animate-pulse bg-muted" />
      )}
    </div>
  );
});

ProductTile.displayName = "ProductTile";

export default ProductTile;
