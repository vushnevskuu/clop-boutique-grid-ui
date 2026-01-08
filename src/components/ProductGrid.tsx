import { memo } from "react";
import ProductCard from "./ProductCard";
import { useProducts } from "@/hooks/useProducts";

const ProductGrid = memo(() => {
  const { products, loading } = useProducts();

  if (loading) {
    return (
      <section 
        id="shop" 
        className="scroll-mt-20 relative z-30" 
        style={{ 
          padding: '30px', 
          paddingBottom: '0', 
          backgroundColor: 'transparent'
        }}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <p>Загрузка товаров...</p>
        </div>
      </section>
    );
  }

  return (
    <section 
      id="shop" 
      className="scroll-mt-20 relative z-30" 
      style={{ 
        padding: '30px', 
        paddingBottom: '0', 
        backgroundColor: 'transparent'
      }}
    >
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6" style={{ rowGap: '20px', columnGap: '20px' }}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            image={product.image}
            hoverImage={product.hover_image}
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
