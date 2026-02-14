import { useState, useCallback, useRef, memo, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface ProductTileProps {
  id: string | number;
  image: string;
  hoverImage?: string;
  position: { x: number; y: number };
  onPositionChange: (id: string | number, x: number, y: number) => void;
  containerRef: React.RefObject<HTMLElement | null>;
  priority?: boolean;
}

const ProductTile = memo(({
  id,
  image,
  hoverImage,
  position,
  onPositionChange,
  containerRef,
  priority = false,
}: ProductTileProps) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{
    offsetX: number;
    offsetY: number;
    clientX: number;
    clientY: number;
    didMove: boolean;
  } | null>(null);
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
      { rootMargin: "50px" }
    );
    observer.observe(tileRef.current);
    return () => observer.disconnect();
  }, [priority]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      const rect = tileRef.current?.getBoundingClientRect();
      if (!rect) return;
      setIsDragging(true);
      dragStartRef.current = {
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top,
        clientX: e.clientX,
        clientY: e.clientY,
        didMove: false,
      };
    },
    []
  );

  useEffect(() => {
    if (!isDragging || !dragStartRef.current || !containerRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || !dragStartRef.current) return;
      const { offsetX, offsetY, clientX, clientY } = dragStartRef.current;
      if (Math.abs(e.clientX - clientX) > 5 || Math.abs(e.clientY - clientY) > 5) {
        dragStartRef.current.didMove = true;
      }
      const rect = containerRef.current.getBoundingClientRect();
      const tileLeft = e.clientX - offsetX;
      const tileTop = e.clientY - offsetY;
      const xPct = ((tileLeft - rect.left) / rect.width) * 100;
      const yPct = ((tileTop - rect.top) / rect.height) * 100;
      const clampedX = Math.max(0, Math.min(85, xPct));
      const clampedY = Math.max(0, Math.min(85, yPct));
      onPositionChange(id, clampedX, clampedY);
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button !== 0) return;
      const didDrag = dragStartRef.current?.didMove ?? false;
      dragStartRef.current = null;
      setIsDragging(false);
      if (!didDrag) {
        navigate(`/product/${encodeURIComponent(String(id))}`);
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, id, onPositionChange, containerRef]);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  return (
    <div
      ref={tileRef}
      className="absolute cursor-grab active:cursor-grabbing touch-none select-none"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        width: "min(180px, 18vw)",
        aspectRatio: "4/5",
        zIndex: isDragging ? 50 : 1,
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {isInView ? (
        <img
          src={displayImage}
          alt=""
          className="w-full h-full object-cover pointer-events-none transition-opacity duration-300 block"
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "low"}
          draggable={false}
        />
      ) : (
        <div className="w-full h-full bg-gray-100 animate-pulse" />
      )}
    </div>
  );
});

ProductTile.displayName = "ProductTile";

export default ProductTile;
