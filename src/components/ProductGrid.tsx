import { memo, useEffect } from "react";
import ProductTile from "./ProductTile";
import { useProducts } from "@/hooks/useProducts";

const ProductGrid = memo(() => {
  const { products, loading, error } = useProducts();

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
        className="relative z-30 scroll-mt-20 bg-transparent px-4 pb-12 md:px-8 lg:px-[30px]"
      >
        <div className="py-8 text-center">Loading products...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section
        id="shop"
        className="relative z-30 scroll-mt-20 bg-transparent px-4 pb-12 md:px-8 lg:px-[30px]"
      >
        <div className="py-8 text-center text-red-500">Error loading products: {error.message}</div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section
        id="shop"
        className="relative z-30 scroll-mt-20 bg-transparent px-4 pb-12 md:px-8 lg:px-[30px]"
      >
        <div className="py-8 text-center">No products found</div>
      </section>
    );
  }

  return (
    <section
      id="shop"
      className="relative z-30 scroll-mt-20 bg-transparent px-4 pb-12 md:px-8 lg:px-[30px]"
    >
      <div className="mx-auto grid w-full max-w-[1600px] grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4 lg:gap-6">
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
            />
          );
        })}
      </div>
    </section>
  );
});

ProductGrid.displayName = "ProductGrid";

export default ProductGrid;
