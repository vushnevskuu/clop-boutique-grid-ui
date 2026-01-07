import { useParams, useNavigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import { useState, useMemo, memo, useCallback, useRef } from "react";

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

const Product = memo(() => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);

  const product = useMemo(() => products.find((p) => p.id === Number(id)), [id]);
  
  const handleBackClick = useCallback(() => {
    navigate("/");
  }, [navigate]);
  
  const handleImageClick = useCallback((src: string) => {
    setSelectedImage(src);
  }, []);
  
  const handleCloseModal = useCallback(() => {
    setSelectedImage(null);
  }, []);

  const handleThumbnailClick = useCallback((index: number) => {
    const ref = imageRefs.current[index];
    if (ref) {
      ref.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  if (!product) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Product not found</h1>
            <button
              onClick={handleBackClick}
              className="btn-brutal"
            >
              Back to catalog
            </button>
          </div>
        </main>
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
            onClick={handleBackClick}
            className="mb-8 text-foreground hover:text-accent transition-colors"
            style={{ fontSize: '12px' }}
          >
            ← Back to catalog
          </button>

          <div className="flex gap-4 mb-20">
            {/* Thumbnails - left side */}
            <div className="flex flex-col gap-2" style={{ width: '80px', flexShrink: 0 }}>
              {productImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => handleThumbnailClick(index)}
                  className="w-full aspect-square overflow-hidden border-2 border-transparent hover:border-gray-400 transition-colors"
                  style={{ 
                    padding: 0,
                    background: 'transparent',
                    cursor: 'pointer'
                  }}
                >
                  <img
                    src={img.src}
                    alt={`${product.title} thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </button>
              ))}
            </div>

            {/* Images Gallery - takes remaining space */}
            <div className="flex-1">
              <div className="flex flex-col">
                {(() => {
                  const rows: JSX.Element[] = [];
                  let i = 0;
                  let imageIndex = 0; // Track actual image index for refs
                  
                  while (i < productImages.length) {
                    const currentImage = productImages[i];
                    
                    if (currentImage.layout === 'full') {
                      // Full width image
                      rows.push(
                        <div 
                          key={i} 
                          ref={(el) => { imageRefs.current[imageIndex] = el; }}
                          className="w-full"
                        >
                          <img
                            src={currentImage.src}
                            alt={`${product.title} ${imageIndex + 1}`}
                            className="w-full h-auto object-cover cursor-pointer"
                            loading="lazy"
                            decoding="async"
                            onClick={() => handleImageClick(currentImage.src)}
                          />
                        </div>
                      );
                      i++;
                      imageIndex++;
                    } else {
                      // Half width - create a row with 2 images
                      const nextImage = productImages[i + 1];
                      rows.push(
                        <div key={i} className="flex w-full">
                          <div 
                            className="w-1/2"
                            ref={(el) => { imageRefs.current[imageIndex] = el; }}
                          >
                            <img
                              src={currentImage.src}
                              alt={`${product.title} ${imageIndex + 1}`}
                              className="w-full h-auto object-cover cursor-pointer"
                              loading="lazy"
                              decoding="async"
                              onClick={() => handleImageClick(currentImage.src)}
                            />
                          </div>
                          {nextImage ? (
                            <div 
                              className="w-1/2"
                              ref={(el) => { imageRefs.current[imageIndex + 1] = el; }}
                            >
                              <img
                                src={nextImage.src}
                                alt={`${product.title} ${imageIndex + 2}`}
                                className="w-full h-auto object-cover cursor-pointer"
                                loading="lazy"
                                decoding="async"
                                onClick={() => handleImageClick(nextImage.src)}
                              />
                            </div>
                          ) : (
                            <div className="w-1/2"></div>
                          )}
                        </div>
                      );
                      i += 2; // Skip next image as it's already rendered
                      imageIndex += nextImage ? 2 : 1;
                    }
                  }
                  
                  return rows;
                })()}
              </div>
            </div>

            {/* Product Info Panel - 750px width */}
            <div className="flex-shrink-0" style={{ width: '750px', marginLeft: '20px' }}>
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
                  <button 
                    className="px-8 py-4 uppercase font-bold w-full transition-all duration-200"
                    style={{ backgroundColor: '#f3f3f3', color: '#000000' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#000000';
                      e.currentTarget.style.color = '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f3f3f3';
                      e.currentTarget.style.color = '#000000';
                    }}
                  >
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
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
});

Product.displayName = 'Product';

export default Product;

