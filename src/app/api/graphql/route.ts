// src/app/api/graphql/route.ts
import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { typeDefs, resolvers } from '@/shared/graphql/schema';
import { connectToDatabase } from '@/shared/lib/db';

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true, // Needed for Apollo Sandbox (Studio)
});

// 👇 This handler works with Next.js App Router (GET and POST)
const handler = startServerAndCreateNextHandler(server, {
  context: async () => {
    await connectToDatabase();
    return {};
  },
});

// 👇 This exports both GET and POST handlers for App Router
export { handler as GET, handler as POST };
