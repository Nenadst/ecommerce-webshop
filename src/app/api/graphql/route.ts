import { NextRequest } from 'next/server';
import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';

import { typeDefs, resolvers } from '@/shared/graphql/schema';
import { connectToDatabase } from '@/shared/lib/db';

// Initialize Apollo Server with schema and resolvers
const server = new ApolloServer({
  typeDefs,
  resolvers, // you can add other resolvers in this array
});

// Define context function to authenticate user from JWT
const handler = startServerAndCreateNextHandler<NextRequest>(server, {
  context: async (req: NextRequest) => {
    // Ensure DB is connected (to handle DB operations in resolvers)
    await connectToDatabase();

    // Default context
    const context: { user?: any } = {};

    // Check Authorization header for a Bearer token
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      try {
        const payload = require('jsonwebtoken').verify(token, process.env.JWT_ACCESS_SECRET!);
        // payload.sub was set to user ID in our login logic
        const userId = typeof payload === 'string' ? payload : payload.sub;
        if (userId) {
          // Fetch the user from DB (exclude sensitive fields)
          const user = await require('@/entities/user/model/user.model')
            .User.findById(userId)
            .select('-password -twoFactorSecret');
          if (user) {
            context.user = user;
          }
        }
      } catch (err) {
        // Invalid token, leave user undefined (not authenticated)
      }
    }
    return context;
  },
});

// Export the handler for GET and POST requests
export { handler as GET, handler as POST };
