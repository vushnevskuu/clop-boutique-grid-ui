import { useState, useCallback, useRef, memo, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface ProductTileProps {
  id: string | number;
  image: string;
  hoverImage?: string;
  priority?: boolean;
}

const ProductTile = memo(({ id, image, hoverImage, priority = false }: ProductTileProps) => {
  const navigate = useNavigate();
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
    navigate(`/product/${encodeURIComponent(String(id))}`);
  }, [id, navigate]);

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
      className="w-full cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
      style={{ aspectRatio: "4/5" }}
      onClick={go}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isInView ? (
        <img
          src={displayImage}
          alt=""
          className="block h-full w-full object-cover transition-opacity duration-300"
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "low"}
          draggable={false}
        />
      ) : (
        <div className="h-full w-full animate-pulse bg-muted" />
      )}
    </div>
  );
});

ProductTile.displayName = "ProductTile";

export default ProductTile;
