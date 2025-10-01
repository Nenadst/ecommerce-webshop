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

      // Check if product exists and has enough stock
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new Error('Product not found');
      }

      if (product.quantity < quantity) {
        throw new Error('Not enough stock available');
      }

      // Check if item already in cart
      const existingItem = await prisma.cartItem.findUnique({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
      });

      let cartItem;

      if (existingItem) {
        // Update quantity
        cartItem = await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + quantity },
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        });
      } else {
        // Create new cart item
        cartItem = await prisma.cartItem.create({
          data: {
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
      }

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

      // Check product stock
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new Error('Product not found');
      }

      if (product.quantity < quantity) {
        throw new Error('Not enough stock available');
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
        throw new Error('Cart item not found');
      }

      const updatedItem = await prisma.cartItem.update({
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
