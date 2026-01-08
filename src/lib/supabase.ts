import { createClient } from '@supabase/supabase-js';

// Получаем переменные окружения
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env file');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Типы для TypeScript
export interface Product {
  id: string;
  title: string;
  brand?: string;
  price: string;
  size?: string;
  image: string;
  hover_image?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  image_order: number;
  created_at?: string;
}

export interface SizeChart {
  id: string;
  product_id: string;
  size_label: string;
  chest?: string;
  waist?: string;
  length?: string;
  created_at?: string;
}

export interface ProductWithDetails extends Product {
  images?: ProductImage[];
  size_charts?: SizeChart[];
}
