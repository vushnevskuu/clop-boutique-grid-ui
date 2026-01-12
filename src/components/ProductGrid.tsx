import { memo, useState, useEffect, useCallback, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
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
  {
    id: 9,
    image: product1,
    hoverImage: product3,
    title: "Vintage denim jacket",
    brand: "Classic",
    price: "$89",
    size: "L",
  },
  {
    id: 10,
    image: product2,
    hoverImage: product4,
    title: "Slim fit jeans",
    brand: "Premium",
    price: "$55",
    size: "30",
  },
  {
    id: 11,
    image: product3,
    hoverImage: product5,
    title: "Cashmere sweater",
    brand: "Luxury",
    price: "$95",
    size: "M",
  },
  {
    id: 12,
    image: product4,
    hoverImage: product6,
    title: "Canvas sneakers",
    brand: "Casual",
    price: "$35",
    size: "41",
  },
  {
    id: 13,
    image: product5,
    hoverImage: product7,
    title: "Cotton scarf",
    brand: "Minimalist",
    price: "$28",
  },
  {
    id: 14,
    image: product6,
    hoverImage: product8,
    title: "Wide leg pants",
    brand: "Vintage",
    price: "$52",
    size: "L",
  },
  {
    id: 15,
    image: product7,
    hoverImage: product1,
    title: "Tailored blazer",
    brand: "Classic",
    price: "$88",
    size: "M",
  },
  {
    id: 16,
    image: product8,
    hoverImage: product2,
    title: "Oversized shirt",
    brand: "Modern",
    price: "$32",
    size: "L",
  },
  {
    id: 17,
    image: product1,
    hoverImage: product4,
    title: "Bomber jacket",
    brand: "Streetwear",
    price: "$105",
    size: "M",
  },
  {
    id: 18,
    image: product2,
    hoverImage: product5,
    title: "Straight leg jeans",
    brand: "Vintage",
    price: "$48",
    size: "32",
  },
  {
    id: 19,
    image: product3,
    hoverImage: product6,
    title: "Knit cardigan",
    brand: "Handmade",
    price: "$65",
    size: "L",
  },
  {
    id: 20,
    image: product4,
    hoverImage: product7,
    title: "High top sneakers",
    brand: "Retro",
    price: "$42",
    size: "43",
  },
];

const ProductGrid = memo(() => {
  const isMobile = useIsMobile();
  const [displayedProducts, setDisplayedProducts] = useState(products);
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const pageRef = useRef(1);

  // Функция для загрузки дополнительных товаров
  const loadMoreProducts = useCallback(() => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    // Симулируем задержку загрузки
    setTimeout(() => {
      // Генерируем больше товаров, повторяя существующие с новыми ID
      const newProducts = products.map((product, index) => ({
        ...product,
        id: products.length * pageRef.current + index + 1,
      }));
      
      setDisplayedProducts(prev => [...prev, ...newProducts]);
      pageRef.current += 1;
      setIsLoading(false);
    }, 500);
  }, [isLoading]);

  // Настройка Intersection Observer для бесконечного скролла на мобильных
  useEffect(() => {
    if (!isMobile || !loadMoreRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !isLoading) {
          loadMoreProducts();
        }
      },
      {
        root: null,
        rootMargin: '200px', // Начинаем загрузку за 200px до конца
        threshold: 0.1,
      }
    );

    observerRef.current.observe(loadMoreRef.current);

    return () => {
      if (observerRef.current && loadMoreRef.current) {
        observerRef.current.unobserve(loadMoreRef.current);
      }
    };
  }, [isMobile, isLoading, loadMoreProducts]);

  return (
    <section 
      id="shop" 
      className="scroll-mt-20 relative z-30 px-4 md:px-8 lg:px-[30px] pb-0" 
      style={{ 
        backgroundColor: 'transparent'
      }}
    >
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5">
        {displayedProducts.map((product) => (
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
      
      {/* Элемент-триггер для загрузки новых товаров на мобильных */}
      {isMobile && (
        <div 
          ref={loadMoreRef}
          className="w-full h-20 flex items-center justify-center"
          style={{ minHeight: '80px' }}
        >
          {isLoading && (
            <div className="text-sm text-gray-500">Загрузка...</div>
          )}
        </div>
      )}
    </section>
  );
});

ProductGrid.displayName = 'ProductGrid';

export default ProductGrid;
