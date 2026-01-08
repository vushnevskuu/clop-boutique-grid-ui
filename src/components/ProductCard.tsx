import { useState, memo, useCallback } from "react";
import { Link } from "react-router-dom";

interface ProductCardProps {
  id: number;
  image: string;
  hoverImage?: string;
  title: string;
  price: string;
  size?: string;
  brand?: string;
}

const ProductCard = memo(({ id, image, hoverImage, title, price, size, brand }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const displayImage = isHovered && hoverImage ? hoverImage : image;
  
  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);
  const handleButtonClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Handle message us action
  }, []);

  return (
    <Link 
      to={`/product/${id}`}
      className="flex flex-col"
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #f3f3f3'
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={displayImage}
          alt={title}
          className="w-full h-full object-cover transition-opacity duration-300"
          loading="lazy"
          decoding="async"
          fetchPriority="low"
        />
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
      <div className="p-4" style={{ backgroundColor: '#ffffff' }}>
        <div className="flex flex-col gap-1">
          <h3 
            className="font-normal uppercase tracking-wide" 
            style={{ 
              fontSize: '12px'
            }}
          >
            {title}
          </h3>
          {brand && <p className="text-muted-foreground lowercase" style={{ fontSize: '14px' }}>{brand}</p>}
          <div className="mt-2">
            <p className="font-bold" style={{ fontSize: '14px' }}>{price}</p>
          </div>
        </div>
      </div>
    </Link>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
