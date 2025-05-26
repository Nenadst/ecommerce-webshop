import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';
import { typeDefs, resolvers } from '@/shared/graphql/schema';
import { connectToDatabase } from '@/shared/lib/db';
import { NextRequest } from 'next/server';
import { User } from '@/entities/user/model/user.model';

interface UserDocument {
  _id: string;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface GraphQLContext {
  req: NextRequest;
  user: UserDocument | null;
  userId: string | null;
  tokenCookie?: string;
}

interface TokenPayload {
  id: string;
  iat?: number;
  exp?: number;
}

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error('Missing JWT_SECRET');

const server = new ApolloServer<GraphQLContext>({
  typeDefs,
  resolvers,
  plugins: [
    {
      async requestDidStart() {
        return {
          async willSendResponse({ response, contextValue }) {
            if (contextValue.tokenCookie) {
              response.http.headers.set('Set-Cookie', contextValue.tokenCookie);
            }
          },
        };
      },
    },
  ],
});

const handler = startServerAndCreateNextHandler(server, {
  context: async (req: NextRequest) => {
    await connectToDatabase();

    const cookieStore = req.cookies;
    let token = cookieStore.get?.('token')?.value;

    if (!token) {
      const raw = req.headers.get('cookie') ?? '';
      token = parse(raw).token;
    }

    let user: UserDocument | null = null;
    let userId: string | null = null;
    if (token) {
      try {
        const { id } = jwt.verify(token, JWT_SECRET) as TokenPayload;
        userId = id;
        const foundUser = await User.findById(id).select('-password').lean().exec();
        user = foundUser as UserDocument | null;
      } catch {
        user = null;
      }
    }

    return { req, user, userId };
  },
});

export const GET = handler;
export const POST = handler;
