import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import ProductGrid from "@/components/ProductGrid";
import About from "@/components/About";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Marquee />
        <ProductGrid />
        <About />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
