import { memo, useEffect, useRef, useCallback, useState } from "react";
import ProductTile from "./ProductTile";
import { useProducts } from "@/hooks/useProducts";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMainScroll } from "@/contexts/MainScrollContext";

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

// Мобильный бесконечный скролл: в каждом чанке 1–2 случайных товара (не вся пачка)
const MOBILE_CHUNK_HEIGHT_VH = 80;
const INITIAL_MOBILE_CHUNKS = 8;

/** Для чанка с индексом chunkIndex возвращаем 1 или 2 случайных id товара (детерминированно). */
function getChunkProductIds(chunkIndex: number, productIds: string[]): string[] {
  if (productIds.length === 0) return [];
  const rng = seededRandom(chunkIndex + 100);
  const count = rng() < 0.5 ? 1 : 2;
  const countClamped = Math.min(count, productIds.length);
  const indices: number[] = [];
  while (indices.length < countClamped) {
    const i = Math.floor(rng() * productIds.length);
    if (!indices.includes(i)) indices.push(i);
  }
  return indices.map((i) => productIds[i]);
}

/** Позиции для товаров внутри одного чанка. */
function getChunkPositions(
  chunkIndex: number,
  chunkProductIds: string[]
): Record<string, { x: number; y: number }> {
  const rng = seededRandom(chunkIndex + 200);
  const positions: Record<string, { x: number; y: number }> = {};
  for (const id of chunkProductIds) {
    positions[id] = getRandomNonOverlappingPosition(positions, rng);
  }
  return positions;
}

const ProductGrid = memo(() => {
  const { products, loading, error } = useProducts();
  const containerRef = useRef<HTMLElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const chunkContainersRef = useRef<Record<number, HTMLDivElement | null>>({});
  const isMobile = useIsMobile();
  const { scrollContainerRef, useScrollContainer } = useMainScroll();
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [numMobileChunks, setNumMobileChunks] = useState(INITIAL_MOBILE_CHUNKS);
  const loadingMoreChunksRef = useRef(false);
  const [scrollContainerReady, setScrollContainerReady] = useState(false);

  // На мобилке с контейнером скролла (Safari) ref может появиться после монтирования
  useEffect(() => {
    if (!isMobile || !useScrollContainer) return;
    const t = setTimeout(() => setScrollContainerReady(true), 150);
    return () => clearTimeout(t);
  }, [isMobile, useScrollContainer]);

  // Бесконечный скролл на мобилке: по событию scroll подгружаем чанки у низа (надёжно на мобиле)
  useEffect(() => {
    if (!isMobile) return;
    const scrollEl = useScrollContainer && scrollContainerRef?.current ? scrollContainerRef.current : null;
    const getScrollTarget = (): { scrollTop: number; scrollHeight: number; clientHeight: number } | null => {
      if (scrollEl) {
        return {
          scrollTop: scrollEl.scrollTop,
          scrollHeight: scrollEl.scrollHeight,
          clientHeight: scrollEl.clientHeight,
        };
      }
      return {
        scrollTop: document.documentElement.scrollTop || window.scrollY,
        scrollHeight: document.documentElement.scrollHeight,
        clientHeight: window.innerHeight,
      };
    };
    const THRESHOLD = 500;
    let rafId = 0;
    const checkAndLoad = () => {
      const t = getScrollTarget();
      if (!t || loadingMoreChunksRef.current) return;
      const distFromBottom = t.scrollHeight - (t.scrollTop + t.clientHeight);
      if (distFromBottom < THRESHOLD) {
        loadingMoreChunksRef.current = true;
        setNumMobileChunks((n) => n + 2);
        setTimeout(() => {
          loadingMoreChunksRef.current = false;
        }, 280);
      }
    };
    const onScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(checkAndLoad);
    };
    const target = scrollEl || window;
    target.addEventListener("scroll", onScroll, { passive: true });
    checkAndLoad();
    return () => {
      target.removeEventListener("scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isMobile, useScrollContainer, scrollContainerReady]);

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

  // Мобилка: бесконечный скролл — по 1 чанку (1–2 товара) при скролле вниз, без пачки дубликатов
  if (isMobile) {
    const productsById = Object.fromEntries(products.map((p) => [String(p.id), p]));
    return (
      <section
        id="shop"
        className="scroll-mt-20 relative z-30 px-4 md:px-8 lg:px-[30px] pb-0"
        style={{ backgroundColor: "transparent", minHeight: "auto" }}
      >
        <div className="relative w-full" style={{ minHeight: "auto" }}>
          {Array.from({ length: numMobileChunks }, (_, chunkIndex) => {
            const chunkProductIds = getChunkProductIds(chunkIndex, productIds);
            const chunkPositions = getChunkPositions(chunkIndex, chunkProductIds);
            const containerRefForChunk: React.RefObject<HTMLDivElement | null> = {
              get current() {
                return chunkContainersRef.current[chunkIndex] ?? null;
              },
            } as React.RefObject<HTMLDivElement | null>;
            return (
              <div
                key={chunkIndex}
                ref={(el) => {
                  chunkContainersRef.current[chunkIndex] = el;
                }}
                className="relative w-full"
                style={{ height: `${MOBILE_CHUNK_HEIGHT_VH}vh` }}
              >
                {chunkProductIds.map((id, index) => {
                  const product = productsById[id];
                  if (!product) return null;
                  const pos = chunkPositions[id];
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
                      key={`${chunkIndex}-${product.id}`}
                      id={product.id}
                      image={firstImage}
                      hoverImage={secondImage}
                      position={pos}
                      onPositionChange={handlePositionChange}
                      containerRef={containerRefForChunk}
                      priority={chunkIndex === 0 && index < 2}
                      disableDrag
                    />
                  );
                })}
              </div>
            );
          })}
          <div
            ref={sentinelRef}
            className="w-full"
            aria-hidden="true"
            style={{ height: 1, minHeight: 1 }}
          />
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
