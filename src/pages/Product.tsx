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

  // Prepare images array with layout info
  // Each image can have layout: 'full' (1 per row) or 'half' (2 per row)
  const productImages = useMemo(() => {
    const images = [
      { src: product.image, layout: 'full' as 'full' | 'half' },
      ...(product.hoverImage ? [{ src: product.hoverImage, layout: 'half' as 'full' | 'half' }] : [])
    ];
    return images;
  }, [product.image, product.hoverImage]);

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
        <div style={{ marginLeft: '30px', marginRight: '30px' }}>
          <button
            onClick={() => navigate("/")}
            className="mb-8 text-foreground hover:text-accent transition-colors"
            style={{ fontSize: '12px' }}
          >
            ← Back to catalog
          </button>

          <div className="flex gap-0 mb-20">
            {/* Images Gallery - takes remaining space */}
            <div className="flex-1">
              <div className="flex flex-col">
                {(() => {
                  const rows: JSX.Element[] = [];
                  let i = 0;
                  
                  while (i < productImages.length) {
                    const currentImage = productImages[i];
                    
                    if (currentImage.layout === 'full') {
                      // Full width image
                      rows.push(
                        <div key={i} className="w-full">
                          <img
                            src={currentImage.src}
                            alt={`${product.title} ${i + 1}`}
                            className="w-full h-auto object-cover cursor-pointer"
                            onClick={() => setSelectedImage(currentImage.src)}
                          />
                        </div>
                      );
                      i++;
                    } else {
                      // Half width - create a row with 2 images
                      const nextImage = productImages[i + 1];
                      rows.push(
                        <div key={i} className="flex w-full">
                          <div className="w-1/2">
                            <img
                              src={currentImage.src}
                              alt={`${product.title} ${i + 1}`}
                              className="w-full h-auto object-cover cursor-pointer"
                              onClick={() => setSelectedImage(currentImage.src)}
                            />
                          </div>
                          {nextImage ? (
                            <div className="w-1/2">
                              <img
                                src={nextImage.src}
                                alt={`${product.title} ${i + 2}`}
                                className="w-full h-auto object-cover cursor-pointer"
                                onClick={() => setSelectedImage(nextImage.src)}
                              />
                            </div>
                          ) : (
                            <div className="w-1/2"></div>
                          )}
                        </div>
                      );
                      i += 2; // Skip next image as it's already rendered
                    }
                  }
                  
                  return rows;
                })()}
              </div>
            </div>

            {/* Product Info Panel - 250px width */}
            <div className="flex-shrink-0" style={{ width: '250px', marginLeft: '20px' }}>
              <div className="space-y-6 sticky top-24">
                {product.brand && (
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">
                    {product.brand}
                  </p>
                )}
                <h1 className="text-2xl font-bold uppercase tracking-tighter">
                  {product.title}
                </h1>
                <p className="font-bold text-xl">{product.price}</p>
                
                {product.size && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Size</p>
                    <p className="text-sm">{product.size}</p>
                  </div>
                )}

                <div className="pt-8">
                  <button className="btn-brutal w-full">
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

