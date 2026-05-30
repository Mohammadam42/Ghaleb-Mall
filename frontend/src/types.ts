export interface Category {
  id: number;
  name_ar: string;
  name_en?: string | null;
  slug: string;
  description?: string | null;
  banner_image?: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface ProductImage {
  id: number;
  image_url: string;
  sort_order: number;
  alt_text?: string | null;
}

export interface Product {
  id: number;
  name_ar: string;
  name_en?: string | null;
  slug: string;
  category_id: number;
  category?: Category | null;
  price: number;
  discount_price?: number | null;
  discount_percentage: number;
  description_ar?: string | null;
  description_en?: string | null;
  main_image?: string | null;
  is_available: boolean;
  is_featured: boolean;
  is_offer: boolean;
  stock: number;
  images: ProductImage[];
  created_at: string;
  updated_at: string;
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  page_size: number;
}

export interface CustomPage {
  id: number;
  title_ar: string;
  title_en?: string | null;
  slug: string;
  description?: string | null;
  banner_image?: string | null;
  is_published: boolean;
  products?: Product[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  id: number;
  product_id?: number | null;
  product_name_snapshot: string;
  product_price_snapshot: number;
  quantity: number;
  subtotal: number;
  product_image_snapshot?: string | null;
}

export interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  total_amount: number;
  payment_method: string;
  delivery_note: string;
  status: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface LogoState {
  pending_logo_url?: string | null;
  confirmed_logo_url?: string | null;
  fallback_text: string;
}

export interface AdminStats {
  total_products: number;
  total_categories: number;
  discounted_products: number;
  featured_products: number;
  custom_pages: number;
  new_orders: number;
  total_orders: number;
  total_sales: number;
  processing_orders: number;
}

