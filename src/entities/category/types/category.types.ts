export type Category = {
  id: string;
  name: string;
};

export interface CategoryData {
  category: Category;
}

export interface UpdateCategoryData {
  updateCategory: Category;
}
