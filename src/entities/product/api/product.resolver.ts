import { prisma } from '@/shared/lib/prisma';

type CreateProductInput = {
  input: {
    name: string;
    description?: string;
    price: number;
    quantity: number;
    image?: string;
    categoryId: string;
  };
};

type UpdateProductInput = {
  name: string;
  description?: string;
  price: number;
  quantity: number;
  image?: string;
  categoryId: string;
};

type DeleteProductArgs = {
  id: string;
};

type ProductFilter = {
  categoryId?: string;
  name?: string;
  minPrice?: number;
  maxPrice?: number;
};

const productResolvers = {
  Query: {
    products: async (
      _: unknown,
      {
        page = 1,
        limit = 10,
        filter = {},
        sort = { field: 'createdAt', order: -1 },
      }: {
        page?: number;
        limit?: number;
        filter?: ProductFilter;
        sort?: { field: string; order: 1 | -1 };
      }
    ) => {
      const where: Record<string, unknown> = {};

      if (filter.name) {
        where.name = {
          contains: filter.name,
          mode: 'insensitive'
        };
      }

      if (filter.categoryId) {
        where.categoryId = filter.categoryId;
      }

      if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
        where.price = {};
        if (filter.minPrice !== undefined) where.price.gte = filter.minPrice;
        if (filter.maxPrice !== undefined) where.price.lte = filter.maxPrice;
      }

      const skip = (page - 1) * limit;
      const orderBy = {
        [sort.field]: sort.order === 1 ? 'asc' : 'desc'
      };

      const [items, total] = await Promise.all([
        prisma.product.findMany({
          where,
          orderBy,
          skip,
          take: limit,
          include: {
            category: true
          }
        }),
        prisma.product.count({ where }),
      ]);

      return {
        items,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    },

    product: async (_: unknown, { id }: { id: string }) => {
      return await prisma.product.findUnique({
        where: { id },
        include: {
          category: true
        }
      });
    },
  },

  Mutation: {
    createProduct: async (_: unknown, args: CreateProductInput) => {
      const product = await prisma.product.create({
        data: args.input,
        include: {
          category: true
        }
      });

      return product;
    },

    deleteProduct: async (_: unknown, { id }: DeleteProductArgs) => {
      try {
        await prisma.product.delete({
          where: { id }
        });
        return true;
      } catch (error) {
        console.error('Failed to delete product:', error);
        return false;
      }
    },

    updateProduct: async (_: unknown, { id, input }: { id: string; input: UpdateProductInput }) => {
      const updated = await prisma.product.update({
        where: { id },
        data: input,
        include: {
          category: true
        }
      });

      return updated;
    },
  },
};

export default productResolvers;