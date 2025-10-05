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

const logOrderAction = async (
  orderId: string,
  action: string,
  description: string,
  performedBy?: string
) => {
  await prisma.orderLog.create({
    data: {
      orderId,
      action,
      description,
      performedBy,
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

      await logOrderAction(
        order.id,
        'ORDER_CREATED',
        `Order ${order.orderNumber} created with ${order.items.length} item(s). Total: €${order.total.toFixed(2)}`,
        order.user.email
      );

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

      const logParts: string[] = [];
      if (status) logParts.push(`Status changed to ${status}`);
      if (paymentStatus) logParts.push(`Payment status changed to ${paymentStatus}`);

      if (logParts.length > 0) {
        await logOrderAction(updatedOrder.id, 'STATUS_UPDATED', logParts.join(', '), user?.email);
      }

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

      const originalOrder = await prisma.order.findUnique({
        where: { id },
      });

      if (!originalOrder) {
        throw new GraphQLError('Order not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

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

      const changes: string[] = [];

      if (email && email !== originalOrder.email) {
        updateData.email = email;
        changes.push(`Email changed from "${originalOrder.email}" to "${email}"`);
      }
      if (phone && phone !== originalOrder.phone) {
        updateData.phone = phone;
        changes.push(`Phone changed from "${originalOrder.phone}" to "${phone}"`);
      }
      if (firstName && firstName !== originalOrder.firstName) {
        updateData.firstName = firstName;
        changes.push(`First name changed from "${originalOrder.firstName}" to "${firstName}"`);
      }
      if (lastName && lastName !== originalOrder.lastName) {
        updateData.lastName = lastName;
        changes.push(`Last name changed from "${originalOrder.lastName}" to "${lastName}"`);
      }
      if (address && address !== originalOrder.address) {
        updateData.address = address;
        changes.push(`Address changed from "${originalOrder.address}" to "${address}"`);
      }
      if (city && city !== originalOrder.city) {
        updateData.city = city;
        changes.push(`City changed from "${originalOrder.city}" to "${city}"`);
      }
      if (postalCode && postalCode !== originalOrder.postalCode) {
        updateData.postalCode = postalCode;
        changes.push(`Postal code changed from "${originalOrder.postalCode}" to "${postalCode}"`);
      }
      if (country && country !== originalOrder.country) {
        updateData.country = country;
        changes.push(`Country changed from "${originalOrder.country}" to "${country}"`);
      }
      if (paymentMethod && paymentMethod !== originalOrder.paymentMethod) {
        updateData.paymentMethod = paymentMethod;
        changes.push(
          `Payment method changed from "${originalOrder.paymentMethod}" to "${paymentMethod}"`
        );
      }

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

      if (changes.length > 0) {
        await logOrderAction(updatedOrder.id, 'DETAILS_UPDATED', changes.join('; '), user?.email);
      }

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

      const originalItem = await prisma.orderItem.findUnique({
        where: { id },
      });

      if (!originalItem) {
        throw new GraphQLError('Order item not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      const updateData: {
        quantity?: number;
        price?: number;
      } = {};

      const changes: string[] = [];

      if (quantity !== undefined && quantity !== originalItem.quantity) {
        updateData.quantity = quantity;
        changes.push(`Quantity changed from ${originalItem.quantity} to ${quantity}`);
      }
      if (price !== undefined && price !== originalItem.price) {
        updateData.price = price;
        changes.push(
          `Price changed from €${originalItem.price.toFixed(2)} to €${price.toFixed(2)}`
        );
      }

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

      if (changes.length > 0) {
        await logOrderAction(
          order.id,
          'ITEM_UPDATED',
          `${originalItem.name}: ${changes.join('; ')}`,
          user?.email
        );
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

      await logOrderAction(
        orderItem.orderId,
        'ITEM_REMOVED',
        `Removed "${orderItem.name}" (Qty: ${orderItem.quantity}, Price: €${orderItem.price.toFixed(2)})`,
        user?.email
      );

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

      await logOrderAction(
        orderId,
        'ITEM_ADDED',
        `Added "${product.name}" (Qty: ${quantity}, Price: €${price.toFixed(2)})`,
        user?.email
      );

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
