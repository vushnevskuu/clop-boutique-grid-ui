import { useEffect, useState, useCallback, useMemo, memo } from "react";
import ProductCard from "./ProductCard";

import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import product5 from "@/assets/product-5.jpg";
import product6 from "@/assets/product-6.jpg";
import product7 from "@/assets/product-7.jpg";
import product8 from "@/assets/product-8.jpg";

const products = [
  {
    id: 1,
    image: product1,
    hoverImage: product2,
    title: "Leather jacket",
    brand: "Vintage",
    price: "$125",
    size: "M",
  },
  {
    id: 2,
    image: product2,
    hoverImage: product3,
    title: "Classic jeans",
    brand: "Levi's",
    price: "$42",
    size: "32",
  },
  {
    id: 3,
    image: product3,
    hoverImage: product4,
    title: "Wool sweater",
    brand: "Handmade",
    price: "$58",
    size: "L",
  },
  {
    id: 4,
    image: product4,
    hoverImage: product5,
    title: "Leather sneakers",
    brand: "Vintage",
    price: "$39",
    size: "42",
  },
  {
    id: 5,
    image: product5,
    hoverImage: product6,
    title: "Silk scarf",
    brand: "Italian",
    price: "$21",
  },
  {
    id: 6,
    image: product6,
    hoverImage: product7,
    title: "Corduroy pants",
    brand: "Vintage",
    price: "$45",
    size: "M",
  },
  {
    id: 7,
    image: product7,
    hoverImage: product8,
    title: "Oversized blazer",
    brand: "90s",
    price: "$72",
    size: "L",
  },
  {
    id: 8,
    image: product8,
    hoverImage: product1,
    title: "Basic t-shirt",
    brand: "Premium Cotton",
    price: "$18",
    size: "M",
  },
];

const ProductGrid = memo(() => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);

  const handleScroll = useCallback(() => {
    const windowHeight = window.innerHeight;
    const heroHeight = windowHeight * 3;
    const currentScroll = window.scrollY;
    setScrollPosition(currentScroll);
    const progress = Math.max(0, Math.min(1, currentScroll / heroHeight));
    setScrollProgress(progress);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  // Calculate translateY for product grid to appear from below
  const gridTranslateY = useMemo(() => {
    const windowHeight = window.innerHeight;
    const heroHeight = windowHeight * 3;
    
    if (scrollProgress >= 1) {
      const extraScroll = Math.max(0, scrollPosition - heroHeight);
      // Start from below screen (one viewport height) and move up as user scrolls
      // When extraScroll = 0, grid is at windowHeight (below screen)
      // As extraScroll increases, grid moves up
      return Math.max(0, windowHeight - extraScroll);
    }
    // Before hero completes, keep grid below screen
    return windowHeight;
  }, [scrollProgress, scrollPosition]);

  return (
    <section 
      id="shop" 
      className="scroll-mt-20 relative z-30" 
      style={{ 
        padding: '30px', 
        paddingBottom: '0', 
        backgroundColor: 'transparent',
        transform: `translateY(${gridTranslateY}px)`,
        transition: scrollProgress >= 1 ? 'transform 0.3s ease-out' : 'none'
      }}
    >
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6" style={{ rowGap: '20px', columnGap: '20px' }}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            image={product.image}
            hoverImage={product.hoverImage}
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
