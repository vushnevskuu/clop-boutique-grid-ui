import { useState } from "react";

interface ProductCardProps {
  image: string;
  hoverImage?: string;
  title: string;
  price: string;
  size?: string;
  brand?: string;
}

const ProductCard = ({ image, hoverImage, title, price, size, brand }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const displayImage = isHovered && hoverImage ? hoverImage : image;

  return (
    <div 
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
          <div className="flex justify-between items-center mt-2">
            <p className="font-bold" style={{ fontSize: '12px' }}>{price}</p>
            {size && <p className="text-xs text-muted-foreground">Size {size}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
