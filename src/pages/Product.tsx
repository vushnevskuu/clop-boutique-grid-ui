import { useParams, useNavigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import { useState, useMemo, memo, useCallback, useRef, useEffect } from "react";

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
  const [logoWidth, setLogoWidth] = useState<number>(120);
  const imageRefs = useRef<Map<number, HTMLDivElement>>(new Map());

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
    const ref = imageRefs.current.get(index);
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

  // Prepare images array
  const productImages = useMemo(() => {
    const images = [
      { src: product.image },
      ...(product.hoverImage ? [{ src: product.hoverImage }] : [])
    ];
    return images;
  }, [product.image, product.hoverImage]);

  // Find similar products (same brand first, then other products)
  const similarProducts = useMemo(() => {
    const sameBrand = products.filter((p) => p.id !== product.id && p.brand === product.brand);
    const otherProducts = products.filter((p) => p.id !== product.id && p.brand !== product.brand);
    const combined = [...sameBrand, ...otherProducts];
    const result = [];
    while (result.length < 16 && combined.length > 0) {
      result.push(...combined);
    }
    return result.slice(0, 16);
  }, [product.id, product.brand]);

  // Измеряем ширину логотипа
  useEffect(() => {
    const logo = document.querySelector('header img[alt="CLOP Logo"]') as HTMLImageElement;
    if (logo) {
      const updateLogoWidth = () => {
        const width = logo.offsetWidth || logo.clientWidth;
        if (width > 0) {
          setLogoWidth(width);
        }
      };
      
      updateLogoWidth();
      
      // Обновляем при изменении размера окна
      window.addEventListener('resize', updateLogoWidth);
      return () => window.removeEventListener('resize', updateLogoWidth);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pb-12" style={{ paddingTop: '60px' }}>
        <div style={{ marginLeft: '30px', marginRight: '30px' }}>
          <div className="flex gap-4 mb-20" style={{ marginTop: '60px' }}>
            {/* Thumbnails and Images Gallery - весь блок sticky как описание */}
            <div className="flex gap-4 flex-1 sticky top-24" style={{ alignSelf: 'flex-start' }}>
              {/* Product Info Panel - только миниатюры слева */}
              <div className="flex-shrink-0" style={{ width: `${logoWidth}px` }}>
                <div className="sticky top-24">
                  {/* Thumbnails */}
                  <div className="flex flex-col gap-4">
                    {productImages.map((img, index) => (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleThumbnailClick(index);
                        }}
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
                </div>
              </div>

              {/* Images Gallery - scrollable */}
              <div className="flex-1">
                <div className="flex flex-col">
                  {productImages.map((img, index) => (
                    <div 
                      key={index}
                      ref={(el) => {
                        if (el) {
                          imageRefs.current.set(index, el);
                        } else {
                          imageRefs.current.delete(index);
                        }
                      }}
                      className="w-full"
                    >
                      <img
                        src={img.src}
                        alt={`${product.title} ${index + 1}`}
                        className="w-full h-auto object-cover cursor-pointer"
                        loading="lazy"
                        decoding="async"
                        onClick={() => handleImageClick(img.src)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Product Info Panel - 750px width */}
            <div className="flex-shrink-0 sticky top-24" style={{ width: '750px', marginLeft: '20px', alignSelf: 'flex-start' }}>
              <div className="space-y-6">
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
                    padding: '10px',
                    margin: '10px'
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
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-10" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${logoWidth}px, 1fr))` }}>
                {similarProducts.map((item) => (
                  <Link key={item.id} to={`/product/${item.id}`} className="block" style={{ width: `${logoWidth}px` }}>
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
          className="fixed inset-0 z-[100] bg-black bg-opacity-90 flex items-center justify-center"
          onClick={handleCloseModal}
          style={{ cursor: 'pointer', pointerEvents: 'auto' }}
        >
          <img
            src={selectedImage}
            alt="Product view"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
            style={{ cursor: 'default', pointerEvents: 'auto' }}
          />
          <button
            onClick={handleCloseModal}
            className="absolute top-4 right-4 text-white text-4xl font-bold z-[101]"
            style={{ cursor: 'pointer', pointerEvents: 'auto' }}
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
