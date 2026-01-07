import { memo, useEffect, useState, useRef, useCallback, useMemo } from "react";
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

// Configurable parameters
const FOOTER_APPEAR_THRESHOLD = 0.5; // 50% of second-to-last row (adjustable)
const LAST_ROW_INITIAL_VISIBILITY = 0; // 0 = fully hidden, 1 = fully visible (adjustable)
const CARDS_PER_ROW_LG = 6; // Cards per row on large screens

const ProductGrid = memo(() => {
  const sectionRef = useRef<HTMLElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [footerHeight, setFooterHeight] = useState(0);
  const [showFooter, setShowFooter] = useState(false);
  const [lastRowTranslateY, setLastRowTranslateY] = useState(0);

  // Calculate number of rows dynamically
  const totalRows = useMemo(() => {
    return Math.ceil(products.length / CARDS_PER_ROW_LG);
  }, []);

  const secondToLastRowIndex = totalRows - 2; // Index of second-to-last row (0-based)
  const lastRowStartIndex = secondToLastRowIndex * CARDS_PER_ROW_LG; // Start index of last row

  // Split products into rows
  const productRows = useMemo(() => {
    const rows: typeof products[] = [];
    for (let i = 0; i < products.length; i += CARDS_PER_ROW_LG) {
      rows.push(products.slice(i, i + CARDS_PER_ROW_LG));
    }
    return rows;
  }, []);

  // Get footer height
  useEffect(() => {
    const footer = document.querySelector('footer');
    if (footer) {
      const updateFooterHeight = () => {
        setFooterHeight(footer.offsetHeight);
      };
      updateFooterHeight();
      window.addEventListener('resize', updateFooterHeight);
      return () => window.removeEventListener('resize', updateFooterHeight);
    }
  }, []);

  // Track scroll to detect when second-to-last row is scrolled
  const handleScroll = useCallback(() => {
    if (!sectionRef.current) return;

    const section = sectionRef.current;
    const sectionTop = section.offsetTop;
    const windowHeight = window.innerHeight;
    const scrollY = window.scrollY;

    // Find second-to-last row element
    const grid = section.querySelector('.grid');
    if (!grid) return;

    const allCards = Array.from(grid.children) as HTMLElement[];
    if (allCards.length === 0) return;

    // Find cards in second-to-last row
    const secondToLastRowCards = allCards.slice(
      secondToLastRowIndex * CARDS_PER_ROW_LG,
      (secondToLastRowIndex + 1) * CARDS_PER_ROW_LG
    );

    if (secondToLastRowCards.length === 0) return;

    const secondToLastRowTop = secondToLastRowCards[0].offsetTop;
    const secondToLastRowHeight = secondToLastRowCards[0].offsetHeight;

    // Calculate scroll position relative to second-to-last row
    // This is the distance from top of viewport to top of second-to-last row
    const rowTopInViewport = (sectionTop + secondToLastRowTop) - scrollY;
    const thresholdHeight = secondToLastRowHeight * FOOTER_APPEAR_THRESHOLD;
    
    // Calculate how much of second-to-last row is visible
    // When rowTopInViewport <= windowHeight - thresholdHeight, footer should appear
    const scrollPastThreshold = Math.max(0, (windowHeight - rowTopInViewport) - thresholdHeight);
    const rowScrollProgress = Math.max(0, Math.min(1, scrollPastThreshold / thresholdHeight));

    setScrollProgress(rowScrollProgress);

    // Show footer when threshold is reached
    if (rowScrollProgress >= 1) {
      setShowFooter(true);
      
      // Calculate how much to translate last row
      // Last row should move synchronously with scroll (1:1)
      // extraScroll is how much we've scrolled past the threshold
      const extraScroll = scrollPastThreshold - thresholdHeight;
      const initialOffset = footerHeight * (1 - LAST_ROW_INITIAL_VISIBILITY);
      // Move up synchronously with scroll (1:1 ratio) - each pixel scrolled = 1 pixel moved up
      setLastRowTranslateY(Math.max(0, initialOffset - extraScroll));
    } else {
      setShowFooter(false);
      // Keep last row hidden below footer before threshold
      setLastRowTranslateY(footerHeight * (1 - LAST_ROW_INITIAL_VISIBILITY));
    }
  }, [secondToLastRowIndex, footerHeight]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  // Control footer visibility
  useEffect(() => {
    const footer = document.querySelector('footer') as HTMLElement;
    if (footer) {
      footer.style.opacity = showFooter ? '1' : '0';
      footer.style.pointerEvents = showFooter ? 'auto' : 'none';
      footer.style.transition = 'none'; // Remove transition for instant appearance
    }
  }, [showFooter]);

  return (
    <section 
      ref={sectionRef}
      id="shop" 
      className="scroll-mt-20 relative" 
      style={{ 
        padding: '30px', 
        paddingBottom: '0', 
        backgroundColor: 'transparent',
        zIndex: 1
      }}
    >
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6" style={{ rowGap: '20px', columnGap: '20px' }}>
        {products.map((product, index) => {
          const isLastRow = index >= lastRowStartIndex;
          return (
            <div
              key={product.id}
              style={{
                transform: isLastRow ? `translateY(${lastRowTranslateY}px)` : 'none',
                transition: 'none',
                zIndex: isLastRow ? 1 : 1
              }}
            >
              <ProductCard
                id={product.id}
                image={product.image}
                hoverImage={product.hoverImage}
                title={product.title}
                brand={product.brand}
                price={product.price}
                size={product.size}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
});

ProductGrid.displayName = 'ProductGrid';

export default ProductGrid;
