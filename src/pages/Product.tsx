import { useParams, useNavigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import { useState, useMemo, memo, useCallback, useRef, useEffect } from "react";
import { useProduct, useProducts } from "@/hooks/useProducts";

const Product = memo(() => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [logoWidth, setLogoWidth] = useState<number>(120);
  const imageRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const { product, loading: productLoading } = useProduct(id || "");
  const { products: allProducts } = useProducts();
  
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


  if (productLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p>Загрузка товара...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
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
    if (!product) return [];
    
    const images = [];
    // Основное изображение
    if (product.image) {
      images.push({ src: product.image });
    }
    // Дополнительные изображения из product_images
    if (product.images && product.images.length > 0) {
      product.images.forEach((img) => {
        images.push({ src: img.image_url });
      });
    }
    // Если нет дополнительных изображений, используем hover_image
    if (images.length === 1 && product.hover_image) {
      images.push({ src: product.hover_image });
    }
    return images;
  }, [product]);

  // Find similar products (same brand first, then other products)
  const similarProducts = useMemo(() => {
    if (!product || !allProducts) return [];
    
    const sameBrand = allProducts.filter((p) => p.id !== product.id && p.brand === product.brand);
    const otherProducts = allProducts.filter((p) => p.id !== product.id && p.brand !== product.brand);
    const combined = [...sameBrand, ...otherProducts];
    const result = [];
    while (result.length < 16 && combined.length > 0) {
      result.push(...combined);
    }
    return result.slice(0, 16);
  }, [product, allProducts]);

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
                    color: '#000000',
                    padding: '0',
                    margin: '0',
                    marginTop: '24px'
                  }}
                >
                  <table className="w-full" style={{ fontSize: '14px', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th className="text-left pb-2" style={{ fontWeight: 'normal', border: '1px solid #f3f3f3', padding: '8px' }}>Size</th>
                        <th className="text-left pb-2" style={{ fontWeight: 'normal', border: '1px solid #f3f3f3', padding: '8px' }}>Chest</th>
                        <th className="text-left pb-2" style={{ fontWeight: 'normal', border: '1px solid #f3f3f3', padding: '8px' }}>Waist</th>
                        <th className="text-left pb-2" style={{ fontWeight: 'normal', border: '1px solid #f3f3f3', padding: '8px' }}>Length</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.size_charts && product.size_charts.length > 0 ? (
                        product.size_charts.map((sizeRow, index) => (
                          <tr key={index}>
                            <td className="py-1" style={{ border: '1px solid #f3f3f3', padding: '8px' }}>{sizeRow.size_label}</td>
                            <td className="py-1" style={{ border: '1px solid #f3f3f3', padding: '8px' }}>{sizeRow.chest || '-'}</td>
                            <td className="py-1" style={{ border: '1px solid #f3f3f3', padding: '8px' }}>{sizeRow.waist || '-'}</td>
                            <td className="py-1" style={{ border: '1px solid #f3f3f3', padding: '8px' }}>{sizeRow.length || '-'}</td>
                          </tr>
                        ))
                      ) : (
                        // Fallback к статической таблице, если нет данных в БД
                        <>
                          <tr>
                            <td className="py-1" style={{ border: '1px solid #f3f3f3', padding: '8px' }}>XS</td>
                            <td className="py-1" style={{ border: '1px solid #f3f3f3', padding: '8px' }}>86-90</td>
                            <td className="py-1" style={{ border: '1px solid #f3f3f3', padding: '8px' }}>66-70</td>
                            <td className="py-1" style={{ border: '1px solid #f3f3f3', padding: '8px' }}>58</td>
                          </tr>
                          <tr>
                            <td className="py-1" style={{ border: '1px solid #f3f3f3', padding: '8px' }}>S</td>
                            <td className="py-1" style={{ border: '1px solid #f3f3f3', padding: '8px' }}>90-94</td>
                            <td className="py-1" style={{ border: '1px solid #f3f3f3', padding: '8px' }}>70-74</td>
                            <td className="py-1" style={{ border: '1px solid #f3f3f3', padding: '8px' }}>60</td>
                          </tr>
                          <tr>
                            <td className="py-1" style={{ border: '1px solid #f3f3f3', padding: '8px' }}>M</td>
                            <td className="py-1" style={{ border: '1px solid #f3f3f3', padding: '8px' }}>94-98</td>
                            <td className="py-1" style={{ border: '1px solid #f3f3f3', padding: '8px' }}>74-78</td>
                            <td className="py-1" style={{ border: '1px solid #f3f3f3', padding: '8px' }}>62</td>
                          </tr>
                          <tr>
                            <td className="py-1" style={{ border: '1px solid #f3f3f3', padding: '8px' }}>L</td>
                            <td className="py-1" style={{ border: '1px solid #f3f3f3', padding: '8px' }}>98-102</td>
                            <td className="py-1" style={{ border: '1px solid #f3f3f3', padding: '8px' }}>78-82</td>
                            <td className="py-1" style={{ border: '1px solid #f3f3f3', padding: '8px' }}>64</td>
                          </tr>
                          <tr>
                            <td className="py-1" style={{ border: '1px solid #f3f3f3', padding: '8px' }}>XL</td>
                            <td className="py-1" style={{ border: '1px solid #f3f3f3', padding: '8px' }}>102-106</td>
                            <td className="py-1" style={{ border: '1px solid #f3f3f3', padding: '8px' }}>82-86</td>
                            <td className="py-1" style={{ border: '1px solid #f3f3f3', padding: '8px' }}>66</td>
                          </tr>
                        </>
                      )}
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
