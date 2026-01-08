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
  const thumbnailToRefMap = useRef<Map<number, number>>(new Map());

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

  const handleThumbnailClick = useCallback((thumbnailIndex: number) => {
    const refIndex = thumbnailToRefMap.current.get(thumbnailIndex);
    if (refIndex !== undefined) {
      const ref = imageRefs.current[refIndex];
      if (ref) {
        // Вычисляем позицию элемента относительно документа
        const elementTop = ref.getBoundingClientRect().top + window.pageYOffset;
        const elementHeight = ref.getBoundingClientRect().height;
        const windowHeight = window.innerHeight;
        const offset = (windowHeight - elementHeight) / 2;
        
        window.scrollTo({
          top: elementTop - offset,
          behavior: 'smooth'
        });
      }
    }
  }, []);

  if (!product) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="font-bold mb-4" style={{ fontSize: '32px' }}>Product not found</h1>
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
    const otherProducts = products.filter((p) => p.id !== product.id && p.brand !== product.brand);
    // Combine and repeat if needed to get 16 products
    const combined = [...sameBrand, ...otherProducts];
    // If we have less than 16, repeat the array
    const result = [];
    while (result.length < 16 && combined.length > 0) {
      result.push(...combined);
    }
    return result.slice(0, 16);
  }, [product.id, product.brand]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-12">
        <div style={{ marginLeft: '30px', marginRight: '30px' }}>
          <div className="flex gap-4 mb-20">
            {/* Thumbnails and Images Gallery - sticky container */}
            <div className="flex gap-4 flex-1 sticky top-24" style={{ alignSelf: 'flex-start' }}>
              {/* Thumbnails - left side */}
              <div className="flex flex-col gap-6" style={{ width: '240px', flexShrink: 0 }}>
                {productImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => handleThumbnailClick(index)}
                    className="w-full aspect-square overflow-hidden"
                    style={{ 
                      padding: 0,
                      background: 'transparent',
                      cursor: 'pointer',
                      border: 'none',
                      outline: 'none'
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
                  // Очищаем маппинг перед созданием нового
                  thumbnailToRefMap.current.clear();
                  const rows: JSX.Element[] = [];
                  let thumbnailIndex = 0; // Индекс в массиве thumbnails (productImages)
                  let refIndex = 0; // Индекс в массиве refs
                  
                  while (thumbnailIndex < productImages.length) {
                    const currentImage = productImages[thumbnailIndex];
                    
                    if (currentImage.layout === 'full') {
                      // Full width image - один thumbnail соответствует одному ref
                      thumbnailToRefMap.current.set(thumbnailIndex, refIndex);
                      rows.push(
                        <div 
                          key={thumbnailIndex} 
                          ref={(el) => { imageRefs.current[refIndex] = el; }}
                          className="w-full"
                        >
                          <img
                            src={currentImage.src}
                            alt={`${product.title} ${refIndex + 1}`}
                            className="w-full h-auto object-cover cursor-pointer"
                            loading="lazy"
                            decoding="async"
                            onClick={() => handleImageClick(currentImage.src)}
                          />
                        </div>
                      );
                      thumbnailIndex++;
                      refIndex++;
                    } else {
                      // Half width - создаем строку с 2 изображениями
                      const nextImage = productImages[thumbnailIndex + 1];
                      
                      // Маппинг для первого изображения в паре
                      thumbnailToRefMap.current.set(thumbnailIndex, refIndex);
                      
                      rows.push(
                        <div key={thumbnailIndex} className="flex w-full">
                          <div 
                            className="w-1/2"
                            ref={(el) => { imageRefs.current[refIndex] = el; }}
                          >
                            <img
                              src={currentImage.src}
                              alt={`${product.title} ${refIndex + 1}`}
                              className="w-full h-auto object-cover cursor-pointer"
                              loading="lazy"
                              decoding="async"
                              onClick={() => handleImageClick(currentImage.src)}
                            />
                          </div>
                          {nextImage ? (
                            <div 
                              className="w-1/2"
                              ref={(el) => { imageRefs.current[refIndex + 1] = el; }}
                            >
                              <img
                                src={nextImage.src}
                                alt={`${product.title} ${refIndex + 2}`}
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
                      
                      // Если есть следующее изображение, создаем маппинг и для него
                      if (nextImage) {
                        thumbnailToRefMap.current.set(thumbnailIndex + 1, refIndex + 1);
                        thumbnailIndex += 2; // Пропускаем оба изображения
                        refIndex += 2;
                      } else {
                        // Если следующего изображения нет, обрабатываем только текущее
                        thumbnailIndex++;
                        refIndex++;
                      }
                    }
                  }
                  
                  return rows;
                })()}
              </div>
              </div>
            </div>

            {/* Product Info Panel - 750px width */}
            <div className="flex-shrink-0" style={{ width: '750px', marginLeft: '20px' }}>
              <div className="space-y-6 sticky top-24">
                <h1 className="font-bold uppercase tracking-tighter" style={{ fontSize: '32px' }}>
                  {product.title}
                </h1>
                {product.brand && (
                  <p className="text-muted-foreground lowercase tracking-widest" style={{ fontSize: '14px' }}>
                    {product.brand}
                  </p>
                )}
                
                {/* Size Table */}
                <div 
                  style={{ 
                    backgroundColor: '#f3f3f3',
                    color: '#000000',
                    padding: '60px'
                  }}
                >
                  <table className="w-full" style={{ fontSize: '14px' }}>
                    <thead>
                      <tr>
                        <th className="text-left pb-2" style={{ fontWeight: 'normal' }}>Size</th>
                        <th className="text-left pb-2" style={{ fontWeight: 'normal' }}>Chest</th>
                        <th className="text-left pb-2" style={{ fontWeight: 'normal' }}>Waist</th>
                        <th className="text-left pb-2" style={{ fontWeight: 'normal' }}>Length</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="py-1">XS</td>
                        <td className="py-1">86-90</td>
                        <td className="py-1">66-70</td>
                        <td className="py-1">58</td>
                      </tr>
                      <tr>
                        <td className="py-1">S</td>
                        <td className="py-1">90-94</td>
                        <td className="py-1">70-74</td>
                        <td className="py-1">60</td>
                      </tr>
                      <tr>
                        <td className="py-1">M</td>
                        <td className="py-1">94-98</td>
                        <td className="py-1">74-78</td>
                        <td className="py-1">62</td>
                      </tr>
                      <tr>
                        <td className="py-1">L</td>
                        <td className="py-1">98-102</td>
                        <td className="py-1">78-82</td>
                        <td className="py-1">64</td>
                      </tr>
                      <tr>
                        <td className="py-1">XL</td>
                        <td className="py-1">102-106</td>
                        <td className="py-1">82-86</td>
                        <td className="py-1">66</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <p className="font-bold" style={{ fontSize: '14px' }}>{product.price}</p>

                <div className="pt-8">
                  <button 
                    className="px-8 py-4 w-full transition-all duration-200"
                    style={{ 
                      backgroundColor: '#000000', 
                      color: '#ffffff',
                      fontSize: '14px',
                      fontWeight: 'normal'
                    }}
                  >
                    message us
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* You may also like section */}
          {similarProducts.length > 0 && (
            <section className="mt-20">
              <h2 className="font-bold uppercase mb-8" style={{ fontSize: '14px' }}>
                You may also like
              </h2>
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-10">
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

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
          onClick={handleCloseModal}
          style={{ cursor: 'pointer' }}
        >
          <img
            src={selectedImage}
            alt="Product view"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
            style={{ cursor: 'default' }}
          />
          <button
            onClick={handleCloseModal}
            className="absolute top-4 right-4 text-white text-4xl font-bold"
            style={{ cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
});

Product.displayName = 'Product';

export default Product;

