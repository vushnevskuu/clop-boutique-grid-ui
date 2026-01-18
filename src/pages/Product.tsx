import { useParams, useNavigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import { useState, useMemo, memo, useCallback, useRef, useEffect } from "react";
import { useProducts } from "@/hooks/useProducts";

const Product = memo(() => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, loading: productsLoading } = useProducts();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [logoWidth, setLogoWidth] = useState<number>(120);
  const imageRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const product = useMemo(() => {
    if (!id) return undefined;
    // Декодируем ID из URL (на случай пробелов и спецсимволов)
    const decodedId = decodeURIComponent(id);
    // ID может быть как строкой (из cloth), так и числом (старые товары)
    return products.find((p) => 
      p.id === decodedId || 
      p.id === String(decodedId) || 
      String(p.id) === decodedId ||
      String(p.id) === id
    );
  }, [id, products]);
  
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

  // Prepare images array - используем product.images если есть, иначе product.image/hoverImage
  const productImages = useMemo(() => {
    if (!product) return [] as { src: string }[];
    if (product.images && product.images.length > 0) {
      return product.images.map((src) => ({ src }));
    }
    const images: { src: string }[] = [];
    if (product.image) images.push({ src: product.image });
    if (product.hoverImage) images.push({ src: product.hoverImage });
    return images;
  }, [product]);

  // Find similar products (same brand first, then other products)
  const similarProducts = useMemo(() => {
    if (!product || !products || products.length === 0) return [];
    const productId = String(product.id);
    const productBrand = product.brand || "";
    const sameBrand = products.filter(
      (p) => String(p.id) !== productId && (p.brand || "") === productBrand
    );
    const otherProducts = products.filter(
      (p) => String(p.id) !== productId && (p.brand || "") !== productBrand
    );
    return [...sameBrand, ...otherProducts].slice(0, 16);
  }, [product?.id, product?.brand, products]);

  // Измеряем ширину логотипа
  useEffect(() => {
    const logo = document.querySelector(
      'header img[alt="CLOP Logo"]'
    ) as HTMLImageElement;
    if (!logo) return;

    const updateLogoWidth = () => {
      const width = logo.offsetWidth || logo.clientWidth;
      if (width > 0) setLogoWidth(width);
    };

    updateLogoWidth();
    window.addEventListener("resize", updateLogoWidth);
    return () => window.removeEventListener("resize", updateLogoWidth);
  }, []);

  // Условные return — строго ПОСЛЕ всех хуков
  if (productsLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="flex items-center justify-center min-h-screen px-4">
          <div className="text-center">Loading product...</div>
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="flex items-center justify-center min-h-screen px-4">
          <div className="text-center">
            <h1
              className="font-bold mb-4 break-words"
              style={{ fontSize: "clamp(20px, 5vw, 32px)" }}
            >
              Product not found
            </h1>
            <button
              onClick={handleBackClick}
              className="btn-brutal px-4 py-2 text-sm md:text-base"
            >
              Back to catalog
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pb-12 pt-16 md:pt-[60px]">
        <div className="px-4 md:px-8 lg:px-[30px]">
          <div className="flex flex-col md:flex-row gap-4 mb-12 md:mb-20 mt-5 md:mt-[60px]">
            {/* Thumbnails and Images Gallery - весь блок sticky как описание */}
            <div className="flex flex-col md:flex-row gap-4 flex-1 md:sticky md:top-24" style={{ alignSelf: 'flex-start' }}>
              {/* Product Info Panel - только миниатюры слева - скрыто на мобильных */}
              <div className="hidden md:block flex-shrink-0" style={{ width: `${logoWidth}px` }}>
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
              <div className="flex-1 w-full">
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
                        src={img.src || ''}
                        alt={`${product?.title || 'Product'} ${index + 1}`}
                        className="w-full h-auto object-cover cursor-pointer"
                        loading="lazy"
                        decoding="async"
                        onClick={() => handleImageClick(img.src || '')}
                        onError={(e) => {
                          console.error(`Failed to load image: ${img.src}`);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Product Info Panel - адаптивная ширина */}
            <div className="flex-shrink-0 w-full md:w-[300px] md:sticky md:top-24 md:ml-5 self-start">
              <div className="space-y-4 md:space-y-6">
                <h1 className="font-bold uppercase tracking-tighter break-words text-[20px] md:text-[32px] leading-tight">
                  {product.title}
                </h1>
                {product.brand && (
                  <p className="text-muted-foreground lowercase tracking-widest break-words text-xs md:text-sm">
                    {product.brand}
                  </p>
                )}
                
                {/* Description */}
                {product.description && (
                  <div className="text-black p-0 m-0 mt-4 md:mt-6">
                    <p className="text-xs md:text-sm break-words whitespace-pre-line">
                      {product.description}
                    </p>
                  </div>
                )}
                
                {/* Size Table */}
                {product.sizes && product.sizes.length > 0 && product.sizes[0] && (
                  <div className="text-black p-0 m-0 mt-4 md:mt-6">
                    <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
                      <table className="w-full min-w-[280px] text-[11px] md:text-sm" style={{ borderCollapse: 'collapse' }}>
                        <thead>
                          <tr>
                            {Object.keys(product.sizes[0] || {}).map((key) => (
                              <th key={key} className="text-left pb-2 whitespace-nowrap font-normal border border-[#f3f3f3] p-1.5 md:p-2 capitalize">
                                {key}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {product.sizes.map((sizeRow, index) => (
                            <tr key={index}>
                              {Object.entries(sizeRow || {}).map(([key, value]) => (
                                <td key={key} className="py-1 whitespace-nowrap border border-[#f3f3f3] p-1.5 md:p-2">
                                  {value || '-'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                {product.price && (
                  <p className="font-bold break-words text-xs md:text-sm">{product.price}</p>
                )}

                <div className="pt-4 md:pt-8">
                  <button 
                    className="px-4 md:px-8 py-3 md:py-4 w-full transition-all duration-200 bg-black text-white text-xs md:text-sm font-normal"
                  >
                    message us
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* You may also like section */}
          {similarProducts.length > 0 && (
            <section className="mt-12 md:mt-20">
              <h2 className="font-bold uppercase mb-4 md:mb-8 break-words" style={{ fontSize: 'clamp(12px, 3vw, 14px)' }}>
                You may also like
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-10 gap-4 md:gap-6">
                {similarProducts.map((item) => (
                  <Link key={item.id} to={`/product/${encodeURIComponent(String(item.id))}`} className="block w-full">
                    <div className="aspect-[4/5] overflow-hidden bg-gray-100">
                      <img
                        src={item.image || item.images?.[0] || ''}
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
          className="fixed inset-0 z-[100] bg-black bg-opacity-90 flex items-center justify-center p-4"
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
            className="absolute top-2 right-2 md:top-4 md:right-4 text-white text-3xl md:text-4xl font-bold z-[101] p-2"
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
