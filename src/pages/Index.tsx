import { memo, useRef, useCallback, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMainScroll } from "@/contexts/MainScrollContext";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import ShoeCanvas from "@/components/ShoeCanvas";

const Index = memo(() => {
  const createShoeRef = useRef<(() => void) | null>(null);
  const { scrollContainerRef, useScrollContainer } = useMainScroll();
  const location = useLocation();
  const isMobile = useIsMobile();

  const handleShoeCreate = useCallback((createFn: () => void) => {
    createShoeRef.current = createFn;
  }, []);

  const handleFooterShoeCreate = useCallback((setCreateFn: (fn: () => void) => void) => {
    if (createShoeRef.current) {
      setCreateFn(createShoeRef.current);
    }
  }, []);

  // Обработка якоря #shop при переходе с других страниц
  useEffect(() => {
    if (location.hash === '#shop') {
      setTimeout(() => {
        const shopEl = document.getElementById('shop');
        const container = scrollContainerRef?.current;
        if (shopEl && useScrollContainer && container) {
          const top = shopEl.getBoundingClientRect().top + container.scrollTop;
          container.scrollTo({ top: top - 80, behavior: 'smooth' });
        } else if (shopEl) {
          shopEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [location.hash, useScrollContainer]);

  const content = (
    <>
      <main className="m-0 p-0 mb-12 md:mb-[60px]">
        <Hero />
        <ProductGrid />
      </main>
      {!isMobile && <ShoeCanvas onShoeCreate={handleShoeCreate} />}
      {!isMobile && <Footer onShoeCreate={handleFooterShoeCreate} />}
    </>
  );

  return (
    <div className="min-h-screen" style={{ margin: 0, padding: 0 }}>
      <Header />
      {useScrollContainer ? (
        <div
          ref={scrollContainerRef}
          className="overflow-y-auto overflow-x-hidden w-full"
          style={{
            height: '100vh',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {content}
        </div>
      ) : (
        content
      )}
    </div>
  );
});

Index.displayName = 'Index';

export default Index;
