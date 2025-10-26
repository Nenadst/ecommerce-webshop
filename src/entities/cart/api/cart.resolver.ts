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

const cartResolvers = {
  Query: {
    cart: async (_: unknown, __: unknown, context: { req: NextRequest }) => {
      const userId = getUserFromToken(context.req);
      if (!userId) {
        return { items: [], total: 0, itemCount: 0 };
      }

      const cartItems = await prisma.cartItem.findMany({
        where: { userId },
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        items: cartItems,
        total,
        itemCount,
      };
    },
  },

  Mutation: {
    addToCart: async (
      _: unknown,
      { productId, quantity = 1 }: { productId: string; quantity?: number },
      context: { req: NextRequest }
    ) => {
      const userId = getUserFromToken(context.req);
      if (!userId) {
        throw new Error('Authentication required');
      }

      const cartItem = await prisma.$transaction(async (tx) => {
        const product = await tx.product.findUnique({
          where: { id: productId },
        });

        if (!product) {
          throw new Error('Product not found');
        }

        // Check if product is out of stock
        if (product.quantity === 0) {
          throw new Error(
            'This product is currently out of stock and cannot be added to your cart'
          );
        }

        const existingItem = await tx.cartItem.findUnique({
          where: {
            userId_productId: {
              userId,
              productId,
            },
          },
        });

        const totalQuantity = existingItem ? existingItem.quantity + quantity : quantity;

        if (product.quantity < totalQuantity) {
          throw new Error(
            `Only ${product.quantity} unit(s) available in stock. You currently have ${existingItem?.quantity || 0} in your cart`
          );
        }

        const item = await tx.cartItem.upsert({
          where: {
            userId_productId: {
              userId,
              productId,
            },
          },
          update: {
            quantity: { increment: quantity },
          },
          create: {
            userId,
            productId,
            quantity,
          },
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        });

        return item;
      });

      return cartItem;
    },

    removeFromCart: async (
      _: unknown,
      { productId }: { productId: string },
      context: { req: NextRequest }
    ) => {
      const userId = getUserFromToken(context.req);
      if (!userId) {
        throw new Error('Authentication required');
      }

      const cartItem = await prisma.cartItem.findUnique({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
      });

      if (!cartItem) {
        return false;
      }

      await prisma.cartItem.delete({
        where: { id: cartItem.id },
      });

      return true;
    },

    updateCartItemQuantity: async (
      _: unknown,
      { productId, quantity }: { productId: string; quantity: number },
      context: { req: NextRequest }
    ) => {
      const userId = getUserFromToken(context.req);
      if (!userId) {
        throw new Error('Authentication required');
      }

      if (quantity <= 0) {
        throw new Error('Quantity must be greater than 0');
      }

      const updatedItem = await prisma.$transaction(async (tx) => {
        const product = await tx.product.findUnique({
          where: { id: productId },
        });

        if (!product) {
          throw new Error('Product not found');
        }

        // Check if requested quantity exceeds available stock
        if (product.quantity === 0) {
          throw new Error('This product is currently out of stock');
        }

        if (product.quantity < quantity) {
          throw new Error(`Only ${product.quantity} unit(s) available in stock`);
        }

        const cartItem = await tx.cartItem.findUnique({
          where: {
            userId_productId: {
              userId,
              productId,
            },
          },
        });

        if (!cartItem) {
          throw new Error('Cart item not found');
        }

        const item = await tx.cartItem.update({
          where: { id: cartItem.id },
          data: { quantity },
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        });

        return item;
      });

      return updatedItem;
    },

    clearCart: async (_: unknown, __: unknown, context: { req: NextRequest }) => {
      const userId = getUserFromToken(context.req);
      if (!userId) {
        throw new Error('Authentication required');
      }

      await prisma.cartItem.deleteMany({
        where: { userId },
      });

      return true;
    },
  },
};

export default cartResolvers;
