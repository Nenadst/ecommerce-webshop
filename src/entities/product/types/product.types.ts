import { Category } from '../../category/types/category.types';

export type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  image?: string;
  category: Category;
  file?: File | null;
};
