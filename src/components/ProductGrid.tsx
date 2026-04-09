import { memo, useEffect } from "react";
import ProductTile from "./ProductTile";
import type { Product } from "@/types/product";

const sectionShell =
  "relative z-30 scroll-mt-[120px] bg-transparent px-4 pb-12 md:scroll-mt-[132px] md:px-8 lg:px-[30px] md:pb-12";

export type ProductGridProps = {
  products: Product[];
  loading: boolean;
  error: Error | null;
  onProductOpen: (id: string | number) => void;
};

const ProductGrid = memo(({ products, loading, error, onProductOpen }: ProductGridProps) => {

  useEffect(() => {
    if (products.length === 0) return;
    const preloadImages = products
      .slice(0, 8)
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
        className={sectionShell}
      >
        <div className="py-12 text-center text-muted-foreground">Загружаем каталог…</div>
      </section>
    );
  }

  if (error) {
    return (
      <section
        id="shop"
        className={sectionShell}
      >
        <div className="py-12 text-center text-red-600">
          Ошибка загрузки: {error.message}
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section
        id="shop"
        className={sectionShell}
      >
        <div className="py-12 text-center text-muted-foreground">
          В каталоге пока нет позиций. Загляните позже или напишите нам в Instagram —{" "}
          <a
            href="https://www.instagram.com/clo.p_market"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground underline decoration-foreground/35 underline-offset-[3px] transition-colors hover:decoration-foreground"
          >
            @clo.p_market
          </a>
        </div>
      </section>
    );
  }

  return (
    <section id="shop" className={sectionShell}>
      <div className="mx-auto grid w-full max-w-[1600px] grid-cols-2 items-start gap-3 sm:gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4 lg:gap-6">
        {products.map((product, index) => {
          const firstImage = product.image || (product.images?.[0] ?? "") || "";
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
              priority={index < 8}
              onOpen={onProductOpen}
            />
          );
        })}
      </div>
    </section>
  );
});

ProductGrid.displayName = "ProductGrid";

export default ProductGrid;
