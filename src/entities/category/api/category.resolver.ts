import { Category } from '@/entities/category/model/category.model';
import { Product } from '@/entities/product/model/product.model';
import { ApolloError } from 'apollo-server-errors';

type CreateCategoryArgs = {
  input: {
    name: string;
  };
};

type DeleteCategoryArgs = {
  id: string;
};

const categoryResolvers = {
  Query: {
    categories: async () => Category.find(),

    category: async (_: unknown, { id }: { id: string }) => {
      return await Category.findById(id);
    },
  },

  Mutation: {
    createCategory: async (_: unknown, args: CreateCategoryArgs) => {
      return Category.create(args.input);
    },

    updateCategory: async (_: unknown, { id, input }: { id: string; input: { name: string } }) => {
      try {
        const existingCategory = await Category.findOne({ name: input.name });
        if (existingCategory && existingCategory._id.toString() !== id) {
          throw new ApolloError('Category name already exists', 'DUPLICATE_CATEGORY');
        }

        const updated = await Category.findByIdAndUpdate(id, input, { new: true });
        return updated;
      } catch (error) {
        if (error instanceof ApolloError) {
          throw error;
        }
        throw new ApolloError('Error updating category');
      }
    },

    deleteCategory: async (_: unknown, { id }: DeleteCategoryArgs) => {
      try {
        const productUsingCategory = await Product.findOne({ category: id });

        if (productUsingCategory) {
          console.warn(`Cannot delete category ${id} - in use by a product`);
          return false;
        }

        const result = await Category.findByIdAndDelete(id);
        return !!result;
      } catch (error) {
        console.error('Failed to delete category:', error);
        return false;
      }
    },
  },
};

export default categoryResolvers;
