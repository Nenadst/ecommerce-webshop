import { prisma } from '@/shared/lib/prisma';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const getUserFromToken = (req: NextRequest): string | null => {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return null;

  const token = authHeader.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch {
    return null;
  }
};

type CreateProductInput = {
  input: {
    name: string;
    description?: string;
    price: number;
    hasDiscount?: boolean;
    discountPrice?: number;
    quantity: number;
    images?: string[];
    categoryId: string;
  };
};

type UpdateProductInput = {
  name: string;
  description?: string;
  price: number;
  hasDiscount?: boolean;
  discountPrice?: number;
  quantity: number;
  images?: string[];
  categoryId: string;
};

type DeleteProductArgs = {
  id: string;
};

type ProductFilter = {
  categoryId?: string;
  categoryIds?: string[];
  name?: string;
  minPrice?: number;
  maxPrice?: number;
};

const productResolvers = {
  Query: {
    userFavorites: async (_: unknown, __: unknown, context: { req: NextRequest }) => {
      const userId = getUserFromToken(context.req);
      if (!userId) {
        return [];
      }

      const favorites = await prisma.userFavorite.findMany({
        where: { userId },
        select: { productId: true },
      });

      return favorites.map((fav) => fav.productId);
    },

    favoriteProducts: async (_: unknown, __: unknown, context: { req: NextRequest }) => {
      const userId = getUserFromToken(context.req);
      if (!userId) {
        return [];
      }

      const favorites = await prisma.userFavorite.findMany({
        where: { userId },
        select: { productId: true },
      });

      const productIds = favorites.map((fav) => fav.productId);

      if (productIds.length === 0) {
        return [];
      }

      const products = await prisma.product.findMany({
        where: {
          id: { in: productIds },
        },
        include: {
          category: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return products;
    },

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
          mode: 'insensitive',
        };
      }

      if (filter.categoryIds && filter.categoryIds.length > 0) {
        where.categoryId = {
          in: filter.categoryIds,
        };
      } else if (filter.categoryId) {
        where.categoryId = filter.categoryId;
      }

      if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
        where.price = {};
        if (filter.minPrice !== undefined) where.price.gte = filter.minPrice;
        if (filter.maxPrice !== undefined) where.price.lte = filter.maxPrice;
      }

      const skip = (page - 1) * limit;
      const orderBy = {
        [sort.field]: sort.order === 1 ? 'asc' : 'desc',
      };

      const [items, total] = await Promise.all([
        prisma.product.findMany({
          where,
          orderBy,
          skip,
          take: limit,
          include: {
            category: true,
          },
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
          category: true,
        },
      });
    },

    productsByIds: async (_: unknown, { ids }: { ids: string[] }) => {
      if (!ids || ids.length === 0) {
        return [];
      }

      return await prisma.product.findMany({
        where: {
          id: { in: ids },
        },
        include: {
          category: true,
        },
      });
    },
  },

  Mutation: {
    createProduct: async (_: unknown, args: CreateProductInput) => {
      const product = await prisma.product.create({
        data: {
          ...args.input,
          hasDiscount: args.input.hasDiscount || false,
          images: args.input.images || [],
        },
        include: {
          category: true,
        },
      });

      return product;
    },

    deleteProduct: async (_: unknown, { id }: DeleteProductArgs) => {
      try {
        await prisma.product.delete({
          where: { id },
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
          category: true,
        },
      });

      return updated;
    },

    toggleFavorite: async (
      _: unknown,
      { productId }: { productId: string },
      context: { req: NextRequest }
    ) => {
      const userId = getUserFromToken(context.req);
      if (!userId) {
        throw new Error('Authentication required');
      }

      const existing = await prisma.userFavorite.findUnique({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
      });

      if (existing) {
        await prisma.userFavorite.delete({
          where: { id: existing.id },
        });
        return false;
      } else {
        await prisma.userFavorite.create({
          data: {
            userId,
            productId,
          },
        });
        return true;
      }
    },
  },
};

export default productResolvers;
