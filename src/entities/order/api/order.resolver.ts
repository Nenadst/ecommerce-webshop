import { GraphQLError } from 'graphql';
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

interface OrderInput {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  paymentMethod: string;
}

const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `ORD-${timestamp}-${random}`;
};

const recalculateOrderTotals = async (orderId: string) => {
  const orderItems = await prisma.orderItem.findMany({
    where: { orderId },
  });

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.0;
  const shipping = 0.0;
  const total = subtotal + tax + shipping;

  await prisma.order.update({
    where: { id: orderId },
    data: {
      subtotal,
      tax,
      shipping,
      total,
    },
  });
};

const orderResolvers = {
  Query: {
    orders: async (_: unknown, __: unknown, context: { req: NextRequest }) => {
      const userId = getUserFromToken(context.req);
      if (!userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const orders = await prisma.order.findMany({
        where: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: true,
                },
              },
            },
          },
          user: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return orders.map((order) => ({
        ...order,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        items: order.items.map((item) => ({
          ...item,
          createdAt: item.createdAt.toISOString(),
        })),
      }));
    },

    order: async (_: unknown, { id }: { id: string }, context: { req: NextRequest }) => {
      const userId = getUserFromToken(context.req);
      if (!userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const order = await prisma.order.findFirst({
        where: {
          id,
          userId,
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: true,
                },
              },
            },
          },
          user: true,
        },
      });

      if (!order) {
        throw new GraphQLError('Order not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      return {
        ...order,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        items: order.items.map((item) => ({
          ...item,
          createdAt: item.createdAt.toISOString(),
        })),
      };
    },

    allOrders: async (_: unknown, __: unknown, context: { req: NextRequest }) => {
      const userId = getUserFromToken(context.req);
      if (!userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Check if user is admin
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (user?.role !== 'ADMIN') {
        throw new GraphQLError('Unauthorized - Admin access required', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const orders = await prisma.order.findMany({
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: true,
                },
              },
            },
          },
          user: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return orders.map((order) => ({
        ...order,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        items: order.items.map((item) => ({
          ...item,
          createdAt: item.createdAt.toISOString(),
        })),
      }));
    },
  },

  Mutation: {
    createOrder: async (
      _: unknown,
      { input }: { input: OrderInput },
      context: { req: NextRequest }
    ) => {
      const userId = getUserFromToken(context.req);
      if (!userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
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
      });

      if (cartItems.length === 0) {
        throw new GraphQLError('Cart is empty', {
          extensions: { code: 'BAD_REQUEST' },
        });
      }

      for (const item of cartItems) {
        if (item.product.quantity < item.quantity) {
          throw new GraphQLError(
            `Insufficient stock for ${item.product.name}. Only ${item.product.quantity} available.`,
            {
              extensions: { code: 'INSUFFICIENT_STOCK' },
            }
          );
        }
      }

      const subtotal = cartItems.reduce((sum, item) => {
        const price =
          item.product.hasDiscount && item.product.discountPrice
            ? item.product.discountPrice
            : item.product.price;
        return sum + price * item.quantity;
      }, 0);

      const tax = subtotal * 0.0;
      const shipping = 0.0;
      const total = subtotal + tax + shipping;

      const orderNumber = generateOrderNumber();

      const order = await prisma.$transaction(async (tx) => {
        const newOrder = await tx.order.create({
          data: {
            userId,
            orderNumber,
            status: 'PENDING',
            email: input.email,
            phone: input.phone,
            firstName: input.firstName,
            lastName: input.lastName,
            address: input.address,
            city: input.city,
            postalCode: input.postalCode,
            country: input.country,
            paymentMethod: input.paymentMethod,
            paymentStatus: 'PAID',
            subtotal,
            tax,
            shipping,
            total,
          },
        });

        for (const item of cartItems) {
          const price =
            item.product.hasDiscount && item.product.discountPrice
              ? item.product.discountPrice
              : item.product.price;

          await tx.orderItem.create({
            data: {
              orderId: newOrder.id,
              productId: item.productId,
              name: item.product.name,
              price,
              quantity: item.quantity,
              image: item.product.images?.[0] || null,
            },
          });

          await tx.product.update({
            where: { id: item.productId },
            data: {
              quantity: {
                decrement: item.quantity,
              },
            },
          });
        }

        await tx.cartItem.deleteMany({
          where: { userId },
        });

        return tx.order.findUnique({
          where: { id: newOrder.id },
          include: {
            items: {
              include: {
                product: {
                  include: {
                    category: true,
                  },
                },
              },
            },
            user: true,
          },
        });
      });

      if (!order) {
        throw new GraphQLError('Failed to create order', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }

      return {
        ...order,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        items: order.items.map((item) => ({
          ...item,
          createdAt: item.createdAt.toISOString(),
        })),
      };
    },

    updateOrderStatus: async (
      _: unknown,
      { id, status, paymentStatus }: { id: string; status?: string; paymentStatus?: string },
      context: { req: NextRequest }
    ) => {
      const userId = getUserFromToken(context.req);
      if (!userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Check if user is admin
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (user?.role !== 'ADMIN') {
        throw new GraphQLError('Unauthorized - Admin access required', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // Build update data object
      const updateData: {
        status?: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
        paymentStatus?: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
        updatedAt: Date;
      } = {
        updatedAt: new Date(),
      };

      if (status)
        updateData.status = status as
          | 'PENDING'
          | 'PROCESSING'
          | 'SHIPPED'
          | 'DELIVERED'
          | 'CANCELLED';
      if (paymentStatus)
        updateData.paymentStatus = paymentStatus as 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

      const updatedOrder = await prisma.order.update({
        where: { id },
        data: updateData,
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: true,
                },
              },
            },
          },
          user: true,
        },
      });

      return {
        ...updatedOrder,
        createdAt: updatedOrder.createdAt.toISOString(),
        updatedAt: updatedOrder.updatedAt.toISOString(),
        items: updatedOrder.items.map((item) => ({
          ...item,
          createdAt: item.createdAt.toISOString(),
        })),
      };
    },

    updateOrderDetails: async (
      _: unknown,
      {
        id,
        email,
        phone,
        firstName,
        lastName,
        address,
        city,
        postalCode,
        country,
        paymentMethod,
      }: {
        id: string;
        email?: string;
        phone?: string;
        firstName?: string;
        lastName?: string;
        address?: string;
        city?: string;
        postalCode?: string;
        country?: string;
        paymentMethod?: string;
      },
      context: { req: NextRequest }
    ) => {
      const userId = getUserFromToken(context.req);
      if (!userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Check if user is admin
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (user?.role !== 'ADMIN') {
        throw new GraphQLError('Unauthorized - Admin access required', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // Build update data object
      const updateData: {
        email?: string;
        phone?: string;
        firstName?: string;
        lastName?: string;
        address?: string;
        city?: string;
        postalCode?: string;
        country?: string;
        paymentMethod?: string;
        updatedAt: Date;
      } = {
        updatedAt: new Date(),
      };

      if (email) updateData.email = email;
      if (phone) updateData.phone = phone;
      if (firstName) updateData.firstName = firstName;
      if (lastName) updateData.lastName = lastName;
      if (address) updateData.address = address;
      if (city) updateData.city = city;
      if (postalCode) updateData.postalCode = postalCode;
      if (country) updateData.country = country;
      if (paymentMethod) updateData.paymentMethod = paymentMethod;

      const updatedOrder = await prisma.order.update({
        where: { id },
        data: updateData,
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: true,
                },
              },
            },
          },
          user: true,
        },
      });

      return {
        ...updatedOrder,
        createdAt: updatedOrder.createdAt.toISOString(),
        updatedAt: updatedOrder.updatedAt.toISOString(),
        items: updatedOrder.items.map((item) => ({
          ...item,
          createdAt: item.createdAt.toISOString(),
        })),
      };
    },

    updateOrderItem: async (
      _: unknown,
      { id, quantity, price }: { id: string; quantity?: number; price?: number },
      context: { req: NextRequest }
    ) => {
      const userId = getUserFromToken(context.req);
      if (!userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (user?.role !== 'ADMIN') {
        throw new GraphQLError('Unauthorized - Admin access required', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const updateData: {
        quantity?: number;
        price?: number;
      } = {};

      if (quantity !== undefined) updateData.quantity = quantity;
      if (price !== undefined) updateData.price = price;

      const orderItem = await prisma.orderItem.update({
        where: { id },
        data: updateData,
      });

      await recalculateOrderTotals(orderItem.orderId);

      const order = await prisma.order.findUnique({
        where: { id: orderItem.orderId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: true,
                },
              },
            },
          },
          user: true,
        },
      });

      if (!order) {
        throw new GraphQLError('Order not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      return {
        ...order,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        items: order.items.map((item) => ({
          ...item,
          createdAt: item.createdAt.toISOString(),
        })),
      };
    },

    removeOrderItem: async (_: unknown, { id }: { id: string }, context: { req: NextRequest }) => {
      const userId = getUserFromToken(context.req);
      if (!userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (user?.role !== 'ADMIN') {
        throw new GraphQLError('Unauthorized - Admin access required', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const orderItem = await prisma.orderItem.findUnique({
        where: { id },
      });

      if (!orderItem) {
        throw new GraphQLError('Order item not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      await prisma.orderItem.delete({
        where: { id },
      });

      await recalculateOrderTotals(orderItem.orderId);

      const order = await prisma.order.findUnique({
        where: { id: orderItem.orderId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: true,
                },
              },
            },
          },
          user: true,
        },
      });

      if (!order) {
        throw new GraphQLError('Order not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      return {
        ...order,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        items: order.items.map((item) => ({
          ...item,
          createdAt: item.createdAt.toISOString(),
        })),
      };
    },

    addOrderItem: async (
      _: unknown,
      {
        orderId,
        productId,
        quantity,
        price,
      }: { orderId: string; productId: string; quantity: number; price: number },
      context: { req: NextRequest }
    ) => {
      const userId = getUserFromToken(context.req);
      if (!userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (user?.role !== 'ADMIN') {
        throw new GraphQLError('Unauthorized - Admin access required', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new GraphQLError('Product not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      await prisma.orderItem.create({
        data: {
          orderId,
          productId,
          name: product.name,
          price,
          quantity,
          image: product.images?.[0] || null,
        },
      });

      await recalculateOrderTotals(orderId);

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: true,
                },
              },
            },
          },
          user: true,
        },
      });

      if (!order) {
        throw new GraphQLError('Order not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      return {
        ...order,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        items: order.items.map((item) => ({
          ...item,
          createdAt: item.createdAt.toISOString(),
        })),
      };
    },
  },
};

export default orderResolvers;
