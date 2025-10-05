import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';
import { prisma } from '@/shared/lib/prisma';
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

const userResolvers = {
  Query: {
    allUsers: async (_: unknown, __: unknown, context: { req: NextRequest }) => {
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

      const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
      });

      return users.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role.toLowerCase(),
        accountStatus: u.accountStatus.toLowerCase(),
        lastLogin: u.lastLogin?.toISOString() || null,
        country: u.country || null,
        createdAt: u.createdAt.toISOString(),
      }));
    },
  },
  Mutation: {
    register: async (
      _: never,
      { input }: { input: { email: string; password: string; name: string } }
    ) => {
      const { email, password, name } = input;

      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: 'USER',
        },
      });

      const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, {
        expiresIn: '7d',
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role.toLowerCase(),
        },
        token,
      };
    },

    login: async (_: never, { input }: { input: { email: string; password: string } }) => {
      const { email, password } = input;

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new Error('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      if (user.accountStatus === 'SUSPENDED') {
        throw new Error('Your account has been suspended. Please contact support for assistance.');
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });

      const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, {
        expiresIn: '7d',
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role.toLowerCase(),
        },
        token,
      };
    },

    updateUser: async (
      _: never,
      { id, input }: { id: string; input: { name?: string; email?: string } }
    ) => {
      const { name, email } = input;

      if (email) {
        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        if (existingUser && existingUser.id !== id) {
          throw new Error('Email is already taken');
        }
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(email !== undefined && { email }),
        },
      });

      const token = jwt.sign(
        { userId: updatedUser.id, email: updatedUser.email, role: updatedUser.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role.toLowerCase(),
        },
        token,
      };
    },

    updateUserRole: async (
      _: unknown,
      { id, role }: { id: string; role: string },
      context: { req: NextRequest }
    ) => {
      const userId = getUserFromToken(context.req);
      if (!userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const adminUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (adminUser?.role !== 'ADMIN') {
        throw new GraphQLError('Unauthorized - Admin access required', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const roleUpper = role.toUpperCase();
      if (roleUpper !== 'USER' && roleUpper !== 'ADMIN') {
        throw new GraphQLError('Invalid role. Must be USER or ADMIN', {
          extensions: { code: 'BAD_REQUEST' },
        });
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: { role: roleUpper as 'USER' | 'ADMIN' },
      });

      return {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role.toLowerCase(),
        accountStatus: updatedUser.accountStatus.toLowerCase(),
        lastLogin: updatedUser.lastLogin?.toISOString() || null,
        country: updatedUser.country || null,
        createdAt: updatedUser.createdAt.toISOString(),
      };
    },

    updateAccountStatus: async (
      _: unknown,
      { id, status }: { id: string; status: string },
      context: { req: NextRequest }
    ) => {
      const userId = getUserFromToken(context.req);
      if (!userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const adminUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (adminUser?.role !== 'ADMIN') {
        throw new GraphQLError('Unauthorized - Admin access required', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const statusUpper = status.toUpperCase();
      if (statusUpper !== 'ACTIVE' && statusUpper !== 'INACTIVE' && statusUpper !== 'SUSPENDED') {
        throw new GraphQLError('Invalid status. Must be ACTIVE, INACTIVE, or SUSPENDED', {
          extensions: { code: 'BAD_REQUEST' },
        });
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: { accountStatus: statusUpper as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' },
      });

      return {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role.toLowerCase(),
        accountStatus: updatedUser.accountStatus.toLowerCase(),
        lastLogin: updatedUser.lastLogin?.toISOString() || null,
        country: updatedUser.country || null,
        createdAt: updatedUser.createdAt.toISOString(),
      };
    },

    deleteUser: async (_: unknown, { id }: { id: string }, context: { req: NextRequest }) => {
      const userId = getUserFromToken(context.req);
      if (!userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const adminUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (adminUser?.role !== 'ADMIN') {
        throw new GraphQLError('Unauthorized - Admin access required', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      if (id === userId) {
        throw new GraphQLError('Cannot delete your own account', {
          extensions: { code: 'BAD_REQUEST' },
        });
      }

      await prisma.user.delete({
        where: { id },
      });

      return true;
    },
  },
};

export default userResolvers;
