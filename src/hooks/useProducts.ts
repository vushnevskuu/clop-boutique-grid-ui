import { useState, useEffect, useCallback } from "react";
import { supabase, Product, ProductImage, ProductWithDetails } from "@/lib/supabase";

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      
      setProducts(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error("Error loading products:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return { products, loading, error, refetch: loadProducts };
};

export const useProduct = (id: string) => {
  const [product, setProduct] = useState<ProductWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProduct = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Загружаем товар
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (productError) throw productError;

      if (!productData) {
        setProduct(null);
        return;
      }

      // Загружаем изображения
      const { data: imagesData } = await supabase
        .from("product_images")
        .select("*")
        .eq("product_id", id)
        .order("image_order", { ascending: true });

      // Загружаем размерную таблицу
      const { data: sizeChartData } = await supabase
        .from("size_charts")
        .select("*")
        .eq("product_id", id)
        .order("size_label", { ascending: true });

      setProduct({
        ...productData,
        images: imagesData || [],
        size_charts: sizeChartData || [],
      });
    } catch (err: any) {
      setError(err.message);
      console.error("Error loading product:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id, loadProduct]);

  return { product, loading, error, refetch: loadProduct };
};
