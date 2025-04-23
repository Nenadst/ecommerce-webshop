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

export interface AdminCategoryModal {
  show: boolean;
  message: string;
  onConfirm: () => void;
  categoryId?: string;
}

export interface AdminCategoriesUIProps {
  categories: Category[];
  loading: boolean;
  error: Error | undefined;
  modal: AdminCategoryModal;
  setModal: React.Dispatch<React.SetStateAction<AdminCategoryModal>>;
  handleAddCategory: (routerPush: (url: string) => void) => void;
  handleDeleteCategory: (id: string) => void;
  deleteLoading: boolean;
  routerPush: (url: string) => void;
}
