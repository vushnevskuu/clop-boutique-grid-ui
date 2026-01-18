import { memo } from "react";
import ProductCard from "./ProductCard";
import { useProducts } from "@/hooks/useProducts";

const ProductGrid = memo(() => {
  const { products, loading, error } = useProducts();

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
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            image={product.image || product.images[0] || ''}
            hoverImage={product.hoverImage || product.images[1] || product.images[0] || ''}
            title={product.title}
            brand={product.brand}
            price={product.price}
            size={product.size}
          />
        ))}
      </div>
    </section>
  );
});

ProductGrid.displayName = 'ProductGrid';

export default ProductGrid;
