interface ProductCardProps {
  image: string;
  title: string;
  price: string;
  size?: string;
  brand?: string;
}

const ProductCard = ({ image, title, price, size, brand }: ProductCardProps) => {
  return (
    <div className="product-card aspect-[4/5]">
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover"
      />
      <div className="product-info">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wide">{title}</h3>
            {brand && <p className="text-xs text-muted-foreground mt-1">{brand}</p>}
          </div>
          <div className="text-right">
            <p className="font-bold">{price}</p>
            {size && <p className="text-xs text-muted-foreground mt-1">Size {size}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
