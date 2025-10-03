export type EditProduct = {
  name: string;
  description: string;
  price: string;
  hasDiscount: boolean;
  discountPrice: string;
  quantity: string;
  existingImages: string[];
  files: File[];
  imagePreviews: string[];
  categoryId: string;
};
