import { useState } from "react";
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

const ProductCard = ({ id, image, hoverImage, title, price, size, brand }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const displayImage = isHovered && hoverImage ? hoverImage : image;

  return (
    <Link 
      to={`/product/${id}`}
      className="flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={displayImage}
          alt={title}
          className="w-full h-full object-cover transition-opacity duration-300"
        />
        {/* Message Us button - appears on hover */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // Handle message us action
          }}
          className="absolute top-4 left-4 bg-background text-foreground px-4 py-2 uppercase tracking-wide font-bold text-xs transition-opacity duration-300 z-10"
          style={{
            opacity: isHovered ? 1 : 0,
            fontSize: '12px'
          }}
        >
          message us
        </button>
      </div>
      <div className="p-4 bg-background">
        <div className="flex flex-col gap-1">
          <h3 
            className="font-bold uppercase tracking-wide transition-colors duration-200" 
            style={{ 
              fontSize: '14px',
              color: isHovered ? 'hsl(var(--accent))' : 'inherit'
            }}
          >
            {title}
          </h3>
          {brand && <p className="text-muted-foreground" style={{ fontSize: '14px' }}>{brand}</p>}
          <div className="mt-2">
            <p className="font-bold" style={{ fontSize: '14px' }}>{price}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
