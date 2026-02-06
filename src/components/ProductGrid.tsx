import { memo, useEffect } from "react";
import ProductCard from "./ProductCard";
import { useProducts } from "@/hooks/useProducts";

const ProductGrid = memo(() => {
  const { products, loading, error } = useProducts();

  // Preload первые 6 изображений для быстрой загрузки
  useEffect(() => {
    if (products.length === 0) return;
    
    const preloadImages = products.slice(0, 6).map((product) => {
      const firstImage = product.image || (product.images && product.images.length > 0 ? product.images[0] : '');
      return firstImage;
    }).filter(Boolean);

    preloadImages.forEach((src) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });

    return () => {
      // Cleanup при размонтировании
      preloadImages.forEach((src) => {
        const links = document.querySelectorAll(`link[href="${src}"]`);
        links.forEach((link) => link.remove());
      });
    };
  }, [products]);

  if (loading) {
    return (
      <section 
        id="shop" 
        className="scroll-mt-20 relative z-30 px-4 md:px-8 lg:px-[30px] pb-0" 
        style={{ 
          backgroundColor: 'transparent'
        }}
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
        style={{ 
          backgroundColor: 'transparent'
        }}
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
        style={{ 
          backgroundColor: 'transparent'
        }}
      >
        <div className="text-center py-8">No products found</div>
      </section>
    );
  }

  return (
    <section 
      id="shop" 
      className="scroll-mt-20 relative z-30 px-4 md:px-8 lg:px-[30px] pb-0" 
      style={{ 
        backgroundColor: 'transparent'
      }}
    >
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5">
        {products.map((product, index) => {
          const firstImage = product.image || (product.images && product.images.length > 0 ? product.images[0] : '') || '';
          const secondImage = product.hoverImage || (product.images && product.images.length > 1 ? product.images[1] : product.images?.[0]) || firstImage;
          return (
            <ProductCard
              key={product.id}
              id={product.id}
              image={firstImage}
              hoverImage={secondImage}
              title={product.title}
              brand={product.brand}
              price={product.price}
              size={product.size}
              priority={index < 6} // Первые 6 карточек загружаются с приоритетом
            />
          );
        })}
      </div>
    </section>
  );
});

ProductGrid.displayName = 'ProductGrid';

export default ProductGrid;
