import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/shared/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const userResolvers = {
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
  },
};

export default userResolvers;
