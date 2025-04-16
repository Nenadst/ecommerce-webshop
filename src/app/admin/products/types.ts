import { Category } from '../categories/types';

export type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  image?: string;
  category: Category;
};
