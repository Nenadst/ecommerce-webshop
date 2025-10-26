import { prisma } from '@/shared/lib/prisma';
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
    categories: async () => {
      return await prisma.category.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });
    },

    category: async (_: unknown, { id }: { id: string }) => {
      return await prisma.category.findUnique({
        where: { id },
      });
    },
  },

  Mutation: {
    createCategory: async (_: unknown, args: CreateCategoryArgs) => {
      try {
        const existingCategory = await prisma.category.findUnique({
          where: { name: args.input.name },
        });

        if (existingCategory) {
          throw new ApolloError('Category name already exists', 'DUPLICATE_CATEGORY');
        }

        const newCategory = await prisma.category.create({
          data: args.input,
        });

        return newCategory;
      } catch (error) {
        console.error('Error creating category:', error);

        if (error instanceof ApolloError) {
          throw error;
        }

        throw new ApolloError('Error creating category');
      }
    },

    updateCategory: async (_: unknown, { id, input }: { id: string; input: { name: string } }) => {
      try {
        const existingCategory = await prisma.category.findUnique({
          where: { name: input.name },
        });

        if (existingCategory && existingCategory.id !== id) {
          throw new ApolloError('Category name already exists', 'DUPLICATE_CATEGORY');
        }

        const updated = await prisma.category.update({
          where: { id },
          data: input,
        });

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
        const productUsingCategory = await prisma.product.findFirst({
          where: { categoryId: id },
        });

        if (productUsingCategory) {
          throw new ApolloError(
            'Cannot delete this category because it is being used by one or more products. Please reassign or delete those products first.',
            'CATEGORY_IN_USE'
          );
        }

        await prisma.category.delete({
          where: { id },
        });

        return true;
      } catch (error) {
        console.error('Failed to delete category:', error);

        if (error instanceof ApolloError) {
          throw error;
        }

        throw new ApolloError('Failed to delete category');
      }
    },
  },
};

export default categoryResolvers;
