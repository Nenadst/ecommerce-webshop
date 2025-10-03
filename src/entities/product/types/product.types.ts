import { Category } from '../../category/types/category.types';

export type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  hasDiscount?: boolean;
  discountPrice?: number;
  quantity: number;
  images?: string[];
  category: Category;
  file?: File | null;
};
