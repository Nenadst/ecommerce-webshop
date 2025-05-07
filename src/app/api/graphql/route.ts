import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { typeDefs, resolvers } from '@/shared/graphql/schema';
import { connectToDatabase } from '@/shared/lib/db';
import { NextRequest } from 'next/server';

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
});

const handler = startServerAndCreateNextHandler<NextRequest>(server, {
  context: async (req) => {
    await connectToDatabase();
    return { req };
  },
});

export const GET = handler;
export const POST = handler;
