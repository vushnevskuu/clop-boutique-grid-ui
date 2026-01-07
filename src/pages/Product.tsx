import { useParams, useNavigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState, useMemo } from "react";

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

const Product = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const product = products.find((p) => p.id === Number(id));

  if (!product) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Product not found</h1>
            <button
              onClick={() => navigate("/")}
              className="btn-brutal"
            >
              Back to catalog
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const displayImage = selectedImage || product.image;

  // Find similar products (same brand first, then other products)
  const similarProducts = useMemo(() => {
    const sameBrand = products.filter((p) => p.id !== product.id && p.brand === product.brand);
    if (sameBrand.length >= 4) {
      return sameBrand.slice(0, 6);
    }
    // If not enough same brand products, add other products
    const otherProducts = products.filter((p) => p.id !== product.id && p.brand !== product.brand);
    return [...sameBrand, ...otherProducts].slice(0, 6);
  }, [product.id, product.brand]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <button
            onClick={() => navigate("/")}
            className="mb-8 text-foreground hover:text-accent transition-colors"
            style={{ fontSize: '12px' }}
          >
            ← Back to catalog
          </button>

          <div className="grid md:grid-cols-2 gap-12 mb-20">
            {/* Images - увеличены в 2 раза */}
            <div className="space-y-4 md:col-span-1">
              <div className="overflow-hidden bg-gray-100" style={{ width: '100%', height: '800px' }}>
                <img
                  src={displayImage}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {product.hoverImage && (
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className="aspect-square overflow-hidden bg-gray-100 cursor-pointer border-2 border-transparent hover:border-foreground transition-colors"
                    onClick={() => setSelectedImage(product.image)}
                  >
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div
                    className="aspect-square overflow-hidden bg-gray-100 cursor-pointer border-2 border-transparent hover:border-foreground transition-colors"
                    onClick={() => setSelectedImage(product.hoverImage!)}
                  >
                    <img
                      src={product.hoverImage}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col justify-center">
              <div className="space-y-6">
                {product.brand && (
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">
                    {product.brand}
                  </p>
                )}
                <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter">
                  {product.title}
                </h1>
                <p className="font-bold text-2xl">{product.price}</p>
                
                {product.size && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Size</p>
                    <p className="text-sm">{product.size}</p>
                  </div>
                )}

                <div className="pt-8">
                  <button className="btn-brutal w-full md:w-auto">
                    Add to cart
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* You may also like section */}
          {similarProducts.length > 0 && (
            <section className="mt-20">
              <h2 className="text-2xl md:text-3xl font-bold uppercase mb-8" style={{ fontSize: '12px' }}>
                You may also like
              </h2>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {similarProducts.map((item) => (
                  <Link key={item.id} to={`/product/${item.id}`} className="block">
                    <div className="aspect-[4/5] overflow-hidden bg-gray-100">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Product;

