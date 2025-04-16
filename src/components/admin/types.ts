export type EditProduct = {
  name: string;
  description: string;
  price: string;
  quantity: string;
  image: string;
  categoryId: string;
  file: File | null;
};
