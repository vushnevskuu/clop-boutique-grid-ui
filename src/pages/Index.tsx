import { memo, useRef, useCallback } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import ShoeCanvas from "@/components/ShoeCanvas";

const Index = memo(() => {
  const createShoeRef = useRef<(() => void) | null>(null);

  const handleShoeCreate = useCallback((createFn: () => void) => {
    createShoeRef.current = createFn;
  }, []);

  const handleFooterShoeCreate = useCallback((setCreateFn: (fn: () => void) => void) => {
    if (createShoeRef.current) {
      setCreateFn(createShoeRef.current);
    }
  }, []);

  return (
    <div className="min-h-screen" style={{ margin: 0, padding: 0 }}>
      <Header />
      <main style={{ margin: 0, padding: 0, marginBottom: '60px' }}>
        <Hero />
        <ProductGrid />
      </main>
      <Footer onShoeCreate={handleFooterShoeCreate} />
      <ShoeCanvas onShoeCreate={handleShoeCreate} />
    </div>
  );
});

Index.displayName = 'Index';

export default Index;
