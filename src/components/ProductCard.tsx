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
      </div>
      <div className="p-4 bg-background">
        <div className="flex flex-col gap-1">
          <h3 className="font-bold text-xs uppercase tracking-wide" style={{ fontSize: '12px' }}>{title}</h3>
          {brand && <p className="text-xs text-muted-foreground">{brand}</p>}
          <div className="mt-2">
            <p className="font-bold" style={{ fontSize: '12px' }}>{price}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
