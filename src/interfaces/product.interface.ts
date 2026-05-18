export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
}

export interface ProductImage {
  id: number;
  mimeType: string;
  fileName: string;
  isMain: boolean;
  productId: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  inStock: number;
  price: number;
  slug: string;
  tags: string[];
  material?: string;
  dimensions?: string;
  weight?: number;
  color?: string;
  categoryId: string;
  category?: Category;
  images?: ProductImage[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}
