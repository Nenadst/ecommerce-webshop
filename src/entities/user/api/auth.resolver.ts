import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { serialize } from 'cookie';
import type { NextRequest, NextResponse } from 'next/server';
import { User } from '../model/user.model';

export interface GraphQLContext {
  req: NextRequest;
  res: NextResponse;
  userId: string | null;
  tokenCookie?: string;
}

export interface LoginArgs {
  email: string;
  password: string;
}

export const authResolvers = {
  Query: {
    me: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      const { userId } = context;
      if (!userId) return null;
      const user = (await User.findById(userId).lean().exec()) as {
        _id: string;
        email: string;
      } | null;
      if (!user) return null;
      return { _id: user._id.toString(), email: user.email };
    },
  },

  Mutation: {
    register: async (
      _parent: unknown,
      args: LoginArgs
    ): Promise<{ _id: string; email: string }> => {
      const { email, password } = args;
      if (await User.findOne({ email })) {
        throw new Error('Email already in use');
      }
      const hash = await bcrypt.hash(password, 12);
      const newUser = await new User({ email, password: hash }).save();
      return { _id: newUser._id.toString(), email: newUser.email };
    },

    login: async (
      _parent: unknown,
      { email, password }: { email: string; password: string },
      context: GraphQLContext
    ) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('Invalid email or password');
      }
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        throw new Error('Invalid email or password');
      }
      // Sign JWT and set as cookie
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: '1d' });
      const cookieValue = serialize('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
        path: '/',
      });
      context.tokenCookie = cookieValue;
      return user;
    },

    logout: async (_parent: unknown, _args: unknown, context: GraphQLContext): Promise<boolean> => {
      context.tokenCookie = serialize('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0, // expire immediately
      });
      return true;
    },
  },
};
