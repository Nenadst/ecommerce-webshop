import { ApolloServer } from 'apollo-server-micro';
import { typeDefs } from '@/graphql/schema';
import { resolvers } from '@/graphql/schema';
import { connectToDatabase } from '@/lib/mongoose';
import type { NextApiRequest, NextApiResponse } from 'next';

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

const startServer = server.start();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();
  await startServer;
  return server.createHandler({ path: '/api/graphql' })(req, res);
}
