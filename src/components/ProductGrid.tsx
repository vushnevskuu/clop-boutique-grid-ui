import { memo, useEffect, useRef, useCallback, useState } from "react";
import ProductTile from "./ProductTile";
import { useProducts } from "@/hooks/useProducts";
import { useIsMobile } from "@/hooks/use-mobile";

// Размер карточек ~1.5× больше и адаптивный (clamp(140px, 27vw, 320px)) — запас по % для расчёта позиций
const TILE_WIDTH_PCT = 34;
const TILE_HEIGHT_PCT = 42;

function getRandomPosition(rng: () => number = Math.random): { x: number; y: number } {
  return {
    x: rng() * (100 - TILE_WIDTH_PCT),
    y: rng() * (100 - TILE_HEIGHT_PCT),
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
  existing: Record<string, { x: number; y: number }>,
  rng: () => number = Math.random
): { x: number; y: number } {
  const list = Object.values(existing);
  for (let attempt = 0; attempt < 200; attempt++) {
    const pos = getRandomPosition(rng);
    const overlaps = list.some((other) => rectanglesOverlap(pos, other));
    if (!overlaps) return pos;
  }
  return getRandomPosition(rng);
}

// Детерминированный рандом по seed (для бесконечного скролла — одна и та же «страница» даёт одни и те же позиции)
function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

function getPositionsForPage(
  pageIndex: number,
  productIds: string[]
): Record<string, { x: number; y: number }> {
  const rng = seededRandom(pageIndex + 1);
  const positions: Record<string, { x: number; y: number }> = {};
  for (const id of productIds) {
    positions[id] = getRandomNonOverlappingPosition(positions, rng);
  }
  return positions;
}

const INITIAL_MOBILE_PAGES = 2;
const PAGES_LOAD_MORE = 2;
const MOBILE_PAGE_HEIGHT_VH = 85;

const ProductGrid = memo(() => {
  const { products, loading, error } = useProducts();
  const containerRef = useRef<HTMLElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const pageContainersRef = useRef<Record<number, HTMLDivElement | null>>({});
  const isMobile = useIsMobile();
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [numMobilePages, setNumMobilePages] = useState(INITIAL_MOBILE_PAGES);

  // Бесконечный скролл на мобилке: подгрузка страниц при достижении низа
  useEffect(() => {
    if (!isMobile || !sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setNumMobilePages((n) => n + PAGES_LOAD_MORE);
        }
      },
      { rootMargin: "200px", threshold: 0 }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [isMobile, numMobilePages]);

  // При загрузке и при появлении новых товаров назначаем случайные позиции без наложения (десктоп)
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

  const productIds = products.map((p) => String(p.id));

  // Мобилка: бесконечный скролл — страницы по 100vh, при скролле вниз подгружаются новые с новыми рандомными позициями
  if (isMobile) {
    return (
      <section
        id="shop"
        className="scroll-mt-20 relative z-30 px-4 md:px-8 lg:px-[30px] pb-0 overflow-visible md:overflow-visible"
        style={{ backgroundColor: "transparent" }}
      >
        <div
          className="relative w-full"
          style={{ minHeight: `${numMobilePages * MOBILE_PAGE_HEIGHT_VH}vh` }}
        >
          {Array.from({ length: numMobilePages }, (_, pageIndex) => {
            const pagePositions = getPositionsForPage(pageIndex, productIds);
            const containerRefForPage: React.RefObject<HTMLDivElement | null> = {
              get current() {
                return pageContainersRef.current[pageIndex] ?? null;
              },
            } as React.RefObject<HTMLDivElement | null>;
            return (
              <div
                key={pageIndex}
                ref={(el) => {
                  pageContainersRef.current[pageIndex] = el;
                }}
                className="relative w-full"
                style={{ height: `${MOBILE_PAGE_HEIGHT_VH}vh` }}
              >
                {products.map((product, index) => {
                  const pos = pagePositions[String(product.id)];
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
                      key={`${pageIndex}-${product.id}`}
                      id={product.id}
                      image={firstImage}
                      hoverImage={secondImage}
                      position={pos}
                      onPositionChange={handlePositionChange}
                      containerRef={containerRefForPage}
                      priority={pageIndex === 0 && index < 6}
                      disableDrag
                    />
                  );
                })}
              </div>
            );
          })}
          <div ref={sentinelRef} className="h-0 w-full" aria-hidden="true" style={{ minHeight: 1 }} />
        </div>
      </section>
    );
  }

  // Десктоп: одна область с летающими карточками
  return (
    <section
      id="shop"
      className="scroll-mt-20 relative z-30 px-4 md:px-8 lg:px-[30px] pb-0 overflow-visible"
      style={{
        backgroundColor: "transparent",
        minHeight: "110vh",
      }}
    >
      <div ref={containerRef as React.RefObject<HTMLDivElement | null>} className="relative w-full h-full" style={{ minHeight: "100vh" }}>
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
