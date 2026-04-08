import { useState, memo, useCallback, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

interface ProductCardProps {
  id: number | string;
  image: string;
  hoverImage?: string;
  title: string;
  price?: string;
  size?: string;
  brand?: string;
  priority?: boolean; // Для первых изображений в сетке
}

const ProductCard = memo(({ id, image, hoverImage, title, price, size, brand, priority = false }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isInView, setIsInView] = useState(priority); // Если priority, сразу загружаем
  const imgRef = useRef<HTMLDivElement>(null);
  const displayImage = isHovered && hoverImage ? hoverImage : image;
  
  // Intersection Observer для lazy loading изображений
  useEffect(() => {
    if (priority || !imgRef.current) return; // Если priority, уже загружаем
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '50px' } // Начинаем загрузку за 50px до появления в viewport
    );
    
    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [priority]);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);
  const handleButtonClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Создаём ссылку на карточку товара
    const productUrl = `${window.location.origin}/?item=${encodeURIComponent(String(id))}`;
    const messageText = `Здравствуйте! Интересует этот товар: ${productUrl}`;
    const telegramUrl = `https://t.me/hithisisi?text=${encodeURIComponent(messageText)}`;
    
    // Открываем Telegram в новой вкладке
    window.open(telegramUrl, '_blank');
  }, [id]);

  return (
    <Link 
      to={`/?item=${encodeURIComponent(String(id))}`}
      className="flex flex-col"
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #f3f3f3'
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div ref={imgRef} className="relative aspect-[4/5] overflow-hidden">
        {isInView ? (
          <img
            src={displayImage}
            alt={title}
            className="w-full h-full object-cover transition-opacity duration-300"
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={priority ? "high" : "low"}
          />
        ) : (
          <div className="w-full h-full bg-gray-100 animate-pulse" />
        )}
        {/* Message Us button - appears on hover */}
        <button
          onClick={handleButtonClick}
          className="absolute top-4 left-4 px-4 py-2 font-normal transition-all duration-200 z-10"
          style={{
            opacity: isHovered ? 1 : 0,
            fontSize: '14px',
            backgroundColor: '#f3f3f3',
            color: '#000000'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#000000';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f3f3';
            e.currentTarget.style.color = '#000000';
          }}
        >
          message us
        </button>
      </div>
      <div className="p-3 md:p-4 bg-white">
        <div className="flex flex-col gap-1">
          <h3 
            className="font-normal uppercase tracking-wide text-[10px] md:text-xs break-words" 
          >
            {title.replace(/_/g, ' ')}
          </h3>
          {brand && <p className="text-muted-foreground lowercase text-xs md:text-sm break-words">{brand}</p>}
          <div className="mt-1 md:mt-2">
            <p className="font-bold text-xs md:text-sm break-words">{price}</p>
          </div>
        </div>
      </div>
    </Link>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
