import { memo } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";

const Index = memo(() => {
  return (
    <div className="min-h-screen" style={{ margin: 0, padding: 0 }}>
      <Header />
      <main style={{ margin: 0, padding: 0 }}>
        <Hero />
        <ProductGrid />
      </main>
      <Footer />
    </div>
  );
});

Index.displayName = 'Index';

export default Index;
