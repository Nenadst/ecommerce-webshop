import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// Fix TypeScript error by declaring global type override
declare global {
  var mongooseConnection: Promise<typeof mongoose> | null;
}

// Use a global variable to cache the connection (only for development)
let cached = global.mongooseConnection;

if (!cached) {
  cached = global.mongooseConnection = mongoose.connect(MONGODB_URI, {
    dbName: 'ecommerce-webshop-db', // optional: replace with your DB name
    bufferCommands: false,
  });
}

export async function connectToDatabase() {
  return cached;
}
