import ProductCard from "./ProductCard";

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
    title: "Leather jacket",
    brand: "Vintage",
    price: "$125",
    size: "M",
  },
  {
    id: 2,
    image: product2,
    title: "Classic jeans",
    brand: "Levi's",
    price: "$42",
    size: "32",
  },
  {
    id: 3,
    image: product3,
    title: "Wool sweater",
    brand: "Handmade",
    price: "$58",
    size: "L",
  },
  {
    id: 4,
    image: product4,
    title: "Leather sneakers",
    brand: "Vintage",
    price: "$39",
    size: "42",
  },
  {
    id: 5,
    image: product5,
    title: "Silk scarf",
    brand: "Italian",
    price: "$21",
  },
  {
    id: 6,
    image: product6,
    title: "Corduroy pants",
    brand: "Vintage",
    price: "$45",
    size: "M",
  },
  {
    id: 7,
    image: product7,
    title: "Oversized blazer",
    brand: "90s",
    price: "$72",
    size: "L",
  },
  {
    id: 8,
    image: product8,
    title: "Basic t-shirt",
    brand: "Premium Cotton",
    price: "$18",
    size: "M",
  },
];

const ProductGrid = () => {
  return (
    <section id="shop" className="scroll-mt-20 bg-background">
      <div className="px-6 py-12 border-b border-border">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase">
          Catalog
        </h2>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            image={product.image}
            title={product.title}
            brand={product.brand}
            price={product.price}
            size={product.size}
          />
        ))}
      </div>
    </section>
  );
};

export default ProductGrid;
