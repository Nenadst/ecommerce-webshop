import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { typeDefs, resolvers } from '@/shared/graphql/schema';
import { connectDB } from '@/shared/lib/db';
import { NextRequest } from 'next/server';

interface Context {
  req: NextRequest;
}

const server = new ApolloServer<Context>({
  typeDefs,
  resolvers,
  introspection: true,
});

const handler = startServerAndCreateNextHandler(server, {
  context: async (req: NextRequest) => {
    await connectDB();
    return { req };
  },
});

export async function GET(request: NextRequest) {
  return handler(request);
}

export async function POST(request: NextRequest) {
  return handler(request);
}
