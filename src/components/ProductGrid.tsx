import { memo, useEffect, useRef, useCallback, useState } from "react";
import ProductTile from "./ProductTile";
import { useProducts } from "@/hooks/useProducts";

const TILE_WIDTH_PCT = 22;
const TILE_HEIGHT_PCT = 28;

function getRandomPosition(): { x: number; y: number } {
  return {
    x: Math.random() * (100 - TILE_WIDTH_PCT),
    y: Math.random() * (100 - TILE_HEIGHT_PCT),
  };
}

function rectanglesOverlap(
  a: { x: number; y: number },
  b: { x: number; y: number }
): boolean {
  return !(
    a.x + TILE_WIDTH_PCT <= b.x ||
    b.x + TILE_WIDTH_PCT <= a.x ||
    a.y + TILE_HEIGHT_PCT <= b.y ||
    b.y + TILE_HEIGHT_PCT <= a.y
  );
}

function getRandomNonOverlappingPosition(
  existing: Record<string, { x: number; y: number }>
): { x: number; y: number } {
  const list = Object.values(existing);
  for (let attempt = 0; attempt < 200; attempt++) {
    const pos = getRandomPosition();
    const overlaps = list.some((other) => rectanglesOverlap(pos, other));
    if (!overlaps) return pos;
  }
  return getRandomPosition();
}

const ProductGrid = memo(() => {
  const { products, loading, error } = useProducts();
  const containerRef = useRef<HTMLElement>(null);
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});

  // При загрузке и при появлении новых товаров назначаем случайные позиции без наложения
  useEffect(() => {
    setPositions((prev) => {
      let next = { ...prev };
      let changed = false;
      products.forEach((product) => {
        const sid = String(product.id);
        if (next[sid] == null) {
          next[sid] = getRandomNonOverlappingPosition(next);
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [products]);

  const handlePositionChange = useCallback((id: string | number, x: number, y: number) => {
    const sid = String(id);
    setPositions((prev) => (prev[sid]?.x === x && prev[sid]?.y === y ? prev : { ...prev, [sid]: { x, y } }));
  }, []);

  // Preload первых изображений
  useEffect(() => {
    if (products.length === 0) return;
    const preloadImages = products
      .slice(0, 6)
      .map((p) => p.image || (p.images?.[0] ?? ""))
      .filter(Boolean);
    preloadImages.forEach((src) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = src;
      document.head.appendChild(link);
    });
    return () => {
      preloadImages.forEach((src) => {
        document.querySelectorAll(`link[href="${src}"]`).forEach((el) => el.remove());
      });
    };
  }, [products]);

  if (loading) {
    return (
      <section
        id="shop"
        className="scroll-mt-20 relative z-30 px-4 md:px-8 lg:px-[30px] pb-0"
        style={{ backgroundColor: "transparent" }}
      >
        <div className="text-center py-8">Loading products...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section
        id="shop"
        className="scroll-mt-20 relative z-30 px-4 md:px-8 lg:px-[30px] pb-0"
        style={{ backgroundColor: "transparent" }}
      >
        <div className="text-center py-8 text-red-500">Error loading products: {error.message}</div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section
        id="shop"
        className="scroll-mt-20 relative z-30 px-4 md:px-8 lg:px-[30px] pb-0"
        style={{ backgroundColor: "transparent" }}
      >
        <div className="text-center py-8">No products found</div>
      </section>
    );
  }

  return (
    <section
      id="shop"
      className="scroll-mt-20 relative z-30 px-4 md:px-8 lg:px-[30px] pb-0 overflow-visible"
      style={{
        backgroundColor: "transparent",
        minHeight: "180vh",
      }}
    >
      <div ref={containerRef} className="relative w-full h-full" style={{ minHeight: "160vh" }}>
        {products.map((product, index) => {
          const pos = positions[String(product.id)];
          if (pos == null) return null;
          const firstImage =
            product.image || (product.images?.[0] ?? "") || "";
          const secondImage =
            product.hoverImage ||
            (product.images?.length && product.images.length > 1
              ? product.images[1]
              : product.images?.[0]) ||
            firstImage;
          return (
            <ProductTile
              key={product.id}
              id={product.id}
              image={firstImage}
              hoverImage={secondImage}
              position={pos}
              onPositionChange={handlePositionChange}
              containerRef={containerRef}
              priority={index < 6}
            />
          );
        })}
      </div>
    </section>
  );
});

ProductGrid.displayName = "ProductGrid";

export default ProductGrid;
