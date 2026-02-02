import { memo, useRef, useCallback, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import ShoeCanvas from "@/components/ShoeCanvas";

const Index = memo(() => {
  const createShoeRef = useRef<(() => void) | null>(null);
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
      // Небольшая задержка для загрузки контента
      setTimeout(() => {
        const shopElement = document.getElementById('shop');
        if (shopElement) {
          shopElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [location.hash]);

  return (
    <div className="min-h-screen" style={{ margin: 0, padding: 0 }}>
      <Header />
      <main className="m-0 p-0 mb-12 md:mb-[60px]">
        <Hero />
        <ProductGrid />
      </main>
      {!isMobile && <ShoeCanvas onShoeCreate={handleShoeCreate} />}
      {!isMobile && <Footer onShoeCreate={handleFooterShoeCreate} />}
    </div>
  );
});

Index.displayName = 'Index';

export default Index;
