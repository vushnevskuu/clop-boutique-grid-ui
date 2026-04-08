/** Товар витрины (общий тип для manifest и Medusa). */
export interface Product {
  id: string;
  title: string;
  description: string;
  sizes: Array<{
    size?: string;
    chest?: string;
    waist?: string;
    length?: string;
    [key: string]: string | undefined;
  }>;
  images: string[];
  image?: string;
  hoverImage?: string;
  brand?: string;
  price?: string;
  size?: string;
}
